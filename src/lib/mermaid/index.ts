/**
 * GitContextGen Secure Mermaid.js Architecture Engine
 * Compiles repository architecture into SVG maps with mandatory securityLevel: 'strict'
 * to eliminate DOM-Based XSS vulnerabilities.
 */

import { fetchKrokiSvg, generateKrokiDiagramUrls } from '../integrations/kroki';

export interface MermaidEngineConfig {
  theme: 'dark' | 'default' | 'neutral';
  securityLevel: 'strict' | 'antiscript';
  darkMode: boolean;
  fontFamily: string;
}

export const STRICT_MERMAID_CONFIG: MermaidEngineConfig = {
  theme: 'dark',
  securityLevel: 'strict', // Strictly blocks inline scripts, javascript: URLs, and event handlers
  darkMode: true,
  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
};

export const STRICT_THEME_VARIABLES = {
  darkMode: true,
  background: '#0a0a0a',
  primaryColor: '#6366f1',
  primaryTextColor: '#f8fafc',
  primaryBorderColor: '#818cf8',
  lineColor: '#38bdf8',
  secondaryColor: '#06b6d4',
  tertiaryColor: '#10b981',
};

/**
 * Initializes Mermaid client instance with strict security guardrails
 */
export async function initializeStrictMermaid(): Promise<any> {
  if (typeof window === 'undefined') return null;
  const mermaid = (await import('mermaid')).default;
  mermaid.initialize({
    startOnLoad: false,
    theme: STRICT_MERMAID_CONFIG.theme,
    securityLevel: STRICT_MERMAID_CONFIG.securityLevel,
    fontFamily: STRICT_MERMAID_CONFIG.fontFamily,
    themeVariables: STRICT_THEME_VARIABLES,
  });
  return mermaid;
}

/**
 * Compiles architecture definition into SVG.
 * In browser: Renders via Mermaid with securityLevel: 'strict'.
 * In Node/Edge server: Compiles via Kroki serverless engine.
 */
export async function compileArchitectureToSvg(
  chartDefinition: string,
  diagramId: string = 'arch-map'
): Promise<{ svg: string; source: 'client-mermaid' | 'server-kroki' }> {
  if (!chartDefinition || typeof chartDefinition !== 'string') {
    throw new Error('Invalid or empty architecture chart definition.');
  }

  // Client-side rendering
  if (typeof window !== 'undefined') {
    const mermaid = await initializeStrictMermaid();
    const uniqueId = `mermaid-strict-${diagramId}-${Math.random().toString(36).slice(2, 8)}`;
    const { svg } = await mermaid.render(uniqueId, chartDefinition);
    return { svg, source: 'client-mermaid' };
  }

  // Server-side fallback rendering via Kroki
  const krokiSvg = await fetchKrokiSvg(chartDefinition);
  if (krokiSvg) {
    return { svg: krokiSvg, source: 'server-kroki' };
  }

  // Fallback direct URL reference
  const urls = generateKrokiDiagramUrls(chartDefinition, diagramId);
  return {
    svg: `<svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg"><text x="10" y="50" fill="#f8fafc" font-family="monospace">Architecture SVG generated: ${urls.svgUrl}</text></svg>`,
    source: 'server-kroki',
  };
}
