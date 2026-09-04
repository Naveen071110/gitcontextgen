'use client';

import { useState } from 'react';
import { Copy, Check, FileText, Download } from 'lucide-react';

interface CodeViewerProps {
  content: string;
  filename?: string;
  className?: string;
}

export default function CodeViewer({ content, filename = 'CLAUDE.md', className = '' }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(content || '')
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => console.warn('Clipboard copy error:', err));
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content || ''], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = (content || '').split('\n');

  return (
    <div className={`rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden flex flex-col ${className}`}>

      {/* Code Viewer Header - Clean flexbox toolbar */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-black border-b border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-mono font-semibold text-white whitespace-nowrap">{filename}</span>
          <span className="text-[11px] text-white/40 font-mono whitespace-nowrap">({lines.length} lines)</span>
        </div>

        {/* Action Button Group - horizontal scroll on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/10 bg-neutral-900 hover:bg-neutral-800 text-white/80 transition-all whitespace-nowrap"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5 text-white/60 shrink-0" />
            Download
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-black hover:opacity-90 transition-all whitespace-nowrap shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            {copied ? 'Copied!' : 'Copy File'}
          </button>
        </div>
      </div>

      {/* Code Text Content */}
      <div className="p-4 sm:p-5 overflow-x-auto font-mono text-xs leading-relaxed bg-black/40 max-h-[500px]">
        <table className="w-full border-collapse table-fixed">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/5 group">
                <td className="w-12 line-number text-right pr-4 text-white/30 group-hover:text-white/50 font-mono text-[11px]">
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
