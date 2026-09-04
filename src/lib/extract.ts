import Anthropic from "@anthropic-ai/sdk";
import { formatProfileFields, type Profile } from "./profile";

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

Path vocabulary you must offer from when it fits: Product · Growth · AI / applied AI · Engineering · Consulting / strategy · Founder / operator · Leadership rise in current function · MBA as a route (never a verdict) · Stay and reinvent.

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

export function normalizeNextMove(raw: unknown): NextMove | null {
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

  const text = await claudeText(system, user, 2500);

  try {
    const parsed = normalizeNextMove(extractJson(text));
    if (!parsed) throw new Error("Missing chosenPath");
    return parsed;
  } catch (err) {
    throw new Error(
      `Failed to parse next-move JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
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
