import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { env } from '../config/env';

describe('Google Authentication Endpoints & Flow Verification', () => {
  let app: any;

  beforeAll(async () => {
    await connectDatabase();
    app = createApp();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it('GET /api/v1/auth/client/google redirects browser directly to Google accounts', async () => {
    const res = await request(app)
      .get('/api/v1/auth/client/google')
      .set('Accept', 'text/html,application/xhtml+xml,application/xml');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(res.headers.location).toContain(`client_id=${env.GOOGLE_CLIENT_ID}`);
    expect(res.headers.location).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000');
    expect(res.headers.location).toContain('response_type=code');
    expect(res.headers.location).toContain('scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile');
  });

  it('GET /api/v1/auth/client/google?format=json returns the Google Auth URL as JSON', async () => {
    const res = await request(app).get('/api/v1/auth/client/google?format=json');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(res.body.url).toContain(env.GOOGLE_CLIENT_ID);
  });

  it('GET /api/v1/auth/client/google/callback without code redirects cleanly to signin with error', async () => {
    const res = await request(app).get('/api/v1/auth/client/google/callback');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/signin?error=no_code');
  });

  it('GET /api/v1/auth/client/google/callback with access_denied redirects cleanly to login with cancelled error', async () => {
    const res = await request(app).get('/api/v1/auth/client/google/callback?error=access_denied');

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/login?error=google_auth_cancelled');
  });

  it('GET /api/v1/auth/client/google encodes allowed Origin in signed state for cross-domain redirect recovery', async () => {
    const res = await request(app)
      .get('/api/v1/auth/client/google?format=json')
      .set('Origin', env.CLIENT_URL);

    expect(res.status).toBe(200);
    const parsedUrl = new URL(res.body.url);
    const state = parsedUrl.searchParams.get('state') || '';
    expect(state).toContain('.');

    // Ensure callback recovers the verified origin from state even without cookies
    const cancelRes = await request(app).get(
      `/api/v1/auth/client/google/callback?error=access_denied&state=${encodeURIComponent(state)}`
    );
    expect(cancelRes.status).toBe(302);
    expect(cancelRes.headers.location.startsWith(env.CLIENT_URL.replace(/\/+$/, ''))).toBe(true);
  });

  it('POST /api/v1/auth/client/google/verify-credential rejects invalid or missing credential', async () => {
    const res = await request(app)
      .post('/api/v1/auth/client/google/verify-credential')
      .send({ credential: 'invalid_mock_jwt_token' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

