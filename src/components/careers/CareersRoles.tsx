"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";

import { SelectMenu } from "@/components/ui/SelectMenu";
import {
  careersJobUrl,
  employmentLabel,
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

  return <div id="roles" className="careers-board">
    <div className="careers-board-toolbar"><div className="careers-search"><Search size={20} aria-hidden="true"/><input aria-label="Search roles" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a role that feels like you" /></div><SelectMenu value={team} onChange={setTeam} ariaLabel="Filter by team" placeholder="All teams" options={[{value:"",label:"All teams"},...teams.map(t=>({value:t,label:t}))]}/><SelectMenu value={office} onChange={setOffice} ariaLabel="Filter by office" placeholder="All offices" options={[{value:"",label:"All offices"},...offices.map(o=>({value:o,label:o}))]}/></div>
    <div className="careers-results-heading"><h3>Open opportunities</h3>{!failed && <span aria-live="polite">{filtered.length} {filtered.length === 1 ? "role" : "roles"}</span>}</div>
    {failed ? <div className="careers-empty"><Search size={30}/><h4>A little pause in the search.</h4><p>We couldn’t load our open roles just now. Please try again in a moment.</p><a href="/careers" className="careers-link">Refresh opportunities <ArrowRight size={18}/></a></div>
    : roles.length===0 ? <div className="careers-empty"><Search size={30}/><h4>The right chapter is worth waiting for.</h4><p>We don’t have any open roles at the moment. Check back here for new opportunities to build with us.</p></div>
    : filtered.length===0 ? <div className="careers-empty"><h4>No matches just yet.</h4><p>Try a different search or explore all our opportunities.</p><button className="careers-link" onClick={()=>{setQuery("");setTeam("");setOffice("");}}>Clear filters <ArrowRight size={18}/></button></div>
    : <div className="careers-role-list">{filtered.map(role=><a key={role.public_id} href={careersJobUrl(role.public_id)} className="careers-role"><div><span>{role.team || "General"}</span><h4>{role.title}</h4><p>{officeLabel(role)}<i/> {employmentLabel(role.employment_type)}{role.remote && role.location.toLowerCase()!=="remote" && " · Remote"}</p></div><span className="careers-role-arrow"><ArrowRight size={22}/></span></a>)}</div>}
   </div>;
}
