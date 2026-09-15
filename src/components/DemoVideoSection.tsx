'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, Pause, Maximize2 } from 'lucide-react';

export default function DemoVideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setHasStarted(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleFullscreen = () => {
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
            Live Demo
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

      {/* Video Container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative group"
      >
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Video Frame */}
        <div className="relative rounded-xl overflow-hidden border border-zinc-800/80 bg-[#0d1117] shadow-2xl shadow-black/50">
          {/* Browser-style top bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-zinc-800/60">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 mx-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#0d1117] border border-zinc-800/50 text-xs text-zinc-500 max-w-md mx-auto">
                <svg className="w-3 h-3 text-zinc-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="truncate">repopulse-ai.singhnaveen360.workers.dev</span>
              </div>
            </div>
            <button
              onClick={handleFullscreen}
              className="p-1 rounded hover:bg-zinc-700/50 text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Video */}
          <div className="relative aspect-video cursor-pointer" onClick={handlePlayPause}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              preload="metadata"
              playsInline
              onEnded={() => { setIsPlaying(false); setHasStarted(false); }}
              onPause={() => setIsPlaying(false)}
              onPlay={() => { setIsPlaying(true); setHasStarted(true); }}
            >
              <source src="/videos/gitcontextgen-demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Play overlay (shown when not playing) */}
            {!isPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/90 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/25 transition-colors"
                  aria-label="Play demo video"
                >
                  <Play className="w-8 h-8 ml-1" fill="currentColor" />
                </motion.button>
                {!hasStarted && (
                  <span className="absolute bottom-6 text-sm text-zinc-300 font-medium">
                    Click to play · Full walkthrough
                  </span>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
