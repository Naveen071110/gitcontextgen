import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication & Workspaces | GitContextGen',
  description: 'Sign in to access your GitContextGen high-fidelity agency context workspaces.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
