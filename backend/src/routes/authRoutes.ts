import { Router } from 'express';
import { register, login, logout, getMe, forgotPassword, resetPassword, updateProfile, deactivateAccount, deleteAccount } from '../controllers/authController';
import {
  sendClientOTP,
  verifyClientOTP,
  clientPasswordLogin,
  getGoogleAuthUrlHandler,
  handleGoogleCallback,
  verifyGoogleCredentialHandler,
  getGitHubAuthUrlHandler,
  handleGitHubCallback,
} from '../controllers/clientAuthController';
import { workspaceLogin, getWorkspaceProfile } from '../controllers/workspaceAuthController';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// ==========================================
// 1. CLIENT PORTAL AUTHENTICATION
// ==========================================
router.post('/client/send-otp', sendClientOTP);
router.post('/client/verify-otp', verifyClientOTP);
router.post('/client/login', clientPasswordLogin);
router.get('/client/google', getGoogleAuthUrlHandler);
router.get('/client/google/callback', handleGoogleCallback);
router.post('/client/google/verify-credential', verifyGoogleCredentialHandler);
router.get('/client/github', getGitHubAuthUrlHandler);
router.get('/client/github/callback', handleGitHubCallback);
router.post('/client/deactivate', requireAuth, deactivateAccount);
router.delete('/client/account', requireAuth, deleteAccount);

// ==========================================
// 2. INTERNAL WORKSPACE AUTHENTICATION (Staff only)
// ==========================================
router.post('/workspace/login', workspaceLogin);
router.get('/workspace/me', requireAuth, getWorkspaceProfile);

// ==========================================
// 3. CORE & SESSION COMMON HANDLERS
// ==========================================
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', requireAuth, updateProfile);
router.patch('/profile', requireAuth, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/deactivate', requireAuth, deactivateAccount);
router.delete('/account', requireAuth, deleteAccount);

export default router;
