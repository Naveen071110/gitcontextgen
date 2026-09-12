export const dynamic = 'force-dynamic';
export const revalidate = 0;

import ProjectDetailClient from './ProjectDetailClient';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProjectDetailClient params={params} />;
}
