import zlib from 'zlib';
import { CodebaseAnalysis } from './localScanner.js';

export interface ArchitectureResult {
  syntax: 'mermaid';
  diagram: string;
  kroki: {
    svgUrl: string;
    pngUrl: string;
    embedMarkdown: string;
  };
}

function encodeDiagram(source: string): string {
  try {
    const deflated = zlib.deflateSync(Buffer.from(source, 'utf-8'));
    return deflated.toString('base64url');
  } catch {
    return Buffer.from(source, 'utf-8').toString('base64url');
  }
}

/**
 * Generates Mermaid architecture diagram and Kroki export links from codebase structure
 */
export function generateArchitecture(analysis: CodebaseAnalysis, style: string = 'layered'): ArchitectureResult {
  const tree = analysis.fileTreeSummary;
  const name = analysis.name;

  const hasApp = tree.includes('src/app') || tree.includes('app/');
  const hasPages = tree.includes('pages/');
  const hasComponents = tree.includes('components/');
  const hasLib = tree.includes('lib/') || tree.includes('utils/');
  const hasApi = tree.includes('api/') || tree.includes('routes/');
  const hasSupabase = analysis.manifest.dependencies.some((d) => d.includes('supabase'));
  const hasDatabase = hasSupabase || tree.includes('prisma') || tree.includes('drizzle') || tree.includes('db/');

  let diagram = `graph TD
  subgraph Frontend ["Frontend UI Layer"]
    ${hasComponents ? `Components["React Components (/components)"]` : `UI["UI View Layer"]`}
    ${hasApp ? `AppRouter["Next.js App Router (/app)"]` : hasPages ? `Pages["Pages Router (/pages)"]` : `ClientEntry["Client Entrypoint"]`}
  end

  subgraph Logic ["Business & API Layer"]
    ${hasApi ? `ApiRoutes["API Route Handlers (/api)"]` : `CoreLogic["Core Business Logic"]`}
    ${hasLib ? `LibUtils["Utilities & Data Services (/lib)"]` : `Helpers["Helper Functions"]`}
  end

  ${
    hasDatabase
      ? `
  subgraph Persistence ["Data & Storage Layer"]
    ${hasSupabase ? `DB[("Supabase PostgreSQL")]` : `DB[("Database & Storage")]`}
  end`
      : ''
  }

  ${hasComponents && hasApp ? `AppRouter --> Components` : ''}
  ${hasApp && hasApi ? `AppRouter --> ApiRoutes` : ''}
  ${hasApi && hasLib ? `ApiRoutes --> LibUtils` : ''}
  ${hasLib && hasDatabase ? `LibUtils --> DB` : ''}`;

  diagram = diagram.trim();

  const encoded = encodeDiagram(diagram);
  const svgUrl = `https://kroki.io/mermaid/svg/${encoded}`;
  const pngUrl = `https://kroki.io/mermaid/png/${encoded}`;
  const embedMarkdown = `![${name} Architecture Diagram](${svgUrl})`;

  return {
    syntax: 'mermaid',
    diagram,
    kroki: {
      svgUrl,
      pngUrl,
      embedMarkdown,
    },
  };
}
