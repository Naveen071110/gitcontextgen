export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { analyzeRepositoryAction } from '@/lib/actions';
import { withTimeout } from '@/lib/github';

function generateRequestId(): string {
  return 'req_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

function extractClientMetadata(req: Request, body?: any) {
  const forwarded = req.headers.get('x-forwarded-for');
  const userIp = forwarded
    ? forwarded.split(',')[0].trim()
    : req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || '127.0.0.1';
  const turnstileToken = req.headers.get('cf-turnstile-token') || body?.turnstileToken || undefined;
  const userId = body?.userId || undefined;
  const userTier = body?.userTier || undefined;
  return { userIp, turnstileToken, userId, userTier };
}

export async function GET(req: Request) {
  const requestId = generateRequestId();
  try {
    const { searchParams } = new URL(req.url);
    const repoUrl = searchParams.get('url') || searchParams.get('repoUrl');
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const clientMeta = extractClientMetadata(req);

    let targetUrl = repoUrl;
    if (!targetUrl && owner && repo) {
      targetUrl = `https://github.com/${owner}/${repo}`;
    }

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'Missing repository target. Provide ?url=https://github.com/owner/repo or ?owner=...&repo=...', requestId },
        { status: 400 }
      );
    }

    const result = await withTimeout(
      analyzeRepositoryAction(targetUrl, undefined, clientMeta),
      35_000,
      'GitHub took too long to respond. Please try the analysis again.'
    );

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || 'Failed to analyze repository', requestId, progress: 'failed' }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      cached: result.cached,
      analysisEngine: result.data.analysisEngine || 'local',
      deepseekEnhanced: result.data.deepseekEnhanced || false,
      progress: 'complete',
      requestId,
    });
  } catch (err: any) {
    const isTimeout =
      err?.name === 'TimeoutError' ||
      err?.status === 504 ||
      err?.message?.toLowerCase().includes('timed out') ||
      err?.message?.toLowerCase().includes('too long');

    const statusCode = isTimeout ? 504 : err?.status || 500;
    const errorMsg = isTimeout
      ? 'GitHub took too long to respond. Please try the analysis again.'
      : err?.message || 'Internal server error during analysis';

    return NextResponse.json({ error: errorMsg, requestId, progress: 'failed' }, { status: statusCode });
  }
}

export async function POST(req: Request) {
  const requestId = generateRequestId();
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body', requestId }, { status: 400 });
    }

    const targetUrl = body.url || body.repoUrl || body.repo_url || (body.owner && body.repo ? `https://github.com/${body.owner}/${body.repo}` : null);
    if (!targetUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required. Provide { "url": "https://github.com/owner/repo" }', requestId },
        { status: 400 }
      );
    }

    const token = body.token || body.userToken;
    const clientMeta = extractClientMetadata(req, body);
    const result = await withTimeout(
      analyzeRepositoryAction(targetUrl, token, clientMeta),
      35_000,
      'GitHub took too long to respond. Please try the analysis again.'
    );

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || 'Failed to analyze repository', requestId, progress: 'failed' }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      cached: result.cached,
      analysisEngine: result.data.analysisEngine || 'local',
      deepseekEnhanced: result.data.deepseekEnhanced || false,
      progress: 'complete',
      requestId,
    });
  } catch (err: any) {
    const isTimeout =
      err?.name === 'TimeoutError' ||
      err?.status === 504 ||
      err?.message?.toLowerCase().includes('timed out') ||
      err?.message?.toLowerCase().includes('too long');

    const statusCode = isTimeout ? 504 : err?.status || 500;
    const errorMsg = isTimeout
      ? 'GitHub took too long to respond. Please try the analysis again.'
      : err?.message || 'Internal server error during analysis';

    return NextResponse.json({ error: errorMsg, requestId, progress: 'failed' }, { status: statusCode });
  }
}
