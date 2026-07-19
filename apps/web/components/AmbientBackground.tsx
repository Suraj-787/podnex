/**
 * Three large, heavily-blurred, very-low-opacity blobs that slowly drift
 * behind the entire page (fixed, so they persist across scroll) — carries
 * the "alive" feel from the Hero through the rest of the homepage instead of
 * confining all motion to the first screen. Pure CSS (see globals.css'
 * drift-a/b/c keyframes), no JS, and disabled under prefers-reduced-motion.
 */
export function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-slate/[0.07] blur-[120px] animate-drift-a" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-muted/[0.1] blur-[140px] animate-drift-b" />
      <div className="absolute top-[35%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-slate-light/[0.05] blur-[100px] animate-drift-c" />
    </div>
  );
}
