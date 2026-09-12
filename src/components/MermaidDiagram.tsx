'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Copy, Check, Code, RefreshCw, AlertTriangle, Download, ExternalLink, ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { generateKrokiDiagramUrls } from '@/lib/integrations/kroki';
import { initializeStrictMermaid } from '@/lib/mermaid';

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

// Helper to parse nodes and connections for fail-safe native SVG rendering
interface ParsedNode {
  id: string;
  label: string;
}
interface ParsedEdge {
  from: string;
  to: string;
}

function parseDiagramElements(text: string): { nodes: ParsedNode[]; edges: ParsedEdge[] } {
  const nodesMap = new Map<string, string>();
  const edges: ParsedEdge[] = [];

  const lines = (text || '').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      !trimmed ||
      trimmed.startsWith('%%') ||
      trimmed.startsWith('style') ||
      trimmed.startsWith('classDef') ||
      trimmed.startsWith('graph') ||
      trimmed.startsWith('flowchart') ||
      trimmed.startsWith('subgraph') ||
      trimmed === 'end'
    ) {
      continue;
    }

    // Match links: A["..."] --> B["..."], A --> B, A -.-> B, A ==> B, A -->|label| B, A -- label --> B
    const linkMatch = trimmed.match(
      /([A-Za-z0-9_]+)(?:\["?(.*?)"?\]|\("?(.*?)"?\))?\s*(?:-->|==>|-\.->|--.*?-->|-->\|.*?\|)\s*([A-Za-z0-9_]+)(?:\["?(.*?)"?\]|\("?(.*?)"?\))?/
    );
    if (linkMatch) {
      const fromId = linkMatch[1];
      const fromLabel = linkMatch[2] || linkMatch[3] || fromId;
      const toId = linkMatch[4];
      const toLabel = linkMatch[5] || linkMatch[6] || toId;

      if (!nodesMap.has(fromId) || fromLabel !== fromId) nodesMap.set(fromId, fromLabel);
      if (!nodesMap.has(toId) || toLabel !== toId) nodesMap.set(toId, toLabel);
      edges.push({ from: fromId, to: toId });
      continue;
    }

    // Standalone node like A["Label"] or A("Label")
    const nodeMatch = trimmed.match(/([A-Za-z0-9_]+)(?:\["?(.*?)"?\]|\("?(.*?)"?\))/);
    if (nodeMatch) {
      const id = nodeMatch[1];
      const label = nodeMatch[2] || nodeMatch[3] || id;
      nodesMap.set(id, label);
    }
  }

  // Fallback: If no structured nodes matched, parse any readable lines as architecture nodes
  if (nodesMap.size === 0) {
    let fallbackIdx = 1;
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        !trimmed ||
        trimmed.startsWith('%%') ||
        trimmed.startsWith('graph') ||
        trimmed.startsWith('flowchart') ||
        trimmed.startsWith('style') ||
        trimmed === 'end'
      ) {
        continue;
      }
      const clean = trimmed.replace(/[\[\]"()]/g, '').trim();
      if (clean.length > 2) {
        nodesMap.set(`node_${fallbackIdx}`, clean);
        fallbackIdx++;
        if (fallbackIdx > 8) break;
      }
    }
  }

  // Guaranteed resilient fallback so nodes is NEVER empty
  if (nodesMap.size === 0) {
    nodesMap.set('client', 'Client Application Layer');
    nodesMap.set('api', 'API & Controller Services');
    nodesMap.set('data', 'Data & Persistence Engine');
    edges.push({ from: 'client', to: 'api' });
    edges.push({ from: 'api', to: 'data' });
  }

  const nodes: ParsedNode[] = Array.from(nodesMap.entries()).map(([id, label]) => ({ id, label }));
  return { nodes, edges };
}

function generateFallbackSvg(chartText: string): string {
  const { nodes, edges } = parseDiagramElements(chartText);

  const nodeWidth = 320;
  const nodeHeight = 54;
  const verticalGap = 44;
  const startX = 60;
  const startY = 32;

  const totalHeight = startY + nodes.length * (nodeHeight + verticalGap) + 20;
  const totalWidth = nodeWidth + startX * 2;

  let svg = `<svg viewBox="0 0 ${totalWidth} ${totalHeight}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 680px; margin: 0 auto; display: block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
    <defs>
      <linearGradient id="nodeBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#161b22" />
        <stop offset="100%" stop-color="#0d1117" />
      </linearGradient>
      <linearGradient id="primaryNodeBorder" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#388bfd" />
        <stop offset="100%" stop-color="#8957e5" />
      </linearGradient>
      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#58a6ff" />
      </marker>
    </defs>`;

  const nodePositions = new Map<string, { x: number; y: number }>();

  // Draw Nodes
  nodes.forEach((node, idx) => {
    const x = startX;
    const y = startY + idx * (nodeHeight + verticalGap);
    nodePositions.set(node.id, { x: x + nodeWidth / 2, y: y + nodeHeight });

    const safeLabel = (node.label || node.id)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    const isRoot = idx === 0;

    svg += `
      <g>
        <rect x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" rx="10" 
              fill="url(#nodeBg)" stroke="${isRoot ? '#388bfd' : '#30363d'}" stroke-width="${isRoot ? '2' : '1'}" />
        <circle cx="${x + 22}" cy="${y + nodeHeight / 2}" r="4.5" fill="${isRoot ? '#58a6ff' : idx === nodes.length - 1 ? '#d2a8ff' : '#238636'}" />
        <text x="${x + 38}" y="${y + nodeHeight / 2 + 4}" fill="#f0f6fc" font-size="12px" font-weight="600">
          ${safeLabel.length > 36 ? safeLabel.slice(0, 34) + '...' : safeLabel}
        </text>
      </g>`;
  });

  // Draw Edges
  if (edges.length > 0) {
    edges.forEach(edge => {
      const from = nodePositions.get(edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      const toIdx = toNode ? nodes.indexOf(toNode) : -1;
      if (from && toIdx >= 0) {
        const toY = startY + toIdx * (nodeHeight + verticalGap);
        const toX = startX + nodeWidth / 2;

        svg += `
          <line x1="${from.x}" y1="${from.y}" x2="${toX}" y2="${toY}" 
                stroke="#388bfd" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#arrow)" opacity="0.85" />`;
      }
    });
  } else {
    // If no explicit edges were captured, draw sequential flow arrows
    for (let i = 0; i < nodes.length - 1; i++) {
      const fromY = startY + i * (nodeHeight + verticalGap) + nodeHeight;
      const toY = startY + (i + 1) * (nodeHeight + verticalGap);
      const midX = startX + nodeWidth / 2;

      svg += `
        <line x1="${midX}" y1="${fromY}" x2="${midX}" y2="${toY}" 
              stroke="#388bfd" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#arrow)" opacity="0.85" />`;
    }
  }

  svg += `</svg>`;
  return svg;
}

function sanitizeMermaidChart(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim();

  // Quote unquoted bracket labels: A[Some / Label & More] -> A["Some / Label & More"]
  cleaned = cleaned.replace(/([A-Za-z0-9_]+)\[([^"\]\n\r]+)\]/g, (_, id, label) => {
    const safeLabel = label.replace(/"/g, "'").trim();
    return `${id}["${safeLabel}"]`;
  });

  return cleaned;
}

export default function MermaidDiagram({ chart, className = '', onReanalyze, krokiUrls: externalKrokiUrls }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedKroki, setCopiedKroki] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(Math.round((prev + 0.15) * 100) / 100, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(Math.round((prev - 0.15) * 100) / 100, 0.5));
  const handleResetZoom = () => setZoom(1);

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);
  const [isRendering, setIsRendering] = useState(true);

  // Safely memoize Kroki URLs to never crash during render
  const activeKrokiUrls = useMemo(() => {
    if (externalKrokiUrls?.svgUrl) return externalKrokiUrls;
    if (!chart) return undefined;
    try {
      return generateKrokiDiagramUrls(chart);
    } catch (e) {
      console.warn('Failed to compute Kroki URLs:', e);
      return undefined;
    }
  }, [externalKrokiUrls, chart]);

  useEffect(() => {
    let isMounted = true;

    async function renderMermaid() {
      setIsRendering(true);
      setError(null);

      if (!chart || typeof window === 'undefined') {
        if (isMounted) setIsRendering(false);
        return;
      }

      const sanitized = sanitizeMermaidChart(chart);

      try {
        const mermaid = await initializeStrictMermaid();
        if (!mermaid) {
          // Native vector SVG topology fallback
          const fallback = generateFallbackSvg(chart);
          if (isMounted) {
            setSvgContent(fallback);
            setIsRendering(false);
          }
          return;
        }

        const id = 'mermaid-svg-' + Math.random().toString(36).substring(2, 9);
        try {
          const { svg } = await mermaid.render(id, sanitized);
          if (isMounted) {
            setSvgContent(svg);
            setIsRendering(false);
          }
        } finally {
          // Clean up any stray error container Mermaid might have left in document.body
          try {
            const strayEl = document.getElementById('d' + id) || document.getElementById(id);
            if (strayEl && strayEl.parentNode) {
              strayEl.parentNode.removeChild(strayEl);
            }
          } catch {
            // Ignore DOM cleanup error
          }
        }
      } catch (err: any) {
        console.warn('Client Mermaid parser encountered an issue, deploying native SVG topology fallback:', err?.message);
        const fallbackSvg = generateFallbackSvg(chart);
        if (isMounted) {
          setSvgContent(fallbackSvg);
          setError(null); // Clear error so the user gets the clean fallback SVG immediately
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
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(chart).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.warn('Clipboard write error:', err);
      });
    }
  };

  const handleCopyKrokiEmbed = () => {
    if (activeKrokiUrls?.embedMarkdown && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(activeKrokiUrls.embedMarkdown).then(() => {
        setCopiedKroki(true);
        setTimeout(() => setCopiedKroki(false), 2000);
      }).catch(err => {
        console.warn('Clipboard write error:', err);
      });
    }
  };

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#030303] flex flex-col p-4 sm:p-6 overflow-hidden'
          : `rounded-2xl border border-[#30363d] bg-[#0d1117] overflow-hidden flex flex-col ${className}`
      }`}
    >

      {/* Control Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-black border-b border-white/10 flex-wrap gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="text-xs font-mono text-white font-semibold tracking-wide truncate">
            ARCHITECTURE TOPOLOGY (KROKI + MERMAID)
          </span>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
          {/* Zoom Controls */}
          <div className="flex items-center rounded-lg bg-[#21262d] border border-[#30363d] p-0.5 shrink-0">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              title="Zoom Out (-15%)"
              aria-label="Zoom out diagram"
              className="p-1 rounded hover:bg-[#30363d] text-[#8b949e] hover:text-[#f0f6fc] disabled:opacity-40 transition cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset Zoom to 100%"
              aria-label="Reset zoom"
              className="px-2 py-0.5 text-[11px] font-mono text-[#c9d1d9] hover:text-white transition cursor-pointer"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 2.5}
              title="Zoom In (+15%)"
              aria-label="Zoom in diagram"
              className="p-1 rounded hover:bg-[#30363d] text-[#8b949e] hover:text-[#f0f6fc] disabled:opacity-40 transition cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand to Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-1.5 rounded-lg border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#f0f6fc] transition cursor-pointer shrink-0"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-[#58a6ff]" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          {activeKrokiUrls?.svgUrl && (
            <a
              href={activeKrokiUrls.svgUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Export Mermaid diagram as SVG via Kroki"
              className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-mono rounded-lg border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 transition-all whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              Export SVG
            </a>
          )}

          {activeKrokiUrls?.embedMarkdown && (
            <button
              onClick={handleCopyKrokiEmbed}
              aria-label="Copy Kroki markdown embed snippet"
              className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-mono rounded-lg border border-white/10 bg-neutral-900 hover:bg-neutral-800 text-white/80 transition-all whitespace-nowrap"
            >
              {copiedKroki ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
              {copiedKroki ? 'Copied Embed!' : 'Copy Embed Link'}
            </button>
          )}

          {onReanalyze && (
            <button
              onClick={onReanalyze}
              aria-label="Re-analyze repository architecture"
              className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/10 bg-neutral-900 hover:bg-neutral-800 text-white/80 transition-all whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              Re-analyze
            </button>
          )}

          <button
            onClick={() => setShowRaw(!showRaw)}
            aria-pressed={showRaw}
            aria-label={showRaw ? 'Switch to visual view' : 'Switch to raw syntax'}
            className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/10 bg-neutral-900 hover:bg-neutral-800 text-white/80 transition-all whitespace-nowrap"
          >
            <Code className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            {showRaw ? 'Visual View' : 'Raw Syntax'}
          </button>

          <button
            onClick={handleCopyCode}
            aria-label="Copy Mermaid diagram code"
            className="inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-black hover:opacity-90 transition-all whitespace-nowrap shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>

      {/* Soft Backdrop-Blur Explanatory Guide Card */}
      <div className="mx-4 sm:mx-5 mt-3.5 p-3.5 rounded-xl bg-[#161b22]/75 backdrop-blur-md border border-[#30363d] flex items-start gap-3 shadow-sm select-none">
        <span className="text-base leading-none select-none shrink-0 mt-0.5">💡</span>
        <p className="text-xs text-[#8b949e] leading-relaxed">
          <strong className="text-[#f0f6fc] font-medium">System Topology Guide:</strong> This flowchart maps out your repository&apos;s primary data models, API endpoints, and middleware layers. Use this map to quickly onboard new developers or plan architectural rewrites.
        </p>
      </div>

      {/* Main Diagram Area */}
      <div className="p-5 sm:p-6 overflow-auto flex-1 min-h-[380px] flex items-center justify-center relative select-none">
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
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full flex justify-center text-white mermaid-container max-w-full"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
}
