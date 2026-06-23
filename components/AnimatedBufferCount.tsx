"use client";

import { useEffect, useRef } from "react";

type AnimatedBufferCountProps = {
  value: number;
  className?: string;
};

// Count-up via rAF + DOM ref — avoids ~60 React re-renders/sec for a display-only effect.
export function AnimatedBufferCount({ value, className }: AnimatedBufferCountProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const displayRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const start = displayRef.current;
    const delta = value - start;

    if (delta === 0) {
      if (ref.current) ref.current.textContent = value.toLocaleString("en-US");
      return;
    }

    // Longer jumps get a bit more time, capped at 520ms.
    const duration = Math.min(520, 160 + Math.abs(delta) * 6);
    const t0 = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - t0) / duration, 1);
      // ease-out quad
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

  // Number is written via ref in useEffect/rAF — keep JSX empty to satisfy react-hooks/refs.
  return <p ref={ref} className={className} data-kpi-buffer-count />;
}
