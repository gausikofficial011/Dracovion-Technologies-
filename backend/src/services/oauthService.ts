import axios from 'axios';
import { env } from '../config/env';
import { BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

export interface GitHubUserInfo {
  id: number;
  login: string;
  email: string;
  name: string;
  avatar_url?: string;
}

/**
 * Returns Google OAuth2 authorization redirect URL
 */
export function getGoogleAuthURL(state = 'client_portal', customRedirectUri?: string): string {
  if (!env.GOOGLE_CLIENT_ID) {
    return `${env.CLIENT_URL}/portal/login?error=google_unconfigured`;
  }

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const targetRedirectUri = customRedirectUri || env.GOOGLE_CALLBACK_URL || 'http://localhost:3000';

  const options = {
    redirect_uri: targetRedirectUri,
    client_id: env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    state,
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

/**
 * Exchange Google authorization code for user profile
 * Implements intelligent dual-URI retry to handle both localhost:3000 bridge
 * and localhost:5000 direct callback seamlessly.
 */
export async function exchangeGoogleCode(code: string, customRedirectUri?: string): Promise<GoogleUserInfo> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new BadRequestError('Google OAuth is not configured on this server.');
  }

  const primaryUri = customRedirectUri || env.GOOGLE_CALLBACK_URL || 'http://localhost:3000';
  const fallbackUri =
    env.NODE_ENV !== 'production'
      ? primaryUri.includes('3000')
        ? 'http://localhost:5000/api/v1/auth/client/google/callback'
        : 'http://localhost:3000'
      : primaryUri;

  const attemptExchange = async (redirectUri: string) => {
    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, id_token } = tokenRes.data;

    // Fetch user profile with access token
    const userRes = await axios.get<GoogleUserInfo>(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    return userRes.data;
  };

  try {
    return await attemptExchange(primaryUri);
  } catch (err: any) {
    const errorDetails = err.response?.data;
    const isMismatch =
      errorDetails?.error === 'redirect_uri_mismatch' ||
      JSON.stringify(errorDetails || {}).includes('redirect_uri_mismatch');

    if (isMismatch && fallbackUri !== primaryUri) {
      logger.warn(`Google OAuth redirect URI ${primaryUri} mismatched. Auto-retrying with fallback URI ${fallbackUri}...`);
      try {
        return await attemptExchange(fallbackUri);
      } catch (retryErr: any) {
        logger.error('Google OAuth token exchange fallback also failed:', retryErr.response?.data || retryErr.message);
        throw new BadRequestError('Failed to authenticate with Google (redirect URI mismatch).');
      }
    }

    logger.error('Google OAuth token exchange failed:', errorDetails || err.message);
    throw new BadRequestError('Failed to authenticate with Google. Please try again.');
  }
}

/**
 * Verify a Google ID Token credential (for Google Identity Services / One-Tap / SDK)
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleUserInfo> {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new BadRequestError('Google OAuth is not configured on this server.');
  }

  try {
    const res = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const tokenInfo = res.data;

    // Verify audience matches either of the registered Google client IDs
    const allowedClientIds = [
      env.GOOGLE_CLIENT_ID,
      '520665328147-vi2897fm1f0ud6qki6726cmfg3in8mhj.apps.googleusercontent.com',
      '520665328147-httqt2lkffenen55lqmamt4hf0kqkdii.apps.googleusercontent.com',
    ].filter(Boolean);

    if (!allowedClientIds.includes(tokenInfo.aud)) {
      throw new BadRequestError('Invalid Google credential token audience.');
    }

    if (tokenInfo.email_verified !== 'true' && tokenInfo.email_verified !== true) {
      throw new BadRequestError('Google email is not verified.');
    }

    return {
      id: tokenInfo.sub,
      email: tokenInfo.email,
      name: tokenInfo.name || tokenInfo.email.split('@')[0],
      picture: tokenInfo.picture,
      verified_email: true,
    };
  } catch (err: any) {
    logger.error('Google ID token verification failed:', err.response?.data || err.message);
    throw new BadRequestError('Google credential verification failed.');
  }
}

/**
 * Returns GitHub OAuth authorization redirect URL
 */
export function getGitHubAuthURL(state = 'client_portal'): string {
  if (!env.GITHUB_CLIENT_ID) {
    return `${env.CLIENT_URL}/portal/login?error=github_unconfigured`;
  }

  const rootUrl = 'https://github.com/login/oauth/authorize';
  const options = {
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: env.GITHUB_CALLBACK_URL,
    scope: 'user:email read:user',
    state,
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

/**
 * Exchange GitHub authorization code for user profile
 */
export async function exchangeGitHubCode(code: string): Promise<GitHubUserInfo> {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    throw new BadRequestError('GitHub OAuth is not configured on this server.');
  }

  try {
    // 1. Exchange code for token
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: env.GITHUB_CALLBACK_URL,
      },
      { headers: { Accept: 'application/json' } }
    );

    const { access_token } = tokenRes.data;
    if (!access_token) {
      throw new BadRequestError('Failed to obtain GitHub access token');
    }

    // 2. Fetch basic profile
    const userRes = await axios.get<any>('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'User-Agent': 'Dracovion-Technologies-App',
      },
    });

    let email = userRes.data.email;

    // 3. If primary email is private on GitHub profile, query /user/emails
    if (!email) {
      const emailRes = await axios.get<any[]>('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'User-Agent': 'Dracovion-Technologies-App',
        },
      });

      const primary = emailRes.data.find((e: any) => e.primary && e.verified);
      email = primary ? primary.email : emailRes.data[0]?.email;
    }

    if (!email) {
      throw new BadRequestError('Unable to retrieve a verified email address from your GitHub account.');
    }

    return {
      id: userRes.data.id,
      login: userRes.data.login,
      email,
      name: userRes.data.name || userRes.data.login,
      avatar_url: userRes.data.avatar_url,
    };
  } catch (err: any) {
    logger.error('GitHub OAuth token exchange failed:', err.response?.data || err.message);
    throw new BadRequestError('Failed to authenticate with GitHub. Please try again.');
  }
}

