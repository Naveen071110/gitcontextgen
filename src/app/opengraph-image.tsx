import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'GitContextGen — AI Context Generator & MCP Server';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #050811 0%, #0B0F19 50%, #0F172A 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          padding: '48px',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '8px 20px',
            borderRadius: '9999px',
            marginBottom: '24px',
            fontSize: '18px',
            color: '#38bdf8',
          }}
        >
          <span>⚡ Official Model Context Protocol (MCP) Server</span>
        </div>

        <h1
          style={{
            fontSize: '64px',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            margin: '0 0 16px 0',
            lineHeight: 1.1,
            background: 'linear-gradient(to bottom right, #ffffff, #94a3b8)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          GitContextGen
        </h1>

        <p
          style={{
            fontSize: '28px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '900px',
            margin: '0 0 36px 0',
            lineHeight: 1.4,
          }}
        >
          Turn any GitHub repository into production-ready AI context rules for Sonnet 5, Opus 5, Claude Code & Cursor.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              padding: '10px 24px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            CLAUDE.md
          </div>
          <div
            style={{
              background: 'rgba(129, 140, 248, 0.1)',
              border: '1px solid rgba(129, 140, 248, 0.3)',
              color: '#818cf8',
              padding: '10px 24px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            .cursorrules
          </div>
          <div
            style={{
              background: 'rgba(52, 211, 153, 0.1)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              color: '#34d399',
              padding: '10px 24px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            AGENTS.md
          </div>
          <div
            style={{
              background: 'rgba(251, 146, 60, 0.1)',
              border: '1px solid rgba(251, 146, 60, 0.3)',
              color: '#fb923c',
              padding: '10px 24px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            MCP Server
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
