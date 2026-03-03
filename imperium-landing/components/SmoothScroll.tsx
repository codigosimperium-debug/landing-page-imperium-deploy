"use client";

import { useEffect } from "react";
import Lenis from "lenis";

function getHashFromHref(href: string): string | null {
  if (href.startsWith("/#")) {
    return href.slice(2);
  }

  if (href.startsWith("#")) {
    return href.slice(1);
  }

  return null;
}

export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.95,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };

    rafId = window.requestAnimationFrame(raf);

    const onAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href) {
        return;
      }

      const hash = getHashFromHref(href);
      if (!hash) {
        return;
      }

      const destination = document.getElementById(hash);
      if (!destination) {
        return;
      }

      const currentPath = window.location.pathname || "/";
      if (href.startsWith("/#") && currentPath !== "/") {
        return;
      }

      event.preventDefault();
      lenis.scrollTo(destination, {
        offset: -96,
        duration: 1,
      });
      window.history.replaceState(null, "", `/#${hash}`);
    };

    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
