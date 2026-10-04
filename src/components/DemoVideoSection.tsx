'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, Maximize2, Sparkles, ShieldCheck, Zap, Pause, RotateCcw } from 'lucide-react';

const VIDEO_URL =
  'https://raw.githubusercontent.com/Naveen071110/gitcontextgen/main/docs/videos/gitcontextgen-demo.mp4';

export default function DemoVideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  // Playback & load states
  const [hasRequestedPlay, setHasRequestedPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // Lazy Fetch Function: ONLY triggered when user clicks Play (or hovers deliberately)
  const startLoadingVideo = useCallback(() => {
    if (blobUrl || isLoading) return;

    setIsLoading(true);
    setLoadError(false);
    setLoadProgress(0);

    const controller = new AbortController();

    fetch(VIDEO_URL, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentLength = Number(res.headers.get('content-length') || 0);
        const reader = res.body?.getReader();
        if (!reader) throw new Error('No readable stream available');

        const chunks: Uint8Array[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (contentLength > 0) {
            setLoadProgress(Math.round((received / contentLength) * 100));
          }
        }

        const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('[DemoVideo] Stream fetch failed:', err);
          setLoadError(true);
          setIsLoading(false);
        }
      });
  }, [blobUrl, isLoading]);

  // Once blob is ready after user clicked play, auto-trigger play
  useEffect(() => {
    if (hasRequestedPlay && blobUrl && videoRef.current) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('[DemoVideo] Autoplay blocked, awaiting interaction:', err);
          setIsPlaying(false);
        });
    }
  }, [hasRequestedPlay, blobUrl]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const handleStartPlay = () => {
    setHasRequestedPlay(true);
    if (!blobUrl && !isLoading) {
      startLoadingVideo();
    } else if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <section
      ref={sectionRef}
      id="demo"
      className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24"
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 mb-4">
          <Play className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-medium text-amber-400 tracking-wide uppercase">
            Live Product Demo
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-3">
          See It In Action
        </h2>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
          Watch a full walkthrough — from pasting a GitHub URL to viewing the complete
          architectural blueprint, vulnerability audit, and AI-ready context export.
        </p>
      </motion.div>

      {/* Video Container Frame */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative group"
      >
        {/* Ambient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/20 rounded-2xl blur-xl opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Browser Shell Frame */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-[#0d1117] shadow-2xl shadow-black/80">
          {/* Browser Navigation Bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-zinc-800/60 select-none">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 mx-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#0d1117] border border-zinc-800/50 text-xs text-zinc-400 max-w-md mx-auto font-mono">
                <svg
                  className="w-3 h-3 text-emerald-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span className="truncate">repopulse-ai.singhnaveen360.workers.dev</span>
                <span className="ml-auto text-[10px] text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Live
                </span>
              </div>
            </div>
            {hasRequestedPlay && blobUrl && (
              <button
                onClick={handleFullscreen}
                className="p-1 rounded hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200 transition-colors"
                aria-label="Fullscreen"
                title="Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Viewport Area */}
          <div className="relative aspect-video w-full overflow-hidden bg-[#0a0d12]">
            {/* STATE 1: ACTIVE VIDEO PLAYER (When user has clicked play and blob is loaded) */}
            {hasRequestedPlay && blobUrl ? (
              <div className="relative w-full h-full cursor-pointer group/video" onClick={handleTogglePlay}>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  controls={false}
                  src={blobUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                />

                {/* Subtle Hover Controls Overlay */}
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 ${
                    isPlaying ? 'opacity-0 group-hover/video:opacity-100' : 'opacity-100'
                  }`}
                >
                  <button
                    onClick={handleTogglePlay}
                    className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/90 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30 transition-transform active:scale-95"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 fill-black text-black" />
                    ) : (
                      <Play className="w-7 h-7 ml-1 fill-black text-black" />
                    )}
                  </button>
                </div>
              </div>
            ) : hasRequestedPlay && isLoading ? (
              /* STATE 2: LOADING PROGRESS STATE (User clicked play, streaming from CDN) */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#0a0d12] text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
                  <Play className="w-7 h-7 text-amber-400 animate-pulse ml-0.5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2 font-mono">
                  Streaming Walkthrough Video
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mb-4">
                  Buffering HD walkthrough from storage...
                </p>

                {/* Progress bar */}
                <div className="w-64 h-2 rounded-full bg-zinc-800 overflow-hidden mb-2 border border-zinc-700/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-200"
                    style={{ width: `${Math.max(loadProgress, 8)}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-amber-400 font-semibold">
                  {loadProgress > 0 ? `${loadProgress}% Buffered` : 'Connecting to edge network...'}
                </span>
              </div>
            ) : loadError ? (
              /* STATE 3: RETRY ERROR STATE */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#0a0d12]">
                <p className="text-sm text-red-400 mb-3">Unable to stream video file at this time.</p>
                <button
                  onClick={handleStartPlay}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-white border border-zinc-700 font-mono transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retry Playback
                </button>
              </div>
            ) : (
              /* STATE 4: INSTANT POSTER FACADE (< 5ms render, ZERO video bytes downloaded) */
              <div
                onClick={handleStartPlay}
                onMouseEnter={() => {
                  // Pre-warm DNS / connection on hover without downloading full video
                }}
                className="relative w-full h-full cursor-pointer select-none overflow-hidden group/poster"
              >
                {/* Simulated High-Fidelity Workspace Mockup Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0c1017] via-[#080b0f] to-[#040608] p-5 sm:p-8 flex flex-col justify-between">
                  {/* Top Workspace Header Bar */}
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-white font-mono">
                            facebook/react
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                            main
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          AST Engine v1.6.0 · 42 Files Scanned
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                        ⚡ 92% Token Reduction
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-semibold">
                        98 / 100 Health
                      </span>
                    </div>
                  </div>

                  {/* Middle Simulated Grid Preview */}
                  <div className="grid grid-cols-3 gap-3 my-auto py-2 opacity-75">
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-400 font-mono uppercase block mb-1">
                        AI Ruleset
                      </span>
                      <p className="text-xs text-white font-semibold font-mono truncate">
                        CLAUDE.md &amp; .mdc
                      </p>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        ✓ Synchronized
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-400 font-mono uppercase block mb-1">
                        Agent Memory
                      </span>
                      <p className="text-xs text-white font-semibold font-mono truncate">
                        memory.db
                      </p>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        ✓ SQLite MCP Active
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-400 font-mono uppercase block mb-1">
                        Security Audit
                      </span>
                      <p className="text-xs text-white font-semibold font-mono truncate">
                        0 Exposed Secrets
                      </p>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        ✓ 7 Classes Shielded
                      </span>
                    </div>
                  </div>

                  {/* Bottom Feature Tags */}
                  <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 text-[11px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Zero-Telemetry Sandbox
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Model Context Protocol (MCP)
                    </span>
                  </div>
                </div>

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-black/45 group-hover/poster:bg-black/35 transition-colors duration-300" />

                {/* Central Action Target */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  {/* Glowing Animated Play Button */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-black shadow-2xl shadow-amber-500/40 group-hover/poster:shadow-amber-500/70 transition-all cursor-pointer mb-4"
                  >
                    <div className="absolute -inset-2 rounded-full bg-amber-400/25 animate-ping pointer-events-none" />
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1.5 fill-black text-black relative z-10" />
                  </motion.div>

                  <div className="text-center px-4">
                    <span className="inline-block text-sm sm:text-base font-semibold text-white tracking-wide mb-1 drop-shadow-md">
                      Watch Live Product Walkthrough
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-300 font-medium drop-shadow">
                      Click to load HD demo · Zero page delay
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
