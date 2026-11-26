import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { seedInitialData } from './services/seedService';
import { env } from './config/env';
import { logger } from './utils/logger';

async function bootstrap() {
  try {
    logger.info('Starting Dracovion Technologies Backend Services...');

    if (env.NODE_ENV === 'production') {
      if (env.SESSION_SECRET.includes('dracovion_dev_session_secret')) {
        logger.warn('SECURITY WARNING: Using default dev SESSION_SECRET in production. Set a random SESSION_SECRET env var!');
      }
      if (!env.GMAIL_APP_PASSWORD && !env.GMAIL_REFRESH_TOKEN) {
        logger.warn('SMTP WARNING: GMAIL_APP_PASSWORD is not set — OTP emails will only log to server console.');
      }
      if (env.CLIENT_URL.includes('localhost')) {
        logger.warn('CONFIG WARNING: CLIENT_URL still points to localhost in production.');
      }
    }

    // 1. Connect Database
    await connectDatabase();

    // 2. Seed Initial Platform Data (Owner account, Service catalog, Portfolio showcases)
    await seedInitialData();

    // 3. Initialize Express Application
    const app = createApp();

    const server = app.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`Dracovion Technologies API Server running on 0.0.0.0:${env.PORT}`, {
        env: env.NODE_ENV,
        port: env.PORT,
        clientUrl: env.CLIENT_URL,
        endpoints: `/api/v1/health`,
      });
    });

    // Optional OAuth Bridge on port 3000 for local development Google Cloud Console compatibility
    let oauthBridge: any = null;
    if (env.NODE_ENV === 'development' && Number(env.PORT) !== 3000) {
      try {
        const http = await import('http');
        oauthBridge = http.createServer((req, res) => {
          const incomingUrl = new URL(req.url || '/', 'http://localhost:3000');
          if (incomingUrl.searchParams.has('code')) {
            const forwardUrl = new URL(`http://localhost:${env.PORT}/api/v1/auth/client/google/callback`);
            incomingUrl.searchParams.forEach((val, key) => forwardUrl.searchParams.set(key, val));
            // Crucial: preserve redirect_uri so token exchange knows it was initiated with redirect_uri=http://localhost:3000
            if (!forwardUrl.searchParams.has('redirect_uri')) {
              forwardUrl.searchParams.set('redirect_uri', 'http://localhost:3000');
            }
            res.writeHead(302, { Location: forwardUrl.toString() });
            res.end();
          } else {
            res.writeHead(302, { Location: env.CLIENT_URL });
            res.end();
          }
        });
        oauthBridge.listen(3000, () => {
          logger.info('Google OAuth compatibility bridge active on port 3000');
        });
        oauthBridge.on('error', () => {
          // Port 3000 in use or restricted, continue cleanly
        });
      } catch {
        // ignore
      }
    }

    // Graceful Shutdown handling
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down server gracefully...`);
      if (oauthBridge) {
        oauthBridge.close();
      }
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Fatal bootstrap error', err);
    process.exit(1);
  }
}

bootstrap();
