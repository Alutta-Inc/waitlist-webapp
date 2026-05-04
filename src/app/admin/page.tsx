"use client";

import { useState } from "react";

type Entry = {
  id: string; first_name: string; email: string;
  country: string | null; destination: string | null;
  source: string; referred_by: string | null;
  referral_code: string; created_at: string;
};

type AdminData = {
  total: number;
  entries: Entry[];
  topReferrers: { referral_code: string; first_name: string; email: string; referral_count: number }[];
  byCountry: Record<string, number>;
  bySource: Record<string, number>;
  byDestination: Record<string, number>;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.status === 401) { setError("Wrong password."); setLoading(false); return; }
      if (!res.ok) { setError("Failed to load data."); setLoading(false); return; }
      setData(await res.json());
    } catch { setError("Connection error."); }
    setLoading(false);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-lg">
          <h1 className="font-display text-2xl text-brand-dark mb-6">Alutta Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchData()}
            placeholder="Admin password"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-accent focus:outline-none mb-4"
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button onClick={fetchData} disabled={loading}
            className="w-full bg-brand-dark text-white py-3 rounded-xl font-semibold hover:bg-brand-dark/90 transition-colors disabled:opacity-50">
            {loading ? "Loading..." : "View Dashboard"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl text-brand-dark">Waitlist Dashboard</h1>
          <button onClick={() => setData(null)} className="text-sm text-gray-500 hover:text-brand-dark">← Log out</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Signups", value: data.total },
            { label: "Top Country", value: Object.entries(data.byCountry).sort((a,b)=>b[1]-a[1])[0]?.[0] || "—" },
            { label: "Top Destination", value: Object.entries(data.byDestination).sort((a,b)=>b[1]-a[1])[0]?.[0] || "—" },
            { label: "Referral %", value: data.entries.filter(e => e.referred_by).length + "%" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="text-2xl font-bold text-brand-dark">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* By country */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-brand-dark mb-3 text-sm">By Country</h3>
            {Object.entries(data.byCountry).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-600">{k}</span><span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
          {/* By source */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-brand-dark mb-3 text-sm">By Source</h3>
            {Object.entries(data.bySource).sort((a,b)=>b[1]-a[1]).map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-600">{k}</span><span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
          {/* Top referrers */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-brand-dark mb-3 text-sm">Top Referrers</h3>
            {data.topReferrers?.slice(0,8).map((r) => (
              <div key={r.referral_code} className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-600 truncate">{r.first_name}</span>
                <span className="font-medium text-brand-accent">{r.referral_count} refs</span>
              </div>
            ))}
          </div>
        </div>

        {/* Entries table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-brand-dark">All Signups ({data.total})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["#", "Name", "Email", "Country", "Dest.", "Source", "Ref?", "Date"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.entries.map((e, i) => (
                  <tr key={e.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{data.total - i}</td>
                    <td className="px-4 py-3 font-medium text-brand-dark">{e.first_name}</td>
                    <td className="px-4 py-3 text-gray-600">{e.email}</td>
                    <td className="px-4 py-3 text-gray-500">{e.country || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{e.destination || "—"}</td>
                    <td className="px-4 py-3"><span className="bg-brand-accent/10 text-brand-accent text-xs px-2 py-0.5 rounded-full">{e.source}</span></td>
                    <td className="px-4 py-3">{e.referred_by ? <span className="text-green-600 font-medium">✓ Yes</span> : "—"}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(e.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
