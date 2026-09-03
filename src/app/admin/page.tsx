import { store } from "@/lib/convexClient";
import { Container, Eyebrow, Wordmark } from "@/lib/ui";

export const dynamic = "force-dynamic";

function formatWhen(ts: number) {
  return new Date(ts).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const adminKey = process.env.ADMIN_KEY;
  const { key } = await searchParams;
  if (adminKey && key !== adminKey) {
    return (
      <main className="p-6">
        <p>Unauthorized.</p>
      </main>
    );
  }

  const [stats, recent, uniqueSignups] = await Promise.all([
    store.stats(),
    store.listRecent({ limit: 25 }),
    store.countUnique(),
  ]);

  const counters: [string, number][] = [
    ["started", stats.started],
    ["act1", stats.act1],
    ["act2", stats.act2],
    ["act3", stats.act3],
    ["written", stats.written],
    ["sent", stats.sent],
    ["shared", stats.shared],
    ["signups (unique email + next move written)", uniqueSignups],
  ];

  return (
    <main className="min-h-full bg-canvas py-8">
      <Container>
        <Wordmark />
        <Eyebrow className="mt-8">COUNTERS</Eyebrow>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {counters.map(([name, count]) => (
            <div key={name} className="rounded-[12px] border border-line bg-surface p-4">
              <p className="text-sm text-muted">{name}</p>
              <p className="font-display text-3xl font-medium">{count}</p>
            </div>
          ))}
        </div>

        <Eyebrow className="mt-12">LAST 25 SESSIONS</Eyebrow>
        <div className="mt-4 overflow-x-auto rounded-[12px] border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="px-4 py-3 font-medium">createdAt</th>
                <th className="px-4 py-3 font-medium">source</th>
                <th className="px-4 py-3 font-medium">email</th>
                <th className="px-4 py-3 font-medium">actReached</th>
                <th className="px-4 py-3 font-medium">sent</th>
                <th className="px-4 py-3 font-medium">shares</th>
                <th className="px-4 py-3 font-medium">link</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((row) => (
                <tr key={row._id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">{formatWhen(row.createdAt)}</td>
                  <td className="px-4 py-3">{row.source || "-"}</td>
                  <td className="px-4 py-3">{row.email || "-"}</td>
                  <td className="px-4 py-3">{row.actReached ?? "-"}</td>
                  <td className="px-4 py-3">{row.sent ? "yes" : "no"}</td>
                  <td className="px-4 py-3">{row.shares}</td>
                  <td className="px-4 py-3">
                    <a href={`/r/${row._id}`} className="text-accent underline">
                      /r/{row._id.slice(0, 8)}
                    </a>
                  </td>
                </tr>
              ))}
              {recent.length === 0 ? (
                <tr>
                    <td className="px-4 py-6 text-muted" colSpan={7}>
                    No sessions yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Container>
    </main>
  );
}
