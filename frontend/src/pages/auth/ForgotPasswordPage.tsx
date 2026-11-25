import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { DracovionLogo } from '../../components/ui/DragonLogo';
import { useAntiAutofill } from '../../hooks/useAntiAutofill';
import { Mail, ArrowRight, CheckCircle2, Loader2, ChevronLeft, KeyRound, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'request' | 'verify' | 'done'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { isFieldUnlocked, unlockField, maskedInputType, maskedInputStyle } = useAntiAutofill();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().replace('#', '@').toLowerCase();
      setEmail(cleanEmail);
      const res = await api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email: cleanEmail });
      setStatusMessage(
        res.message || `If an active account exists for ${cleanEmail}, a 6-digit verification code has been dispatched.`
      );
      setStep('verify');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to process password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (otp.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });
      setStep('done');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification failed or code expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-transparent relative">
      <div className="w-full max-w-md p-7 sm:p-9 rounded-3xl bg-[#0A0D13] border border-[#D6A94F]/45 shadow-[0_20px_55px_rgba(0,0,0,0.9),0_0_30px_rgba(214,169,79,0.18)] space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D6A94F]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="text-center space-y-2.5 relative z-10">
          <div className="flex justify-center mb-1">
            <DracovionLogo variant="gold" size="sm" glow={true} />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Reset Account Access</h1>
          <p className="text-xs text-[#9299A6]">
            {step === 'request'
              ? 'Enter your account email to receive a 6-digit verification code'
              : step === 'verify'
              ? 'Enter the 6-digit verification code and your new password'
              : 'Your password has been securely updated'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5 relative z-10">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {statusMessage && step === 'verify' && (
          <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/70 text-emerald-300 text-xs relative z-10 leading-relaxed">
            {statusMessage}
          </div>
        )}

        {step === 'done' ? (
          <div className="p-6 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-center space-y-3 relative z-10">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Password Updated</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Access credentials for <span className="text-[#FFBD55] font-mono">{email}</span> have been reset. You can sign in right away.
            </p>
            <Link
              to="/login"
              className="btn-gold-primary inline-block mt-3 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Sign In Now
            </Link>
          </div>
        ) : step === 'verify' ? (
          <form onSubmit={handleResetPassword} autoComplete="off" className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white placeholder-[#9299A6] focus:outline-none focus:border-[#FFBD55] text-sm font-mono tracking-widest"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-3.5" />
                <input
                  type={maskedInputType(showPassword, 'resetNew')}
                  name="dracovion_reset_new"
                  autoComplete="off"
                  readOnly={!isFieldUnlocked('resetNew')}
                  onFocus={() => unlockField('resetNew')}
                  onPointerDown={() => unlockField('resetNew')}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  style={maskedInputStyle(showPassword, 'resetNew')}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white placeholder-[#9299A6] focus:outline-none focus:border-[#FFBD55] text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#9299A6] hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-3.5" />
                <input
                  type={maskedInputType(showPassword, 'resetConfirm')}
                  name="dracovion_reset_confirm"
                  autoComplete="off"
                  readOnly={!isFieldUnlocked('resetConfirm')}
                  onFocus={() => unlockField('resetConfirm')}
                  onPointerDown={() => unlockField('resetConfirm')}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  style={maskedInputStyle(showPassword, 'resetConfirm')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white placeholder-[#9299A6] focus:outline-none focus:border-[#FFBD55] text-sm font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-gold-primary w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Confirm Password Reset</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('request')}
              className="w-full text-center text-[11px] font-mono text-[#9299A6] hover:text-[#FFBD55] cursor-pointer"
            >
              Change email or resend verification code
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestOtp} autoComplete="off" className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                Your Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  inputMode="email"
                  name="dracovion_recovery_email"
                  autoComplete="off"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  readOnly={!isFieldUnlocked('recoveryEmail')}
                  onFocus={() => unlockField('recoveryEmail')}
                  onPointerDown={() => unlockField('recoveryEmail')}
                  data-lpignore="true"
                  data-form-type="other"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white placeholder-[#9299A6] focus:outline-none focus:border-[#FFBD55] text-sm font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-gold-primary w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center relative z-10">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#D6A94F] hover:text-[#FFBD55] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
