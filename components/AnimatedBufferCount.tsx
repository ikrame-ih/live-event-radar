"use client";

import { useEffect, useRef } from "react";

type AnimatedBufferCountProps = {
  value: number;
  className?: string;
};

// Animates a number from its previous displayed value to the new one.
//
// This component writes directly to the DOM via a ref instead of storing
// animation progress in React state. Storing it in state would trigger
// React's reconciliation on every animation frame (~60 times per second),
// which is expensive for a purely visual effect. The ref approach keeps
// React out of the loop for the display tick while React still owns the
// source value.
export function AnimatedBufferCount({ value, className }: AnimatedBufferCountProps) {
  // Holds a reference to the <p> element so we can update its text directly.
  const ref = useRef<HTMLParagraphElement>(null);
  // Tracks the last number we rendered so the next animation starts from there.
  const displayRef = useRef(0);
  // Holds the active requestAnimationFrame ID so we can cancel it on cleanup.
  const rafRef = useRef(0);

  useEffect(() => {
    const start = displayRef.current;
    const delta = value - start;

    if (delta === 0) {
      if (ref.current) ref.current.textContent = value.toLocaleString("en-US");
      return;
    }

    // Scale duration with the size of the jump so large leaps don't feel instant,
    // but cap at 520ms so it never feels sluggish.
    const duration = Math.min(520, 160 + Math.abs(delta) * 6);
    const t0 = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - t0) / duration, 1);
      // Quadratic ease-out: fast at first, slows as it approaches the target.
      const eased = 1 - (1 - t) ** 2;
      const current = Math.round(start + delta * eased);
      displayRef.current = current;
      if (ref.current) ref.current.textContent = current.toLocaleString("en-US");
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else displayRef.current = value;
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return (
    <p ref={ref} className={className} data-kpi-buffer-count>
      {displayRef.current.toLocaleString("en-US")}
    </p>
  );
}
