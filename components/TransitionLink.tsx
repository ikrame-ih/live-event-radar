"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, type ComponentProps, type MouseEvent } from "react";

type TransitionLinkProps = ComponentProps<typeof NextLink>;

// Middle-click, modified click, etc. — leave default Link behaviour alone.
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

// ~180ms crossfade in globals.css; plain router.push when unsupported.
function runViewTransition(navigate: () => void) {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    document.startViewTransition(() => {
      startTransition(navigate);
    });
    return;
  }

  navigate();
}

// Link with View Transitions on same-tab nav. Skips hash/anchor targets.
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
