import Anthropic from "@anthropic-ai/sdk";

export type TranscriptTurn = { role: "assistant" | "user"; text: string };
export type PathOption = {
  name: string;
  whyItFits: string;
  realism: "strong fit" | "realistic" | "a stretch" | "long shot";
  firstGap: string;
  firstExperiment: string;
};
export type Roadmap = {
  headline: string;
  years: number | null;
  trigger: "push" | "pull" | "drift";
  awayFrom: string;
  toward: string;
  energyEvidence: string;
  anchors: string[];
  envy: string;
  tried: string[];
  costOfStaying: string;
  paths: PathOption[];
  decisionDate: string;
  actReached: 1 | 2 | 3;
  privateItems: string[];
};

const EXTRACT_PROMPT = `Return ONLY JSON matching this TypeScript type. No prose, no markdown.

export type PathOption = { name: string; whyItFits: string; realism: 'strong fit' | 'realistic' | 'a stretch' | 'long shot'; firstGap: string; firstExperiment: string };
export type Roadmap = {
  headline: string;            // one line about the person, third person, no name
  years: number | null;
  trigger: 'push' | 'pull' | 'drift';
  awayFrom: string; toward: string; energyEvidence: string;
  anchors: string[]; envy: string; tried: string[]; costOfStaying: string;
  paths: PathOption[];         // 3 or 4; at least one must be 'a stretch' or 'long shot' unless evidence clearly says otherwise; include 'Stay and reinvent' as a path when the evidence supports it
  decisionDate: string;        // ISO date 30–60 days from today
  actReached: 1 | 2 | 3;       // highest act whose questions were substantially answered
  privateItems: string[];      // anything the user asked to keep private — NEVER rendered on the share card
};

Path vocabulary you must offer from when it fits: Product · Growth · AI / applied AI · Engineering · Consulting / strategy · Founder / operator · Leadership rise in current function · MBA as a route (never a verdict) · Stay and reinvent.

Rules:
- Quote the user's own words inside whyItFits where possible.
- If the transcript is short (act 1 only), still produce 3 paths and mark actReached: 1.
- Produce 3 or 4 paths. At least one realism value must be 'a stretch' or 'long shot' unless the evidence clearly says otherwise.
- Include 'Stay and reinvent' as a path when the evidence supports it.
- headline is third person, one line, no name.
- decisionDate is an ISO date 30–60 days from today (${new Date().toISOString().slice(0, 10)}).
- privateItems: anything the user asked to keep private.
- Return ONLY JSON.`;

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

export async function extractRoadmap(
  transcript: TranscriptTurn[],
): Promise<Roadmap> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const body = transcript
    .map((t) => `${t.role === "assistant" ? "Coach" : "User"}: ${t.text}`)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 2000,
    // claude-sonnet-5 rejects temperature; thinking disabled so JSON fits in max_tokens
    thinking: { type: "disabled" },
    system: EXTRACT_PROMPT,
    messages: [
      {
        role: "user",
        content: body || "(empty transcript)",
      },
    ],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  try {
    return extractJson(text) as Roadmap;
  } catch (err) {
    throw new Error(
      `Failed to parse roadmap JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
