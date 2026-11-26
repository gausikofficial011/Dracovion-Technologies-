import mongoose from 'mongoose';
import dns from 'dns';
import type { MongoMemoryServer as MongoMemoryServerType } from 'mongodb-memory-server';
import { env } from './env';
import { logger } from '../utils/logger';

let mongoMemoryServer: MongoMemoryServerType | null = null;

function isDnsResolutionError(err: unknown): boolean {
  const msg = ((err as Error)?.message || '').toLowerCase();
  return (
    msg.includes('querysrv') ||
    msg.includes('enotfound') ||
    msg.includes('etimeout') ||
    msg.includes('eservfail') ||
    msg.includes('eai_again')
  );
}

export async function connectDatabase(): Promise<typeof mongoose> {
  const uri = (env.MONGODB_URI || '').trim().replace(/^["']|["']$/g, '');
  const useUriInCurrentEnv = env.NODE_ENV !== 'test' || process.env.USE_LIVE_DB_FOR_TESTS === 'true';

  if (uri !== '' && useUriInCurrentEnv) {
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
      // Retry once with public DNS resolvers if container/ISP DNS failed SRV lookup
      if (uri.startsWith('mongodb+srv://') && isDnsResolutionError(err)) {
        try {
          logger.warn('SRV DNS lookup failed with system resolver; retrying via 8.8.8.8 / 1.1.1.1...');
          dns.setServers(['8.8.8.8', '1.1.1.1']);
          const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            dbName: 'dracovion_technologies',
          });
          logger.info('MongoDB Atlas connected successfully (fallback DNS)', {
            host: conn.connection.host,
            dbName: conn.connection.name,
          });
          return conn;
        } catch (retryErr) {
          logger.warn('MongoDB Atlas retry with fallback DNS also failed.', {
            error: (retryErr as Error).message,
          });
        }
      } else {
        logger.warn('Failed to connect to configured MONGODB_URI. Checking fallback options...', {
          error: (err as Error).message,
        });
      }

      if (env.NODE_ENV === 'production') {
        logger.error(
          'Production requires a valid and reachable MONGODB_URI (verify Atlas Network Access includes 0.0.0.0/0 and URI encoding). Exiting.',
          err
        );
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
