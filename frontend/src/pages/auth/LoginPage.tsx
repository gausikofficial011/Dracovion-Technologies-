import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resolveApiUrl } from '../../api/client';
import { DracovionLogo } from '../../components/ui/DragonLogo';
import { useAntiAutofill } from '../../hooks/useAntiAutofill';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const { login, user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isFieldUnlocked, unlockField, maskedInputType, maskedInputStyle } = useAntiAutofill();

  const resolveDashboardPath = (targetUser?: { role?: string; portalType?: string } | null) => {
    if (!targetUser) return '/portal/dashboard';
    if (
      targetUser.portalType === 'workspace' ||
      ['super_admin', 'owner', 'ceo', 'employee', 'admin'].includes(targetUser.role || '')
    ) {
      return targetUser.role === 'super_admin' ? '/workspace/super-admin' : '/workspace/orders';
    }
    if (targetUser.role === 'student') return '/student/dashboard';
    if (targetUser.role === 'partner') return '/partner/dashboard';
    if (targetUser.role === 'team_member') return '/team/dashboard';
    return '/portal/dashboard';
  };

  const getDashboardPath = () => resolveDashboardPath(user);

  useEffect(() => {
    const errorParam = searchParams.get('error');

    if (errorParam) {
      if (errorParam === 'github_unconfigured') {
        setErrorMessage(
          'GitHub OAuth credentials are not configured on the server yet. Please sign in with email and password or Google.'
        );
      } else if (errorParam === 'google_unconfigured') {
        setErrorMessage(
          'Google OAuth credentials are not configured on the server yet. Please sign in with email and password.'
        );
      } else if (errorParam === 'google_auth_cancelled') {
        setErrorMessage('Google Sign-In was cancelled. You can try again anytime or sign in with your password.');
      } else if (errorParam === 'google_auth_failed') {
        setErrorMessage('Google Authentication was not completed. Please try again.');
      } else if (errorParam === 'github_auth_failed') {
        setErrorMessage('GitHub Authentication could not be completed. Please try again.');
      } else if (errorParam === 'no_code') {
        setErrorMessage('No authorization code was returned. Please retry.');
      } else {
        setErrorMessage(decodeURIComponent(errorParam));
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Auto-normalize any # or typo into @
      const cleanEmail = email.trim().replace('#', '@');
      const authenticatedUser = await login({ email: cleanEmail, password });

      navigate(resolveDashboardPath(authenticatedUser));
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-x-hidden selection:bg-[#D6A94F]/30 selection:text-[#F5D18A] flex flex-col justify-between">
      {/* Background Aura Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,rgba(214,169,79,0.12)_0%,transparent_65%)] blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(214,169,79,0.06)_0%,transparent_65%)] blur-3xl" />
      </div>

      {/* Header Bar */}
      <header className="relative z-20 w-full px-6 sm:px-10 lg:px-16 py-5 flex items-center justify-between border-b border-[#292E38]/40 bg-[#050609]/60 backdrop-blur-md">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-xs font-mono text-[#9299A6] hover:text-[#FFBD55] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#D6A94F]" />
          <span className="tracking-wider uppercase font-semibold">Back to Homepage</span>
        </Link>

        <div className="flex items-center gap-3 text-xs font-mono text-[#9299A6]">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30">
            <ShieldCheck className="w-3.5 h-3.5 text-[#52D69A]" />
            <span className="tracking-widest uppercase text-[10px] text-slate-300">Unified Gateway</span>
          </div>
          <span className="text-[#FFBD55] font-bold tracking-widest text-[11px]">DRACOVION ID</span>
        </div>
      </header>

      {/* Main Login Card Stage */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-4 sm:py-6">
        <div className="w-full max-w-lg relative">
          {/* Card Container with Glowing Gold Aura */}
          <div className="relative rounded-3xl bg-[#080A0E] border-[1.5px] border-[#D6A94F]/70 shadow-[0_0_50px_-5px_rgba(214,169,79,0.45),0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden p-6 sm:p-7 space-y-4">
            {/* Top Brand Logo */}
            <div className="text-center space-y-1.5 select-none">
              <div className="flex justify-center">
                <DracovionLogo variant="gold" size="md" glow={true} />
              </div>

              {/* Varied Word Style Headline: Elegant Serif Accent + Grotesk Display + Champagne Gradient */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#D6A94F] uppercase font-bold block">
                  AUTHENTICATED ACCESS
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
                  <span className="italic font-serif font-normal text-slate-300 mr-2">Secure</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D6A94F] via-[#FFBD55] to-[#F5D18A]">
                    Sign In
                  </span>
                </h1>
                <p className="text-xs text-[#9299A6] max-w-sm mx-auto leading-relaxed">
                  Sign in with your registered email address to access your Dracovion portal.
                </p>
              </div>
            </div>

            {isAuthenticated && user && (
              <div className="p-3.5 rounded-2xl bg-[#11151D] border border-[#D6A94F]/45 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase text-[#FFBD55] font-bold">
                    Active Session Detected
                  </div>
                  <div className="text-white font-semibold truncate">
                    {user.fullName} ({user.email})
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate(getDashboardPath())}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D6A94F] to-[#FFBD55] text-[#050609] font-bold cursor-pointer"
                  >
                    Open Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="px-2.5 py-1.5 rounded-lg bg-[#080A0E] border border-[#292E38] text-[#9299A6] hover:text-white cursor-pointer"
                  >
                    Switch
                  </button>
                </div>
              </div>
            )}

            {/* Error Banner */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div>{errorMessage}</div>
                    {/invalid email or password/i.test(errorMessage) && (
                      <div className="text-[11px] text-rose-200/80">
                        Tip: Click the eye icon on Password to verify exact spelling and ensure Chrome did not fill an old saved password or extra spaces.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9299A6]" />
                  <input
                    type="text"
                    inputMode="email"
                    name="dracovion_login_identifier"
                    autoComplete="off"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    readOnly={!isFieldUnlocked('email')}
                    onFocus={() => unlockField('email')}
                    onPointerDown={() => unlockField('email')}
                    data-lpignore="true"
                    data-form-type="other"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#15191F] border border-[#292E38] text-white text-xs placeholder:text-[#9299A6] focus:border-[#FFBD55] focus:outline-none transition-colors font-mono select-text"
                  />
                  {email && (
                    <button
                      type="button"
                      onClick={() => setEmail('')}
                      aria-label="Clear email"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9299A6] hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-300 tracking-wide">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-[#FFBD55] hover:text-[#F5D18A] hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9299A6]" />
                  <input
                    type={maskedInputType(showPassword, 'password')}
                    name="dracovion_login_secret"
                    autoComplete="off"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    readOnly={!isFieldUnlocked('password')}
                    onFocus={() => unlockField('password')}
                    onPointerDown={() => unlockField('password')}
                    data-lpignore="true"
                    data-form-type="other"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={maskedInputStyle(showPassword, 'password')}
                    className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-[#15191F] border border-[#292E38] text-white text-xs placeholder:text-[#9299A6] focus:border-[#FFBD55] focus:outline-none transition-colors font-mono select-text"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {password && (
                      <button
                        type="button"
                        onClick={() => setPassword('')}
                        aria-label="Clear password"
                        className="text-[#9299A6] hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="text-[#9299A6] hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-[#050609] transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(214,169,79,0.4)] hover:shadow-[0_0_35px_rgba(255,189,85,0.6)] hover:scale-[1.01] cursor-pointer disabled:opacity-50 mt-2"
                style={{
                  background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 50%, #F5D18A 100%)',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#050609]" />
                    <span className="font-mono tracking-wider">Verifying Session...</span>
                  </>
                ) : (
                  <>
                    <span className="tracking-wider">Sign In</span>
                    <ArrowRight className="w-4 h-4 text-[#050609]" />
                  </>
                )}
              </button>
            </form>

            {/* Social Authentication (For Clients) */}
            <div className="space-y-3 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#292E38]" />
                <span className="absolute bg-[#080A0E] px-3 text-[10px] font-mono text-[#9299A6] uppercase tracking-wider">
                  OR SIGN IN WITH
                </span>
              </div>

              <div className="w-full">
                <a
                  href={resolveApiUrl('/auth/client/google')}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/50 text-xs font-semibold text-white transition-all hover:bg-[#15191F] shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                    <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7 0-1.2.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-4.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 18C3.5 21.8 7.4 24 12 24z" />
                  </svg>
                  <span>Continue with Google</span>
                </a>
              </div>
            </div>

            {/* Bottom Contact & Sign Up Lines */}
            <div className="pt-3 border-t border-[#292E38]/60 space-y-2 text-center text-xs text-[#9299A6]">
              <div>
                <span>Don't have an account yet? </span>
                <Link
                  to="/signup"
                  className="text-[#FFBD55] font-bold hover:text-[#F5D18A] hover:underline transition-colors"
                >
                  Create Account →
                </Link>
              </div>
              <div className="text-[11px] font-mono text-[#9299A6]/80">
                Official Support Desk:{' '}
                <a
                  href="mailto:dracoviontechnology@gmail.com"
                  className="text-[#D6A94F] hover:underline"
                >
                  dracoviontechnology@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 border-t border-[#292E38]/30 text-center text-xs text-[#9299A6] font-mono">
        © {new Date().getFullYear()} DRACOVION TECHNOLOGIES • Global Technology Company
      </footer>
    </div>
  );
};
