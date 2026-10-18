'use client';

import { useState } from 'react';
import { Copy, Check, FileText, Download } from 'lucide-react';

interface CodeViewerProps {
  content: string;
  filename?: string;
  className?: string;
  tokenEstimate?: number;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  allowEditing?: boolean;
}

export default function CodeViewer({
  content,
  filename = 'CLAUDE.md',
  className = '',
  tokenEstimate,
  badge,
  actions,
  allowEditing = true,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  // Synchronize when outer content prop changes
  const prevContentRef = useState(content);
  if (prevContentRef[0] !== content && !isEditing) {
    setEditedContent(content);
  }

  const activeContent = editedContent ?? content ?? '';
  const isModified = activeContent !== content;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(activeContent)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => console.warn('Clipboard copy error:', err));
    }
  };

  const handleDownload = () => {
    const blob = new Blob([activeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const lines = activeContent.split('\n');
  const tokenCount = isModified 
    ? Math.max(1, Math.round(activeContent.length / 3.8))
    : (tokenEstimate ?? Math.max(1, Math.round((content || '').length / 3.8)));

  return (
    <div className={`rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden flex flex-col ${className}`}>

      {/* Code Viewer Header - Clean flexbox toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-5 py-3.5 bg-black border-b border-white/10">
        <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-mono font-semibold text-white whitespace-nowrap">{filename}</span>
          <span className="text-[11px] text-white/40 font-mono whitespace-nowrap">({lines.length} lines)</span>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 whitespace-nowrap"
            title="Estimated prompt token usage (calculated at ~3.8 characters per token)"
          >
            ~{tokenCount.toLocaleString()} tokens
          </span>
          {isModified && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap"
              title="Locally customized in browser"
            >
              Edited
            </span>
          )}
          {badge}
        </div>

        {/* Action Button Group - horizontal scroll on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar self-end sm:self-auto">
          {actions}

          {/* In-Browser Edit Toggle */}
          {allowEditing && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-lg border transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
                isEditing
                  ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300 font-semibold'
                  : 'border-white/10 bg-neutral-900 hover:bg-neutral-800 text-white/80'
              }`}
              title={isEditing ? 'Exit edit mode and preview markdown' : 'Edit instructions before downloading'}
            >
              <span>{isEditing ? 'Preview' : 'Edit Instructions'}</span>
            </button>
          )}

          {/* Reset button when modified */}
          {isModified && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 shrink-0 px-2.5 py-1.5 min-h-[36px] text-xs font-medium rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-all whitespace-nowrap cursor-pointer"
              title="Reset to generated original"
            >
              Reset
            </button>
          )}

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-lg border border-white/10 bg-neutral-900 hover:bg-neutral-800 text-white/80 transition-all whitespace-nowrap cursor-pointer touch-manipulation"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5 text-white/60 shrink-0" />
            Download
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-lg bg-white text-black hover:opacity-90 transition-all whitespace-nowrap shadow-sm cursor-pointer touch-manipulation"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            {copied ? 'Copied!' : 'Copy File'}
          </button>
        </div>
      </div>

      {/* Code Text Content / Editor */}
      {isEditing ? (
        <div className="p-4 bg-[#0d1117] flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8b949e] font-mono px-1">
            <span>✏️ In-Browser Editor (Client-side state — adjusts your download/clipboard package)</span>
            <span>{lines.length} lines</span>
          </div>
          <textarea
            value={activeContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-[420px] p-3 rounded-lg bg-black/70 border border-[#30363d] text-white/90 font-mono text-xs leading-relaxed focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 resize-y"
            placeholder="Edit instructions here..."
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="p-4 sm:p-5 overflow-x-auto font-mono text-xs leading-relaxed bg-black/40 max-h-[500px]">
          <table className="w-full border-collapse table-fixed">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-white/5 group">
                  <td className="w-12 line-number select-none text-right pr-4 text-white/30 group-hover:text-white/50 font-mono text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="selectable-code text-white/80 whitespace-pre-wrap font-mono break-all sm:break-normal">
                    {formatMarkdownLine(line)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Lightweight syntax styler for Markdown headings, lists, code blocks
function formatMarkdownLine(line: string) {
  if (line.startsWith('# ')) {
    return <span className="text-cyan-400 font-bold text-sm">{line}</span>;
  }
  if (line.startsWith('## ')) {
    return <span className="text-cyan-300 font-bold">{line}</span>;
  }
  if (line.startsWith('### ')) {
    return <span className="text-emerald-400 font-semibold">{line}</span>;
  }
  if (line.startsWith('```')) {
    return <span className="text-amber-400 font-semibold">{line}</span>;
  }
  if (line.startsWith('- ') || line.startsWith('* ')) {
    return <span className="text-white/70">{line}</span>;
  }
  return <span>{line}</span>;
}
