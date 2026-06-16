type AppLogoProps = {
  size?: number;
  className?: string;
};

/** Radar mark — matches app/icon.svg favicon */
export function AppLogo({ size = 28, className }: AppLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="32" height="32" rx="9" fill="#1a1a1c" />
      <circle cx="16" cy="16" r="11" stroke="url(#lr-logo-grad)" strokeWidth="2" opacity="0.95" />
      <circle cx="16" cy="16" r="6" stroke="url(#lr-logo-grad)" strokeWidth="1.5" opacity="0.55" />
      <circle cx="16" cy="16" r="2.5" fill="#c8f542" />
      <defs>
        <linearGradient id="lr-logo-grad" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff8a4c" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
