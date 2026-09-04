export type Caps = {
  emailStarted: number;
  todayStarted: number;
};

export function envCap(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function utcDayStart(ts: number) {
  const d = new Date(ts);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function capsExceeded(caps: Caps, kind: "email" | "daily") {
  if (kind === "email") return caps.emailStarted >= envCap("PER_EMAIL_CAP", 1);
  return caps.todayStarted >= envCap("DAILY_CAP", 60);
}
