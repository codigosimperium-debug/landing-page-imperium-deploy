"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { initSession, track } from "@/lib/trackingClient";

export default function TrackingPageView() {
  const pathname = usePathname();

  useEffect(() => {
    initSession();
  }, []);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    void track("page_view", { pagePath: pathname });
  }, [pathname]);

  return null;
}
