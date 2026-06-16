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
    <div className="relative mx-auto flex h-[120px] w-[120px] items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 88 88" aria-hidden>
        <circle cx="44" cy="44" r="38" fill="none" stroke="var(--gauge-track)" strokeWidth="5" />
        <circle
          cx="44"
          cy="44"
          r="38"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--gradient-start)" />
            <stop offset="100%" stopColor="var(--gradient-end)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="bry-gauge-value font-mono">{value}</span>
    </div>
  );
}
