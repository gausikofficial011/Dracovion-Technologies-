import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { AdminLoadError } from '../../components/admin/AdminLoadError';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadLogs = useCallback(() => {
    setIsLoading(true);
    setErrorMsg(null);
    api
      .get<{ success: boolean; logs: any[] }>('/admin/audit-logs')
      .then((res) => setLogs(res.logs || []))
      .catch((err: any) => {
        setErrorMsg(err?.message || 'Unable to load security audit trail.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  if (isLoading) {
    return <div className="py-20 text-center text-[#9299A6] font-mono text-sm">Loading security audit trail...</div>;
  }

  if (errorMsg) {
    return <AdminLoadError message={errorMsg} onRetry={loadLogs} />;
  }

  return (
    <div className="space-y-8 select-none">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-[10px] font-mono text-[#FFBD55] uppercase font-bold mb-2">
          <span>SYSTEM IMMUTABLE LEDGER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">Security &amp; Financial Audit Trails</h1>
        <p className="text-xs sm:text-sm text-[#9299A6] mt-1">
          Immutable event ledger recording authentication, role changes, quotation approvals, and payment actions.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#9299A6] rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-xl">
          No audit entries recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-[#292E38] bg-[#080A0E] shadow-2xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0A0D13] text-[#F5D18A] border-b border-[#292E38]">
              <tr>
                <th className="p-4">Timestamp (UTC)</th>
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4">User</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292E38]/80">
              {logs.map(log => (
                <tr key={log._id} className="hover:bg-[#11151D]/60 transition-colors">
                  <td className="p-4 text-[#9299A6] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-[#11151D] text-[#FFBD55] border border-[#D6A94F]/40 font-bold text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-[#E7E9EE] font-sans font-medium">{log.entityType}</td>
                  <td className="p-4 text-white font-sans font-medium">
                    {log.userId?.fullName || 'System / Visitor'}
                    <span className="block text-[10px] text-[#9299A6] font-mono">{log.userId?.email}</span>
                  </td>
                  <td className="p-4 text-[#9299A6]">{log.ipAddress || '127.0.0.1'}</td>
                  <td className="p-4 max-w-xs truncate text-[#9299A6] text-[11px]">
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
