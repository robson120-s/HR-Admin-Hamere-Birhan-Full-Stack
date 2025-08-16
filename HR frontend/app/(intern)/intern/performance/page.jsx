"use client";
import { useEffect, useMemo, useState } from "react";

function ScorePill({ score }) {
  const cls =
    score == null
      ? "bg-gray-100 text-gray-600"
      : score >= 90
      ? "bg-green-100 text-green-700"
      : score >= 75
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${cls}`}>
      {score == null ? "Pending (HR)" : score}
    </span>
  );
}

export default function PerformancePage() {
  const [data, setData] = useState({ items: [], avgScore: null });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // filters
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("reviewDate:desc");
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (from) p.set("from", from);
      if (to) p.set("to", to);
      if (sort) p.set("sort", sort);
      const res = await fetch(`/api/performance-reviews?${p.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load reviews");
      setData(await res.json());
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const items = data.items || [];
  const header = useMemo(() => {
    if (!items.length) return "No reviews yet";
    const newest = items[0];
    const range =
      items.length > 1
        ? `${new Date(items[items.length - 1].reviewDate).toLocaleDateString()} — ${new Date(newest.reviewDate).toLocaleDateString()}`
        : new Date(newest.reviewDate).toLocaleDateString();
    return `Showing ${items.length} review(s) • ${range}`;
  }, [items]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Performance Reviews</h1>
          <p className="text-sm text-gray-500">{header}</p>
        </div>
        <div className="rounded-2xl border p-3 bg-white shadow-sm text-right">
          <div className="text-xs text-gray-500">Average Score</div>
          <div className="text-2xl font-semibold">{data.avgScore ?? "—"}</div>
          <div className="text-[10px] text-gray-400">Scores set by HR</div>
        </div>
      </header>

      {/* Filters */}
      <section className="rounded-2xl border bg-white shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search reviewer or comments…"
            className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
          />
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="reviewDate:desc">Newest first</option>
            <option value="reviewDate:asc">Oldest first</option>
            <option value="score:desc">Score high → low</option>
            <option value="score:asc">Score low → high</option>
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={load} className="px-3 py-2 rounded-lg border shadow-sm bg-black text-white">Apply</button>
          <button
            onClick={() => { setQ(""); setFrom(""); setTo(""); setSort("reviewDate:desc"); load(); }}
            className="px-3 py-2 rounded-lg border shadow-sm"
          >
            Reset
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b"><h2 className="font-medium">Reviews</h2></div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Reviewer</th>
                <th className="text-left px-4 py-2">Score</th>
                <th className="text-left px-4 py-2">Comments</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Loading…</td></tr>
              )}
              {err && !loading && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-red-600">{err}</td></tr>
              )}
              {!loading && !err && items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No reviews found.</td></tr>
              )}
              {!loading && !err && items.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{new Date(r.reviewDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{r.reviewerName || "—"}</td>
                  <td className="px-4 py-2"><ScorePill score={r.score} /></td>
                  <td className="px-4 py-2 truncate max-w-[420px]">{r.comments || "—"}</td>
                  <td className="px-4 py-2">
                    <button className="text-blue-600 underline text-xs" onClick={() => setSelected(r)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Details modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white w-full md:max-w-xl rounded-t-2xl md:rounded-2xl shadow-xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Review Details</h3>
              <button onClick={() => setSelected(null)} className="text-sm">Close</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-gray-500">Date</div><div>{new Date(selected.reviewDate).toLocaleString()}</div></div>
              <div><div className="text-xs text-gray-500">Reviewer</div><div>{selected.reviewerName || "—"}</div></div>
              <div><div className="text-xs text-gray-500">Score</div><div>{selected.score ?? "Pending (HR)"}</div></div>
              <div><div className="text-xs text-gray-500">Created</div><div>{new Date(selected.createdAt).toLocaleString()}</div></div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-1">Comments</div>
              <p className="text-sm whitespace-pre-wrap">{selected.comments || "—"}</p>
            </div>
            <div className="mt-4 text-xs text-gray-500">* View-only; HR manages scores/comments.</div>
          </div>
        </div>
      )}
    </div>
  );
}
