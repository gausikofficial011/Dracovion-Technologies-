import React from 'react';
import { DownloadCloud, FileText, Image as ImageIcon, X } from 'lucide-react';
import { resolveApiUrl } from '../../api/client';
import type { ChatAttachmentFile } from '../../hooks/useChatRealtime';

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const MessageAttachmentsList: React.FC<{ attachments?: ChatAttachmentFile[] }> = ({ attachments }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="pt-2 space-y-2">
      {attachments.map((att) => {
        const isImage = Boolean(att.mimeType && att.mimeType.startsWith('image/'));
        const downloadHref = resolveApiUrl(`/files/${att.fileKey}/download`);
        const previewHref = resolveApiUrl(`/files/${att.fileKey}/download?inline=true`);

        return (
          <div
            key={att._id || att.fileKey}
            className="rounded-xl bg-[#080A0E]/90 border border-[#292E38] p-2 space-y-2"
          >
            {isImage && (
              <a href={downloadHref} target="_blank" rel="noopener noreferrer" className="block">
                <img
                  src={previewHref}
                  alt={att.originalName}
                  className="max-h-48 w-auto rounded-lg border border-[#292E38] object-contain"
                />
              </a>
            )}
            <a
              href={downloadHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#E7E9EE] hover:text-[#FFBD55] transition-colors"
            >
              <span className="flex items-center gap-1.5 min-w-0">
                {isImage ? (
                  <ImageIcon className="w-3.5 h-3.5 text-[#78BFFF] shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-[#FFBD55] shrink-0" />
                )}
                <span className="truncate">{att.originalName}</span>
                <span className="text-[#9299A6] shrink-0">({formatBytes(att.sizeBytes)})</span>
              </span>
              <DownloadCloud className="w-3.5 h-3.5 text-[#FFBD55] shrink-0" />
            </a>
          </div>
        );
      })}
    </div>
  );
};

export const StagedAttachmentsBar: React.FC<{
  files: ChatAttachmentFile[];
  onRemove: (id: string) => void;
}> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pb-2 shrink-0">
      {files.map((file) => (
        <div
          key={file._id}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#11151D] border border-[#D6A94F]/40 text-[11px] font-mono text-[#E7E9EE]"
        >
          <span className="truncate max-w-[180px]">{file.originalName}</span>
          <span className="text-[#9299A6]">({formatBytes(file.sizeBytes)})</span>
          <button
            type="button"
            onClick={() => onRemove(file._id)}
            className="text-[#9299A6] hover:text-rose-400 cursor-pointer"
            aria-label={`Remove ${file.originalName}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
