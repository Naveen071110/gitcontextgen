'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, CheckCircle2, BookmarkPlus } from 'lucide-react';
import { saveProjectAction } from '@/lib/actions';

interface StickyCTAProps {
  repoUrl: string;
  contextMarkdown: string;
  mermaidArchitecture: string;
}

export default function StickyCTA({ repoUrl, contextMarkdown, mermaidArchitecture }: StickyCTAProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAndRedirect = async () => {
    setIsSaving(true);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'pending_repopulse_project',
          JSON.stringify({ repoUrl, contextMarkdown, mermaidArchitecture })
        );
      }

      const res = await saveProjectAction({
        repoUrl,
        contextMarkdown,
        mermaidArchitecture,
      });

      if (res.success && res.projectId) {
        setSavedSuccess(true);
        setTimeout(() => {
          router.push(`/dashboard/${res.projectId}`);
        }, 800);
      } else {
        router.push('/dashboard');
      }
    } catch (e) {
      console.error('Error saving project:', e);
      router.push('/dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4 animate-fade-in-up">
      <div className="bg-black/95 border border-white/20 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">

        <div className="flex items-center gap-3.5 text-left min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 whitespace-nowrap">
              Automate release notes & keep docs updated
            </h4>
            <p className="text-xs text-white/50 font-mono truncate">
              Save generated CLAUDE.md & Mermaid map to your workspace.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAndRedirect}
          disabled={isSaving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 shrink-0 px-6 py-3 rounded-xl bg-white text-black font-bold text-xs shadow-lg hover:opacity-90 transition-all whitespace-nowrap disabled:opacity-50"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Saved! Redirecting...
            </>
          ) : isSaving ? (
            <>Saving Project...</>
          ) : (
            <>
              <BookmarkPlus className="w-4 h-4 shrink-0" /> Save Project & Sign In
              <ArrowRight className="w-4 h-4 shrink-0" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
