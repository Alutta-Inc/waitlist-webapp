export const markets = [
 { code: "global", name: "Global", description: "Explore Alutta worldwide", home: "/" },
 { code: "ng", name: "Nigeria", description: "Opportunities at home and abroad", home: "/ng" },
] as const;
export type Market = typeof markets[number]["code"];
export function marketForPath(path: string): Market { return path === "/ng" || path.startsWith("/ng/") ? "ng" : "global"; }
export function marketPath(path: string, market: Market) {
 const local = path.replace(/^\/ng(?=\/|$)/, "") || "/";
 if (market === "global") return local;
 return local === "/waitlist" ? "/ng/waitlist" : "/ng";
}
