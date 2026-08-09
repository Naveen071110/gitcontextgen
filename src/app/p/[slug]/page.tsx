'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MockStore } from '@/lib/mockStore';
import { Project, Release } from '@/lib/types';
import { subscribeEmailAction } from '@/lib/actions';
import { Mail, Check, Terminal, ExternalLink, Tag, Calendar } from 'lucide-react';

export default function PublicChangelogPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [project, setProject] = useState<Project | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subStatus, setSubStatus] = useState<string | null>(null);

  useEffect(() => {
    const proj = MockStore.getProjectBySlug(slug) || MockStore.getProjectById(slug);
    if (proj) {
      setProject(proj);
      setReleases(MockStore.getReleases(proj.id));
    }
  }, [slug]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !email) return;

    setIsSubscribing(true);
    setSubStatus(null);

    try {
      const res = await subscribeEmailAction(project.id, email);
      if (res.success) {
        setSubStatus('Subscribed! You will receive email notifications when new releases ship.');
        setEmail('');
      } else {
        setSubStatus(res.error || 'Failed to subscribe.');
      }
    } catch (err: any) {
      setSubStatus(err?.message || 'Failed to subscribe.');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Changelog Not Found</h2>
            <p className="text-sm text-white/60 mb-4">No repository changelog exists for "{slug}".</p>
            <Link href="/" className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold">
              Return Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <Navbar />

      {/* Structural Top Navbar Offset Spacer */}
      <div className="w-full h-20 sm:h-24 shrink-0 pointer-events-none" />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4 sm:pt-8 pb-12">
        {/* Header Hero */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black border border-white/10 text-xs font-mono text-white/80">
            <Terminal className="w-3.5 h-3.5 text-white/60" /> Public Product Changelog
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {project.slug} <span className="text-white/60">Releases</span>
          </h1>

          <a
            href={project.repo_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-mono text-white/60 hover:text-white transition"
          >
            {project.repo_url} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Subscribe Form Card */}
        <div className="p-6 rounded-2xl bg-black border border-white/10 mb-12 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4 text-white/80" /> Subscribe to Release Updates
              </h3>
              <p className="text-xs text-white/60">
                Get AI-summarized release notes delivered directly to your inbox whenever code is pushed.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-white w-full sm:w-60"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-5 py-2.5 bg-white hover:bg-slate-200 text-black font-bold text-xs rounded-xl shadow-md transition shrink-0 disabled:opacity-50"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>

          {subStatus && (
            <p className="mt-3 text-xs font-mono text-cyan-300 bg-slate-950 p-2.5 rounded-lg border border-white/10">
              {subStatus}
            </p>
          )}
        </div>

        {/* Releases Timeline */}
        <div className="space-y-8">
          {releases.length === 0 ? (
            <div className="p-8 rounded-2xl bg-black border border-white/10 text-center text-white/60 font-mono text-sm">
              No release notes generated yet. Push commits to trigger GitHub Webhook release notes!
            </div>
          ) : (
            releases.map((release) => (
              <article
                key={release.id}
                className="p-8 rounded-2xl bg-black border border-white/10 space-y-4 backdrop-blur-xl relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-white/40"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white font-mono text-xs font-bold flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> {release.version_tag}
                    </span>
                    <h3 className="text-base font-bold text-white">{release.commit_summary || 'Feature Release'}</h3>
                  </div>

                  <span className="text-xs text-white/60 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-white/40" />
                    {new Date(release.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="prose prose-invert max-w-none text-white/80 text-sm font-sans leading-relaxed space-y-3">
                  {release.generated_notes.split('\n\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
