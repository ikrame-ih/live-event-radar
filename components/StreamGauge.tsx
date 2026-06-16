"use client";

type StreamGaugeProps = {
  value: number;
  max?: number;
};

export function StreamGauge({ value, max = 3 }: StreamGaugeProps) {
  const pct = Math.min(value / max, 1);
  const circumference = 2 * Math.PI * 38;
  const offset = circumference * (1 - pct);

  return (
    <div className="bry-gauge-glow relative mx-auto flex h-[132px] w-[132px] items-center justify-center">
      <div className="bry-glass absolute inset-3 rounded-full" />
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 88 88" aria-hidden>
        <circle cx="44" cy="44" r="38" fill="none" stroke="var(--gauge-track)" strokeWidth="7" />
        <circle
          cx="44"
          cy="44"
          r="30"
          fill="none"
          stroke="rgb(255 255 255 / 0.62)"
          strokeWidth="1.5"
        />
        <circle
          cx="44"
          cy="44"
          r="38"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-[900ms] ease-[var(--ease-out-soft)]"
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--gradient-start)" />
            <stop offset="100%" stopColor="var(--gradient-end)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="bry-gauge-value relative font-mono">{value}</span>
    </div>
  );
}
