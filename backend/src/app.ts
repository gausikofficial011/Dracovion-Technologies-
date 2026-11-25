import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { getAllowedOrigins, normalizeOrigin } from './config/cors';
import apiRouter from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { NotFoundError } from './utils/errors';

export function createApp(): express.Application {
  const app = express();

  const isProd = env.NODE_ENV === 'production';

  // Trust reverse proxy headers (Render, Railway, Cloudflare) for secure cookies & req.ip
  if (isProd) {
    app.set('trust proxy', 1);
  }

  const allowedOrigins = getAllowedOrigins();
  const normalizedClientUrl = normalizeOrigin(env.CLIENT_URL);

  // 1. Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: isProd
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'", 'https://accounts.google.com', 'https://apis.google.com'],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
              imgSrc: [
                "'self'",
                'data:',
                'blob:',
                'https:',
                'https://lh3.googleusercontent.com',
                'https://avatars.githubusercontent.com',
              ],
              connectSrc: ["'self'", ...allowedOrigins, 'https://accounts.google.com'],
              frameSrc: ["'none'"],
              objectSrc: ["'none'"],
              upgradeInsecureRequests: [],
            },
          }
        : false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. CORS configuration — prod: configured production origins only; dev: localhost allowed
  app.use(
    cors({
      origin: (incomingOrigin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!incomingOrigin) return callback(null, true);
        if (allowedOrigins.includes(incomingOrigin)) {
          return callback(null, true);
        }
        callback(new Error(`CORS policy: origin ${incomingOrigin} is not allowed.`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. Compression and Logging
  app.use(compression());
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // 4. Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 5. Rate Limiting for Public Protection
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.NODE_ENV === 'test' ? 10000 : env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP address. Please try again later.',
      },
    },
  });
  app.use('/api/', limiter);

  // 6. Production-Ready Session Management with HTTP-only Cookies
  // Cross-origin production deployments (e.g. Netlify/Vercel -> Render) require sameSite='none' + secure=true.
  const sessionSameSite = env.COOKIE_SAME_SITE || (isProd ? 'none' : 'lax');
  const sessionConfig: session.SessionOptions = {
    name: env.SESSION_NAME,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: isProd,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: sessionSameSite,
      maxAge: env.SESSION_MAX_AGE_MS,
    },
  };

  // If mongoose is connected, attach MongoStore for persistent sessions
  if (mongoose.connection.readyState === 1 && mongoose.connection.getClient()) {
    sessionConfig.store = MongoStore.create({
      client: mongoose.connection.getClient() as any,
      collectionName: 'sessions',
      ttl: env.SESSION_MAX_AGE_MS / 1000,
    });
  }

  app.use(session(sessionConfig));

  // Request ID injection for traceability
  app.use((req, _res, next) => {
    (req as any).requestId = 'req_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    next();
  });

  // Root status endpoint for platform uptime monitors
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      service: 'Dracovion Technologies Platform API',
      health: '/api/v1/health',
      website: normalizedClientUrl,
    });
  });

  // 7. Mount versioned API routes
  app.use('/api/v1', apiRouter);

  // 8. 404 handler for undefined API routes
  app.use('/api/*', () => {
    throw new NotFoundError('API endpoint not found');
  });

  // 9. Centralized Error Handler
  app.use(errorHandler);

  return app;
}
