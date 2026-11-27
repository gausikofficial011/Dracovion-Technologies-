import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Sparkles,
  MapPin,
  Briefcase,
  Globe,
  FileCode,
  BookOpen,
  Hash,
  Save,
  Award,
  Layers,
  ArrowRight,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  UserX,
  AlertTriangle,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ClientProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Account Deactivation & Deletion State
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Avatar / Profile Picture State
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');

  // Role detection: is staff/executive or standard client?
  const isStaff =
    user?.portalType === 'workspace' ||
    user?.role === 'owner' ||
    user?.role === 'ceo' ||
    user?.role === 'super_admin' ||
    user?.role === 'employee';

  // Entity Classification (Student vs Company)
  const [accountType, setAccountType] = useState<'student' | 'company'>(
    user?.accountType === 'student' || (!user?.accountType && !!user?.collegeOrUniversity)
      ? 'student'
      : 'company'
  );

  // Common Identity Details
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [stateName, setStateName] = useState(user?.state || 'Tamil Nadu');
  const [bio, setBio] = useState(user?.bio || '');

  // Staff / Executive Specific Details
  const [staffDesignation, setStaffDesignation] = useState(user?.designation || '');
  const [staffDepartment, setStaffDepartment] = useState(user?.department || 'Executive Leadership');

  // Student-Specific Details
  const [collegeOrUniversity, setCollegeOrUniversity] = useState(user?.collegeOrUniversity || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [degree, setDegree] = useState(user?.degree || 'B.E / B.Tech');
  const [academicYear, setAcademicYear] = useState(user?.academicYear || 'Final Year (4th Year)');
  const [registerNumber, setRegisterNumber] = useState(user?.registerNumber || '');
  const [projectDomain, setProjectDomain] = useState(user?.projectDomain || 'Full-Stack Web App');
  const [githubProfile, setGithubProfile] = useState(user?.githubProfile || '');
  const [linkedinProfile, setLinkedinProfile] = useState(user?.linkedinProfile || '');

  // Company-Specific Details
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [industry, setIndustry] = useState(user?.industry || 'Software & Technology');
  const [designation, setDesignation] = useState(user?.designation || 'Founder / Managing Director');
  const [companyWebsite, setCompanyWebsite] = useState(user?.companyWebsite || '');
  const [companySize, setCompanySize] = useState(user?.companySize || 'Early-Stage Startup (1-10)');
  const [gstin, setGstin] = useState(user?.gstin || '');
  const [workAddress, setWorkAddress] = useState(user?.workAddress || '');

  // Profile Save Feedback
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Management State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sync state whenever the user auth context changes or loads
  useEffect(() => {
    if (user) {
      if (user.avatarUrl) {
        setAvatarUrl(user.avatarUrl);
        setAvatarPreview(user.avatarUrl);
      }
      if (user.accountType) {
        setAccountType(user.accountType === 'student' ? 'student' : 'company');
      } else if (user.collegeOrUniversity) {
        setAccountType('student');
      }
      if (user.fullName) setFullName(user.fullName);
      if (user.phone) setPhone(user.phone);
      if (user.city) setCity(user.city);
      if (user.state) setStateName(user.state);
      if (user.bio) setBio(user.bio);
      if (user.designation) {
        setDesignation(user.designation);
        setStaffDesignation(user.designation);
      }
      if (user.department) {
        setDepartment(user.department);
        setStaffDepartment(user.department);
      }
      if (user.collegeOrUniversity) setCollegeOrUniversity(user.collegeOrUniversity);
      if (user.degree) setDegree(user.degree);
      if (user.academicYear) setAcademicYear(user.academicYear);
      if (user.registerNumber) setRegisterNumber(user.registerNumber);
      if (user.projectDomain) setProjectDomain(user.projectDomain);
      if (user.githubProfile) setGithubProfile(user.githubProfile);
      if (user.linkedinProfile) setLinkedinProfile(user.linkedinProfile);
      if (user.companyName) setCompanyName(user.companyName);
      if (user.industry) setIndustry(user.industry);
      if (user.companyWebsite) setCompanyWebsite(user.companyWebsite);
      if (user.companySize) setCompanySize(user.companySize);
      if (user.gstin) setGstin(user.gstin);
      if (user.workAddress) setWorkAddress(user.workAddress);
    }
  }, [user]);

  // Handle Image File Selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Selected image exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      setAvatarUrl(resultStr);
      setAvatarPreview(resultStr);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    setAvatarPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Profile Save
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    if (!fullName.trim()) {
      setProfileError('Full Name is required.');
      return;
    }

    if (!isStaff && !phone.trim()) {
      setProfileError('Contact phone / WhatsApp number is required so our lead engineers can reach you.');
      return;
    }

    if (!isStaff && accountType === 'student' && !collegeOrUniversity.trim()) {
      setProfileError('Please specify your College or University name.');
      return;
    }

    if (!isStaff && accountType === 'company' && !companyName.trim()) {
      setProfileError('Please specify your Company or Organization name.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({
        avatarUrl,
        accountType: isStaff ? undefined : accountType,
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        state: stateName.trim(),
        bio: bio.trim(),
        // Staff-specific fields
        designation: isStaff ? staffDesignation.trim() : (accountType === 'company' ? designation.trim() : undefined),
        department: isStaff ? staffDepartment.trim() : (accountType === 'student' ? department.trim() : undefined),
        // Student fields
        collegeOrUniversity: !isStaff && accountType === 'student' ? collegeOrUniversity.trim() : '',
        degree: !isStaff && accountType === 'student' ? degree.trim() : '',
        academicYear: !isStaff && accountType === 'student' ? academicYear.trim() : '',
        registerNumber: !isStaff && accountType === 'student' ? registerNumber.trim() : '',
        projectDomain: !isStaff && accountType === 'student' ? projectDomain.trim() : '',
        githubProfile: !isStaff && accountType === 'student' ? githubProfile.trim() : '',
        linkedinProfile: !isStaff && accountType === 'student' ? linkedinProfile.trim() : '',
        // Company fields
        companyName: !isStaff && accountType === 'company' ? companyName.trim() : '',
        industry: !isStaff && accountType === 'company' ? industry.trim() : '',
        companyWebsite: !isStaff && accountType === 'company' ? companyWebsite.trim() : '',
        companySize: !isStaff && accountType === 'company' ? companySize.trim() : '',
        gstin: !isStaff && accountType === 'company' ? gstin.trim() : '',
        workAddress: !isStaff && accountType === 'company' ? workAddress.trim() : '',
      });

      setProfileSuccess('Your complete profile details and photo have been securely saved and synchronized across Dracovion Cloud!');
      setTimeout(() => setProfileSuccess(null), 6000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to save profile. Please verify your details.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!user?.email) {
      setPasswordError('User session email not resolved.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.post('/auth/reset-password', {
        email: user.email,
        newPassword,
      });
      setPasswordSuccess('Your account password has been successfully updated and secured.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 6000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeactivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeactivating(true);
    setDeactivateError(null);
    try {
      await api.post('/auth/client/deactivate', {
        reason: deactivateReason.trim() || undefined,
        password: deactivatePassword || undefined,
      });
      setShowDeactivateModal(false);
      await logout();
      navigate('/');
    } catch (err: any) {
      setDeactivateError(err.message || 'Failed to deactivate account. Please check your credentials.');
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE' && !deletePassword) {
      setDeleteError('Please type DELETE or provide your account password to confirm.');
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError(null);
    try {
      await api.delete('/auth/client/account', {
        confirmation: deleteConfirmText.trim(),
        password: deletePassword || undefined,
      });
      setShowDeleteModal(false);
      await logout();
      navigate('/');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account. Please verify confirmation.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292E38] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isStaff ? 'OFFICIAL WORKSPACE & GOVERNANCE ID' : 'AUTHENTICATED CLIENT CLOUD'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            {isStaff ? 'My Profile & Picture' : 'Profile & Entity Identity'}
          </h1>
          <p className="text-xs sm:text-sm text-[#9299A6] mt-1">
            {isStaff
              ? 'Update your name, picture, executive designation, phone, and password.'
              : 'Specify your complete background whether you are approaching Dracovion as a student or a company.'}
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-[#080A0E] border border-[#292E38] flex items-center gap-3 shrink-0">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile"
              className="w-10 h-10 rounded-xl object-cover border border-[#FFBD55] shadow-md"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFBD55] to-[#D6A94F] text-[#050609] flex items-center justify-center font-bold text-sm shadow-md">
              {fullName.charAt(0) || user?.fullName?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <div className="text-xs font-bold text-white truncate max-w-[150px]">{fullName || user?.fullName}</div>
            <div className="text-[10px] font-mono text-[#FFBD55] uppercase">
              {isStaff
                ? user?.role?.toUpperCase().replace(/_/g, ' ')
                : accountType === 'student'
                ? '🎓 Student Researcher'
                : '🏢 Corporate Client'}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleProfileSave} className="space-y-8">
        {/* Profile Picture Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D6A94F] font-bold">
              BIOMETRIC AVATAR &amp; VISUAL IDENTITY
            </span>
            <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#FFBD55]" />
              <span>Profile Picture &amp; Avatar</span>
            </h2>
            <p className="text-xs text-[#9299A6]">
              Upload a clear profile picture or avatar. It will display in your portal header, orders queue, and navigation bar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-[#D6A94F] bg-[#11151D] shadow-[0_0_30px_rgba(214,169,79,0.25)] flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-3xl font-display font-extrabold text-[#FFBD55]">
                    {fullName.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            </div>

            {/* Upload Controls */}
            <div className="space-y-3 flex-1 text-center sm:text-left">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleImageFileChange}
                className="hidden"
              />

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-[#15191F] border border-[#D6A94F]/70 hover:border-[#FFBD55] text-white text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 transition-all"
                >
                  <Upload className="w-4 h-4 text-[#FFBD55]" />
                  <span>Choose Photo from Device</span>
                </button>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-rose-900/50 hover:border-rose-500 text-rose-400 hover:text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>

              <div className="text-[11px] text-[#9299A6] font-mono">
                Supported formats: PNG, JPG, JPEG, WEBP (Max 5MB).
              </div>
            </div>
          </div>
        </div>

        {/* Entity Switcher (Only for Clients) */}
        {!isStaff && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D6A94F] font-bold">
                CLASSIFICATION PROTOCOL
              </span>
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#FFBD55]" />
                <span>How Are You Approaching Dracovion Technologies? *</span>
              </h2>
              <p className="text-xs text-[#9299A6]">
                Select whether you are an engineering student or a business enterprise so we configure your project workspace appropriately.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Student Card */}
              <div
                onClick={() => setAccountType('student')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  accountType === 'student'
                    ? 'bg-[#15191F] border-[#FFBD55] shadow-[0_0_25px_rgba(214,169,79,0.25)]'
                    : 'bg-[#11151D] border-[#292E38] hover:border-[#D6A94F]/40 opacity-80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFBD55]/20 to-[#D6A94F]/10 border border-[#FFBD55]/40 flex items-center justify-center text-[#FFBD55]">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    {accountType === 'student' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFBD55] text-[#050609]">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">Student / Academic Researcher</h3>
                    <div className="text-[11px] font-mono text-[#FFBD55] mt-0.5">Allhunter Academic Hub</div>
                    <p className="text-xs text-[#9299A6] mt-2 leading-relaxed">
                      College capstone prototypes, final-year engineering projects, research papers, source code review, and viva defense coaching.
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Card */}
              <div
                onClick={() => setAccountType('company')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  accountType === 'company'
                    ? 'bg-[#15191F] border-[#FFBD55] shadow-[0_0_25px_rgba(214,169,79,0.25)]'
                    : 'bg-[#11151D] border-[#292E38] hover:border-[#D6A94F]/40 opacity-80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D6A94F]/20 to-[#FFBD55]/10 border border-[#D6A94F]/40 flex items-center justify-center text-[#FFBD55]">
                      <Building2 className="w-5 h-5" />
                    </div>
                    {accountType === 'company' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFBD55] text-[#050609]">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">Company / Business Entity</h3>
                    <div className="text-[11px] font-mono text-[#FFBD55] mt-0.5">Corporate &amp; Enterprise Client</div>
                    <p className="text-xs text-[#9299A6] mt-2 leading-relaxed">
                      Commercial websites, web applications, bespoke SaaS software, mobile apps, database architecture, and custom AI systems.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Alert Banners */}
        {profileSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        {/* Step 2: Primary Identity & Direct Reachability (Common) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#292E38]">
            <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#FFBD55]" />
              <span>{isStaff ? 'Executive Leadership Credentials' : 'Primary Contact & Reachability'}</span>
            </h2>
            <span className="text-[11px] font-mono text-[#9299A6]">Direct Synced</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-semibold text-[#D6A94F] uppercase font-mono mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Gausik Srinivasan"
                className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-semibold text-[#D6A94F] uppercase font-mono mb-1.5">
                Registered Email Address (Verified)
              </label>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#15191F] border border-[#292E38] text-slate-300 font-mono text-xs">
                <span>{user?.email}</span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Active</span>
                </span>
              </div>
            </div>

            {/* Direct Phone / WhatsApp Number */}
            <div>
              <label className="block text-[11px] font-semibold text-[#D6A94F] uppercase font-mono mb-1.5">
                Contact Phone / WhatsApp {isStaff ? '(Official)' : '*'}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98401 23456"
                className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs font-mono focus:border-[#FFBD55] focus:outline-none"
              />
            </div>

            {/* City & State Location */}
            <div>
              <label className="block text-[11px] font-semibold text-[#D6A94F] uppercase font-mono mb-1.5">
                City / Location
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Madurai / Chennai / Coimbatore"
                className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
              />
            </div>

            {/* Staff-specific: Title & Department */}
            {isStaff && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-[#D6A94F] uppercase font-mono mb-1.5">
                    Official Executive Designation
                  </label>
                  <input
                    type="text"
                    value={staffDesignation}
                    onChange={(e) => setStaffDesignation(e.target.value)}
                    placeholder="e.g. Managing Director / Engineering Lead"
                    className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#D6A94F] uppercase font-mono mb-1.5">
                    Department / Division
                  </label>
                  <input
                    type="text"
                    value={staffDepartment}
                    onChange={(e) => setStaffDepartment(e.target.value)}
                    placeholder="e.g. Executive Governance / Engineering & Delivery"
                    className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Professional Headline / Bio */}
          <div>
            <label className="block text-[11px] font-semibold text-[#D6A94F] uppercase font-mono mb-1.5">
              Professional Statement / Bio
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Technical direction, high-grade architecture resilience, and client stewardship."
              className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
            />
          </div>
        </div>

        {/* Step 3A: Student & Academic Credentials (when accountType === 'student' and not staff) */}
        {!isStaff && accountType === 'student' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border-2 border-[#D6A94F]/60 shadow-2xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#292E38]">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FFBD55] font-bold">
                  ACADEMIC IDENTITY • ALLHUNTER HUB
                </span>
                <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#FFBD55]" />
                  <span>College, Degree &amp; Academic Information</span>
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#D6A94F] px-2.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30">
                Viva Coaching Match
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#FFBD55] uppercase font-mono mb-1.5">
                  College / University Name *
                </label>
                <input
                  type="text"
                  required={accountType === 'student'}
                  value={collegeOrUniversity}
                  onChange={(e) => setCollegeOrUniversity(e.target.value)}
                  placeholder="e.g. Anna University / PSG College of Technology / SRM Institute"
                  className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#FFBD55] uppercase font-mono mb-1.5">
                  Department / Branch *
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering (CSE) / IT / AI & DS"
                  className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#FFBD55] uppercase font-mono mb-1.5">
                  Degree Program *
                </label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
                >
                  <option value="B.E / B.Tech">B.E / B.Tech (Engineering)</option>
                  <option value="M.E / M.Tech">M.E / M.Tech (Master of Engg)</option>
                  <option value="MCA">MCA (Master of Computer Applications)</option>
                  <option value="B.Sc / M.Sc Computer Science">B.Sc / M.Sc Computer Science</option>
                  <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                  <option value="Ph.D. / Research">Ph.D. / Doctoral Research</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#FFBD55] uppercase font-mono mb-1.5">
                  Current Year of Study *
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
                >
                  <option value="Final Year (4th Year)">Final Year (4th Year - Major Project)</option>
                  <option value="3rd Year (Pre-Final)">3rd Year (Pre-Final - Mini Project)</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="Post-Graduate Final Year">Post-Graduate Final Year</option>
                  <option value="Pass-out / Career Starter">Recent Graduate / Career Starter</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#FFBD55] uppercase font-mono mb-1.5">
                  Register / Roll Number
                </label>
                <input
                  type="text"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  placeholder="e.g. 710020104015"
                  className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs font-mono focus:border-[#FFBD55] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#FFBD55] uppercase font-mono mb-1.5">
                  Primary Domain of Interest
                </label>
                <select
                  value={projectDomain}
                  onChange={(e) => setProjectDomain(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
                >
                  <option value="Full-Stack Web App">Full-Stack Web Application (React / Node / MongoDB)</option>
                  <option value="AI & Machine Learning">AI &amp; Deep Learning (PyTorch / CNN / Transformers)</option>
                  <option value="Mobile App Development">Mobile App (Flutter / React Native / Android)</option>
                  <option value="IoT & Embedded Systems">IoT &amp; Embedded Hardware Interfacing</option>
                  <option value="Cyber Security & Cloud">Cyber Security &amp; Network Defense</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#FFBD55] uppercase font-mono mb-1.5">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={githubProfile}
                  onChange={(e) => setGithubProfile(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs font-mono focus:border-[#FFBD55] focus:outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3B: Company & Corporate Credentials (when accountType === 'company' and not staff) */}
        {!isStaff && accountType === 'company' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border-2 border-[#D6A94F]/40 shadow-2xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#292E38]">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FFBD55] font-bold">
                  COMMERCIAL IDENTITY • ENTERPRISE CLIENT
                </span>
                <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#FFBD55]" />
                  <span>Company &amp; Business Information</span>
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#FFBD55] px-2.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30">
                Corporate SLA Matching
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#FFBD55] uppercase font-mono mb-1.5">
                  Company / Brand Name *
                </label>
                <input
                  type="text"
                  required={accountType === 'company'}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Velox Industrial Solutions Pvt Ltd"
                  className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#D6A94F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#FFBD55] uppercase font-mono mb-1.5">
                  Your Job Role / Designation *
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Founder &amp; CEO / Chief Technology Officer / Product Lead"
                  className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#D6A94F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#FFBD55] uppercase font-mono mb-1.5">
                  Industry / Business Sector
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#D6A94F] focus:outline-none"
                >
                  <option value="Software & IT Services">Software, SaaS &amp; Cloud</option>
                  <option value="Manufacturing & Industrial">Manufacturing, Industrial &amp; Engineering</option>
                  <option value="Healthcare & Life Sciences">Healthcare, Biotech &amp; Pharmaceuticals</option>
                  <option value="E-Commerce & Retail">E-Commerce, Logistics &amp; Retail</option>
                  <option value="FinTech & Financial Services">FinTech, Banking &amp; Financial Services</option>
                  <option value="Education & EdTech">Education, Universities &amp; EdTech</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#FFBD55] uppercase font-mono mb-1.5">
                  Company Website / Domain
                </label>
                <input
                  type="url"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs font-mono focus:border-[#D6A94F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#FFBD55] uppercase font-mono mb-1.5">
                  Company Size / Team Scale
                </label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#D6A94F] focus:outline-none"
                >
                  <option value="Early-Stage Startup (1-10)">Early-Stage Startup (1-10 Employees)</option>
                  <option value="Growing Business (11-50)">Growing Business (11-50 Employees)</option>
                  <option value="Mid-Market Enterprise (51-200)">Mid-Market Enterprise (51-200 Employees)</option>
                  <option value="Large Corporation (200+) ">Large Corporation (200+ Employees)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#FFBD55] uppercase font-mono mb-1.5">
                  GSTIN / Tax ID (Optional)
                </label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs font-mono focus:border-[#D6A94F] focus:outline-none uppercase"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#FFBD55] uppercase font-mono mb-1.5">
                  Office / Headquarters Address
                </label>
                <input
                  type="text"
                  value={workAddress}
                  onChange={(e) => setWorkAddress(e.target.value)}
                  placeholder="e.g. Suite 402, Guindy Industrial Tech Park, Chennai, Tamil Nadu - 600032"
                  className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#D6A94F] focus:outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Save Changes CTA Button */}
        <div className="p-6 rounded-3xl bg-[#080A0E] border border-[#292E38] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="text-xs text-[#9299A6]">
            All updates sync directly to your assigned project engineers and Dracovion leadership.
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-[#050609] flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(214,169,79,0.35)] hover:shadow-[0_0_35px_rgba(255,189,85,0.55)] hover:scale-[1.02] transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
            }}
          >
            {isSavingProfile ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#050609]" />
                <span>Saving Profile Details...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#050609]" />
                <span>Save Profile Details &amp; Photo</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Change Password Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#FFBD55]" />
            <span>Update Account Password</span>
          </h3>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#9299A6] px-2.5 py-1 rounded-full bg-[#11151D] border border-[#292E38]">
            Direct Credential Sync
          </span>
        </div>

        <p className="text-xs text-[#9299A6] leading-relaxed">
          Ensure your password is at least 8 characters long with a mix of letters, numbers, and symbols. Once updated, your credentials sync securely with our encrypted authentication system.
        </p>

        {passwordSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-[#D6A94F] uppercase tracking-wider mb-2">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs font-mono focus:outline-none focus:border-[#D6A94F]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9299A6] hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D6A94F] uppercase tracking-wider mb-2">
              Confirm New Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-4 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs font-mono focus:outline-none focus:border-[#D6A94F]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] shadow-[0_0_20px_rgba(214,169,79,0.35)] hover:shadow-[0_0_30px_rgba(255,189,85,0.5)] hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              style={{
                background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
              }}
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#050609]" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#050609]" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Architecture Info */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#D6A94F]" />
          <span>Security &amp; Authentication Architecture</span>
        </h3>
        <p className="text-xs text-[#9299A6] leading-relaxed">
          Dracovion Technologies uses server-managed sessions with cryptographically signed, HTTP-only, SameSite cookies. Long-lived credentials or JSON Web Tokens are never stored in browser local storage, protecting your account against cross-site scripting (XSS) and token theft.
        </p>

        <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] flex items-center justify-between text-xs font-mono">
          <span className="text-[#9299A6]">Session Cookie Protection:</span>
          <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted HTTP-Only Active</span>
          </span>
        </div>
      </div>

      {/* Account Deactivation & Permanent Deletion (Danger Zone) */}
      {!isStaff && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-rose-950/60 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Account Governance &amp; Data Erasure</span>
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 px-2.5 py-1 rounded-full bg-rose-950/40 border border-rose-800/40 font-bold">
              Danger Zone
            </span>
          </div>

          <p className="text-xs text-[#9299A6] leading-relaxed">
            You maintain full sovereignty over your client account. You can temporarily freeze all active operations by deactivating your account, or permanently purge your profile, uncompleted orders, and personal records from Dracovion servers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Deactivation Box */}
            <div className="p-5 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-amber-500/40 transition-colors flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-display font-bold text-sm">
                  <UserX className="w-4 h-4" />
                  <span>Deactivate Account</span>
                </div>
                <p className="text-[11px] text-[#9299A6] leading-relaxed">
                  Temporarily disable your profile, project alerts, and active login sessions. Past completed deliverables remain archived securely and can be restored by contacting leadership.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDeactivateError(null);
                  setDeactivateReason('');
                  setDeactivatePassword('');
                  setShowDeactivateModal(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-semibold text-amber-300 bg-amber-950/30 border border-amber-600/40 hover:bg-amber-900/40 hover:border-amber-500 transition-all cursor-pointer"
              >
                Deactivate My Account
              </button>
            </div>

            {/* Permanent Deletion Box */}
            <div className="p-5 rounded-2xl bg-[#11151D] border border-rose-950/60 hover:border-rose-500/40 transition-colors flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-display font-bold text-sm">
                  <Trash2 className="w-4 h-4" />
                  <span>Permanent Account Deletion</span>
                </div>
                <p className="text-[11px] text-[#9299A6] leading-relaxed">
                  Permanently delete your user credentials, personal contact snapshots, active uncompleted orders, and direct support conversations. This action cannot be reversed.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setDeleteConfirmText('');
                  setDeletePassword('');
                  setShowDeleteModal(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-semibold text-rose-300 bg-rose-950/40 border border-rose-700/50 hover:bg-rose-900/50 hover:border-rose-500 transition-all cursor-pointer"
              >
                Permanently Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Account Modal */}
      <AnimatePresence>
        {showDeactivateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050609]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[#080A0E] border border-amber-500/50 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#292E38] pb-4">
                <div className="flex items-center gap-2 text-amber-400 font-display font-bold text-base">
                  <UserX className="w-5 h-5" />
                  <span>Confirm Account Deactivation</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeactivateModal(false)}
                  className="p-1 rounded-lg text-[#9299A6] hover:text-white hover:bg-[#11151D] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#B7BBC4] leading-relaxed">
                Deactivating your account will immediately terminate your session and suspend direct notifications. To restore access later, please reach out to Dracovion Executive Support.
              </p>

              {deactivateError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-600/40 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{deactivateError}</span>
                </div>
              )}

              <form onSubmit={handleDeactivateAccount} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#9299A6] uppercase mb-1">
                    Reason for Deactivation (Optional)
                  </label>
                  <input
                    type="text"
                    value={deactivateReason}
                    onChange={(e) => setDeactivateReason(e.target.value)}
                    placeholder="e.g. Project finished, temporary break, etc."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#9299A6] uppercase mb-1">
                    Enter Password (if local password account)
                  </label>
                  <input
                    type="password"
                    value={deactivatePassword}
                    onChange={(e) => setDeactivatePassword(e.target.value)}
                    placeholder="Account password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeactivateModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-mono text-[#9299A6] hover:text-white hover:bg-[#11151D] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeactivating}
                    className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase text-[#050609] bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isDeactivating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Deactivating...</span>
                      </>
                    ) : (
                      <span>Confirm Deactivation</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Permanently Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050609]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[#080A0E] border border-rose-600/60 shadow-[0_0_50px_rgba(225,29,72,0.25)] space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#292E38] pb-4">
                <div className="flex items-center gap-2 text-rose-400 font-display font-bold text-base">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Permanent Account Deletion</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="p-1 rounded-lg text-[#9299A6] hover:text-white hover:bg-[#11151D] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 leading-relaxed space-y-1">
                <strong className="block text-rose-200">Irreversible Action:</strong>
                <p>
                  This will permanently delete your user profile, active uncompleted project orders, and support conversations from Dracovion Technologies.
                </p>
              </div>

              {deleteError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-600/40 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-rose-300 uppercase mb-1">
                    Type <span className="font-bold text-white tracking-widest">DELETE</span> to confirm *
                  </label>
                  <input
                    type="text"
                    required
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-rose-800/50 text-white text-xs font-mono focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#9299A6] uppercase mb-1">
                    Enter Password (if local password account)
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Account password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs font-mono focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-mono text-[#9299A6] hover:text-white hover:bg-[#11151D] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeletingAccount || (deleteConfirmText.trim().toUpperCase() !== 'DELETE' && !deletePassword)}
                    className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase text-white bg-rose-600 hover:bg-rose-500 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    {isDeletingAccount ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Deleting Account...</span>
                      </>
                    ) : (
                      <span>Permanently Delete</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
