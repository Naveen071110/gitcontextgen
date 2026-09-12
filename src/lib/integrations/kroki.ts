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
 * Encodes text payload into zlib deflated base64 URL-safe format for Kroki REST API.
 * Isomorphic: uses Node zlib if in Node runtime, and standards-compliant Base64URL in browser.
 */
function encodeDiagram(source: string): string {
  if (!source) return '';

  // 1. If running in server / Node.js environment, use zlib deflate
  if (typeof window === 'undefined') {
    try {
      // Dynamic require to prevent client bundlers from bundling Node's zlib
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodeZlib = require('zlib');
      if (typeof nodeZlib?.deflateSync === 'function' && typeof Buffer !== 'undefined') {
        const deflated = nodeZlib.deflateSync(Buffer.from(source, 'utf-8'));
        return deflated.toString('base64url');
      }
    } catch {
      // Fall through to universal base64url
    }
  }

  // 2. Universal fallback (safe in all browsers, workers, and runtimes)
  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(source, 'utf-8').toString('base64url');
    }
    // Browser UTF-8 to Base64URL
    const bytes = new TextEncoder().encode(source);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (err) {
    console.warn('Diagram encoding notice:', err);
    return '';
  }
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

  try {
    const encoded = encodeDiagram(mermaidCode.trim());
    if (!encoded) {
      return {
        svgUrl: '',
        pngUrl: '',
        embedMarkdown: '',
      };
    }

    const svgUrl = `https://kroki.io/mermaid/svg/${encoded}`;
    const pngUrl = `https://kroki.io/mermaid/png/${encoded}`;
    const embedMarkdown = `![${repoName} Architecture Diagram](${svgUrl})`;

    return {
      svgUrl,
      pngUrl,
      embedMarkdown,
    };
  } catch (err) {
    console.warn('Kroki URL generation error:', err);
    return {
      svgUrl: '',
      pngUrl: '',
      embedMarkdown: '',
    };
  }
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
      signal: AbortSignal.timeout(7000),
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
