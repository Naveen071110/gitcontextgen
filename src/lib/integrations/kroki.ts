/**
 * Kroki Diagram Rendering Integration
 * Converts Mermaid.js diagrams into direct SVG/PNG images via Kroki API
 * https://kroki.io (Free, Serverless, Zero-auth)
 */

export interface KrokiDiagramUrls {
  svgUrl: string;
  pngUrl: string;
  embedMarkdown: string;
}

/**
 * Encodes text payload into base64 URL-safe format for Kroki REST API
 */
function encodeDiagram(source: string): string {
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(source)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  return Buffer.from(source, 'utf-8').toString('base64url');
}

/**
 * Generates direct Kroki image URLs for a given Mermaid diagram definition
 */
export function generateKrokiDiagramUrls(mermaidCode: string, repoName: string = 'repository'): KrokiDiagramUrls {
  if (!mermaidCode || typeof mermaidCode !== 'string') {
    return {
      svgUrl: '',
      pngUrl: '',
      embedMarkdown: '',
    };
  }

  const encoded = encodeDiagram(mermaidCode.trim());
  const svgUrl = `https://kroki.io/mermaid/svg/${encoded}`;
  const pngUrl = `https://kroki.io/mermaid/png/${encoded}`;

  const embedMarkdown = `![${repoName} Architecture Diagram](${svgUrl})`;

  return {
    svgUrl,
    pngUrl,
    embedMarkdown,
  };
}

/**
 * Directly fetches SVG markup from Kroki API with 24h edge cache
 */
export async function fetchKrokiSvg(mermaidCode: string): Promise<string | null> {
  try {
    const res = await fetch('https://kroki.io/mermaid/svg', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Accept': 'image/svg+xml',
      },
      body: mermaidCode.trim(),
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      return await res.text();
    }
    return null;
  } catch (err) {
    return null;
  }
}
