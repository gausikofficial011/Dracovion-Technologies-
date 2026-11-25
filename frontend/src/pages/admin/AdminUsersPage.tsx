import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  GraduationCap,
  Building,
  Search,
  CheckCircle2,
  Ban,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';

interface ManagedUser {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  status: 'active' | 'suspended' | 'pending';
  companyName?: string;
  collegeOrUniversity?: string;
  fraudFlag?: boolean;
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
}

const ROLE_LABELS: Record<string, string> = {
  client: 'Client',
  student: 'Student',
  partner: 'Partner',
  team_member: 'Team Member',
  project_manager: 'Project Manager',
  finance_operator: 'Finance Operator',
  employee: 'Employee',
  admin: 'Administrator',
  ceo: 'CEO',
  owner: 'President / Owner',
  super_admin: 'Super Admin',
};

const EDITABLE_ROLES = [
  'client',
  'student',
  'partner',
  'team_member',
  'project_manager',
  'finance_operator',
  'employee',
  'admin',
  'owner',
] as const;

const PROTECTED_EXECUTIVE_ROLES = new Set(['super_admin', 'owner', 'ceo']);
const FRAUD_REASON_PRESETS = [
  'Suspected fraudulent activity / scam',
  'Payment or chargeback fraud',
  'Fake identity / impersonation',
  'Unauthorized access or API abuse',
];

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Account activation/disable modal state
  const [moderationTarget, setModerationTarget] = useState<{
    user: ManagedUser;
    targetStatus: 'active' | 'suspended';
  } | null>(null);
  const [isFraudFlag, setIsFraudFlag] = useState(true);
  const [moderationReason, setModerationReason] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const canManageAccountStatus = ['owner', 'super_admin', 'ceo'].includes(currentUser?.role || '');

  const loadUsers = () => {
    setIsLoading(true);
    api
      .get<{ success: boolean; users: ManagedUser[] }>('/admin/users', {
        role: roleFilter,
        status: statusFilter,
        ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
      })
      .then((res) => setUsers(res.users || []))
      .catch((err: any) => {
        setFeedback({ type: 'error', text: err?.message || 'Failed to load accounts.' });
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (currentUser?.role !== 'owner') {
      setFeedback({ type: 'error', text: 'Only the primary Platform President / Owner can change roles.' });
      return;
    }

    if (!window.confirm(`Change this user's role to '${ROLE_LABELS[newRole] || newRole}'?`)) {
      return;
    }

    try {
      const res = await api.patch<{ success: boolean; message?: string }>(`/admin/users/${userId}/role`, {
        role: newRole,
      });
      setFeedback({ type: 'success', text: res.message || 'User role updated successfully.' });
      loadUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to update user role.' });
    }
  };

  const openModerationModal = (targetUser: ManagedUser, targetStatus: 'active' | 'suspended') => {
    setModerationTarget({ user: targetUser, targetStatus });
    if (targetStatus === 'suspended') {
      setIsFraudFlag(true);
      setModerationReason(FRAUD_REASON_PRESETS[0]);
    } else {
      setIsFraudFlag(false);
      setModerationReason('Account verified and restored by executive governance.');
    }
  };

  const handleConfirmStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moderationTarget) return;

    setIsUpdatingStatus(true);
    setFeedback(null);
    try {
      const res = await api.patch<{ success: boolean; message?: string }>(
        `/admin/users/${moderationTarget.user._id}/status`,
        {
          status: moderationTarget.targetStatus,
          isFraud: moderationTarget.targetStatus === 'suspended' ? isFraudFlag : false,
          reason: moderationReason.trim(),
        }
      );
      setFeedback({
        type: 'success',
        text:
          res.message ||
          `Account ${moderationTarget.user.email} set to ${moderationTarget.targetStatus}.`,
      });
      setModerationTarget(null);
      loadUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to update account status.' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const activeCount = users.filter((u) => u.status === 'active').length;
  const suspendedCount = users.filter((u) => u.status === 'suspended').length;
  const fraudCount = users.filter((u) => u.status === 'suspended' && u.fraudFlag).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#292E38] pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-[10px] font-mono text-[#FFBD55] uppercase font-bold mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FFBD55]" />
              <span>SECURITY, RBAC &amp; FRAUD GOVERNANCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Users &amp; Account Security Control
            </h1>
            <p className="text-xs sm:text-sm text-[#9299A6] mt-1">
              President, Super Admin, and CEO can activate or disable accounts immediately when fraud or security threats are detected.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full lg:w-80">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9299A6] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or email..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#11151D] border border-[#292E38] text-xs text-white placeholder-[#9299A6] focus:outline-none focus:border-[#D6A94F]"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-[#15191F] border border-[#292E38] hover:border-[#D6A94F] text-xs font-mono text-[#FFBD55] cursor-pointer transition-colors"
            >
              Find
            </button>
          </form>
        </div>

        {/* Summary Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#0A0D13] border border-[#292E38] flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#9299A6]">Listed Accounts</div>
              <div className="text-xl font-display font-bold text-white mt-0.5">{users.length}</div>
            </div>
            <Users className="w-5 h-5 text-[#FFBD55]" />
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0A0D13] border border-[#292E38] flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#9299A6]">Active Accounts</div>
              <div className="text-xl font-display font-bold text-emerald-400 mt-0.5">{activeCount}</div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0A0D13] border border-[#292E38] flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#9299A6]">Disabled / Fraud Flagged</div>
              <div className="text-xl font-display font-bold text-rose-400 mt-0.5">
                {suspendedCount} <span className="text-xs font-mono text-[#9299A6]">({fraudCount} fraud)</span>
              </div>
            </div>
            <Ban className="w-5 h-5 text-rose-400" />
          </div>
        </div>

        {/* Wrapped Filter Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'client', 'student', 'partner', 'employee', 'ceo', 'owner', 'super_admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === r
                    ? 'bg-gradient-to-r from-[#D6A94F] to-[#FFBD55] text-[#050609] font-bold shadow-md'
                    : 'bg-[#11151D] text-[#9299A6] border border-[#292E38] hover:border-[#D6A94F] hover:text-white'
                }`}
              >
                {r === 'all' ? 'All Roles' : ROLE_LABELS[r] || r}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'active', label: 'Active' },
              { id: 'suspended', label: 'Disabled / Fraud' },
              { id: 'pending', label: 'Pending' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatusFilter(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === s.id
                    ? 'bg-[#1A202C] text-[#FFBD55] border border-[#D6A94F]/70 font-bold'
                    : 'bg-[#11151D] text-[#9299A6] border border-[#292E38] hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inline Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
              : 'bg-rose-950/60 border-rose-700/60 text-rose-300'
          }`}
        >
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)} className="text-current opacity-80 hover:opacity-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Accounts Table */}
      {isLoading ? (
        <div className="py-20 text-center text-[#9299A6] font-mono text-sm">Loading user accounts...</div>
      ) : users.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-[#292E38] bg-[#080A0E] text-[#9299A6] font-mono text-xs">
          No user accounts match the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-[#292E38] bg-[#080A0E] shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0D13] text-[#F5D18A] font-mono border-b border-[#292E38]">
              <tr>
                <th className="p-4">Full Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Affiliation</th>
                <th className="p-4 text-center">Current Role</th>
                <th className="p-4 text-center">Account Status</th>
                <th className="p-4 text-center">Role Governance</th>
                <th className="p-4 text-right">Fraud / Activation Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292E38]/80">
              {users.map((u) => {
                const isSelf = u._id === currentUser?.id;
                const isProtectedTarget = PROTECTED_EXECUTIVE_ROLES.has(u.role) && currentUser?.role === 'ceo';
                const canToggleTarget = canManageAccountStatus && !isSelf && !isProtectedTarget;
                const isEditableRoleTarget = currentUser?.role === 'owner' && !['super_admin', 'ceo'].includes(u.role);

                return (
                  <tr key={u._id} className="hover:bg-[#11151D]/60 transition-colors align-middle">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5 font-bold text-white">
                        <div className="w-7 h-7 rounded-lg bg-[#11151D] border border-[#D6A94F]/30 text-[#FFBD55] flex items-center justify-center font-mono font-bold shrink-0">
                          {u.fullName.charAt(0)}
                        </div>
                        <span className="truncate max-w-[180px]">{u.fullName}</span>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-[#E7E9EE] whitespace-nowrap">{u.email}</td>

                    <td className="p-4 text-[#9299A6]">
                      {u.companyName ? (
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-[#FFBD55] shrink-0" />
                          <span>{u.companyName}</span>
                        </span>
                      ) : u.collegeOrUniversity ? (
                        <span className="flex items-center gap-1.5 text-[#FFBD55]">
                          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                          <span>{u.collegeOrUniversity}</span>
                        </span>
                      ) : (
                        'Direct User'
                      )}
                    </td>

                    <td className="p-4 text-center font-mono uppercase font-bold text-[#FFBD55] whitespace-nowrap">
                      {ROLE_LABELS[u.role] || u.role}
                    </td>

                    <td className="p-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        {u.status === 'active' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase font-bold">
                            Active
                          </span>
                        ) : u.status === 'suspended' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase font-bold whitespace-nowrap">
                            {u.fraudFlag ? 'Disabled • Fraud' : 'Disabled'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase font-bold">
                            Pending
                          </span>
                        )}
                        {u.status === 'suspended' && u.moderationReason && (
                          <span className="text-[10px] text-[#9299A6] max-w-[190px] truncate" title={u.moderationReason}>
                            {u.moderationReason}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      {isEditableRoleTarget ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-[#11151D] border border-[#292E38] text-white font-mono text-[11px] focus:border-[#D6A94F] focus:outline-none cursor-pointer"
                        >
                          {EDITABLE_ROLES.map((roleOpt) => (
                            <option key={roleOpt} value={roleOpt}>
                              {ROLE_LABELS[roleOpt]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[11px] text-[#9299A6] font-mono whitespace-nowrap">
                          {PROTECTED_EXECUTIVE_ROLES.has(u.role) ? 'Executive Leadership' : 'Owner Restricted'}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      {isSelf ? (
                        <span className="text-[10px] font-mono text-[#9299A6] px-2.5 py-1 rounded-lg bg-[#11151D] border border-[#292E38]">
                          Current Session
                        </span>
                      ) : isProtectedTarget ? (
                        <span className="text-[10px] font-mono text-[#9299A6] px-2.5 py-1 rounded-lg bg-[#11151D] border border-[#292E38]">
                          Protected Executive
                        </span>
                      ) : !canToggleTarget ? (
                        <span className="text-[10px] font-mono text-[#9299A6]">Executive Only</span>
                      ) : (
                        <div className="inline-flex items-center gap-2 justify-end">
                          {u.status !== 'active' && (
                            <button
                              type="button"
                              onClick={() => openModerationModal(u, 'active')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 transition-colors cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Activate</span>
                            </button>
                          )}
                          {u.status !== 'suspended' && (
                            <button
                              type="button"
                              onClick={() => openModerationModal(u, 'suspended')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 transition-colors cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Disable (Fraud)</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Account Activation / Fraud Disable Modal */}
      {moderationTarget &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-[#050609]/90 backdrop-blur-md"
            onClick={() => !isUpdatingStatus && setModerationTarget(null)}
          >
            <div
              className="w-full max-w-lg rounded-3xl bg-[#0A0D13] border border-[#D6A94F]/45 shadow-[0_25px_65px_rgba(0,0,0,0.95)] p-6 sm:p-7 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#292E38] pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      moderationTarget.targetStatus === 'suspended'
                        ? 'bg-rose-950/60 border-rose-700/60 text-rose-400'
                        : 'bg-emerald-950/60 border-emerald-700/60 text-emerald-400'
                    }`}
                  >
                    {moderationTarget.targetStatus === 'suspended' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#FFBD55]">
                      Executive Account Governance
                    </div>
                    <h2 className="text-lg font-display font-bold text-white">
                      {moderationTarget.targetStatus === 'suspended'
                        ? 'Disable Account for Fraud / Security'
                        : 'Verify & Activate Account'}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !isUpdatingStatus && setModerationTarget(null)}
                  className="p-2 rounded-full bg-[#11151D] border border-[#292E38] text-[#9299A6] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmStatusUpdate} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#11151D] border border-[#292E38] text-xs space-y-1">
                  <div className="font-bold text-white">{moderationTarget.user.fullName}</div>
                  <div className="font-mono text-[#9299A6]">
                    {moderationTarget.user.email} • {ROLE_LABELS[moderationTarget.user.role] || moderationTarget.user.role}
                  </div>
                </div>

                {moderationTarget.targetStatus === 'suspended' && (
                  <>
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-950/25 border border-rose-800/50 cursor-pointer text-xs text-rose-200">
                      <input
                        type="checkbox"
                        checked={isFraudFlag}
                        onChange={(e) => setIsFraudFlag(e.target.checked)}
                        className="accent-rose-500"
                      />
                      <span>Flag account for suspected fraud / security violation (revokes active sessions immediately)</span>
                    </label>

                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono uppercase text-[#9299A6]">Quick Reason Presets</div>
                      <div className="flex flex-wrap gap-1.5">
                        {FRAUD_REASON_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setModerationReason(preset)}
                            className="px-2.5 py-1 rounded-lg bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F] text-[11px] text-[#E7E9EE] cursor-pointer transition-colors"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Audit Reason / Governance Note
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={moderationReason}
                    onChange={(e) => setModerationReason(e.target.value)}
                    placeholder="Enter reason for activating or disabling this account..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-xs text-white placeholder-[#9299A6] focus:outline-none focus:border-[#D6A94F]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => setModerationTarget(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-[#11151D] border border-[#292E38] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 ${
                      moderationTarget.targetStatus === 'suspended'
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-[#050609]'
                    }`}
                  >
                    {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>
                      {moderationTarget.targetStatus === 'suspended'
                        ? 'Disable Account Now'
                        : 'Activate Account'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
