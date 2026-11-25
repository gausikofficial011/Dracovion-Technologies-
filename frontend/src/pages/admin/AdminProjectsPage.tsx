import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { AdminLoadError } from '../../components/admin/AdminLoadError';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  Upload,
  Layers,
  ArrowRight,
  ShieldAlert,
  Loader2,
  DownloadCloud,
} from 'lucide-react';

export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Deliverable Upload Form State
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const loadProjects = useCallback(() => {
    setIsLoading(true);
    setErrorMsg(null);
    api.get<{ success: boolean; projects: any[] }>('/projects/admin/all')
      .then(res => {
        setProjects(res.projects || []);
        if (selectedProject) {
          const updated = res.projects?.find((p: any) => p._id === selectedProject._id);
          if (updated) setSelectedProject(updated);
        }
      })
      .catch((err: any) => setErrorMsg(err?.message || 'Unable to load project control hub.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadProjects();
  }, []);

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      await api.patch(`/projects/${projectId}/status`, {
        status: newStatus,
        note: `Administrative state transition to ${newStatus}`,
      });
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to update project status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMilestoneToggle = async (projectId: string, index: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    setActionLoading(true);
    try {
      await api.patch(`/projects/${projectId}/milestones/${index}`, { status: nextStatus });
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to update milestone');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliverableUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !deliverableFile) {
      alert('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', deliverableFile);
      formData.append('projectId', selectedProject._id);
      formData.append('title', deliverableTitle || deliverableFile.name);
      formData.append('isDeliverable', 'true');

      await api.post('/files/upload', formData);
      alert('Deliverable artifact uploaded securely to project vault!');
      setDeliverableFile(null);
      setDeliverableTitle('');
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to upload deliverable file.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-500 font-mono text-sm">Loading project control hub...</div>;
  }

  if (errorMsg) {
    return <AdminLoadError message={errorMsg} onRetry={loadProjects} />;
  }

  return (
    <div className="space-y-8 select-none">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-[10px] font-mono text-[#FFBD55] uppercase font-bold mb-2">
          <span>PRODUCTION SPRINT LIFECYCLE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">Project Sprints &amp; State Machine</h1>
        <p className="text-xs sm:text-sm text-[#9299A6] mt-1">
          Manage controlled project transitions, milestone verifications, and deliverable vault uploads.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#9299A6] rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-xl">
          No projects created yet. Projects are initialized automatically when a client accepts a quotation.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects List */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-[#9299A6] uppercase tracking-wider block">
              Active Projects ({projects.length})
            </span>
            {projects.map(p => {
              const isSelected = selectedProject?._id === p._id;
              return (
                <div
                  key={p._id}
                  onClick={() => setSelectedProject(p)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-[#11151D] border-[#D6A94F] shadow-lg shadow-[#D6A94F]/10'
                      : 'bg-[#080A0E] border-[#292E38] hover:border-[#D6A94F]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono text-[#FFBD55]">{p.projectCode}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <h4 className="text-sm font-bold text-white">{p.title}</h4>
                  <div className="flex items-center justify-between text-xs text-[#9299A6] mt-2 font-mono">
                    <span>{p.clientId?.fullName || 'Client'}</span>
                    <span className="text-[#FFBD55] font-bold">{p.progressPercent}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Project Control Panel */}
          {selectedProject && (
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#292E38]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[#FFBD55]">{selectedProject.projectCode}</span>
                    <span className="text-xs font-mono text-[#9299A6]">
                      • Client: {selectedProject.clientId?.fullName} ({selectedProject.clientId?.email})
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white font-display">{selectedProject.title}</h2>
                </div>
                <StatusBadge status={selectedProject.status} size="md" />
              </div>

              {/* Status State Machine Transitions */}
              <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-3">
                <span className="text-xs font-mono text-[#9299A6] uppercase tracking-wider block">
                  Advance State Machine Status:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'approved',
                    'in_progress',
                    'review',
                    'delivered',
                    'completed',
                    'revision_required',
                    'blocked',
                    'cancelled',
                  ].map(st => (
                    <button
                      key={st}
                      disabled={actionLoading || selectedProject.status === st}
                      onClick={() => handleStatusChange(selectedProject._id, st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition-all cursor-pointer ${
                        selectedProject.status === st
                          ? 'bg-gradient-to-r from-[#D6A94F] to-[#FFBD55] text-[#050609] font-bold shadow-md'
                          : 'bg-[#080A0E] text-[#9299A6] hover:text-white border border-[#292E38] hover:border-[#D6A94F]'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milestones Checklist */}
              <div className="space-y-3">
                <span className="text-xs font-mono text-[#9299A6] uppercase tracking-wider block">
                  Milestones Progress:
                </span>
                <div className="space-y-2">
                  {selectedProject.milestones.map((m: any, idx: number) => {
                    const isDone = m.status === 'completed';
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          isDone
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-[#11151D] border-[#292E38]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleMilestoneToggle(selectedProject._id, idx, m.status)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isDone
                                ? 'bg-emerald-500 text-white border-emerald-400'
                                : 'bg-[#080A0E] text-[#9299A6] border-[#292E38] hover:text-white'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <div>
                            <div className={`text-xs font-bold ${isDone ? 'text-[#9299A6] line-through' : 'text-white'}`}>
                              {m.title}
                            </div>
                            {m.description && <div className="text-[11px] text-[#9299A6]">{m.description}</div>}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-[#9299A6] uppercase">
                          {m.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upload Deliverable Vault Form */}
              <div className="p-5 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#FFBD55]" />
                  <span>Upload Deliverable Artifact (Vault Release)</span>
                </h4>

                <form onSubmit={handleDeliverableUpload} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-[#9299A6] uppercase mb-1">
                        Deliverable Title
                      </label>
                      <input
                        type="text"
                        value={deliverableTitle}
                        onChange={e => setDeliverableTitle(e.target.value)}
                        placeholder="e.g. Production Source Code v1.0"
                        className="w-full px-3 py-2 rounded-xl bg-[#080A0E] border border-[#292E38] text-white text-xs focus:border-[#D6A94F] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-[#9299A6] uppercase mb-1">
                        Select File (.zip, .pdf, .tar.gz)
                      </label>
                      <input
                        type="file"
                        required
                        onChange={e => setDeliverableFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full text-xs text-[#9299A6] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#D6A94F]/40 file:text-xs file:font-bold file:bg-[#080A0E] file:text-[#FFBD55] cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] shadow-[0_0_20px_rgba(214,169,79,0.35)] hover:shadow-[0_0_30px_rgba(255,189,85,0.5)] transition-all cursor-pointer disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                    }}
                  >
                    {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#050609]" />}
                    <span>Upload &amp; Authorize for Client Download</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
