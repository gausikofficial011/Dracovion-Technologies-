import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toLowerCase();

  const getStyle = () => {
    switch (normalized) {
      // Success states
      case 'approved':
      case 'accepted':
      case 'verified':
      case 'paid':
      case 'completed':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

      // In Progress & Review
      case 'in_progress':
      case 'review':
      case 'reviewing':
      case 'under_review':
        return 'bg-[#FFBD55]/15 text-[#FFBD55] border-[#D6A94F]/30';

      // Pending & Proposals
      case 'quoted':
      case 'sent':
      case 'negotiating':
      case 'pending':
      case 'submitted':
      case 'issued':
      case 'new':
        return 'bg-[#D6A94F]/15 text-[#F5D18A] border-[#D6A94F]/30';

      // Revision Required & Blocked
      case 'revision_required':
      case 'blocked':
      case 'partially_paid':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';

      // Negative states
      case 'rejected':
      case 'cancelled':
      case 'expired':
      case 'void':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';

      default:
        return 'bg-[#11151D] text-[#9299A6] border-[#292E38]';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').toUpperCase();
  };

  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border ${getStyle()} ${sizeClass} select-none`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {formatText(status)}
    </span>
  );
};
