"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";

import { SelectMenu } from "@/components/ui/SelectMenu";
import {
  careersJobUrl,
  employmentLabel,
  flagEmoji,
  officeLabel,
  type Role,
} from "@/lib/careers";

/**
 * The Available Roles table with search and filters. It filters the rows that
 * were already loaded, on the client, because this is ops scale (a handful to a
 * few dozen roles, not thousands), so there is no reason to call the API again on
 * every keystroke. Each row opens the job board at careers.alutta.com/jobs/{id}.
 */
export function CareersRoles({
  roles,
  teams,
  failed,
}: {
  roles: Role[];
  teams: string[];
  failed: boolean;
}) {
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState("");
  const [office, setOffice] = useState("");

  const offices = useMemo(
    () => [...new Set(roles.map((r) => officeLabel(r)).filter(Boolean))].sort(),
    [roles],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roles.filter((r) => {
      if (q && !r.title.toLowerCase().includes(q) && !r.team.toLowerCase().includes(q)) return false;
      if (team && r.team !== team) return false;
      if (office && officeLabel(r) !== office) return false;
      return true;
    });
  }, [roles, query, team, office]);

  return (
    <div id="roles">
      {/* Search bar, a white card floating over the boundary of the green hero. */}
      <div className="bg-white rounded-3xl shadow-[0_24px_70px_-24px_rgba(0,48,36,0.22)] p-4 md:p-6 -mt-10 md:-mt-14 relative z-10 flex flex-col md:flex-row gap-3">
        <div className="flex items-center gap-2.5 flex-1 bg-brand-bg-alt rounded-2xl px-5 h-14">
          <Search className="w-5 h-5 text-brand-iridium/50 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search role"
            className="bg-transparent outline-none text-base w-full text-brand-dark placeholder:text-brand-iridium/50"
          />
        </div>
        <SelectMenu
          value={team}
          onChange={setTeam}
          ariaLabel="Filter by team"
          placeholder="All teams"
          className="md:w-56"
          searchThreshold={4}
          options={[{ value: "", label: "All teams" }, ...teams.map((t) => ({ value: t, label: t }))]}
        />
        <SelectMenu
          value={office}
          onChange={setOffice}
          ariaLabel="Filter by office"
          placeholder="All offices"
          className="md:w-56"
          searchThreshold={4}
          options={[{ value: "", label: "All offices" }, ...offices.map((o) => ({ value: o, label: o }))]}
        />
      </div>

      {/* Available roles */}
      <div className="mt-14">
        <div className="flex items-center gap-3 mb-7">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-dark">
            Available roles
          </h2>
          {!failed && roles.length > 0 && (
            <span className="text-base font-bold text-brand-dark bg-brand-turbo/40 rounded-full px-3 py-0.5">
              {filtered.length}
            </span>
          )}
        </div>

        {failed ? (
          <div className="rounded-3xl border border-brand-iridium/10 bg-brand-bg-alt p-10 text-center text-lg text-brand-iridium/70">
            We could not load our open roles just now. Please refresh in a moment.
          </div>
        ) : roles.length === 0 ? (
          <div className="rounded-3xl border border-brand-iridium/10 bg-brand-bg-alt p-14 text-center">
            <p className="text-2xl font-display font-bold text-brand-dark">
              No open vacancies right now
            </p>
            <p className="text-lg text-brand-iridium/70 mt-3 max-w-xl mx-auto leading-relaxed font-medium">
              We are not actively hiring at the moment, but we are always glad to meet
              people who would be a good fit. Do check back soon.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-brand-iridium/10 bg-brand-bg-alt p-12 text-center text-lg text-brand-iridium/70">
            No roles match that search. Try clearing a filter.
          </div>
        ) : (
          <div className="rounded-3xl bg-brand-bg-alt p-4 md:p-6">
            {/* header row, held above the scroll area */}
            <div className="hidden md:grid grid-cols-[1fr_240px_260px_48px] gap-6 px-6 pb-4 text-base font-bold text-brand-dark">
              <span>Role</span>
              <span>Team</span>
              <span>Office</span>
              <span />
            </div>
            {/* the rows scroll when there are many; the header above stays put */}
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map((role) => (
                <a
                  key={role.public_id}
                  href={careersJobUrl(role.public_id)}
                  className="group grid grid-cols-1 md:grid-cols-[1fr_240px_260px_48px] gap-2 md:gap-6 md:items-center bg-white rounded-2xl px-6 py-5 md:py-6 hover:shadow-[0_14px_36px_-14px_rgba(0,48,36,0.22)] transition-shadow"
                >
                  <span className="text-xl font-display font-semibold text-brand-dark">
                    {role.title}
                  </span>
                  <span className="text-base font-semibold text-brand-iridium/80">
                    {role.team || "General"}
                  </span>
                  <span className="text-base font-semibold text-brand-iridium/80 flex items-center gap-2">
                    {officeLabel(role)}
                    {flagEmoji(role.country_code) && (
                      <span className="text-lg leading-none">{flagEmoji(role.country_code)}</span>
                    )}
                    {role.remote && role.location.toLowerCase() !== "remote" && (
                      <span className="text-xs font-semibold text-brand-primary bg-brand-accent/10 rounded-full px-2 py-0.5">
                        Remote
                      </span>
                    )}
                  </span>
                  <span className="flex items-center justify-between md:justify-center">
                    <span className="md:hidden text-sm text-brand-iridium/50">
                      {employmentLabel(role.employment_type)}
                    </span>
                    <ArrowRight className="w-6 h-6 text-brand-primary opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
