'use client';

import { useEffect, useRef, useState } from 'react';
import { Copy, Check, Code, RefreshCw, AlertTriangle, Download, ExternalLink } from 'lucide-react';
import { generateKrokiDiagramUrls } from '@/lib/integrations/kroki';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
  onReanalyze?: () => void;
  krokiUrls?: {
    svgUrl: string;
    pngUrl: string;
    embedMarkdown: string;
  };
}

export default function MermaidDiagram({ chart, className = '', onReanalyze, krokiUrls: externalKrokiUrls }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedKroki, setCopiedKroki] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [isRendering, setIsRendering] = useState(true);

  const activeKrokiUrls = externalKrokiUrls || (chart ? generateKrokiDiagramUrls(chart) : undefined);

  useEffect(() => {
    let isMounted = true;

    async function renderMermaid() {
      setIsRendering(true);
      setError(null);

      if (!chart || typeof window === 'undefined') return;

      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          themeVariables: {
            darkMode: true,
            background: '#0a0a0a',
            primaryColor: '#6366f1',
            primaryTextColor: '#f8fafc',
            primaryBorderColor: '#818cf8',
            lineColor: '#38bdf8',
            secondaryColor: '#06b6d4',
            tertiaryColor: '#10b981',
          },
        });

        const id = 'mermaid-svg-' + Math.random().toString(36).substring(2, 9);
        const { svg } = await mermaid.render(id, chart);

        if (isMounted) {
          setSvgContent(svg);
          setIsRendering(false);
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setError(err?.message || 'Failed to render Mermaid diagram structure.');
          setIsRendering(false);
        }
      }
    }

    renderMermaid();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyKrokiEmbed = () => {
    if (activeKrokiUrls?.embedMarkdown) {
      navigator.clipboard.writeText(activeKrokiUrls.embedMarkdown);
      setCopiedKroki(true);
      setTimeout(() => setCopiedKroki(false), 2000);
    }
  };

  return (
    <div className={`rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden flex flex-col ${className}`}>

      {/* Control Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-black border-b border-white/10 flex-wrap gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="text-xs font-mono text-white font-semibold tracking-wide whitespace-nowrap">
            ARCHITECTURE TOPOLOGY (KROKI + MERMAID)
          </span>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {activeKrokiUrls?.svgUrl && (
            <a
              href={activeKrokiUrls.svgUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-mono rounded-lg border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 transition-all whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              Export SVG
            </a>
          )}

          {activeKrokiUrls?.embedMarkdown && (
            <button
              onClick={handleCopyKrokiEmbed}
              className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-mono rounded-lg border border-white/10 bg-neutral-900 hover:bg-neutral-800 text-white/80 transition-all whitespace-nowrap"
            >
              {copiedKroki ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
              {copiedKroki ? 'Copied Embed!' : 'Copy Embed Link'}
            </button>
          )}

          {onReanalyze && (
            <button
              onClick={onReanalyze}
              className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/10 bg-neutral-900 hover:bg-neutral-800 text-white/80 transition-all whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              Re-analyze
            </button>
          )}

          <button
            onClick={() => setShowRaw(!showRaw)}
            className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/10 bg-neutral-900 hover:bg-neutral-800 text-white/80 transition-all whitespace-nowrap"
          >
            <Code className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            {showRaw ? 'Visual View' : 'Raw Syntax'}
          </button>

          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-black hover:opacity-90 transition-all whitespace-nowrap shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="p-5 sm:p-6 overflow-x-auto flex-1 min-h-[360px] flex items-center justify-center relative">
        {isRendering ? (
          <div className="flex flex-col items-center gap-3 text-white/60">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-sm font-mono">Rendering Architecture Nodes...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-lg">
            <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
            <p className="text-sm text-white font-semibold mb-2">Mermaid Render Alert</p>
            <p className="text-xs text-white/60 font-mono mb-4 bg-black p-3 rounded-xl border border-white/10 text-left overflow-x-auto w-full">
              {error}
            </p>
            <button
              onClick={() => setShowRaw(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:opacity-90 transition shadow-sm"
            >
              Switch to Raw Syntax Mode
            </button>
          </div>
        ) : showRaw ? (
          <pre className="w-full text-xs font-mono text-cyan-300 bg-black p-5 rounded-2xl border border-white/10 overflow-x-auto">
            {chart}
          </pre>
        ) : (
          <div
            ref={containerRef}
            className="w-full flex justify-center text-white mermaid-container max-w-full"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
}
