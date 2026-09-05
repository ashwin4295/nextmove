import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { utcDayStart, type Caps } from "./caps";
import type { NextMove, Pack, TranscriptTurn } from "./extract";
import { asPack, normalizeNextMove } from "./extract";
import { asProfile, type Profile, type ProfileStatus } from "./profile";

export type SessionDoc = {
  phone?: string | null;
  _id: string;
  createdAt: number;
  source: string;
  transcript: TranscriptTurn[];
  roadmap: NextMove | null;
  actReached: number | null;
  selectedPath: string | null;
  shares: number;
  sent: boolean;
  contactName: string | null;
  name: string | null;
  email: string | null;
  payLinkUrl: string | null;
  payLinkId: string | null;
  paid: boolean;
  startedAt: number | null;
  pack: Pack | null;
  packFailed: boolean;
  linkedinUrl: string | null;
  profileStatus: ProfileStatus;
  profile: Profile | null;
  feedbackScore: number | null;
  feedbackText: string | null;
};

export type Stats = {
  started: number;
  act1: number;
  act2: number;
  act3: number;
  written: number;
  sent: number;
  paid: number;
  shared: number;
  roadmaps: number;
  selected: number;
};

export type RecentRow = {
  _id: string;
  createdAt: number;
  source: string;
  actReached: number | null;
  sent: boolean;
  paid: boolean;
  shares: number;
  email: string | null;
  profileStatus: ProfileStatus;
  hasPack: boolean;
  packFailed: boolean;
  feedbackScore: number | null;
  feedbackText: string | null;
};

export type SessionStore = {
  create: (args: {
    source: string;
    name?: string;
    email?: string;
    linkedinUrl?: string;
    phone?: string;
  }) => Promise<string>;
  setProfile: (args: {
    id: string;
    status: ProfileStatus;
    profile: Profile | null;
  }) => Promise<void>;
  finish: (args: {
    id: string;
    transcript: TranscriptTurn[];
    roadmap: NextMove | null;
    actReached?: number;
  }) => Promise<void>;
  selectPath: (args: { id: string; path: string }) => Promise<void>;
  share: (args: { id: string }) => Promise<void>;
  markSent: (args: { id: string }) => Promise<void>;
  setPayLink: (args: {
    id: string;
    url: string;
    linkId: string;
  }) => Promise<void>;
  markPaid: (args: { id: string; paymentId: string }) => Promise<void>;
  markStarted: (args: { id: string }) => Promise<void>;
  setPack: (args: {
    id: string;
    pack: Pack | null;
    failed?: boolean;
  }) => Promise<void>;
  caps: (args: { email: string }) => Promise<Caps>;
  pilotStarted: () => Promise<number>;
  joinWaitlist: (args: {
    email: string;
    source: string;
  }) => Promise<{ ok: true }>;
  waitlistCount: () => Promise<number>;
  setFeedback: (args: {
    id: string;
    score: number;
    text: string;
  }) => Promise<void>;
  setContact: (args: {
    id: string;
    contactName: string;
    message: string;
  }) => Promise<void>;
  get: (args: { id: string }) => Promise<SessionDoc | null>;
  stats: () => Promise<Stats>;
  listRecent: (args: { limit: number }) => Promise<RecentRow[]>;
  countUnique: () => Promise<number>;
};

type MemoryRow = SessionDoc;

function computeStats(rows: MemoryRow[]): Stats {
  const written = rows.filter((r) => r.roadmap != null).length;
  return {
    started: rows.length,
    act1: rows.filter((r) => (r.actReached ?? 0) >= 1).length,
    act2: rows.filter((r) => (r.actReached ?? 0) >= 2).length,
    act3: rows.filter((r) => (r.actReached ?? 0) >= 3).length,
    written,
    roadmaps: written,
    sent: rows.filter((r) => r.sent).length,
    paid: rows.filter((r) => r.paid).length,
    selected: rows.filter((r) => r.selectedPath != null).length,
    shared: rows.filter((r) => r.shares > 0).length,
  };
}

function getMemoryMap(): Map<string, MemoryRow> {
  const g = globalThis as typeof globalThis & {
    __nextmoveSessions?: Map<string, MemoryRow>;
  };
  if (!g.__nextmoveSessions) {
    g.__nextmoveSessions = new Map();
  }
  return g.__nextmoveSessions;
}

type SessionExtras = {
  phone?: string | null;
  name: string | null;
  email: string | null;
  payLinkUrl?: string | null;
  payLinkId?: string | null;
  paid?: boolean;
  startedAt?: number | null;
  pack?: Pack | null;
  packFailed?: boolean;
  linkedinUrl?: string | null;
  profileStatus?: ProfileStatus;
  profile?: Profile | null;
  feedbackScore?: number | null;
  feedbackText?: string | null;
};

function getWaitlist(): Set<string> {
  const g = globalThis as typeof globalThis & {
    __nextmoveWaitlist?: Set<string>;
  };
  if (!g.__nextmoveWaitlist) {
    g.__nextmoveWaitlist = new Set();
  }
  return g.__nextmoveWaitlist;
}

function countPilotFromRows(
  rows: { startedAt?: number | null }[],
): number {
  return rows.filter((r) => typeof r.startedAt === "number").length;
}

function extrasMap(): Map<string, SessionExtras> {
  const g = globalThis as typeof globalThis & {
    __nextmoveExtras?: Map<string, SessionExtras>;
  };
  if (!g.__nextmoveExtras) {
    g.__nextmoveExtras = new Map();
  }
  return g.__nextmoveExtras;
}

function rememberExtras(id: string, extras: Partial<SessionExtras>) {
  const prev = extrasMap().get(id) ?? { name: null, email: null };
  extrasMap().set(id, { ...prev, ...extras });
}

function countUniqueFrom(rows: { roadmap: unknown; email: string | null }[]) {
  const emails = new Set<string>();
  for (const r of rows) {
    if (r.roadmap != null && r.email) {
      emails.add(r.email.toLowerCase());
    }
  }
  return emails.size;
}

function hydrate(row: {
  _id: string;
  createdAt: number;
  source: string;
  transcript: TranscriptTurn[];
  roadmap: unknown;
  actReached: number | null;
  selectedPath: string | null;
  shares: number;
  sent?: boolean;
  contactName?: string | null;
  name?: string | null;
  email?: string | null;
  payLinkUrl?: string | null;
  payLinkId?: string | null;
  paid?: boolean;
  startedAt?: number | null;
  pack?: unknown;
  packFailed?: boolean;
  linkedinUrl?: string | null;
  profileStatus?: ProfileStatus;
  profile?: unknown;
  feedbackScore?: number | null;
  feedbackText?: string | null;
}): SessionDoc {
  const nextMove = normalizeNextMove(row.roadmap, { lenient: true });
  const blob =
    row.roadmap && typeof row.roadmap === "object"
      ? (row.roadmap as Record<string, unknown>)
      : null;
  const sent =
    row.sent === true || blob?.__sessionSent === true;
  const contactName =
    row.contactName ??
    (typeof blob?.__contactName === "string" ? blob.__contactName : null) ??
    nextMove?.contact.name ??
    null;
  const extras = extrasMap().get(String(row._id));
  const name =
    row.name ??
    (typeof blob?.__name === "string" ? blob.__name : null) ??
    extras?.name ??
    null;
  const email =
    row.email ??
    (typeof blob?.__email === "string" ? blob.__email : null) ??
    extras?.email ??
    null;
  const payLinkUrl =
    row.payLinkUrl ??
    (typeof blob?.__payLinkUrl === "string" ? blob.__payLinkUrl : null) ??
    extras?.payLinkUrl ??
    null;
  const payLinkId =
    row.payLinkId ??
    (typeof blob?.__payLinkId === "string" ? blob.__payLinkId : null) ??
    extras?.payLinkId ??
    null;
  const paid =
    row.paid === true || blob?.__paid === true || extras?.paid === true;
  const startedAt =
    (typeof row.startedAt === "number" ? row.startedAt : null) ??
    (typeof blob?.__startedAt === "number" ? blob.__startedAt : null) ??
    (typeof extras?.startedAt === "number" ? extras.startedAt : null);
  const pack =
    asPack(row.pack) ?? asPack(blob?.__pack) ?? extras?.pack ?? null;
  const packFailed =
    row.packFailed === true ||
    blob?.__packFailed === true ||
    extras?.packFailed === true;
  const linkedinUrl =
    row.linkedinUrl ??
    (typeof blob?.__linkedinUrl === "string" ? blob.__linkedinUrl : null) ??
    extras?.linkedinUrl ??
    null;
  const profileStatus: ProfileStatus =
    row.profileStatus ??
    (blob?.__profileStatus === "pending" ||
    blob?.__profileStatus === "ready" ||
    blob?.__profileStatus === "failed" ||
    blob?.__profileStatus === "none"
      ? blob.__profileStatus
      : null) ??
    extras?.profileStatus ??
    (linkedinUrl ? "pending" : "none");
  const profile =
    asProfile(row.profile) ??
    asProfile(blob?.__profile) ??
    extras?.profile ??
    null;
  const feedbackScore =
    (typeof row.feedbackScore === "number" ? row.feedbackScore : null) ??
    (typeof extras?.feedbackScore === "number" ? extras.feedbackScore : null);
  const feedbackText =
    (typeof row.feedbackText === "string" ? row.feedbackText : null) ??
    (typeof extras?.feedbackText === "string" ? extras.feedbackText : null);
  return {
    _id: String(row._id),
    createdAt: row.createdAt,
    source: row.source,
    transcript: row.transcript ?? [],
    roadmap: nextMove,
    actReached: row.actReached,
    selectedPath: row.selectedPath,
    shares: row.shares ?? 0,
    sent,
    contactName,
    name,
    email,
    payLinkUrl,
    payLinkId,
    paid,
    startedAt,
    pack,
    packFailed,
    linkedinUrl,
    profileStatus,
    profile,
    feedbackScore,
    feedbackText,
  };
}

const memoryStore: SessionStore = {
  async create({ source, name, email, linkedinUrl, phone }) {
    const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const url = linkedinUrl?.trim() || null;
    getMemoryMap().set(id, {
      _id: id,
      createdAt: Date.now(),
      source,
      transcript: [],
      roadmap: null,
      actReached: null,
      selectedPath: null,
      shares: 0,
      sent: false,
      contactName: null,
      name: name?.trim() || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      payLinkUrl: null,
      payLinkId: null,
      paid: false,
      startedAt: null,
      pack: null,
      packFailed: false,
      linkedinUrl: url,
      profileStatus: url ? "pending" : "none",
      profile: null,
      feedbackScore: null,
      feedbackText: null,
    });
    return id;
  },
  async setProfile({ id, status, profile }) {
    const row = getMemoryMap().get(id);
    if (!row) return;
    row.profileStatus = status;
    row.profile = profile;
  },
  async finish({ id, transcript, roadmap, actReached }) {
    const row = getMemoryMap().get(id);
    if (!row) return;
    row.transcript = transcript;
    row.roadmap = roadmap;
    const extracted =
      roadmap && typeof roadmap.actReached === "number"
        ? roadmap.actReached
        : 0;
    const client = typeof actReached === "number" ? actReached : 0;
    row.actReached = Math.max(client, extracted) || null;
  },
  async selectPath({ id, path }) {
    const row = getMemoryMap().get(id);
    if (!row) return;
    row.selectedPath = path;
  },
  async share({ id }) {
    const row = getMemoryMap().get(id);
    if (!row) return;
    row.shares += 1;
  },
  async markSent({ id }) {
    const row = getMemoryMap().get(id);
    if (!row) return;
    row.sent = true;
  },
  async setPayLink({ id, url, linkId }) {
    const row = getMemoryMap().get(id);
    if (!row) return;
    row.payLinkUrl = url;
    row.payLinkId = linkId;
  },
  async markPaid({ id }) {
    const row = getMemoryMap().get(id);
    if (!row) return;
    if (row.paid) return;
    row.paid = true;
  },
  async markStarted({ id }) {
    const row = getMemoryMap().get(id);
    if (!row) return;
    if (row.startedAt != null) return;
    row.startedAt = Date.now();
  },
  async setPack({ id, pack, failed }) {
    const row = getMemoryMap().get(id);
    if (!row) return;
    row.pack = pack;
    row.packFailed = failed === true;
  },
  async caps({ email }) {
    const norm = email.trim().toLowerCase();
    const rows = [...getMemoryMap().values()];
    const start = utcDayStart(Date.now());
    return {
      emailStarted: rows.filter(
        (r) =>
          r.email?.toLowerCase() === norm && typeof r.startedAt === "number",
      ).length,
      todayStarted: rows.filter(
        (r) => typeof r.startedAt === "number" && r.startedAt >= start,
      ).length,
      pilotStarted: countPilotFromRows(rows),
    };
  },
  async pilotStarted() {
    return countPilotFromRows([...getMemoryMap().values()]);
  },
  async joinWaitlist({ email }) {
    getWaitlist().add(email.trim().toLowerCase());
    return { ok: true as const };
  },
  async waitlistCount() {
    return getWaitlist().size;
  },
  async setFeedback({ id, score, text }) {
    const row = getMemoryMap().get(id);
    if (!row) return;
    row.feedbackScore = Math.min(5, Math.max(1, Math.round(score)));
    row.feedbackText = text.trim().slice(0, 600);
  },
  async setContact({ id, contactName, message }) {
    const row = getMemoryMap().get(id);
    if (!row) return;
    row.contactName = contactName;
    if (row.roadmap) {
      row.roadmap = {
        ...row.roadmap,
        message,
        contact: { ...row.roadmap.contact, name: contactName },
      };
    }
  },
  async get({ id }) {
    const row = getMemoryMap().get(id);
    return row ? hydrate(row) : null;
  },
  async stats() {
    return computeStats([...getMemoryMap().values()]);
  },
  async listRecent({ limit }) {
    return [...getMemoryMap().values()]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, Math.min(Math.max(limit, 1), 25))
      .map((r) => ({
        _id: r._id,
        createdAt: r.createdAt,
        source: r.source,
        actReached: r.actReached,
        sent: r.sent,
        paid: r.paid,
        shares: r.shares,
        email: r.email,
        profileStatus: r.profileStatus,
        hasPack: r.pack != null,
        packFailed: r.packFailed,
        feedbackScore: r.feedbackScore,
        feedbackText: r.feedbackText,
      }));
  },
  async countUnique() {
    return countUniqueFrom([...getMemoryMap().values()]);
  },
};

function recentIdList(): string[] {
  const g = globalThis as typeof globalThis & { __nextmoveRecentIds?: string[] };
  if (!g.__nextmoveRecentIds) g.__nextmoveRecentIds = [];
  return g.__nextmoveRecentIds;
}

function rememberId(id: string) {
  const recentIds = recentIdList();
  const i = recentIds.indexOf(id);
  if (i >= 0) recentIds.splice(i, 1);
  recentIds.unshift(id);
  if (recentIds.length > 25) recentIds.pop();
}

function convexStore(url: string): SessionStore {
  const client = () => new ConvexHttpClient(url);

  async function finishViaExisting(
    id: string,
    transcript: TranscriptTurn[],
    roadmap: unknown,
  ) {
    await client().mutation(anyApi.sessions.finish, {
      id,
      transcript,
      roadmap,
    });
  }

  return {
    async create({ source, name, email, linkedinUrl, phone }) {
      const extras: SessionExtras = {
        phone: phone?.trim() || null,
        name: name?.trim() || null,
        email: email?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
        profileStatus: linkedinUrl?.trim() ? "pending" : "none",
        profile: null,
      };
      const persistLink = async (id: string) => {
        rememberId(id);
        rememberExtras(id, extras);
        if (!extras.linkedinUrl) return;
        try {
          await finishViaExisting(id, [], {
            __linkedinUrl: extras.linkedinUrl,
            __profileStatus: extras.profileStatus,
          });
        } catch {
          // extras still in memory for this process
        }
      };
      try {
        const id = String(
          await client().mutation(anyApi.sessions.create, {
            source,
            ...(extras.name ? { name: extras.name } : {}),
            ...(extras.email ? { email: extras.email } : {}),
            ...(extras.phone ? { phone: extras.phone } : {}),
            ...(extras.linkedinUrl
              ? {
                  linkedinUrl: extras.linkedinUrl,
                  profileStatus: extras.profileStatus,
                }
              : {}),
          }),
        );
        rememberId(id);
        rememberExtras(id, extras);
        return id;
      } catch {
        try {
          const id = String(
            await client().mutation(anyApi.sessions.create, {
              source,
              ...(extras.name ? { name: extras.name } : {}),
              ...(extras.email ? { email: extras.email } : {}),
              ...(extras.phone ? { phone: extras.phone } : {}),
            ...(extras.phone ? { phone: extras.phone } : {}),
            }),
          );
          await persistLink(id);
          return id;
        } catch {
          const id = String(
            await client().mutation(anyApi.sessions.create, { source }),
          );
          await persistLink(id);
          return id;
        }
      }
    },
    async setProfile({ id, status, profile }) {
      rememberExtras(id, { profileStatus: status, profile });
      try {
        await client().mutation(anyApi.sessions.setProfile, {
          id,
          status,
          profile,
        });
      } catch {
        const row = await client().query(anyApi.sessions.get, { id });
        if (!row) return;
        const prev =
          row.roadmap && typeof row.roadmap === "object" ? row.roadmap : {};
        const extras = extrasMap().get(id);
        await finishViaExisting(id, row.transcript ?? [], {
          ...prev,
          __profileStatus: status,
          __profile: profile,
          ...(extras?.linkedinUrl
            ? { __linkedinUrl: extras.linkedinUrl }
            : {}),
        });
      }
    },
    async finish({ id, transcript, roadmap, actReached }) {
      const extras = extrasMap().get(id);
      const merged =
        roadmap && typeof actReached === "number"
          ? {
              ...roadmap,
              actReached: Math.max(roadmap.actReached ?? 0, actReached) as
                | 1
                | 2
                | 3,
            }
          : roadmap;
      const meta = extras
        ? {
            ...(extras.email ? { __email: extras.email } : {}),
            ...(extras.name ? { __name: extras.name } : {}),
            ...(extras.linkedinUrl
              ? { __linkedinUrl: extras.linkedinUrl }
              : {}),
            ...(extras.profileStatus
              ? { __profileStatus: extras.profileStatus }
              : {}),
            ...(extras.profile ? { __profile: extras.profile } : {}),
          }
        : {};
      const withMeta = merged
        ? { ...merged, ...meta }
        : Object.keys(meta).length
          ? meta
          : merged;
      // Do not send extra args: production Convex still has the M-A finish signature
      // until the operator deploys. actReached is baked into the stored object.
      await finishViaExisting(id, transcript, withMeta);
    },
    async selectPath({ id, path }) {
      await client().mutation(anyApi.sessions.selectPath, { id, path });
    },
    async share({ id }) {
      await client().mutation(anyApi.sessions.share, { id });
    },
    async markSent({ id }) {
      try {
        await client().mutation(anyApi.sessions.markSent, { id });
      } catch {
        const row = await client().query(anyApi.sessions.get, { id });
        if (!row) return;
        const prev =
          row.roadmap && typeof row.roadmap === "object" ? row.roadmap : {};
        await finishViaExisting(id, row.transcript ?? [], {
          ...prev,
          __sessionSent: true,
        });
      }
    },
    async setPayLink({ id, url, linkId }) {
      rememberExtras(id, { payLinkUrl: url, payLinkId: linkId });
      try {
        await client().mutation(anyApi.sessions.setPayLink, { id, url, linkId });
      } catch {
        const row = await client().query(anyApi.sessions.get, { id });
        if (!row) return;
        const prev =
          row.roadmap && typeof row.roadmap === "object" ? row.roadmap : {};
        await finishViaExisting(id, row.transcript ?? [], {
          ...prev,
          __payLinkUrl: url,
          __payLinkId: linkId,
        });
      }
    },
    async markPaid({ id, paymentId }) {
      rememberExtras(id, { paid: true });
      try {
        await client().mutation(anyApi.sessions.markPaid, { id, paymentId });
      } catch {
        const row = await client().query(anyApi.sessions.get, { id });
        if (!row) return;
        const prev =
          row.roadmap && typeof row.roadmap === "object" ? row.roadmap : {};
        if (
          prev &&
          typeof prev === "object" &&
          "__paid" in prev &&
          prev.__paid === true
        ) {
          return;
        }
        await finishViaExisting(id, row.transcript ?? [], {
          ...prev,
          __paid: true,
        });
      }
    },
    async markStarted({ id }) {
      const now = Date.now();
      const extra = extrasMap().get(id);
      if (typeof extra?.startedAt === "number") return;
      rememberExtras(id, { startedAt: now });
      try {
        await client().mutation(anyApi.sessions.markStarted, { id });
      } catch {
        const row = await client().query(anyApi.sessions.get, { id });
        if (!row) return;
        const prev =
          row.roadmap && typeof row.roadmap === "object" ? row.roadmap : {};
        if (
          prev &&
          typeof prev === "object" &&
          typeof (prev as { __startedAt?: unknown }).__startedAt === "number"
        ) {
          return;
        }
        await finishViaExisting(id, row.transcript ?? [], {
          ...prev,
          __startedAt: now,
        });
      }
    },
    async setPack({ id, pack, failed }) {
      rememberExtras(id, { pack, packFailed: failed === true });
      try {
        await client().mutation(anyApi.sessions.setPack, {
          id,
          pack,
          failed: failed === true,
        });
      } catch {
        const row = await client().query(anyApi.sessions.get, { id });
        if (!row) return;
        const prev =
          row.roadmap && typeof row.roadmap === "object" ? row.roadmap : {};
        await finishViaExisting(id, row.transcript ?? [], {
          ...prev,
          __pack: pack,
          __packFailed: failed === true,
        });
      }
    },
    async caps({ email }) {
      try {
        const raw = (await client().query(anyApi.sessions.caps, {
          email,
        })) as Caps;
        if (
          raw &&
          typeof raw.emailStarted === "number" &&
          typeof raw.todayStarted === "number"
        ) {
          return {
            emailStarted: raw.emailStarted,
            todayStarted: raw.todayStarted,
            pilotStarted:
              typeof raw.pilotStarted === "number"
                ? raw.pilotStarted
                : await this.pilotStarted(),
          };
        }
      } catch {
        // new query is not on the live deployment yet
      }
      const ids = recentIdList();
      const extras = extrasMap();
      const rows = await Promise.all(
        ids.map(async (id) => {
          try {
            const row = await client().query(anyApi.sessions.get, { id });
            return row ? hydrate(row as SessionDoc) : null;
          } catch {
            const extra = extras.get(id);
            if (!extra) return null;
            return {
              email: extra.email,
              startedAt: extra.startedAt ?? null,
            };
          }
        }),
      );
      const norm = email.trim().toLowerCase();
      const start = utcDayStart(Date.now());
      const seen = rows.filter(
        (r): r is { email: string | null; startedAt: number | null } =>
          r != null,
      );
      return {
        emailStarted: seen.filter(
          (r) =>
            r.email?.toLowerCase() === norm && typeof r.startedAt === "number",
        ).length,
        todayStarted: seen.filter(
          (r) => typeof r.startedAt === "number" && r.startedAt >= start,
        ).length,
        pilotStarted: countPilotFromRows(seen),
      };
    },
    async pilotStarted() {
      try {
        const raw = (await client().query(anyApi.sessions.pilotStatus, {})) as {
          started?: number;
        };
        if (raw && typeof raw.started === "number") return raw.started;
      } catch {
        // new query is not on the live deployment yet
      }
      const ids = recentIdList();
      const extras = extrasMap();
      const rows = await Promise.all(
        ids.map(async (id) => {
          try {
            const row = await client().query(anyApi.sessions.get, { id });
            return row ? hydrate(row as SessionDoc) : null;
          } catch {
            const extra = extras.get(id);
            if (!extra) return null;
            return { startedAt: extra.startedAt ?? null };
          }
        }),
      );
      return countPilotFromRows(
        rows.filter((r): r is { startedAt: number | null } => r != null),
      );
    },
    async joinWaitlist({ email, source }) {
      const key = email.trim().toLowerCase();
      getWaitlist().add(key);
      try {
        await client().mutation(anyApi.waitlist.joinWaitlist, {
          email: key,
          source,
        });
      } catch {
        // new mutation is not on the live deployment yet
      }
      return { ok: true as const };
    },
    async waitlistCount() {
      try {
        const n = await client().query(anyApi.waitlist.count, {});
        if (typeof n === "number") return n;
      } catch {
        // new query is not on the live deployment yet
      }
      return getWaitlist().size;
    },
    async setFeedback({ id, score, text }) {
      const clamped = Math.min(5, Math.max(1, Math.round(score)));
      const trimmed = text.trim().slice(0, 600);
      rememberExtras(id, { feedbackScore: clamped, feedbackText: trimmed });
      try {
        await client().mutation(anyApi.sessions.setFeedback, {
          id,
          score: clamped,
          text: trimmed,
        });
      } catch {
        // extras stand for this process
      }
    },
    async setContact({ id, contactName, message }) {
      try {
        await client().mutation(anyApi.sessions.setContact, {
          id,
          contactName,
          message,
        });
      } catch {
        const row = await client().query(anyApi.sessions.get, { id });
        if (!row) return;
        const prev =
          row.roadmap && typeof row.roadmap === "object" ? row.roadmap : {};
        const prevContact =
          "contact" in prev && prev.contact && typeof prev.contact === "object"
            ? prev.contact
            : {};
        await finishViaExisting(id, row.transcript ?? [], {
          ...prev,
          message,
          contact: { ...prevContact, name: contactName },
          __contactName: contactName,
        });
      }
    },
    async get({ id }) {
      const row = await client().query(anyApi.sessions.get, { id });
      if (!row) return null;
      rememberId(String(row._id ?? id));
      return hydrate(row as SessionDoc);
    },
    async stats() {
      const raw = (await client().query(anyApi.sessions.stats, {})) as Partial<Stats> & {
        roadmaps?: number;
        paid?: number;
      };
      const written = raw.written ?? raw.roadmaps ?? 0;
      const extraPaid = [...extrasMap().values()].filter(
        (e) => e.paid === true,
      ).length;
      return {
        started: raw.started ?? 0,
        act1: raw.act1 ?? 0,
        act2: raw.act2 ?? 0,
        act3: raw.act3 ?? 0,
        written,
        roadmaps: written,
        sent: raw.sent ?? 0,
        paid: Math.max(raw.paid ?? 0, extraPaid),
        selected: raw.selected ?? 0,
        shared: raw.shared ?? 0,
      };
    },
    async listRecent({ limit }) {
      try {
        const rows = (await client().query(anyApi.sessions.listRecent, {
          limit,
        })) as Array<
          RecentRow & {
            hasPack?: boolean;
            packFailed?: boolean;
            feedbackScore?: number | null;
            feedbackText?: string | null;
          }
        >;
        const legacy = rows.every(
          (r) => r.hasPack === undefined && r.packFailed === undefined,
        );
        const mapped = await Promise.all(
          rows.map(async (r) => {
            const extra = extrasMap().get(String(r._id));
            let paid = r.paid === true || extra?.paid === true;
            let hasPack = r.hasPack === true || extra?.pack != null;
            let packFailed =
              r.packFailed === true || extra?.packFailed === true;
            if (legacy && (!paid || (!hasPack && !packFailed))) {
              try {
                const full = await client().query(anyApi.sessions.get, {
                  id: r._id,
                });
                if (full) {
                  const doc = hydrate(full as SessionDoc);
                  paid = paid || doc.paid;
                  hasPack = hasPack || doc.pack != null;
                  packFailed = packFailed || doc.packFailed;
                }
              } catch {
                // extras / list fields stand
              }
            }
            return {
              ...r,
              _id: String(r._id),
              email: r.email ?? extra?.email ?? null,
              paid,
              profileStatus: r.profileStatus ?? extra?.profileStatus ?? "none",
              hasPack,
              packFailed,
              feedbackScore:
                typeof r.feedbackScore === "number"
                  ? r.feedbackScore
                  : extra?.feedbackScore ?? null,
              feedbackText:
                typeof r.feedbackText === "string"
                  ? r.feedbackText
                  : extra?.feedbackText ?? null,
            };
          }),
        );
        return mapped;
      } catch {
        const ids = recentIdList().slice(0, Math.min(Math.max(limit, 1), 25));
        const rows = await Promise.all(
          ids.map(async (id) => {
            const row = await client().query(anyApi.sessions.get, { id });
            return row ? hydrate(row as SessionDoc) : null;
          }),
        );
        return rows
          .filter((r): r is SessionDoc => r != null)
          .map((r) => ({
            _id: r._id,
            createdAt: r.createdAt,
            source: r.source,
            actReached: r.actReached,
            sent: r.sent,
            paid: r.paid,
            shares: r.shares,
            email: r.email,
            profileStatus: r.profileStatus,
            hasPack: r.pack != null,
            packFailed: r.packFailed,
            feedbackScore: r.feedbackScore,
            feedbackText: r.feedbackText,
          }));
      }
    },
    async countUnique() {
      try {
        const n = await client().query(anyApi.sessions.countUnique, {});
        return typeof n === "number" ? n : 0;
      } catch {
        const ids = recentIdList();
        const rows = await Promise.all(
          ids.map(async (id) => {
            const row = await client().query(anyApi.sessions.get, { id });
            return row ? hydrate(row as SessionDoc) : null;
          }),
        );
        return countUniqueFrom(
          rows.filter((r): r is SessionDoc => r != null),
        );
      }
    },
  };
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export const store: SessionStore =
  convexUrl && convexUrl.length > 0 ? convexStore(convexUrl) : memoryStore;

console.log(
  convexUrl && convexUrl.length > 0 ? "store: convex" : "store: memory",
);
