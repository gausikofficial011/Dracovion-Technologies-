import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { AdminLoadError } from '../../components/admin/AdminLoadError';
import { Building, ShieldCheck, Database } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadSettings = useCallback(() => {
    setIsLoading(true);
    setErrorMsg(null);
    api
      .get<{ success: boolean; settings: any }>('/admin/settings')
      .then((res) => setSettings(res.settings))
      .catch((err: any) => {
        setErrorMsg(err?.message || 'Unable to load platform configuration.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-[#9299A6] font-mono text-sm">
        Loading platform configurations...
      </div>
    );
  }

  if (errorMsg || !settings) {
    return (
      <AdminLoadError
        message={errorMsg || 'Platform configuration response was empty.'}
        onRetry={loadSettings}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-[10px] font-mono text-[#FFBD55] uppercase font-bold mb-2">
          <span>ENTERPRISE CONFIGURATION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">Platform Settings &amp; Commercial Identity</h1>
        <p className="text-xs sm:text-sm text-[#9299A6] mt-1">
          Operational configurations, Indian GST compliance state, and storage service drivers.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-6">
        <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <Building className="w-5 h-5 text-[#FFBD55]" />
          <span>Business Identity (Tamil Nadu, India)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38]">
            <span className="text-[#9299A6] block uppercase text-[10px]">Brand Name</span>
            <span className="text-white font-bold text-sm">{settings.businessName}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38]">
            <span className="text-[#9299A6] block uppercase text-[10px]">Tagline</span>
            <span className="text-white font-bold text-sm">{settings.tagline}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38]">
            <span className="text-[#9299A6] block uppercase text-[10px]">Operational State &amp; Country</span>
            <span className="text-[#FFBD55] font-bold">
              {settings.state}, {settings.country}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38]">
            <span className="text-[#9299A6] block uppercase text-[10px]">Primary Currency</span>
            <span className="text-white font-bold">{settings.currency} (Indian Rupee)</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38]">
            <span className="text-[#9299A6] block uppercase text-[10px]">Official Contact</span>
            <span className="text-white">{settings.email}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38]">
            <span className="text-[#9299A6] block uppercase text-[10px]">Primary Phone</span>
            <span className="text-white">{settings.phone}</span>
          </div>
        </div>
      </div>

      {/* GST and Taxation Compliance Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#D6A94F]" />
          <span>Indian Commercial Tax &amp; GST Treatment</span>
        </h3>

        <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-2 text-xs">
          <div className="flex items-center justify-between font-mono">
            <span className="text-[#9299A6]">GST Registration Status:</span>
            <span className={settings.isGstRegistered ? 'text-emerald-400 font-bold' : 'text-[#FFBD55] font-bold'}>
              {settings.isGstRegistered ? 'Registered Tax Entity' : 'Unregistered / Exemption Threshold (Starter Studio)'}
            </span>
          </div>
          <p className="text-[#9299A6] text-[11px] leading-relaxed pt-1">
            As a founder-led startup in Tamil Nadu, GST is only collected and remitted once legal commercial turnover thresholds are met. The system avoids false tax collection claims.
          </p>
        </div>
      </div>

      {/* Storage and Security Architecture */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <Database className="w-5 h-5 text-[#FFBD55]" />
          <span>Storage &amp; Cloud Infrastructure</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38]">
            <span className="text-[#9299A6] block uppercase text-[10px]">Deliverables Storage Driver</span>
            <span className="text-white font-bold">{settings.storageDriver.toUpperCase()} (Private Vault)</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38]">
            <span className="text-[#9299A6] block uppercase text-[10px]">Database Architecture</span>
            <span className="text-white font-bold">MongoDB Atlas (Mongoose ODM)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
