import RepoViewClient from './RepoViewClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;
  return {
    title: `${owner}/${repo} - AI Context & Cursor Rules | GitContextGen`,
    description: `Instant on-the-fly repository context, AST intelligence, synchronized .cursor/rules, and CLAUDE.md for ${owner}/${repo}.`,
  };
}

export default async function DynamicRepoPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;
  return <RepoViewClient owner={owner} repo={repo} />;
}
