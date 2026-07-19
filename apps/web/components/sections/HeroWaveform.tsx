"use client";

import { useEffect, useRef } from "react";

const BAR_COUNT = 44;

/**
 * A live-looking audio waveform — the most direct visual metaphor for "text
 * becomes a spoken conversation." Bars breathe continuously via a sine wave
 * per bar (distinct phase/speed so it never looks mechanically uniform), and
 * gain extra amplitude near the cursor for a responsive, "it's listening"
 * feel. Driven by requestAnimationFrame + transform (not height/layout), and
 * disabled to a calm static shape under prefers-reduced-motion.
 */
export function HeroWaveform() {
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const mouseXRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const phases = Array.from({ length: BAR_COUNT }, () => Math.random() * Math.PI * 2);

    if (prefersReducedMotion) {
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const arc = 0.35 + 0.3 * Math.sin((i / BAR_COUNT) * Math.PI);
        bar.style.transform = `scaleY(${arc})`;
        bar.style.opacity = `${0.5 + arc * 0.4}`;
      });
      return;
    }

    let raf: number;
    const start = performance.now();

    function tick(now: number) {
      const t = (now - start) / 1000;
      const mouseX = mouseXRef.current;

      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const phase = phases[i]!;
        const speed = 1.0 + (i % 5) * 0.09;
        const arcBase = 0.22 + 0.16 * Math.sin((i / BAR_COUNT) * Math.PI); // gentle dome shape
        let amplitude = 0.22;

        if (mouseX !== null) {
          const barCenter = (i + 0.5) / BAR_COUNT;
          const dist = Math.abs(barCenter - mouseX);
          const boost = Math.max(0, 1 - dist * 3.2);
          amplitude += boost * 0.6;
        }

        const wave = arcBase + amplitude * (0.5 + 0.5 * Math.sin(t * speed + phase));
        const scale = Math.max(0.05, Math.min(1, wave));

        bar.style.transform = `scaleY(${scale})`;
        bar.style.opacity = `${0.45 + scale * 0.55}`;
      });

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseXRef.current = (e.clientX - rect.left) / rect.width;
  };

  const handleMouseLeave = () => {
    mouseXRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full flex items-center justify-center gap-[3px] sm:gap-1 px-6"
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          className="h-full w-1 sm:w-1.5 rounded-full bg-gradient-to-t from-slate via-slate-light to-foreground will-change-transform"
          style={{ transform: "scaleY(0.3)", opacity: 0.5 }}
        />
      ))}
    </div>
  );
}
