import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import type { Roadmap, TranscriptTurn } from "./extract";

export type SessionDoc = {
  _id: string;
  createdAt: number;
  source: string;
  transcript: TranscriptTurn[];
  roadmap: Roadmap | null;
  actReached: number | null;
  selectedPath: string | null;
  shares: number;
};

export type Stats = {
  started: number;
  act1: number;
  act2: number;
  act3: number;
  roadmaps: number;
  selected: number;
  shared: number;
};

export type SessionStore = {
  create: (args: { source: string }) => Promise<string>;
  finish: (args: {
    id: string;
    transcript: TranscriptTurn[];
    roadmap: Roadmap | null;
  }) => Promise<void>;
  selectPath: (args: { id: string; path: string }) => Promise<void>;
  share: (args: { id: string }) => Promise<void>;
  get: (args: { id: string }) => Promise<SessionDoc | null>;
  stats: () => Promise<Stats>;
};

type MemoryRow = SessionDoc;

function computeStats(rows: MemoryRow[]): Stats {
  return {
    started: rows.length,
    act1: rows.filter((r) => (r.actReached ?? 0) >= 1).length,
    act2: rows.filter((r) => (r.actReached ?? 0) >= 2).length,
    act3: rows.filter((r) => (r.actReached ?? 0) >= 3).length,
    roadmaps: rows.filter((r) => r.roadmap != null).length,
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

const memoryStore: SessionStore = {
  async create({ source }) {
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
    });
    return id;
  },
  async finish({ id, transcript, roadmap }) {
    const row = getMemoryMap().get(id);
    if (!row) return;
    row.transcript = transcript;
    row.roadmap = roadmap;
    row.actReached =
      roadmap && typeof roadmap.actReached === "number"
        ? roadmap.actReached
        : null;
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
  async get({ id }) {
    return getMemoryMap().get(id) ?? null;
  },
  async stats() {
    return computeStats([...getMemoryMap().values()]);
  },
};

function convexStore(url: string): SessionStore {
  const client = () => new ConvexHttpClient(url);
  return {
    async create({ source }) {
      const id = await client().mutation(anyApi.sessions.create, { source });
      return String(id);
    },
    async finish({ id, transcript, roadmap }) {
      await client().mutation(anyApi.sessions.finish, {
        id,
        transcript,
        roadmap,
      });
    },
    async selectPath({ id, path }) {
      await client().mutation(anyApi.sessions.selectPath, { id, path });
    },
    async share({ id }) {
      await client().mutation(anyApi.sessions.share, { id });
    },
    async get({ id }) {
      const row = await client().query(anyApi.sessions.get, { id });
      if (!row) return null;
      return row as SessionDoc;
    },
    async stats() {
      return (await client().query(anyApi.sessions.stats, {})) as Stats;
    },
  };
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export const store: SessionStore =
  convexUrl && convexUrl.length > 0 ? convexStore(convexUrl) : memoryStore;

console.log(
  convexUrl && convexUrl.length > 0
    ? "store: convex"
    : "store: memory",
);
