"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

/**
 * formatDistanceToNow computes a moment-dependent string — rendering it
 * during SSR and again at hydration (a few seconds apart) can produce two
 * different strings, which React flags as a hydration mismatch. Render a
 * stable, non-time-dependent value first, then swap to the relative string
 * after mount, where there's only one render left to match.
 */
export function RelativeTime({
  date,
  addSuffix = true,
}: {
  date: string | Date;
  addSuffix?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const d = new Date(date);
  if (!mounted) return <>{d.toLocaleDateString()}</>;
  return <>{formatDistanceToNow(d, { addSuffix })}</>;
}
