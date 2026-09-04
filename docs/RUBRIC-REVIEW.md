# NextMove: Realism Rubric Review

Independent review of the consulting door rubric currently in the extraction prompt, plus proposed rubrics for the other door families.

Every claim below is tagged **[verified]** (traceable to a cited source in the Sources section) or **[judgment]** (reviewer's reasoning, not evidence).

---

## Summary

**[judgment]** The consulting rubric is a good rubric written by someone who has actually placed candidates. Its structure — raisers, lowerers, four grades with counting thresholds, and a forced tier call in `firstGap` — is the strongest part and should survive. Its content is where the problems are.

Three findings dominate:

1. **[verified]** The "more than 12 years without prior consulting" hard lowerer is directionally right but set at the wrong boundary and for the wrong reason. Firms level experienced hires by *relevance and scope of experience*, not by a year count: roughly 2–5 years post-undergrad maps to the pre-MBA/junior tier, and 5+ years with leadership can map to post-MBA Consultant/Associate or even Manager/Project Leader. The generalist door does narrow with tenure, but MBB simultaneously runs an **expert/specialist track** explicitly fed by the experienced-hire channel, which is where deep 12+ year specialists actually enter. The current rubric has no concept of the expert track, so it will grade a 14-year pricing or supply-chain specialist as "long shot" when their realistic door is Specialist/Expert Associate Partner. This is the single largest correctness error.

2. **[judgment]** Roughly a third of the raisers are India-specific proxies, not causal signals. "Top engineering/commerce college," "GCC of a global firm," and "known brand" are locally legible screens that a Bangalore recruiter reads instantly and a Berlin or Chicago recruiter cannot parse. **[verified]** The India-specific item that *is* real and is missing: referral is the dominant off-campus channel in India (reported at roughly 40–50% of off-campus MBB hires there). The rubric rewards a proxy for pedigree while ignoring the mechanism that actually converts.

3. **[verified/judgment]** The rubric is missing three things that are load-bearing: (a) **route awareness** — Big 4 strategy arms (EY-Parthenon, Monitor Deloitte, Strategy&, KPMG GSG) are documented as the main feeder into MBB experienced hiring, so "boutique first" should read "Big 4 strategy or boutique first"; (b) **comp and title reset as an explicit constraint check** rather than a soft lowerer, since experienced-hire base pay is largely non-negotiable and banded by cohort; (c) **evidence that the person has already done consulting-shaped work**, which is a stronger predictor than any credential and is the one thing a ten-minute conversation can actually observe.

**[judgment]** On the wider design question: eight more per-door rubrics will not fit a ten-minute conversation and will not be evenly evidenced. I recommend a hybrid — four cross-cutting signals as the engine, with a short door-specific *fact sheet* (entry routes, real entry title, typical first gap) rather than a full rubric per door. See Verdict.

---

## Consulting rubric review

### What the rubric gets right

**[verified] Experience genuinely maps to entry level, and the entry level is often a step down.** Multiple prep-industry sources converge: candidates with 2–5 years post-undergrad are typically considered at the second rung (Junior Associate at McKinsey, Senior Associate at BCG, Experienced Associate Consultant at Bain); more than five years post-undergrad tends to be considered at the post-MBA entry level (Consultant at BCG, Associate at McKinsey); around five-plus years *with leadership* can map to Manager / Project Leader. McKinsey's own framing for the Associate role is an advanced graduate degree *or equivalent professional experience*. So the founder's intuition — that a long-tenured person entering consulting takes a title reset — is correct.

**[verified] Comp does not follow seniority in, and is not very negotiable.** Industry sources state experienced-hire base salary is generally banded by incoming cohort and not meaningfully negotiable, and that the more senior you are outside consulting, the more likely the move involves a pay cut. The rubric's "stated pay floor above an entry-level consultant's package" lowerer is therefore well-founded — arguably it deserves promotion from soft lowerer to veto.

**[verified] Big 4 strategy is a real intermediate route.** Sources report that the majority of MBB experienced-professional hires came from Big 4 strategy units (EY-Parthenon, Monitor Deloitte, Strategy& at PwC, KPMG Global Strategy Group), and that an MBA is *not* required if you apply as an experienced hire from a strategy-adjacent role and perform on the case. This validates the rubric's "a stretch … can be worked around (an MBA route, a boutique first)" logic, and suggests naming Big 4 strategy explicitly as the most-travelled bridge.

**[verified] Structure in answers is a defensible signal — with a caveat.** Meta-analytic work in I/O psychology finds structured interviews substantially outperform unstructured ones on predictive validity. That supports grading *how* someone reasons. But the specific claim that case interviews predict consulting job performance is **contested** — at least one widely-circulated critique by a former McKinsey consultant argues they do not, and I found no peer-reviewed validation study for the case format specifically. **[judgment]** So "structures their answers" should be framed as evidence about *interview survivability*, not about consulting aptitude — an honest distinction the rubric currently blurs.

### Where the rubric is wrong or missing

**1. The 12-year rule is the wrong instrument. [verified + judgment]**

**[verified]** Experienced hires at MBB are variously described as spanning 2 to 8, 2 to 10+, and 2 to 15+ years, with placement depending "on your office, function, and how cleanly your experience translates" — two people with six years can land a tier apart. **[verified]** Separately, MBB run an **expert/specialist track**: deep functional or industry specialists (pricing, digital, data science, operations, life sciences, sustainability) hired primarily *through the experienced-professional channel*, on their own ladder (Analyst/Fellow → Specialist → Expert → Associate Expert Partner → Expert Partner), with the same screening and case process blended with expert cases.

**[judgment]** The consequence for NextMove is concrete: the current rubric fires a hard lowerer on exactly the profile that the expert track is designed to hire. A 14-year supply-chain leader is a "long shot" for generalist Associate and a plausible "realistic" for Specialist. Grading the door as one undifferentiated thing produces a wrong answer for the most common NextMove user (4–15 years). **Fix: split the consulting door into generalist and expert/specialist sub-doors, and let depth flip from lowerer to raiser when the person can name a domain they are genuinely known for.**

**2. Three raisers are India-specific proxies. [judgment]**

"Top engineering/commerce college," "a GCC of a global firm," and "a known brand" are pedigree screens whose signal value is local. **[judgment]** A recruiter in India reads IIT/SRCC and a GCC instantly; the same string is noise to a US or EU screener, and "known brand" is unresolvable for a model reading a LinkedIn profile from an arbitrary country. These should be replaced with the underlying thing they proxy for: *has the person worked at organisational scale and complexity comparable to a consulting client, and can a recruiter verify it in thirty seconds.* That formulation travels.

**3. The strongest India-specific fact is absent. [verified]**

Referrals are reported as by far the most effective off-campus route in India, at roughly 40–50% of off-campus MBB hires there, and experienced-hire applications run year-round outside the campus cycle. **[judgment]** NextMove already asks "who do you know one step ahead" — that answer is *directly* a consulting-door raiser and the rubric does not use it. Whether a person can name a consultant who would forward their CV is more predictive of getting an interview than which college they attended.

**4. "Prestige or exit options only" is a weak lowerer as written. [judgment]**

Wanting exits is close to universal among applicants and is not observable honestly in ten minutes — asked directly, nobody says "prestige." Better to detect the same thing indirectly: whether the person can describe a *problem* they want to work on, or only a *label* they want to hold.

**5. No treatment of the non-MBB tiers as distinct doors. [judgment]**

The rubric requires naming a tier in `firstGap` (good) but grades only one door. In-house strategy and corporate development are frequently the realistic landing spot for a 10–15 year professional and are not a consolation prize; boutiques vary enormously by geography. **[judgment]** The grade should attach to the tier, not to "consulting."

**6. Travel and hours: keep, but as a veto. [judgment]**

A hard no to travel or to long hours is not a soft signal; it is incompatible with the delivery model of most client-facing strategy work. It belongs with the pay floor in a constraints/veto check that runs before grading, not in the raiser/lowerer count. NextMove already collects "what must stay true" — that is the natural home.

### Geography check

| Claim in rubric | US | Europe | India |
|---|---|---|---|
| 2–8 yrs is the sweet spot | **[verified]** broadly holds; 2–5 → junior tier, 5+ → post-MBA tier | **[judgment]** holds; MBA weighting varies, some markets weight advanced degrees more | **[verified]** holds; 2+ yrs can apply year-round as experienced hire |
| MBA required | **[verified]** no — advanced degree *or equivalent professional experience* | **[judgment]** no, but a target-school MBA is a strong reset lever | **[judgment]** an Indian top-tier MBA is a materially stronger signal domestically than internationally |
| >12 yrs = hard lowerer | **[verified]** wrong as stated — expert track exists; leveling is by relevance | same **[judgment]** | same **[judgment]** |
| Pedigree college as raiser | **[judgment]** weak/illegible | **[judgment]** weak/illegible | **[judgment]** strong but local |
| Referral as raiser | **[judgment]** helpful | **[judgment]** helpful | **[verified]** dominant channel (~40–50% of off-campus MBB hires) |
| Pay floor above entry package | **[verified]** real constraint — comp banded, largely non-negotiable | **[judgment]** same | **[judgment]** same, and the absolute gap is often larger |

---

## Geography-neutral consulting rubric

**[judgment]** Proposed replacement text for the extraction prompt. Under 250 words. Grades the door, not the person; keeps the four grades.

---

**CONSULTING DOOR RUBRIC** (strategy or management consulting; grade the door, not the person)

First decide which door: **generalist** (Associate/Consultant) or **expert** (a domain they are already known for).

**Vetoes — if unmovable, long shot regardless of raisers:** a hard no to travel or client-driven hours; a pay floor above the banded entry package for their level (experienced-hire pay is set by cohort, not negotiated); unwilling to enter one title below where they sit now.

**Raisers:** work a client would have paid for — analysis with a decision attached, not activity; answers in structure, gives reasons unprompted; names a problem, not just a firm; has already spoken to someone inside a firm or practised a case; work verifiable at scale on the profile (budget, market, team, system); for the expert door, five-plus years of visible depth in a domain practices staff.

**Lowerers:** no example where they owned the analysis; answers circle; wants the label, not the work; for the generalist door, ten-plus years with no route named.

**Grades:** strong fit = three or more raisers, no veto. Realistic = two raisers, no veto. A stretch = one raiser, or a veto with a workaround (Big 4 strategy or boutique first, an MBA reset, the expert door instead). Long shot = a live veto, or no raisers.

**In firstGap name the tier — MBB, Big 4 strategy, boutique, in-house — say which is realistic, and what would sink it.**

---

## Rubrics for the other doors

**[judgment]** All eight are under 120 words. Evidence grounding is uneven and is flagged per rubric.

### Product

**[verified]** Roughly 28% of new PMs arrive via internal transfer; adjacent roles (product analyst, product ops, TPM) are the standard stepping stones; hiring managers are reluctant when a candidate has never done the job and PM-experienced applicants exist.
**Raisers:** has shipped something users touched and can name the trade-off they made; has worked with engineers or designers as a peer; owns a metric today; an internal move is available; adjacent title already (analyst, ops, TPM, solutions).
**Lowerers:** describes product as "ideas" or "strategy" with no delivery; no engineering contact; targeting senior PM externally with no PM title; a market where PM hiring has contracted.
**firstGap should name:** the specific first title (APM, product analyst, product ops, internal PM) — not "PM."

### Growth

**[judgment]** No strong published evidence base; this is practitioner judgment. **[verified]** Marketing/PR is the second-largest sector demanding AI skills, so an AI-fluent growth pitch is currently live.
**Raisers:** can quote a number they moved and how they knew it was them; has run an experiment end to end; comfortable in the data tool, not just the dashboard; has owned a budget or a channel; writes or builds, not only briefs.
**Lowerers:** attribution stories with no baseline; brand-only background pitching performance; wants "growth strategy" without channel ownership; no tolerance for being measured weekly.
**firstGap should name:** the one channel or loop they will own first, and the metric they will be judged on.

### Applied AI

**[verified]** AI-skilled postings carry roughly a 28% salary premium (~$18k); as of 2024 about 51% of AI-skill postings sit outside IT/CS, with ~800% growth in generative-AI roles in non-tech industries since 2022; AI/ML specialists are among the three fastest-growing roles to 2030.
**Raisers:** has already built or shipped something with a model, however small; can name the failure mode of a system they used; brings a domain the model needs (clinical, legal, ops, risk); their employer has live AI work they could join.
**Lowerers:** course certificates with no artefact; wants "AI strategy" with no technical contact; treats AI as a topic to be near rather than work to do.
**firstGap should name:** the artefact to build in 30 days, and whether the realistic route is inside their current employer or outside.

### Engineering

**[judgment]** Judgment, not evidence — I found no reliable outcome data for mid-career switchers into engineering that survives selection bias.
**Raisers:** already writes code that other people depend on; a technical degree or a technical adjacent role (data, QA, analyst, solutions); an internal move onto a team that knows them; can read a codebase, not just a tutorial.
**Lowerers:** more than eight years away from technical work with nothing shipped since; needs to hold current comp from day one; entry-level market conditions in their city; motivated by the salary rather than the making.
**firstGap should name:** the smallest real system they must own, and whether the honest route is internal transfer rather than external junior hire.

### Founder or operator

**[verified]** Mean founder age for the top 1-in-1,000 fastest-growing ventures is 45; a 50-year-old founder is roughly twice as likely as a 30-year-old to have a runaway success; three-plus years in the startup's own industry roughly doubles the odds of top-tier growth. Age is a raiser here, not a lowerer — the inverse of consulting.
**Raisers:** three-plus years inside the industry they would build in; has sold, hired, or shipped without being told to; a named customer problem they have watched go unsolved; runway or a co-founder.
**Lowerers:** no financial floor and dependants; the idea is a category, not a customer; has never carried a number.
**firstGap should name:** the first paying customer conversation, not the product.

### A bigger role where they are

**[verified]** Internal promotees outperform external hires in the first two years and exit less; external hires are paid ~18% more initially, are 61% more likely to be fired and 21% more likely to quit. The internal door is systematically underrated relative to how it feels.
**Raisers:** the scope they want already exists and has a name; their manager or skip has said something concrete; they are already doing part of the job; the organisation is growing or reorganising.
**Lowerers:** the role does not exist and nobody has been asked; the block is a person, not a gap; they have already been passed over twice with no stated reason.
**firstGap should name:** the conversation to have, with whom, and the scope to ask for in words.

### An MBA as a route

**[verified]** MBA remains the highest-paid degree type in GMAC's recruiter data, but projected US starting salaries fell in the 2026 survey (MBA ~$120k, down from ~$125k), and one in three employers report replacing some entry-level roles with AI. **[verified]** For consulting specifically, an MBA is most useful when the current record reads as delivery, audit, or tax and a clean reset into campus recruiting is the point.
**Raisers:** the target door recruits on campus; their current record cannot be re-read into that door; they can fund it without breaking a stated constraint; they are inside the age and experience band the schools admit.
**Lowerers:** using it to decide *what* they want; two years out of the market breaks a family or money constraint; the target door hires laterally anyway.
**firstGap should name:** which specific door the MBA unlocks that lateral entry does not.

### Staying and reshaping the current role

**[judgment]** Judgment. **[verified]** Supported indirectly by the internal-mobility advantage above, and by the observation that skill-adjacent moves are the ones workers actually complete.
**Raisers:** they named a moment of absorption that is inside their current job; the pull is toward different *work*, not a different logo; a sympathetic manager; the constraint list makes any move expensive.
**Lowerers:** what they are moving away from is the organisation or a person, not the tasks; the absorbing work is not something this employer sells; they have already tried and been refused.
**firstGap should name:** the specific task to trade away and the one to trade in — with the person who can approve it.

---

## Verdict

**[judgment]** Under 200 words.

**Recommendation: cross-cutting signals as the engine, with a thin door fact sheet on top. Do not ship nine rubrics.**

Three reasons. A ten-minute conversation yields perhaps eight substantive answers; nine rubrics fight over the same evidence and grade doors on unequal amounts of it — consulting on six observations, growth on one. The evidence base is asymmetric: consulting, founder, internal promotion and the MBA have published grounding; growth, engineering and reshaping are practitioner judgment, identical syntax makes judgment look like evidence. And nine rubrics are nine things to keep true — consulting stays sharp because the founder maintains it, the rest rot.

Use four cross-cutting signals — **evidence the person has already done the target work; constraints as vetoes; adjacency of the move; market timing** — as the graded engine. Keep one paragraph per door of pure fact: entry routes, honest entry title, usual first gap. **[verified]** Adjacency is the best-evidenced of the four: workers transition between occupations that share skills, and that constraint shows up in national employment data.

Keep the consulting rubric as the exception — the founder's edge, well-evidenced, worth its length — but load it only when a consulting door is on the table.

---

## Sources

Consulting hiring — experience bands, levels, tracks:
- [How to enter consulting as an experienced hire — CaseCoach](https://casecoach.com/b/how-to-join-a-top-consulting-firm-as-an-experienced-hire/) (accessed via search summary; direct fetch returned 403)
- [Experienced Hire: How to Get into McKinsey, BCG, or Bain — StrategyCase](https://strategycase.com/experienced-hires-at-mckinsey-bcg-bain/)
- [McKinsey Experienced Hires: How to Get In (2026) — Hacking the Case Interview](https://www.hackingthecaseinterview.com/pages/mckinsey-experienced-hires)
- [McKinsey Associate: Role, Salary, and How to Get Hired — Hacking the Case Interview](https://www.hackingthecaseinterview.com/pages/mckinsey-associate)
- [Experienced professional — McKinsey Careers](https://www.mckinsey.com/careers/students/experienced-professionals) (fetch timed out; cited via search summary)
- [Experienced Professionals — BCG Careers](https://careers.bcg.com/global/en/experienced-professionals) (fetched; page states no explicit bands)
- [Consulting Firms: Expert vs. Generalist Career Paths — CaseCoach](https://casecoach.com/b/expert-track-mckinsey-bcg-bain/)
- [Expert Consultant Tracks — Management Consulted](https://managementconsulted.com/expert-consultant-tracks/)
- [Guide to Consulting Firm Titles: McKinsey — Umbrex](https://umbrex.com/resources/guide-to-consulting-firm-titles/mckinsey-and-company/)
- [Consulting Recruiting In India: Complete Guide (2026) — Hacking the Case Interview](https://www.hackingthecaseinterview.com/pages/consulting-recruiting-india)
- [How to move from 'the Big 4' to MBB — CaseCoach](https://casecoach.com/b/big-4-to-mbb-mcksiney-bcg-bain/)
- [Big 4 to MBB: How to Make the Switch (2026) — Hacking the Case Interview](https://www.hackingthecaseinterview.com/pages/big-4-to-mbb)
- [Management Consultant Salary Market Report — My Consulting Offer](https://www.myconsultingoffer.org/management-consultant-salary/)

Interview and assessment validity:
- [Structured interviews: moving beyond mean validity — Industrial and Organizational Psychology, Cambridge Core](https://www.cambridge.org/core/journals/industrial-and-organizational-psychology/article/structured-interviews-moving-beyond-mean-validity/7CB1F7C86CB0D15328B3F07AD5F964E2)
- [Do consulting case interviews actually work? What the research says — StrategyU](https://strategyu.co/case-studies-deep-dive/) (the dissenting view)

Internal vs external hiring:
- [Paying More to Get Less — Matthew Bidwell, Administrative Science Quarterly (2011)](https://journals.sagepub.com/doi/abs/10.1177/0001839211433562)
- [Why External Hires Get Paid More, and Perform Worse — Knowledge at Wharton](https://knowledge.wharton.upenn.edu/article/why-external-hires-get-paid-more-and-perform-worse-than-internal-staff/)

Founder age and industry experience:
- [Age and High-Growth Entrepreneurship — Azoulay, Jones, Kim, Miranda, NBER w24489](https://www.nber.org/papers/w24489)
- [Research: The Average Age of a Successful Startup Founder Is 45 — HBR](https://hbr.org/2018/07/research-the-average-age-of-a-successful-startup-founder-is-45)

AI and labour market demand:
- [AI Skills Command 28% Salary Premium — Lightcast (July 2025)](https://lightcast.io/resources/blog/beyond-the-buzz-press-release-2025-07-23)
- [The Generative AI Job Market: 2025 Data Insights — Lightcast](https://lightcast.io/resources/blog/the-generative-ai-job-market-2025-data-insights)
- [Future of Jobs Report 2025: fastest growing and declining jobs — World Economic Forum](https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-the-fastest-growing-and-declining-jobs/)

MBA market:
- [The Corporate Recruiters Survey 2025 Report — GMAC](https://www.gmac.com/market-intelligence-and-research/market-research/corporate-recruiters-survey/the-corporate-recruiters-survey-2025-report)
- [Employers Still Want MBAs — But 1 In 3 Are Replacing Entry-Level Roles With AI — Poets&Quants on GMAC 2026](https://poetsandquants.com/2026/06/25/employers-still-want-mbas-but-1-in-3-are-replacing-entry-level-roles-with-ai-gmac-finds/)

Career transitions and skill adjacency:
- [Unpacking the polarization of workplace skills — Alabdulkareem et al., Science Advances (2018)](https://www.science.org/doi/10.1126/sciadv.aao6030)
- [Skill-driven recommendations for job transition pathways — PLOS One](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0254722)
- [Work Change Report — LinkedIn Economic Graph](https://economicgraph.linkedin.com/research/work-change-report)

Product management entry:
- [How to Break into Product Management in 2026 — Product Alliance](https://www.productalliance.com/post/how-to-break-into-product-management-in-2026-even-without-experience)
- [Product Hiring Trends Shaping the Market in 2026 — Product Leadership](https://www.productleadership.com/blog/product-hiring-market-trends/)

**Source-quality note [judgment]:** the consulting-hiring facts rest largely on prep-industry secondary sources (CaseCoach, StrategyCase, Hacking the Case Interview), because firms publish very little explicitly. They agree with each other and with McKinsey's own "advanced degree or equivalent professional experience" language, but they are not primary. The India referral share (~40–50%) is a single-source figure and should be treated as indicative, not measured.
