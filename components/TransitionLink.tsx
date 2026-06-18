"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, type ComponentProps, type MouseEvent } from "react";

type TransitionLinkProps = ComponentProps<typeof NextLink>;

// Returns true for any click that the browser or OS should handle natively
// (middle-click, Ctrl+click, modified click, already-prevented, etc.).
// In those cases we let the default Next.js link behaviour run unchanged.
function shouldSkipTransition(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

// Wraps navigation in document.startViewTransition when the browser supports it.
// This triggers the ~180ms crossfade defined in globals.css.
// Falls back to a plain router.push for browsers that don't support the API yet.
function runViewTransition(navigate: () => void) {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    document.startViewTransition(() => {
      startTransition(navigate);
    });
    return;
  }

  navigate();
}

// Drop-in replacement for Next.js <Link> that plays a View Transitions crossfade
// on same-tab navigation. Anchor and hash links are excluded because the API
// doesn't apply to in-page jumps.
export function TransitionLink({
  href,
  onClick,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();

  return (
    <NextLink
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (shouldSkipTransition(event)) return;

        const target =
          typeof href === "string"
            ? href
            : typeof href === "object" && href.pathname
              ? `${href.pathname}${href.hash ?? ""}`
              : null;

        if (!target || target.startsWith("#")) return;

        event.preventDefault();
        runViewTransition(() => {
          router.push(target);
        });
      }}
    />
  );
}
