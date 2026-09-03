"use client";

import posthog from "posthog-js";
import { useEffect, type ReactNode } from "react";
import { rememberSource } from "@/lib/analytics";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (key) {
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
        capture_pageview: true,
        person_profiles: "identified_only",
      });
    }

    const src = new URLSearchParams(window.location.search).get("src");
    if (src) rememberSource(src);
  }, []);

  return children;
}
