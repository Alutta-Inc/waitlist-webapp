/** The footer's link columns, once, for both footers (the home page's own in
 *  HomeClosing, and CareersFooter on every other page).
 *
 *  "Who it's for" names the three sides of an application: the student, the
 *  institution that decides it and the body that funds it. /researchers is NOT
 *  here, on purpose: that page is not an offer to researchers, it tells them
 *  what we show about them and how to be left out, so it sits with Privacy and
 *  Terms where a person looking for their rights will look. */
//: [label, href, event key]. The key is optional: an anchor that repeats
//: the header nav is already counted there.
export const footerColumns: { title: string; links: [string, string, string?][] }[] = [
  { title: "Explore", links: [["The Alutta way", "#about"], ["Destinations", "#destinations"], ["Your journey", "#how-it-works"], ["Questions", "#questions"]] },
  { title: "Who it’s for", links: [["For students", "#about"], ["For institutions", "/institutions", "pack-institutions"], ["For funding bodies", "/funding-bodies", "pack-funders"]] },
  { title: "Company", links: [["About us", "#about"], ["Careers", "/careers", "careers-open"], ["Join the waitlist", "/waitlist", "join-footer"], ["Contact", "mailto:hello@alutta.com"]] },
  { title: "Legal", links: [["Privacy", "/privacy"], ["Terms", "/terms"], ["For researchers", "/researchers"], ["AluttaBot", "/bot"]] },
];
