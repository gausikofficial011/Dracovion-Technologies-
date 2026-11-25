import React from 'react';
import { FolderGit2 } from 'lucide-react';

/**
 * Symmetric official company social links bar rendered inside portal sidebars.
 */
export const PortalSocialLinks: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <a
        href="https://github.com/dracovion-technologies"
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-[#9299A6] hover:text-[#FFBD55] bg-[#11151D]/40 hover:bg-[#11151D] border border-[#292E38]/80 hover:border-[#D6A94F]/40 transition-colors"
      >
        <FolderGit2 className="w-3.5 h-3.5 text-[#FFBD55] shrink-0" />
        <span>GitHub</span>
      </a>
      <a
        href="https://www.instagram.com/dracovion_technologies?hvrq=MWxuaXdtZ2tsYjdhNQ=="
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-[#9299A6] hover:text-[#FFBD55] bg-[#11151D]/40 hover:bg-[#11151D] border border-[#292E38]/80 hover:border-[#D6A94F]/40 transition-colors"
      >
        <svg className="w-3.5 h-3.5 text-[#FFBD55] fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
        </svg>
        <span>Instagram</span>
      </a>
    </div>
  );
};
