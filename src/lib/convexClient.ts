import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import type { NextMove, TranscriptTurn } from "./extract";
import { normalizeNextMove } from "./extract";

export type SessionDoc = {
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
};

export type Stats = {
  started: number;
  act1: number;
  act2: number;
  act3: number;
  written: number;
  sent: number;
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
  shares: number;
  email: string | null;
};

export type SessionStore = {
  create: (args: {
    source: string;
    name?: string;
    email?: string;
  }) => Promise<string>;
  finish: (args: {
    id: string;
    transcript: TranscriptTurn[];
    roadmap: NextMove | null;
    actReached?: number;
  }) => Promise<void>;
  selectPath: (args: { id: string; path: string }) => Promise<void>;
  share: (args: { id: string }) => Promise<void>;
  markSent: (args: { id: string }) => Promise<void>;
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

type SessionExtras = { name: string | null; email: string | null };

function extrasMap(): Map<string, SessionExtras> {
  const g = globalThis as typeof globalThis & {
    __nextmoveExtras?: Map<string, SessionExtras>;
  };
  if (!g.__nextmoveExtras) {
    g.__nextmoveExtras = new Map();
  }
  return g.__nextmoveExtras;
}

function rememberExtras(id: string, extras: SessionExtras) {
  extrasMap().set(id, extras);
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
}): SessionDoc {
  const nextMove = normalizeNextMove(row.roadmap);
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
  };
}

const memoryStore: SessionStore = {
  async create({ source, name, email }) {
    const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
    });
    return id;
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
        shares: r.shares,
        email: r.email,
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
    async create({ source, name, email }) {
      const extras = {
        name: name?.trim() || null,
        email: email?.trim() || null,
      };
      try {
        const id = String(
          await client().mutation(anyApi.sessions.create, {
            source,
            ...(extras.name ? { name: extras.name } : {}),
            ...(extras.email ? { email: extras.email } : {}),
          }),
        );
        rememberId(id);
        rememberExtras(id, extras);
        return id;
      } catch {
        const id = String(
          await client().mutation(anyApi.sessions.create, { source }),
        );
        rememberId(id);
        rememberExtras(id, extras);
        return id;
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
      const withMeta =
        merged && extras
          ? {
              ...merged,
              ...(extras.email ? { __email: extras.email } : {}),
              ...(extras.name ? { __name: extras.name } : {}),
            }
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
      };
      const written = raw.written ?? raw.roadmaps ?? 0;
      return {
        started: raw.started ?? 0,
        act1: raw.act1 ?? 0,
        act2: raw.act2 ?? 0,
        act3: raw.act3 ?? 0,
        written,
        roadmaps: written,
        sent: raw.sent ?? 0,
        selected: raw.selected ?? 0,
        shared: raw.shared ?? 0,
      };
    },
    async listRecent({ limit }) {
      try {
        const rows = (await client().query(anyApi.sessions.listRecent, {
          limit,
        })) as RecentRow[];
        return rows.map((r) => ({
          ...r,
          _id: String(r._id),
          email: r.email ?? extrasMap().get(String(r._id))?.email ?? null,
        }));
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
            shares: r.shares,
            email: r.email,
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
