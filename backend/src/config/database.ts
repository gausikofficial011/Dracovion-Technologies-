import mongoose from 'mongoose';
import dns from 'dns';
import type { MongoMemoryServer as MongoMemoryServerType } from 'mongodb-memory-server';
import { env } from './env';
import { logger } from '../utils/logger';

let mongoMemoryServer: MongoMemoryServerType | null = null;

// Ensure reliable DNS resolution for MongoDB Atlas SRV connection strings across all environments
if (env.MONGODB_URI && env.MONGODB_URI.startsWith('mongodb+srv://')) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // ignore
  }
}

export async function connectDatabase(): Promise<typeof mongoose> {
  const uri = env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      logger.info('Attempting connection to MongoDB Atlas...', { uri: uri.replace(/:[^:]*@/, ':****@') });
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        dbName: 'dracovion_technologies',
      });
      logger.info('MongoDB Atlas connected successfully', {
        host: conn.connection.host,
        dbName: conn.connection.name,
      });
      return conn;
    } catch (err) {
      logger.warn('Failed to connect to configured MONGODB_URI. Checking fallback options...', {
        error: (err as Error).message,
      });

      if (env.NODE_ENV === 'production') {
        logger.error('Production requires a valid and reachable MONGODB_URI. Exiting.', err);
        throw err;
      }
    }
  }

  if (env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI is required in production environment.');
  }

  // Development & Test fallback: dynamically import in-memory MongoDB (devDependency only)
  logger.info('Starting local embedded MongoDB memory server for development/testing...');
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  mongoMemoryServer = await MongoMemoryServer.create();
  const memUri = mongoMemoryServer.getUri();
  
  const conn = await mongoose.connect(memUri);
  logger.info('Embedded MongoDB memory server connected successfully', { uri: memUri });
  return conn;
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    logger.info('MongoDB disconnected gracefully');
  } catch (err) {
    logger.error('Error during MongoDB disconnect', err);
  }
}
