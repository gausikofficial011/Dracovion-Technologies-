import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCw, LogIn } from 'lucide-react';

interface AdminLoadErrorProps {
  message: string;
  onRetry: () => void;
}

/**
 * Reusable fallback card for admin views when live API data fails to load.
 */
export const AdminLoadError: React.FC<AdminLoadErrorProps> = ({ message, onRetry }) => {
  return (
    <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-[#080A0E] border border-rose-800/60 shadow-2xl text-center space-y-5">
      <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-700/60 text-rose-400 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-display font-bold text-white">Unable to Load Live Data</h2>
        <p className="text-xs font-mono text-rose-300 leading-relaxed">{message}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#11151D] border border-[#D6A94F]/50 hover:border-[#FFBD55] text-xs font-mono text-[#FFBD55] cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D6A94F] to-[#FFBD55] text-[#050609] text-xs font-bold uppercase tracking-wider"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In Again</span>
        </Link>
      </div>
    </div>
  );
};
