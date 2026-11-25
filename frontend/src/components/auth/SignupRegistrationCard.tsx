import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resolveApiUrl } from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  GraduationCap,
  Handshake,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  Building2,
  ChevronDown,
  Megaphone,
  Check,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  BookOpen,
  Calendar,
  Sparkles,
  X,
} from 'lucide-react';

export type AccountRoleType = 'client' | 'student' | 'partner';

interface CountryCode {
  code: string;
  flag: string;
  country: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: '+91', flag: '🇮🇳', country: 'India' },
  { code: '+1', flag: '🇺🇸', country: 'United States' },
  { code: '+44', flag: '🇬🇧', country: 'United Kingdom' },
  { code: '+971', flag: '🇦🇪', country: 'United Arab Emirates' },
  { code: '+65', flag: '🇸🇬', country: 'Singapore' },
  { code: '+49', flag: '🇩🇪', country: 'Germany' },
  { code: '+61', flag: '🇦🇺', country: 'Australia' },
  { code: '+1', flag: '🇨🇦', country: 'Canada' },
  { code: '+33', flag: '🇫🇷', country: 'France' },
  { code: '+81', flag: '🇯🇵', country: 'Japan' },
];

export const SignupRegistrationCard: React.FC = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Role Tab State
  const [activeRole, setActiveRole] = useState<AccountRoleType>('client');

  // Common Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Role-Specific Fields
  // Client
  const [companyName, setCompanyName] = useState('');
  const [referralSource, setReferralSource] = useState('');

  // Student
  const [collegeOrUniversity, setCollegeOrUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('3rd Year');

  // Partner
  const [partnerOrgName, setPartnerOrgName] = useState('');
  const [organizationType, setOrganizationType] = useState('Enterprise / Corporate');
  const [partnershipInterest, setPartnershipInterest] = useState('Technology Integration & API');

  // UI / Submission States
  const [fieldsUnlocked, setFieldsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const supportsTextSecurity =
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('-webkit-text-security', 'disc');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successModalData, setSuccessModalData] = useState<{
    role: AccountRoleType;
    status: 'active' | 'pending';
    message: string;
  } | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'google_unconfigured') {
        setErrorMessage('Google OAuth is not configured on the server yet. Please create an account using your email and password.');
      } else if (errorParam === 'google_auth_cancelled') {
        setErrorMessage('Google Sign-Up was cancelled. You can try again anytime.');
      } else if (errorParam === 'google_auth_failed') {
        setErrorMessage('Google Authentication was not completed. Please try again.');
      } else if (errorParam === 'no_code') {
        setErrorMessage('Google did not return an authorization code. Please retry.');
      } else {
        setErrorMessage(decodeURIComponent(errorParam));
      }
    }
  }, [searchParams]);

  // Password Security Analysis
  const passwordCriteria = useMemo(() => {
    return {
      hasMinLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumberOrSymbol: /[\d\W_]/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.hasMinLength) score++;
    if (passwordCriteria.hasLowercase) score++;
    if (passwordCriteria.hasUppercase) score++;
    if (passwordCriteria.hasNumberOrSymbol) score++;
    return score;
  }, [passwordCriteria]);

  const passwordStrengthLabel = useMemo(() => {
    if (!password) return '';
    if (passwordScore <= 1) return 'Weak';
    if (passwordScore === 2) return 'Fair';
    if (passwordScore === 3) return 'Good';
    return 'Very Strong';
  }, [password, passwordScore]);

  const passwordStrengthColor = useMemo(() => {
    if (passwordScore <= 1) return 'bg-[#FF6262] text-[#FF6262]';
    if (passwordScore === 2) return 'bg-[#FFBD55] text-[#FFBD55]';
    if (passwordScore === 3) return 'bg-[#D6A94F] text-[#D6A94F]';
    return 'bg-[#52D69A] text-[#52D69A]';
  }, [passwordScore]);

  const handleRoleChange = (role: AccountRoleType) => {
    setActiveRole(role);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validations
    const normalizedEmail = email.trim().replace('#', '@').toLowerCase();
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }
    if (!password || password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('You must accept the Terms of Service and Privacy Policy to create an account.');
      return;
    }

    // Role-specific validation
    if (activeRole === 'student' && !collegeOrUniversity.trim()) {
      setErrorMessage('Please provide your college or university name.');
      return;
    }
    if (activeRole === 'partner' && !partnerOrgName.trim()) {
      setErrorMessage('Please enter your organization name.');
      return;
    }

    setIsLoading(true);

    try {
      const fullPhone = phoneNumber ? `${selectedCountry.code} ${phoneNumber.trim()}` : '';

      const payload: any = {
        fullName: fullName.trim(),
        email: normalizedEmail,
        password,
        phone: fullPhone,
        role: activeRole,
      };

      if (activeRole === 'client') {
        payload.companyName = companyName.trim();
        payload.referralSource = referralSource;
      } else if (activeRole === 'student') {
        payload.collegeOrUniversity = collegeOrUniversity.trim();
        payload.department = department.trim();
        payload.academicYear = academicYear;
      } else if (activeRole === 'partner') {
        payload.companyName = partnerOrgName.trim();
        payload.organizationType = organizationType;
        payload.partnershipInterest = partnershipInterest;
      }

      const registeredUser = await authRegister(payload);

      setSuccessModalData({
        role: activeRole,
        status: (registeredUser?.status as 'active' | 'pending') || 'active',
        message: 'Welcome to Dracovion Technologies. Your account has been initialized.',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalProceed = () => {
    if (!successModalData) return;
    const { role } = successModalData;
    setSuccessModalData(null);

    switch (role) {
      case 'student':
        navigate('/student/dashboard');
        break;
      case 'partner':
        navigate('/partner/dashboard');
        break;
      case 'client':
      default:
        navigate('/portal/dashboard');
        break;
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Outer Glowing Warm Gold Neon Border & Card Container */}
      <div className="relative rounded-3xl lg:rounded-[32px] bg-[#080A0E] border-[1.5px] border-[#D6A94F]/70 shadow-[0_0_50px_-5px_rgba(214,169,79,0.45),0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden p-6 sm:p-8 lg:p-10 select-none transition-all duration-300">
        {/* Subtle Radial Gradient Aura inside card */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#FFBD55]/10 via-[#D6A94F]/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#78BFFF]/5 via-transparent to-transparent blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="relative z-10 space-y-1 mb-6 sm:mb-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/35 text-[10px] font-mono font-bold text-[#FFBD55] tracking-widest uppercase mb-1 shadow-sm">
            <Sparkles className="w-3 h-3 text-[#FFBD55]" />
            <span>DRACOVION REGISTRATION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-2">
            <span>Sign</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D6A94F] via-[#FFBD55] to-[#F5D18A]">
              Up
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#9299A6] font-sans">
            Create your Dracovion account & access your personalized portal.
          </p>
        </div>

        {/* Account Type Selection - 3 Interactive Public Tabs */}
        <div className="relative z-10 mb-6 sm:mb-8">
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#0A0D13] border border-[#292E38]/80 shadow-inner">
            {/* Tab 01: Client */}
            <button
              type="button"
              onClick={() => handleRoleChange('client')}
              className={`relative py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                activeRole === 'client'
                  ? 'text-white border border-[#FFBD55] bg-gradient-to-r from-[#D6A94F]/25 via-[#FFBD55]/15 to-[#D6A94F]/20 shadow-[0_0_15px_rgba(214,169,79,0.3)]'
                  : 'text-[#9299A6] hover:text-white border border-transparent hover:bg-[#11151D]'
              }`}
            >
              {activeRole === 'client' && (
                <motion.div
                  layoutId="activeRolePill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#D6A94F]/20 to-[#FFBD55]/10 pointer-events-none"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <Briefcase
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeRole === 'client' ? 'text-[#FFBD55]' : 'text-[#9299A6]'
                }`}
              />
              <span>Client</span>
            </button>

            {/* Tab 02: Student */}
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`relative py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                activeRole === 'student'
                  ? 'text-white border border-[#FFBD55] bg-gradient-to-r from-[#D6A94F]/25 via-[#FFBD55]/15 to-[#D6A94F]/20 shadow-[0_0_15px_rgba(214,169,79,0.3)]'
                  : 'text-[#9299A6] hover:text-white border border-transparent hover:bg-[#11151D]'
              }`}
            >
              {activeRole === 'student' && (
                <motion.div
                  layoutId="activeRolePill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#D6A94F]/20 to-[#FFBD55]/10 pointer-events-none"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <GraduationCap
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeRole === 'student' ? 'text-[#FFBD55]' : 'text-[#9299A6]'
                }`}
              />
              <span>Student</span>
            </button>

            {/* Tab 03: Partner */}
            <button
              type="button"
              onClick={() => handleRoleChange('partner')}
              className={`relative py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                activeRole === 'partner'
                  ? 'text-white border border-[#FFBD55] bg-gradient-to-r from-[#D6A94F]/25 via-[#FFBD55]/15 to-[#D6A94F]/20 shadow-[0_0_15px_rgba(214,169,79,0.3)]'
                  : 'text-[#9299A6] hover:text-white border border-transparent hover:bg-[#11151D]'
              }`}
            >
              {activeRole === 'partner' && (
                <motion.div
                  layoutId="activeRolePill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#D6A94F]/20 to-[#FFBD55]/10 pointer-events-none"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <Handshake
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeRole === 'partner' ? 'text-[#FFBD55]' : 'text-[#9299A6]'
                }`}
              />
              <span>Partner</span>
            </button>
          </div>
        </div>

        {/* Error Alert Message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative z-10 mb-6 p-4 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-3 shadow-lg"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="flex-1 font-medium">{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="relative z-10 space-y-5">
          {/* Two-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Field: Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name <span className="text-[#FFBD55]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full legal name"
                  className="w-full h-[46px] pl-10 pr-4 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs sm:text-sm placeholder-[#9299A6]/70 focus:outline-none focus:border-[#FFBD55] focus:ring-1 focus:ring-[#FFBD55]/50 transition-colors"
                />
              </div>
            </div>

            {/* Field: Email Address */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address <span className="text-[#FFBD55]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  name="reg_contact_addr"
                  autoComplete="off"
                  readOnly={!fieldsUnlocked}
                  onFocus={() => setFieldsUnlocked(true)}
                  onPointerDown={() => setFieldsUnlocked(true)}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-[46px] pl-10 pr-4 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs sm:text-sm placeholder-[#9299A6]/70 focus:outline-none focus:border-[#FFBD55] focus:ring-1 focus:ring-[#FFBD55]/50 transition-colors"
                />
              </div>
            </div>

            {/* Field: Phone Number with Country Flag Dropdown */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Phone Number <span className="text-[#FFBD55]">*</span>
              </label>
              <div className="flex gap-2">
                {/* Country Code Pill Dropdown */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="h-[46px] px-3 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs font-mono flex items-center gap-1.5 hover:border-[#D6A94F] focus:outline-none focus:border-[#FFBD55] transition-colors cursor-pointer"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.code}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#9299A6]" />
                  </button>

                  {/* Dropdown Menu */}
                  {isCountryDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-48 rounded-xl bg-[#0D1117] border border-[#292E38] shadow-2xl z-50 max-h-56 overflow-y-auto py-1">
                      {COUNTRY_CODES.map((c) => (
                        <button
                          key={c.country + c.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(c);
                            setIsCountryDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-xs flex items-center justify-between text-slate-300 hover:text-white hover:bg-[#15191F] transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span>{c.country}</span>
                          </span>
                          <span className="font-mono text-[#D6A94F]">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Telephone Input */}
                <input
                  type="tel"
                  name="phoneNumber"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="98765 43210"
                  className="flex-1 min-w-0 h-[46px] px-4 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs sm:text-sm placeholder-[#9299A6]/70 focus:outline-none focus:border-[#FFBD55] focus:ring-1 focus:ring-[#FFBD55]/50 transition-colors"
                />
              </div>
            </div>

            {/* Dynamic Role Field 2 */}
            {activeRole === 'client' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Organization / Company
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="reg_org_entity"
                    autoComplete="off"
                    readOnly={!fieldsUnlocked}
                    onFocus={() => setFieldsUnlocked(true)}
                    onPointerDown={() => setFieldsUnlocked(true)}
                    data-lpignore="true"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company name (optional)"
                    className="w-full h-[46px] pl-10 pr-4 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs sm:text-sm placeholder-[#9299A6]/70 focus:outline-none focus:border-[#FFBD55] focus:ring-1 focus:ring-[#FFBD55]/50 transition-colors"
                  />
                </div>
              </div>
            )}

            {activeRole === 'student' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  College / University <span className="text-[#FFBD55]">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="collegeOrUniversity"
                    autoComplete="organization"
                    required
                    value={collegeOrUniversity}
                    onChange={(e) => setCollegeOrUniversity(e.target.value)}
                    placeholder="College or university"
                    className="w-full h-[46px] pl-10 pr-4 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs sm:text-sm placeholder-[#9299A6]/70 focus:outline-none focus:border-[#FFBD55] focus:ring-1 focus:ring-[#FFBD55]/50 transition-colors"
                  />
                </div>
              </div>
            )}

            {activeRole === 'partner' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Organization / Firm Name <span className="text-[#FFBD55]">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="partnerOrgName"
                    autoComplete="organization"
                    required
                    value={partnerOrgName}
                    onChange={(e) => setPartnerOrgName(e.target.value)}
                    placeholder="Organization name"
                    className="w-full h-[46px] pl-10 pr-4 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs sm:text-sm placeholder-[#9299A6]/70 focus:outline-none focus:border-[#FFBD55] focus:ring-1 focus:ring-[#FFBD55]/50 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Field: Create Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Create Password <span className="text-[#FFBD55]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : supportsTextSecurity ? 'text' : 'password'}
                  name="reg_pass_secret"
                  autoComplete="off"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  readOnly={!fieldsUnlocked}
                  onFocus={() => setFieldsUnlocked(true)}
                  onPointerDown={() => setFieldsUnlocked(true)}
                  data-lpignore="true"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  style={
                    supportsTextSecurity
                      ? ({ WebkitTextSecurity: showPassword ? 'none' : 'disc' } as React.CSSProperties)
                      : undefined
                  }
                  className="w-full h-[46px] pl-10 pr-11 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs sm:text-sm placeholder-[#9299A6]/70 focus:outline-none focus:border-[#FFBD55] focus:ring-1 focus:ring-[#FFBD55]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9299A6] hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field: Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirm Password <span className="text-[#FFBD55]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : supportsTextSecurity ? 'text' : 'password'}
                  name="reg_pass_confirm"
                  autoComplete="off"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  readOnly={!fieldsUnlocked}
                  onFocus={() => setFieldsUnlocked(true)}
                  onPointerDown={() => setFieldsUnlocked(true)}
                  data-lpignore="true"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  style={
                    supportsTextSecurity
                      ? ({ WebkitTextSecurity: showConfirmPassword ? 'none' : 'disc' } as React.CSSProperties)
                      : undefined
                  }
                  className="w-full h-[46px] pl-10 pr-11 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs sm:text-sm placeholder-[#9299A6]/70 focus:outline-none focus:border-[#FFBD55] focus:ring-1 focus:ring-[#FFBD55]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9299A6] hover:text-white transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Security Meter & Checklist (Visible when password input is focused/filled) */}
          {password && (
            <div className="p-3.5 rounded-xl bg-[#0D1117] border border-[#292E38]/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9299A6]">Password Strength</span>
                <span className={`font-mono font-bold ${passwordStrengthColor.split(' ')[1]}`}>
                  {passwordStrengthLabel}
                </span>
              </div>

              {/* 4-Segment Strength Bar */}
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((seg) => (
                  <div
                    key={seg}
                    className={`rounded-full transition-all duration-300 ${
                      passwordScore >= seg ? passwordStrengthColor.split(' ')[0] : 'bg-[#292E38]'
                    }`}
                  />
                ))}
              </div>

              {/* Checklist */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#9299A6]">
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordCriteria.hasMinLength ? 'text-emerald-400' : ''
                  }`}
                >
                  <Check className="w-3 h-3 shrink-0" />
                  <span>8+ characters</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordCriteria.hasUppercase ? 'text-emerald-400' : ''
                  }`}
                >
                  <Check className="w-3 h-3 shrink-0" />
                  <span>1 uppercase letter</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordCriteria.hasLowercase ? 'text-emerald-400' : ''
                  }`}
                >
                  <Check className="w-3 h-3 shrink-0" />
                  <span>1 lowercase letter</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordCriteria.hasNumberOrSymbol ? 'text-emerald-400' : ''
                  }`}
                >
                  <Check className="w-3 h-3 shrink-0" />
                  <span>1 number or symbol</span>
                </div>
              </div>
            </div>
          )}

          {/* Role-Specific Secondary Fields */}
          {activeRole === 'client' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                How did you hear about us?
              </label>
              <div className="relative">
                <Megaphone className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  className="w-full h-[46px] pl-10 pr-10 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs sm:text-sm focus:outline-none focus:border-[#FFBD55] focus:ring-1 focus:ring-[#FFBD55]/50 appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-[#080A0E] text-[#9299A6]">
                    Select an option
                  </option>
                  <option value="Referral / Word of Mouth" className="bg-[#080A0E] text-white">
                    Referral / Word of Mouth
                  </option>
                  <option value="Google / Web Search" className="bg-[#080A0E] text-white">
                    Google / Web Search
                  </option>
                  <option value="LinkedIn / Social Media" className="bg-[#080A0E] text-white">
                    LinkedIn / Social Media
                  </option>
                  <option value="Campus / Tech Conference" className="bg-[#080A0E] text-white">
                    Campus / Tech Conference
                  </option>
                  <option value="Industry Partner" className="bg-[#080A0E] text-white">
                    Industry Partner
                  </option>
                  <option value="Other" className="bg-[#080A0E] text-white">
                    Other
                  </option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#9299A6] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {activeRole === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Department / Major <span className="text-[#FFBD55]">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full h-[46px] pl-10 pr-4 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs sm:text-sm placeholder-[#9299A6]/70 focus:outline-none focus:border-[#FFBD55] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Academic Year <span className="text-[#FFBD55]">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full h-[46px] pl-10 pr-10 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs sm:text-sm focus:outline-none focus:border-[#FFBD55] appearance-none cursor-pointer"
                  >
                    <option value="1st Year" className="bg-[#080A0E] text-white">1st Year</option>
                    <option value="2nd Year" className="bg-[#080A0E] text-white">2nd Year</option>
                    <option value="3rd Year" className="bg-[#080A0E] text-white">3rd Year</option>
                    <option value="Final Year" className="bg-[#080A0E] text-white">Final Year</option>
                    <option value="Post-Graduate" className="bg-[#080A0E] text-white">Post-Graduate / Alumni</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#9299A6] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {activeRole === 'partner' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Organization Type <span className="text-[#FFBD55]">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="w-full h-[46px] pl-10 pr-10 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs sm:text-sm focus:outline-none focus:border-[#FFBD55] appearance-none cursor-pointer"
                  >
                    <option value="Enterprise / Corporate" className="bg-[#080A0E] text-white">Enterprise / Corporate</option>
                    <option value="Tech Startup" className="bg-[#080A0E] text-white">Tech Startup</option>
                    <option value="Academic Institution" className="bg-[#080A0E] text-white">Academic Institution</option>
                    <option value="Technology Provider" className="bg-[#080A0E] text-white">Technology Provider</option>
                    <option value="Government / NGO" className="bg-[#080A0E] text-white">Government / NGO</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#9299A6] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Partnership Interest <span className="text-[#FFBD55]">*</span>
                </label>
                <div className="relative">
                  <Handshake className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={partnershipInterest}
                    onChange={(e) => setPartnershipInterest(e.target.value)}
                    className="w-full h-[46px] pl-10 pr-10 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs sm:text-sm focus:outline-none focus:border-[#FFBD55] appearance-none cursor-pointer"
                  >
                    <option value="Technology Integration & API" className="bg-[#080A0E] text-white">Technology Integration & API</option>
                    <option value="Enterprise Solution Reseller" className="bg-[#080A0E] text-white">Enterprise Solution Reseller</option>
                    <option value="Academic Alliance & Labs" className="bg-[#080A0E] text-white">Academic Alliance & Labs</option>
                    <option value="Joint Venture & R&D" className="bg-[#080A0E] text-white">Joint Venture & R&D</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#9299A6] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Terms & Privacy Consent Checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  agreeTerms
                    ? 'bg-gradient-to-tr from-[#D6A94F] to-[#FFBD55] border-[#FFBD55] text-[#050609] shadow-[0_0_8px_rgba(214,169,79,0.5)]'
                    : 'bg-[#15191F] border-[#353941] group-hover:border-[#D6A94F]'
                }`}
              >
                {agreeTerms && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="sr-only"
              />
              <span className="text-xs text-[#B7BBC4] leading-relaxed">
                I agree to the{' '}
                <Link
                  to="/terms"
                  target="_blank"
                  className="text-[#FFBD55] hover:underline font-semibold"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  target="_blank"
                  className="text-[#FFBD55] hover:underline font-semibold"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>

          {/* Luxury Gold Gradient Submit Button */}
          <div className="pt-1">
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative w-full h-12 rounded-xl font-display font-bold text-xs sm:text-sm tracking-wider text-[#080A0E] uppercase flex items-center justify-center gap-2 overflow-hidden shadow-[0_4px_25px_rgba(214,169,79,0.4)] disabled:opacity-50 cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 50%, #D6A94F 100%)',
                backgroundSize: '200% 100%',
              }}
            >
              {/* Button Gold Light Sweep Hover */}
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#080A0E]" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 text-[#080A0E]" />
                </>
              )}
            </motion.button>
          </div>

          {/* Separator: OR SIGN UP WITH */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="h-[1px] w-full bg-[#292E38]" />
            <span className="absolute px-3 bg-[#080A0E] text-[10px] font-mono tracking-widest uppercase text-[#9299A6]">
              OR SIGN UP WITH
            </span>
          </div>

          {/* Social Sign-Up Button (Google) */}
          <div>
            <a
              href={resolveApiUrl('/auth/client/google')}
              className="w-full h-12 px-4 rounded-xl bg-[#0D1117] border border-[#292E38] hover:border-[#D6A94F]/60 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:bg-[#15191F] cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </a>
          </div>

          {/* Bottom Sign-In Navigation */}
          <div className="pt-3 text-center text-xs text-[#9299A6]">
            <span>Already have an account? </span>
            <Link
              to="/signin"
              className="text-[#FFBD55] hover:text-[#F5D18A] hover:underline font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </form>
      </div>

      {/* Success Registration Confirmation Modal */}
      <AnimatePresence>
        {successModalData && (
          <div className="fixed inset-0 z-[9990] flex items-center justify-center px-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md rounded-3xl bg-[#080A0E] border-[1.5px] border-[#D6A94F] p-8 shadow-[0_0_60px_rgba(214,169,79,0.4)] text-center space-y-5 relative"
            >
              {/* Animated Gold Checkmark */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D6A94F]/20 via-[#FFBD55]/30 to-transparent border border-[#FFBD55] flex items-center justify-center mx-auto text-[#FFBD55] shadow-[0_0_25px_rgba(214,169,79,0.5)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-display text-white">
                  Registration Successful!
                </h3>
                <p className="text-xs font-mono uppercase tracking-wider text-[#FFBD55]">
                  Role: {successModalData.role.toUpperCase()}
                </p>
              </div>

              <p className="text-xs text-[#B7BBC4] leading-relaxed">
                {successModalData.message}
              </p>

              <div className="p-4 rounded-xl bg-[#11151D] border border-[#292E38] text-left text-xs space-y-1.5">
                <div className="text-[10px] font-mono text-[#9299A6] uppercase tracking-wider">
                  Next Step
                </div>
                <div className="text-white font-medium">
                  {successModalData.role === 'student' &&
                    'Access your Allhunter student mentoring portal, skill tracks, and project repos.'}
                  {successModalData.role === 'partner' &&
                    'Access your partner portal, alliance resources, and client referral pipeline.'}
                  {successModalData.role === 'client' &&
                    'Access your client dashboard to track quotations, contracts, and deliverables.'}
                </div>
              </div>

              <button
                type="button"
                onClick={handleModalProceed}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D6A94F] via-[#FFBD55] to-[#D6A94F] text-[#080A0E] text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

