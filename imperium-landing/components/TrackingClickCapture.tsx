"use client";

import { useEffect } from "react";
import { track } from "@/lib/trackingClient";

function textFromElement(element: HTMLElement): string {
  return (element.getAttribute("aria-label") || element.textContent || "")
    .trim()
    .slice(0, 120);
}

export default function TrackingClickCapture() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const tracked = target?.closest("[data-track-click]") as HTMLElement | null;
      if (!tracked) {
        return;
      }

      const clickName = tracked.getAttribute("data-track-click") || "ui_click";
      const href =
        tracked instanceof HTMLAnchorElement ? tracked.getAttribute("href") || "" : "";

      void track("click", {
        props: {
          click_name: clickName,
          label: textFromElement(tracked),
          href,
        },
      });
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
