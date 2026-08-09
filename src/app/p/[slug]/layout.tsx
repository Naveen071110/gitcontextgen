import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slugName = resolvedParams.slug.replace(/-/g, ' ');
  const capitalized = slugName.charAt(0).toUpperCase() + slugName.slice(1);

  return {
    title: `${capitalized} — AI Context & Repository Audit Showcase | GitContextGen`,
    description: `View public repository context, AGENTS.md specs, and architecture floor plans for ${capitalized} on GitContextGen.`,
    openGraph: {
      title: `${capitalized} Repository Context Showcase`,
      description: `Verified AI context, CLAUDE.md specs, and system architecture for ${capitalized}.`,
    },
  };
}

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
