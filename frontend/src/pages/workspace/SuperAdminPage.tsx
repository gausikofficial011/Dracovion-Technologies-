import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  ShieldAlert,
  UserPlus,
  Trash2,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  User,
  Building,
  ArrowLeft,
  Sparkles,
  KeyRound,
  X,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  RotateCcw,
  Wand2,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SuperAdminPage: React.FC = () => {
  const { user, isSuperAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [staffList, setStaffList] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Staff Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newDepartment, setNewDepartment] = useState('Engineering & Delivery');
  const [newDesignation, setNewDesignation] = useState('Full Stack Software Engineer');
  const [newPhone, setNewPhone] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Password Reveal & Management State (Applicable ONLY for Employees)
  const [revealedPasswords, setRevealedPasswords] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generateMemorablePassword = () => {
    const prefixes = ['Dracovion', 'Quantum', 'Nexus', 'Apex', 'Cyber', 'Titan', 'Vanguard', 'Hyperion', 'Aero', 'Solaris'];
    const nouns = ['Falcon', 'Dragon', 'Shield', 'Pioneer', 'Matrix', 'Vector', 'Spark', 'Forge', 'Sentinel', 'Pulse'];
    const symbols = ['!', '@', '#', '$', '%'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    return `${prefix}-${noun}-${num}${symbol}`;
  };

  const handleGeneratePasswordForNewStaff = () => {
    const pwd = generateMemorablePassword();
    setNewPassword(pwd);
    setShowNewPassword(true);
  };

  const handleCopyPassword = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResetEmployeePassword = async (staffId: string, fullName: string) => {
    const generated = generateMemorablePassword();
    if (!window.confirm(`Issue and set a new strong memorable password for ${fullName}?\n\nGenerated Password: ${generated}`)) {
      return;
    }

    try {
      const res = await api.post<{ success: boolean; message: string; retrievablePassword: string }>(
        `/super-admin/staff/${staffId}/reset-password`,
        { newPassword: generated }
      );
      setBannerMessage(`Password rotated for ${fullName}. Retrievable password: ${res.retrievablePassword}`);
      fetchStaff();
      setTimeout(() => setBannerMessage(null), 10000);
    } catch (err: any) {
      alert(err.message || 'Failed to reset employee password.');
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get<{ success: boolean; counts: any; staff: any[] }>('/super-admin/staff');
      setStaffList(res.staff || []);
      setCounts(res.counts || null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to retrieve staff roster.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/workspace/orders');
      return;
    }
    fetchStaff();
  }, [isSuperAdmin]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsCreating(true);

    try {
      const res = await api.post<{ success: boolean; message: string; staff: any }>('/super-admin/staff', {
        fullName: newFullName.trim(),
        email: newEmail.trim().toLowerCase(),
        password: newPassword,
        role: 'employee', // Strictly Employee accounts only
        department: newDepartment.trim(),
        designation: newDesignation.trim(),
        phone: newPhone.trim() || undefined,
      });

      setBannerMessage(res.message);
      setIsCreateModalOpen(false);
      // Reset form
      setNewFullName('');
      setNewEmail('');
      setNewPassword('');
      fetchStaff();
      setTimeout(() => setBannerMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create workspace account.');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.delete<{ success: boolean; message: string }>(`/super-admin/staff/${deleteTarget._id}`);
      setBannerMessage(res.message);
      setDeleteTarget(null);
      fetchStaff();
      setTimeout(() => setBannerMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to permanently delete staff account.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050609]/80 backdrop-blur-sm text-white selection:bg-[#D6A94F]/30 selection:text-[#F5D18A] relative z-10">
      {/* Top Bar */}
      <header className="w-full px-6 sm:px-10 py-4 border-b border-[#292E38] bg-[#0A0D13]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/workspace/orders"
            className="group inline-flex items-center gap-2 text-xs font-mono text-[#9299A6] hover:text-[#FFBD55] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#D6A94F]" />
            <span>BACK TO ORDERS QUEUE</span>
          </Link>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-700 text-purple-300 font-mono font-bold">
            SUPER ADMIN GOVERNANCE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="px-3 py-1.5 rounded-xl bg-[#11151D] border border-rose-500/40 text-rose-300 hover:text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">Users &amp; Fraud</span>
          </Link>

          <Link
            to="/admin/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F] text-white hover:text-[#FFBD55] text-xs font-medium transition-all"
            title="Edit My Profile & Photo"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName || 'Admin'}
                className="w-5 h-5 rounded-full object-cover object-top border border-[#D6A94F]"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FFBD55] to-[#D6A94F] text-[#050609] flex items-center justify-center font-bold text-[10px]">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
            )}
            <span className="hidden sm:inline font-mono">{user?.fullName?.split(' ')[0]}</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-[#080A0E] shadow-lg cursor-pointer"
            style={{
              background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
            }}
          >
            <UserPlus className="w-3.5 h-3.5 text-[#080A0E]" />
            <span className="hidden sm:inline">Issue Worker Access</span>
          </button>

          <button
            onClick={() => logout()}
            title="Sign Out"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 hover:border-rose-700/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Banner Alert */}
        <AnimatePresence>
          {bannerMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{bannerMessage}</span>
            </motion.div>
          )}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Console Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border-[1.5px] border-[#D6A94F]/50 shadow-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#FFBD55] uppercase font-bold">
            <Sparkles className="w-4 h-4 text-[#FFBD55]" />
            <span>CENTRAL WORKSPACE GOVERNANCE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Super Admin <span className="text-[#FFBD55]">Console</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#B7BBC4] max-w-2xl leading-relaxed">
            Welcome, <strong>{user?.fullName}</strong>. Workspace accounts for Employees, CEO, and Owner are fixed
            and issued exclusively through this console. Only Super Admin has authority to permanently delete or provision worker workspace accounts.
          </p>

          {/* Counts */}
          {counts && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#292E38] text-center font-mono text-xs">
              <div className="p-3 rounded-2xl bg-[#11151D] border border-[#292E38]">
                <div className="text-xl font-bold text-[#FFBD55]">{counts.total}</div>
                <div className="text-[10px] text-[#9299A6] uppercase mt-0.5">Total Personnel</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#11151D] border border-purple-500/30">
                <div className="text-xl font-bold text-purple-300">{counts.employees}</div>
                <div className="text-[10px] text-[#9299A6] uppercase mt-0.5">Company Employees</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#11151D] border border-[#D6A94F]/30">
                <div className="text-xl font-bold text-[#FFBD55]">{counts.ceo}</div>
                <div className="text-[10px] text-[#9299A6] uppercase mt-0.5">Chief Executive</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#11151D] border border-emerald-500/30">
                <div className="text-xl font-bold text-[#52D69A]">{counts.owner}</div>
                <div className="text-[10px] text-[#9299A6] uppercase mt-0.5">Platform Owner</div>
              </div>
            </div>
          )}
        </div>

        {/* Staff Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FFBD55]" />
              <span>Workspace Roster ({staffList.length})</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs font-mono text-[#9299A6]">Loading roster...</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {staffList.map((staff) => {
                const isMe = staff._id === user?.id;
                const isSuper = staff.role === 'super_admin';

                return (
                  <div
                    key={staff._id}
                    className="p-5 rounded-2xl bg-[#080A0E] border border-[#292E38] hover:border-[#D6A94F]/50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-[#FFBD55]">
                          {staff.employeeCode || 'DRV-STAFF'}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            staff.role === 'super_admin'
                              ? 'bg-purple-950/80 border border-purple-700 text-purple-300'
                              : staff.role === 'ceo'
                              ? 'bg-[#11151D] border border-[#D6A94F]/60 text-[#FFBD55]'
                              : staff.role === 'owner'
                              ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-400'
                              : 'bg-amber-950/80 border border-amber-700 text-[#FFBD55]'
                          }`}
                        >
                          {staff.role.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-[#52D69A]">• {staff.status}</span>
                      </div>

                      <div className="text-base font-bold text-white font-display flex items-center gap-2">
                        <span>{staff.fullName}</span>
                        {isMe && <span className="text-xs text-[#FFBD55] font-mono">(You)</span>}
                      </div>

                      <div className="text-xs text-[#9299A6] flex flex-wrap items-center gap-3">
                        <span className="text-slate-300">{staff.email}</span>
                        <span>•</span>
                        <span>{staff.designation}</span>
                        <span>•</span>
                        <span>{staff.department}</span>
                      </div>
                    </div>

                    {/* Actions & Credential Vault */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#292E38]">
                      {/* Employee Password Vault (Applicable strictly for employees) */}
                      {staff.role === 'employee' ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#11151D] border border-[#292E38] text-xs">
                          <KeyRound className="w-3.5 h-3.5 text-[#FFBD55] shrink-0" />
                          <span className="font-mono text-xs text-[#E7E9EE] select-all">
                            {revealedPasswords[staff._id]
                              ? (staff.retrievablePassword || 'Not stored in vault')
                              : '••••••••••••'}
                          </span>

                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(staff._id)}
                            className="text-[#9299A6] hover:text-white p-1 transition-colors cursor-pointer"
                            title={revealedPasswords[staff._id] ? 'Hide Password' : 'Show Retrievable Password'}
                          >
                            {revealedPasswords[staff._id] ? (
                              <EyeOff className="w-3.5 h-3.5 text-[#FFBD55]" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {staff.retrievablePassword && (
                            <button
                              type="button"
                              onClick={() => handleCopyPassword(staff._id, staff.retrievablePassword!)}
                              className="text-[#9299A6] hover:text-[#FFBD55] p-1 transition-colors cursor-pointer"
                              title="Copy Password"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {copiedId === staff._id && (
                            <span className="text-[10px] text-emerald-400 font-mono font-bold animate-pulse">
                              Copied!
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleResetEmployeePassword(staff._id, staff.fullName)}
                            className="inline-flex items-center gap-1 ml-1.5 px-2 py-0.5 rounded-lg bg-[#15191F] border border-[#353941] text-[10px] font-mono text-[#FFBD55] hover:text-white hover:border-[#FFBD55] transition-colors cursor-pointer"
                            title="Reset with New Memorable Password"
                          >
                            <RotateCcw className="w-3 h-3 text-[#FFBD55]" />
                            <span>Reset</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#11151D]/60 border border-[#292E38] text-[10px] font-mono text-[#9299A6]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#D6A94F]" />
                          <span>Permanent Leadership • Self-Managed</span>
                        </div>
                      )}

                      {/* Permanent Delete Action */}
                      <div>
                        {!isMe && staff.role === 'employee' ? (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(staff)}
                            className="px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 hover:bg-rose-900/60 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>Delete</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono text-[#9299A6] px-2.5 py-1 rounded-xl bg-[#11151D] border border-[#292E38] shrink-0">
                            Permanent Role
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* CREATE WORKER MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-[#080A0E] border-[1.5px] border-[#D6A94F] p-7 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-[#292E38] pb-3">
                <div>
                  <div className="text-[10px] font-mono text-[#FFBD55] uppercase font-bold">
                    PROVISION EMPLOYEE WORKSPACE ACCESS
                  </div>
                  <h3 className="text-lg font-bold font-display text-white">Issue Employee Credentials</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-lg text-[#9299A6] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      placeholder="e.g. Senthil Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Company Work Email *</label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="senthil@dracovion.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
                    />
                  </div>

                  {/* Password Field with Memorable Auto-Generator */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-300">Initial Password *</label>
                      <button
                        type="button"
                        onClick={handleGeneratePasswordForNewStaff}
                        className="text-[11px] font-mono text-[#FFBD55] hover:text-[#F5D18A] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Wand2 className="w-3 h-3 text-[#FFBD55]" />
                        <span>Generate Strong Memorable Password</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="e.g. Dracovion-Falcon-8492! (min 8 chars)"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs font-mono focus:border-[#FFBD55] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9299A6] hover:text-white cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-[#9299A6] mt-1">
                      This password will be securely encrypted and retrievable by Super Admin if the employee forgets.
                    </p>
                  </div>

                  {/* Role Specification Notice */}
                  <div className="sm:col-span-2 p-3 rounded-xl bg-[#11151D] border border-[#292E38] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#52D69A]" />
                      <span className="text-[11px] font-mono text-[#FFBD55] uppercase font-bold">
                        Role: Company Employee (Fixed Governance)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9299A6] leading-relaxed">
                      Super Admin can only create employee login accounts. Owner and CEO accounts are permanent leadership roles and cannot be created or altered here.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Department *</label>
                    <input
                      type="text"
                      required
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      placeholder="e.g. Engineering & Delivery"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Designation *</label>
                    <input
                      type="text"
                      required
                      value={newDesignation}
                      onChange={(e) => setNewDesignation(e.target.value)}
                      placeholder="e.g. Lead Mobile Architect"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-[#080A0E] flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                    }}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#080A0E]" />
                        <span>Creating Employee Account...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 text-[#080A0E]" />
                        <span>Authorize &amp; Provision Employee</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-3 rounded-xl bg-[#15191F] border border-[#292E38] text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PERMANENT DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-[#080A0E] border-[1.5px] border-rose-700 p-7 text-center space-y-4 shadow-2xl relative"
            >
              <div className="w-14 h-14 rounded-full bg-rose-950/80 border border-rose-700 flex items-center justify-center mx-auto text-rose-400">
                <Trash2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold font-display text-white">Permanent Account Deletion</h3>
                <p className="text-xs text-[#9299A6]">
                  Are you sure you want to permanently delete{' '}
                  <strong className="text-white">{deleteTarget.fullName}</strong> ({deleteTarget.email})?
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs text-left leading-relaxed">
                * As Super Admin, this action is permanent. The worker will be immediately blocked from accessing the workspace and all active sessions will be terminated.
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handlePermanentDelete}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Permanently Delete Worker</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-5 py-3 rounded-xl bg-[#15191F] border border-[#292E38] text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

