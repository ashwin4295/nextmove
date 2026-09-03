import { store } from "@/lib/convexClient";

export const dynamic = "force-dynamic";

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

  const stats = await store.stats();
  const rows: [string, number][] = [
    ["started", stats.started],
    ["act1", stats.act1],
    ["act2", stats.act2],
    ["act3", stats.act3],
    ["roadmaps", stats.roadmaps],
    ["selected", stats.selected],
    ["shared", stats.shared],
  ];

  return (
    <main className="p-6">
      <table>
        <thead>
          <tr>
            <th align="left">metric</th>
            <th align="left">count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, count]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
