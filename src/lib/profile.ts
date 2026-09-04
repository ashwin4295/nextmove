export type ProfileStatus = "pending" | "ready" | "failed" | "none";

export type Profile = {
  name: string;
  headline: string;
  location: string;
  about: string;
  yearsExperience: number | null;
  currentRole: { company: string; title: string; since: string } | null;
  roles: {
    company: string;
    title: string;
    start: string;
    end: string;
    duration: string;
  }[];
  education: { school: string; degree: string }[];
  topSkills: string[];
};

const LINKEDIN_IN =
  /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([^/?#]+)\/?(?:[?#].*)?$/i;

export function normalizeLinkedInUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const match = LINKEDIN_IN.exec(raw);
  if (!match) return null;
  let id = match[1];
  try {
    id = decodeURIComponent(id);
  } catch {
    return null;
  }
  id = id.replace(/\/+$/, "");
  if (!id || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)) return null;
  return `https://www.linkedin.com/in/${id}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function dateText(value: unknown): string {
  const rec = asRecord(value);
  if (!rec) return typeof value === "string" ? value : "";
  return asString(rec.text);
}

function dateYear(value: unknown): number | null {
  const rec = asRecord(value);
  if (!rec) {
    if (typeof value === "string") {
      const m = value.match(/(?:19|20)\d{2}/);
      return m ? Number(m[0]) : null;
    }
    return null;
  }
  if (typeof rec.year === "number" && rec.year > 1900 && rec.year < 2100) {
    return rec.year;
  }
  const text = asString(rec.text);
  const m = text.match(/(?:19|20)\d{2}/);
  return m ? Number(m[0]) : null;
}

function asRole(value: unknown) {
  const rec = asRecord(value);
  if (!rec) return null;
  const company = asString(rec.companyName);
  const title = asString(rec.position);
  if (!company && !title) return null;
  return {
    company,
    title,
    start: dateText(rec.startDate),
    end: dateText(rec.endDate),
    duration: asString(rec.duration),
    startYear: dateYear(rec.startDate),
  };
}

function asSkills(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        const rec = asRecord(item);
        return asString(rec?.name ?? rec?.skill ?? rec?.title).trim();
      })
      .filter(Boolean)
      .slice(0, 8);
  }
  if (typeof value === "string") {
    return value
      .split(/\s*[•·|,]\s*/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
  }
  return [];
}

function isCurrentEnd(end: string) {
  return !end || /^present$/i.test(end);
}

export function normalizeProfile(raw: unknown): Profile | null {
  const rec = asRecord(raw);
  if (!rec) return null;

  const experience = Array.isArray(rec.experience)
    ? rec.experience.map(asRole).filter((r): r is NonNullable<typeof r> => r != null)
    : [];
  const currentList = Array.isArray(rec.currentPosition)
    ? rec.currentPosition.map(asRole).filter((r): r is NonNullable<typeof r> => r != null)
    : [];

  const currentFromList = currentList[0] ?? null;
  const currentFromExp =
    experience.find((r) => isCurrentEnd(r.end)) ?? experience[0] ?? null;
  const currentSource = currentFromList ?? currentFromExp;
  const currentRole = currentSource
    ? {
        company: currentFromList?.company || currentFromExp?.company || "",
        title: currentFromList?.title || currentFromExp?.title || "",
        since: currentFromList?.start || currentFromExp?.start || "",
      }
    : null;

  const years = experience
    .map((r) => r.startYear)
    .filter((y): y is number => y != null);
  const earliest = years.length ? Math.min(...years) : null;
  const yearsExperience =
    earliest != null ? Math.max(0, new Date().getFullYear() - earliest) : null;

  const education = (Array.isArray(rec.education) ? rec.education : [])
    .map((item) => {
      const ed = asRecord(item);
      if (!ed) return null;
      const school = asString(ed.schoolName);
      const degree = [asString(ed.degree), asString(ed.fieldOfStudy)]
        .filter(Boolean)
        .join(", ");
      if (!school && !degree) return null;
      return { school, degree };
    })
    .filter((e): e is { school: string; degree: string } => e != null)
    .slice(0, 2);

  const locationRec = asRecord(rec.location);
  const name = [asString(rec.firstName), asString(rec.lastName)]
    .filter(Boolean)
    .join(" ")
    .trim();
  const headline = asString(rec.headline);
  const about = asString(rec.about).slice(0, 600);

  if (
    !name &&
    !headline &&
    !about &&
    !currentRole &&
    experience.length === 0
  ) {
    return null;
  }

  return {
    name,
    headline,
    location: asString(locationRec?.linkedinText),
    about,
    yearsExperience,
    currentRole:
      currentRole && (currentRole.company || currentRole.title)
        ? currentRole
        : null,
    roles: experience.slice(0, 6).map(({ company, title, start, end, duration }) => ({
      company,
      title,
      start,
      end,
      duration,
    })),
    education,
    topSkills: asSkills(rec.topSkills),
  };
}

export function asProfile(raw: unknown): Profile | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  if (
    typeof rec.name !== "string" ||
    typeof rec.headline !== "string" ||
    typeof rec.location !== "string" ||
    typeof rec.about !== "string"
  ) {
    return normalizeProfile(raw);
  }
  const current = asRecord(rec.currentRole);
  return {
    name: rec.name,
    headline: rec.headline,
    location: rec.location,
    about: rec.about,
    yearsExperience:
      typeof rec.yearsExperience === "number" ? rec.yearsExperience : null,
    currentRole: current
      ? {
          company: asString(current.company),
          title: asString(current.title),
          since: asString(current.since),
        }
      : null,
    roles: Array.isArray(rec.roles)
      ? rec.roles
          .map((item) => {
            const r = asRecord(item);
            if (!r) return null;
            return {
              company: asString(r.company),
              title: asString(r.title),
              start: asString(r.start),
              end: asString(r.end),
              duration: asString(r.duration),
            };
          })
          .filter((r): r is Profile["roles"][number] => r != null)
          .slice(0, 6)
      : [],
    education: Array.isArray(rec.education)
      ? rec.education
          .map((item) => {
            const e = asRecord(item);
            if (!e) return null;
            return { school: asString(e.school), degree: asString(e.degree) };
          })
          .filter((e): e is Profile["education"][number] => e != null)
          .slice(0, 2)
      : [],
    topSkills: asSkills(rec.topSkills),
  };
}

export function formatProfileFields(profile: Profile): string {
  const current = profile.currentRole
    ? `${profile.currentRole.title} at ${profile.currentRole.company} since ${profile.currentRole.since}`
    : "";
  const past = profile.roles
    .map((r) => {
      const when = [r.start, r.end].filter(Boolean).join(" to ");
      const extra = [when, r.duration].filter(Boolean).join(", ");
      return extra
        ? `${r.title} at ${r.company} (${extra})`
        : `${r.title} at ${r.company}`;
    })
    .join("\n");
  const education = profile.education
    .map((e) => [e.degree, e.school].filter(Boolean).join(", "))
    .filter(Boolean)
    .join(" · ");
  const skills = profile.topSkills.join(" · ");
  const years =
    profile.yearsExperience != null ? String(profile.yearsExperience) : "";
  return [
    `Name: ${profile.name} · Headline: ${profile.headline} · Location: ${profile.location}`,
    current ? `Current: ${current}` : "Current:",
    `Past:\n${past}`,
    `Education: ${education}`,
    `About (their words): ${profile.about}`,
    skills ? `Skills: ${skills}` : "",
    years ? `Years experience: ${years}` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}
