'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

function WordSpan({
  word,
  index,
  total,
  containerRef,
}: {
  word: string;
  index: number;
  total: number;
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end center'],
  });

  const opacity = useTransform(scrollYProgress, [index / total, (index + 1) / total], [0.2, 1]);
  const color = useTransform(
    scrollYProgress,
    [index / total, (index + 1) / total],
    ['hsl(0 0% 35%)', 'hsl(0 0% 100%)']
  );

  return (
    <motion.span style={{ opacity, color }} className="mr-[0.3em] inline-block">
      {word}
    </motion.span>
  );
}

export default function TestimonialSection() {
  const containerRef = useRef<HTMLElement>(null);
  const testimonialText =
    'RepoPulse eliminated our documentation debt overnight. AI coding agents now understand our monolithic architecture instantly, and our release notes generate themselves! RepoPulse eliminated our documentation debt overnight.';
  const words = testimonialText.split(' ');

  return (
    <section
      ref={containerRef}
      id="testimonial"
      className="min-h-screen flex flex-col justify-center py-24 md:py-32 px-8 md:px-28 max-w-5xl mx-auto"
    >
      <div className="max-w-3xl mx-auto flex flex-col items-start gap-10">
        {/* Quote Mark Symbol */}
        <span className="text-6xl text-[hsl(var(--muted-foreground))] font-serif leading-none select-none">
          &ldquo;
        </span>

        {/* Scroll-Driven Word Reveal Text */}
        <p className="text-4xl md:text-5xl font-medium leading-[1.2] flex flex-wrap">
          {words.map((word, i) => (
            <WordSpan
              key={i}
              word={word}
              index={i}
              total={words.length}
              containerRef={containerRef}
            />
          ))}
          <span className="text-[hsl(var(--muted-foreground))] ml-2">&rdquo;</span>
        </p>

        {/* Author Row */}
        <div className="flex items-center gap-4 pt-2">
          <div className="w-14 h-14 rounded-full border-[3px] border-[hsl(var(--foreground))] bg-[hsl(var(--card))] flex items-center justify-center text-base font-bold text-white shadow-md">
            AC
          </div>
          <div>
            <p className="text-base font-semibold leading-7 text-[hsl(var(--foreground))]">
              Alex Chen
            </p>
            <p className="text-sm font-normal leading-5 text-[hsl(var(--muted-foreground))]">
              Lead Data Engineer
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
