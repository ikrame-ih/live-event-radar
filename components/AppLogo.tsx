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
      <circle
        cx="16"
        cy="16"
        r="11"
        stroke="#e54d3a"
        strokeWidth="2"
        opacity="0.95"
      />
      <circle
        cx="16"
        cy="16"
        r="6"
        stroke="#e54d3a"
        strokeWidth="1.5"
        opacity="0.45"
      />
      <circle cx="16" cy="16" r="2.5" fill="#0d9b5c" />
    </svg>
  );
}
