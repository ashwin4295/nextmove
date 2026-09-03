"use client";

import posthog from "posthog-js";

const SOURCE_KEY = "nextmove_src";

export function rememberSource(src: string) {
  if (!src || typeof window === "undefined") return;
  try {
    if (!sessionStorage.getItem(SOURCE_KEY)) {
      sessionStorage.setItem(SOURCE_KEY, src);
    }
  } catch {
    // private mode
  }
}

export function storedSource(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(SOURCE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function track(
  event: string,
  props: { session_id?: string; source?: string } = {},
) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, {
    session_id: props.session_id,
    source: props.source || storedSource(),
  });
}

export function identifyEmail(email: string) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || !email) return;
  posthog.identify(email);
}
