"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, type ComponentProps, type MouseEvent } from "react";

type TransitionLinkProps = ComponentProps<typeof NextLink>;

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

function runViewTransition(navigate: () => void) {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    document.startViewTransition(() => {
      startTransition(navigate);
    });
    return;
  }

  navigate();
}

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
