import Anthropic from "@anthropic-ai/sdk";
import { formatProfileFields, type Profile } from "./profile";

export class DuplicateLabelError extends Error {
  labels: string[];
  constructor(labels: string[]) {
    super(`duplicate door labels: ${labels.join(", ")}`);
    this.labels = labels;
  }
}

export type TranscriptTurn = { role: "assistant" | "user"; text: string };
export type Realism = "strong fit" | "realistic" | "a stretch" | "long shot";
export type PathOption = {
  name: string;
  whyItFits: string;
  realism: Realism;
  firstGap: string;
};
export type Contact = {
  name: string | null;
  relation: string | null;
  role: string | null;
};
export type NextMove = {
  headline: string;
  trigger: "push" | "pull" | "drift";
  awayFrom: string;
  toward: string;
  anchors: string[];
  chosenPath: PathOption;
  otherPaths: PathOption[];
  contact: Contact;
  message: string;
  experiment: string;
  decisionDate: string;
  actReached: 1 | 2 | 3;
  privateItems: string[];
};
export type PackMessage = { to: string; body: string };
export type PackPlanRow = { day: string; action: string };
export type Pack = {
  messages: PackMessage[];
  plan: PackPlanRow[];
};

const REALISM: Realism[] = [
  "strong fit",
  "realistic",
  "a stretch",
  "long shot",
];

const EXTRACT_PROMPT = `Return ONLY JSON matching this TypeScript type. No prose, no markdown.

export type PathOption = { name: string; whyItFits: string; realism: 'strong fit' | 'realistic' | 'a stretch' | 'long shot'; firstGap: string };
export type Contact = { name: string | null; relation: string | null; role: string | null };
export type NextMove = {
  headline: string;                 // one line about the person, third person, no name
  trigger: 'push' | 'pull' | 'drift';
  awayFrom: string; toward: string;
  anchors: string[];                // what has to stay true
  chosenPath: PathOption;           // the door they said pulls them, or the best-supported one
  otherPaths: PathOption[];         // 1–3 others, at least one 'a stretch' or 'long shot' unless evidence clearly says otherwise; include 'Stay and reinvent' when the evidence supports it
  contact: Contact;                 // the person from Q7; nulls if none
  message: string;                  // 60–110 words, first person, the user's own phrasing where possible, addressed to contact.name (or "Hi," if null): one line on where they are, one honest line on what is pulling them toward the chosen path, one specific ask for a 20-minute conversation with a concrete question from Q8, one line making it easy to say no. No flattery, no exclamation marks, no buzzwords.
  experiment: string;               // one thing to do in the next 30 days beyond sending the message
  decisionDate: string;             // ISO, 30–45 days from today
  actReached: 1 | 2 | 3;
  privateItems: string[];           // never rendered on the share card
};

Path names: every path name must be a specific role or move, never a bare category. Good: "Product operations", "Applied AI product management", "Growth lead at a Series B", "Bigger scope in your current team", "Consulting, strategy boutique", "Stay and reshape the role". Bad: "Product", "Growth", "AI". No two paths may share a name or differ only by punctuation; if two doors are close, name what distinguishes them. Families to draw from when they fit: product, growth, applied AI, engineering, consulting or strategy, founder or operator, a bigger role where they are, an MBA as a route (never as the answer), staying and reshaping the role.

Rules:
- whyItFits is written TO the user in second person ("You said...", "You named Rohan..."), never "the user". Quote their own words inside whyItFits and the message where possible.
- If the transcript is short (act 1 only), still produce a chosenPath, at least one other path, and a message. Mark actReached: 1.
- otherPaths: 1 to 3. At least one realism value across chosenPath + otherPaths must be 'a stretch' or 'long shot' unless the evidence clearly says otherwise.
- Include 'Stay and reinvent' when the evidence supports it.
- headline is third person, one line, no name.
- message: 60–110 words. First person. No flattery, no exclamation marks, no buzzwords. Address contact.name, or start with "Hi," if name is null.
- decisionDate is an ISO date 30–45 days from today (${new Date().toISOString().slice(0, 10)}).
- privateItems: anything the user asked to keep private.
- Never use an em dash or en dash anywhere in any string; use a comma, a full stop, or a colon instead.
- CONSULTING DOOR RUBRIC (apply whenever a door is strategy or management consulting; grade the door, not the person):
  Evidence that raises realism: 2 to 8 years of experience (0 to 2 also fine for campus routes); a target-school MBA or top engineering/commerce college; current employer is a known brand, a top startup, a GCC of a global firm, or a Big 4 / boutique consulting; visible quantitative or analytical work; the person structures their answers and speaks in reasons; they have already spoken to consultants or practised cases; they can name a specific firm tier and why.
  Evidence that lowers realism: more than 12 years of experience without prior consulting (the entry is a step down in title and pay); a hard no to travel or long hours; a stated pay floor above an entry-level consultant's package; no examples of analytical work; answers that ramble or avoid structure; wanting consulting for prestige or exit options only, with no problem-solving pull.
  Grades: "strong fit" needs three or more raisers and no hard lowerer. "realistic" needs two raisers and at most one soft lowerer. "a stretch" is one raiser or a hard lowerer that can be worked around (an MBA route, a boutique first). "long shot" is a hard lowerer that cannot be worked around at their stage, or no raisers at all.
  Always name the tier honestly in firstGap: MBB, Big 4 strategy, boutique, or in-house strategy, and say which one is realistic for this person and what would sink it.
- Before returning, check that chosenPath.name and every otherPaths[].name are distinct and specific. If not, fix them.
- Return ONLY JSON.`;

const DRAFT_PROMPT = `Rewrite the first message for a newly supplied name. Return ONLY the message text. No JSON, no markdown, no quotes around the whole thing.

Rules:
- 60–110 words, first person, the user's own phrasing where possible.
- Addressed to the new name: one line on where they are, one honest line on what is pulling them toward the chosen path, one specific ask for a 20-minute conversation with a concrete question, one line making it easy to say no.
- No flattery, no exclamation marks, no buzzwords.`;

function extractJson(raw: string): unknown {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object in model output");
  }
  return JSON.parse(text.slice(start, end + 1));
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringOrNull(value: unknown): string | null {
  if (value == null) return null;
  return typeof value === "string" && value.trim() ? value : null;
}

function asRealism(value: unknown): Realism {
  return REALISM.includes(value as Realism)
    ? (value as Realism)
    : "realistic";
}

function asPath(value: unknown): PathOption {
  const o = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    name: asString(o.name, "Stay and reinvent"),
    whyItFits: asString(o.whyItFits),
    realism: asRealism(o.realism),
    firstGap: asString(o.firstGap),
  };
}

function asAct(value: unknown): 1 | 2 | 3 {
  if (value === 2 || value === 3) return value;
  return 1;
}

export function userTurnCount(transcript: TranscriptTurn[]): number {
  return transcript.filter((t) => t.role === "user" && t.text.trim().length > 0)
    .length;
}

export function toPublicNextMove(nextMove: NextMove | null): Omit<
  NextMove,
  "privateItems"
> | null {
  if (!nextMove) return null;
  const { privateItems: _omit, ...pub } = nextMove;
  void _omit;
  return pub;
}

export function normalizeNextMove(raw: unknown, opts?: { lenient?: boolean }): NextMove | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const legacyPaths = Array.isArray(o.paths)
    ? o.paths.map(asPath)
    : [];
  const chosen = o.chosenPath
    ? asPath(o.chosenPath)
    : legacyPaths[0];
  if (!chosen) return null;

  const others = Array.isArray(o.otherPaths)
    ? o.otherPaths.map(asPath)
    : legacyPaths.slice(1);
  {
    const norm = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const all = [chosen, ...others];
    const seen = new Map<string, number>();
    const dupes: string[] = [];
    for (const p of all) {
      const k = norm(p.name);
      seen.set(k, (seen.get(k) ?? 0) + 1);
      if ((seen.get(k) ?? 0) > 1) dupes.push(p.name);
    }
    if (dupes.length) {
      if (!opts?.lenient) {
        throw new DuplicateLabelError(dupes);
      }
      // Second failure: keep the result, make every label distinct on screen.
      const used = new Set<string>();
      for (const p of all) {
        let label = p.name;
        if (used.has(norm(label))) label = `${p.name}, ${p.realism}`;
        let n = 2;
        while (used.has(norm(label))) label = `${p.name} (${n++})`;
        p.name = label;
        used.add(norm(label));
      }
      console.error("duplicate path labels kept and disambiguated", dupes);
    }
  }

  const contactRaw =
    o.contact && typeof o.contact === "object"
      ? (o.contact as Record<string, unknown>)
      : {};

  const chosenRaw =
    o.chosenPath && typeof o.chosenPath === "object"
      ? (o.chosenPath as Record<string, unknown>)
      : null;
  const firstLegacy = Array.isArray(o.paths)
    ? (o.paths[0] as Record<string, unknown> | undefined)
    : undefined;
  const experiment =
    asString(o.experiment) ||
    asString(chosenRaw?.firstExperiment) ||
    asString(firstLegacy?.firstExperiment);

  return {
    headline: asString(o.headline, "A professional deciding their next move"),
    trigger:
      o.trigger === "push" || o.trigger === "pull" || o.trigger === "drift"
        ? o.trigger
        : "drift",
    awayFrom: asString(o.awayFrom),
    toward: asString(o.toward),
    anchors: Array.isArray(o.anchors)
      ? o.anchors.filter((a): a is string => typeof a === "string")
      : [],
    chosenPath: chosen,
    otherPaths: others,
    contact: {
      name: asStringOrNull(contactRaw.name),
      relation: asStringOrNull(contactRaw.relation),
      role: asStringOrNull(contactRaw.role),
    },
    message: asString(o.message),
    experiment,
    decisionDate: asString(o.decisionDate),
    actReached: asAct(o.actReached),
    privateItems: Array.isArray(o.privateItems)
      ? o.privateItems.filter((p): p is string => typeof p === "string")
      : [],
  };
}

async function claudeText(system: string, user: string, maxTokens: number) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: maxTokens,
    thinking: { type: "disabled" },
    system,
    messages: [{ role: "user", content: user }],
  });
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}

const PACK_PROMPT = `Return ONLY JSON matching this TypeScript type. No prose, no markdown.

export type Pack = {
  messages: [
    { to: "A hiring manager in that world", body: string },
    { to: "A mentor you admire", body: string },
    { to: "Your current manager, the internal version", body: string }
  ];
  plan: { day: string; action: string }[];
};

Rules:
- First person, the user's own phrasing.
- 70 to 120 words per message.
- No flattery, no exclamation marks, no dashes.
- Each message ends with an easy no.
- plan has up to 6 rows across two weeks. day looks like "Day 1 to 3" or "Day 4 to 7".
- Never use an em dash or en dash anywhere in any string; use a comma, a full stop, or a colon instead.
- Return ONLY JSON.`;

export function asPack(raw: unknown): Pack | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.messages) || !Array.isArray(o.plan)) return null;
  const messages = o.messages
    .filter((m): m is Record<string, unknown> => !!m && typeof m === "object")
    .map((m) => ({
      to: asString(m.to),
      body: asString(m.body),
    }))
    .filter((m) => m.to && m.body);
  const plan = o.plan
    .filter((p): p is Record<string, unknown> => !!p && typeof p === "object")
    .map((p) => ({
      day: asString(p.day),
      action: asString(p.action),
    }))
    .filter((p) => p.day && p.action)
    .slice(0, 6);
  if (messages.length === 0) return null;
  return { messages, plan };
}

export async function extractNextMove(
  transcript: TranscriptTurn[],
  profile?: Profile | null,
): Promise<NextMove> {
  const body = transcript
    .map((t) => `${t.role === "assistant" ? "Coach" : "User"}: ${t.text}`)
    .join("\n");
  const user = profile
    ? `${body || "(empty transcript)"}\n\nPROFILE CONTEXT\n${formatProfileFields(profile)}`
    : body || "(empty transcript)";
  const system = profile
    ? `${EXTRACT_PROMPT}\n\nProfile informs realism and specificity; the transcript wins on intent and constraints.`
    : EXTRACT_PROMPT;

  async function parseOnce(
    text: string,
    label: string,
    lenient = false,
  ): Promise<NextMove> {
    try {
      const parsed = normalizeNextMove(extractJson(text), { lenient });
      if (!parsed) throw new Error("Missing chosenPath");
      return parsed;
    } catch (err) {
      console.error(
        `extractNextMove ${label}`,
        err instanceof Error ? err.message : err,
      );
      throw err;
    }
  }

  const text = await claudeText(system, user, 2500);
  try {
    return await parseOnce(text, "first failure");
  } catch (firstErr) {
    const reason =
      firstErr instanceof DuplicateLabelError
        ? `Your previous result gave two doors the same label (${firstErr.labels.join(", ")}). Every door must have a distinct, specific role name that says what makes it different from the others. Return only the JSON.`
        : "Your previous output was not valid JSON matching the type. Return only the JSON.";
    const retryUser = `${user}\n\n${reason}`;
    const retryText = await claudeText(system, retryUser, 2500);
    try {
      return await parseOnce(retryText, "retry failure", true);
    } catch (err) {
      throw new Error(
        `Failed to parse next-move JSON: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

export async function generatePack(
  transcript: TranscriptTurn[],
  nextMove: NextMove,
): Promise<Pack> {
  const body = transcript
    .map((t) => `${t.role === "assistant" ? "Coach" : "User"}: ${t.text}`)
    .join("\n");
  const user = [
    body || "(empty transcript)",
    "",
    "NEXT MOVE",
    `Chosen path: ${nextMove.chosenPath.name} (${nextMove.chosenPath.realism})`,
    nextMove.chosenPath.whyItFits,
    `Away from: ${nextMove.awayFrom}`,
    `Toward: ${nextMove.toward}`,
    `First message: ${nextMove.message}`,
    `Experiment: ${nextMove.experiment}`,
  ].join("\n");

  const text = await claudeText(PACK_PROMPT, user, 3000);
  const parsed = asPack(extractJson(text));
  if (!parsed) throw new Error("Invalid pack JSON");
  return parsed;
}

export async function draftMessage(
  nextMove: NextMove,
  contactName: string,
): Promise<string> {
  const brief = [
    `New name: ${contactName}`,
    `Existing message: ${nextMove.message || "(none)"}`,
    `Chosen path: ${nextMove.chosenPath.name} (${nextMove.chosenPath.realism})`,
    `Why it fits: ${nextMove.chosenPath.whyItFits}`,
    `Away from: ${nextMove.awayFrom}`,
    `Toward: ${nextMove.toward}`,
    `Ask they wanted: ${nextMove.contact.role ?? ""} ${nextMove.contact.relation ?? ""}`,
  ].join("\n");

  const text = (await claudeText(DRAFT_PROMPT, brief, 400)).trim();
  if (!text) {
    throw new Error("Empty drafted message");
  }
  return text.replace(/^["']|["']$/g, "");
}
