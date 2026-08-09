import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agency Workspaces & Dashboard | GitContextGen',
  description: 'Manage multi-repository context files, 3-line architectural truth streams, and context synchronization.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
