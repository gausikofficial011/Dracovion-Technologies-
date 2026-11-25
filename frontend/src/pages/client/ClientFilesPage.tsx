import React, { useEffect, useState } from 'react';
import { api, resolveApiUrl } from '../../api/client';
import { DownloadCloud, FileArchive, ShieldCheck, FolderGit2 } from 'lucide-react';

export const ClientFilesPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.allSettled([
      api.get<{ success: boolean; projects: any[] }>('/projects/client/my'),
      api.get<{ success: boolean; orders: any[] }>('/orders/my'),
    ])
      .then(([projRes, orderRes]) => {
        if (projRes.status === 'fulfilled') setProjects(projRes.value.projects || []);
        if (orderRes.status === 'fulfilled') setOrders(orderRes.value.orders || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const allDeliverables = [
    ...projects.flatMap(p =>
      (p.deliverables || []).map((d: any) => ({
        ...d,
        itemCode: p.projectCode,
        itemTitle: p.title,
        sourceType: 'Sprint Project',
      }))
    ),
    ...orders.flatMap(o =>
      (o.deliverables || []).map((d: any) => ({
        ...d,
        itemCode: o.orderNumber,
        itemTitle: o.projectTitle,
        sourceType: 'Given Order',
      }))
    ),
  ];

  if (isLoading) {
    return <div className="py-20 text-center text-[#9299A6] font-mono text-sm">Loading deliverable files...</div>;
  }

  return (
    <div className="space-y-8 select-none">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">Deliverable Files Vault</h1>
        <p className="text-xs sm:text-sm text-[#9299A6] mt-1">
          Access and securely download production source repositories, documentation, and configuration deliverables.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-4">
        {allDeliverables.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#9299A6] space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#11151D] border border-[#D6A94F]/30 mx-auto flex items-center justify-center text-[#FFBD55]">
              <DownloadCloud className="w-8 h-8" />
            </div>
            <p className="font-semibold text-white font-display text-base">No deliverable files available yet.</p>
            <p className="text-[#9299A6] max-w-sm mx-auto">
              As sprint milestones are completed and approved, authorized zip packages and source repositories will be uploaded here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allDeliverables.map((file, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2.5 rounded-xl bg-[#080A0E] border border-[#292E38] text-[#FFBD55] shrink-0">
                    <FileArchive className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-bold text-white truncate">{file.title}</div>
                    <div className="text-[11px] font-mono text-[#9299A6]">
                      <span className="text-[#FFBD55] font-bold">{file.itemCode || file.projectCode}</span> • {file.originalName} • {(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB {file.sourceType && `(${file.sourceType})`}
                    </div>
                  </div>
                </div>

                <a
                  href={resolveApiUrl(`/files/${file.fileKey}/download`)}
                  download
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#050609] shadow-[0_0_15px_rgba(214,169,79,0.35)] hover:shadow-[0_0_25px_rgba(255,189,85,0.5)] hover:scale-[1.02] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  style={{
                    background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                  }}
                >
                  <DownloadCloud className="w-3.5 h-3.5 text-[#050609]" />
                  <span>Download Deliverable</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
