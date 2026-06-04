"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Entry = {
  id: string;
  first_name: string;
  email: string;
  country: string | null;
  destination: string | null;
  source: string;
  referred_by: string | null;
  referral_code: string;
  created_at: string;
};

type AdminData = {
  total: number;
  entries: Entry[];
  topReferrers: { referral_code: string; first_name: string; email: string; referral_count: number }[];
  byCountry: Record<string, number>;
  bySource: Record<string, number>;
  byDestination: Record<string, number>;
};

const emptyValue = "-";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

      if (res.status === 401) {
        setError("Wrong password.");
        setLoading(false);
        return;
      }

      const payload = await res.json();
      if (!res.ok) {
        setError(payload.detail ? `${payload.error}: ${payload.detail}` : payload.error || "Failed to load data.");
        setLoading(false);
        return;
      }

      setData(payload);
    } catch {
      setError("Connection error.");
    }

    setLoading(false);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-lg">
          <h1 className="font-display text-2xl text-brand-dark mb-6">Alutta Admin</h1>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
              placeholder="Admin password"
              className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-brand-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-brand-dark transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            onClick={fetchData}
            disabled={loading}
            className="w-full bg-brand-dark text-white py-3 rounded-xl font-semibold hover:bg-brand-dark/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "View Dashboard"}
          </button>
        </div>
      </div>
    );
  }

  const topCountry = Object.entries(data.byCountry).sort((a, b) => b[1] - a[1])[0]?.[0] || emptyValue;
  const topDestination = Object.entries(data.byDestination).sort((a, b) => b[1] - a[1])[0]?.[0] || emptyValue;
  const referralCount = data.entries.filter((entry) => entry.referred_by).length;
  const referralPercent = data.total > 0 ? `${Math.round((referralCount / data.total) * 100)}%` : "0%";

  return (
    <div className="min-h-screen bg-brand-bg p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl text-brand-dark">Waitlist Dashboard</h1>
          <button onClick={() => setData(null)} className="text-sm text-gray-500 hover:text-brand-dark">
            Log out
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Signups", value: data.total },
            { label: "Top Country", value: topCountry },
            { label: "Top Destination", value: topDestination },
            { label: "Referral %", value: referralPercent },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="text-2xl font-bold text-brand-dark">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-brand-dark mb-3 text-sm">By Country</h3>
            {Object.entries(data.byCountry).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([country, count]) => (
              <div key={country} className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-600">{country}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-brand-dark mb-3 text-sm">By Source</h3>
            {Object.entries(data.bySource).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
              <div key={source} className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-600">{source}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-brand-dark mb-3 text-sm">Top Referrers</h3>
            {data.topReferrers?.slice(0, 8).map((referrer) => (
              <div key={referrer.referral_code} className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-600 truncate">{referrer.first_name}</span>
                <span className="font-medium text-brand-accent">{referrer.referral_count} refs</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-brand-dark">All Signups ({data.total})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["#", "Name", "Email", "Country", "Dest.", "Source", "Referral Code", "Referred By", "Date"].map((header) => (
                    <th key={header} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.entries.map((entry, index) => (
                  <tr key={entry.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{data.total - index}</td>
                    <td className="px-4 py-3 font-medium text-brand-dark">{entry.first_name}</td>
                    <td className="px-4 py-3 text-gray-600">{entry.email}</td>
                    <td className="px-4 py-3 text-gray-500">{entry.country || emptyValue}</td>
                    <td className="px-4 py-3 text-gray-500">{entry.destination || emptyValue}</td>
                    <td className="px-4 py-3">
                      <span className="bg-brand-accent/10 text-brand-accent text-xs px-2 py-0.5 rounded-full">
                        {entry.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-brand-dark">{entry.referral_code || emptyValue}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{entry.referred_by || emptyValue}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(entry.created_at).toLocaleDateString()}</td>
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
