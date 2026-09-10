/** A photo for each city the catalogue lists, from /public/images.
 *
 *  The catalogue carries no imagery, so the explorer's card for a school
 *  shows its CITY. Cities are keyed by name as institution-service spells
 *  them. A city with no photo here falls back to its country's destination
 *  photo, and then to the graduates picture, with the city named on the card
 *  either way so two schools in one country still read as different places.
 *
 *  TO ADD A CITY: drop a licensed photo in /public/images/cities/ and add one
 *  line. Cities in the catalogue today with no photo of their own: Aachen,
 *  Accra, Belfast, Edinburgh, Edmonton, Leeds, Manchester, Melbourne,
 *  Montreal, Richardson, Rondebosch, Tempe, Vancouver. */
const CITY: Record<string, string> = {
  toronto: "/images/school-toronto.jpg",
  london: "/images/destination-uk.jpg",
  "new york": "/images/destination-usa.jpg",
  sydney: "/images/destination-australia.jpg",
  shanghai: "/images/destination-china.jpg",
  paris: "/images/planner-paris.jpg",
  lagos: "/images/lagos-students.png",
};

const COUNTRY: Record<string, string> = {
  US: "/images/destination-usa.jpg",
  GB: "/images/destination-uk.jpg",
  CA: "/images/destination-canada.jpg",
  AU: "/images/destination-australia.jpg",
  CN: "/images/destination-china.jpg",
  FR: "/images/planner-paris.jpg",
  NG: "/images/lagos-students.png",
};

/** The best photo we have for a place, and whether it is the city itself. */
export function placeImage(city: string, countryCode: string): { src: string; ofCity: boolean } {
  const own = CITY[city.trim().toLowerCase()];
  if (own) return { src: own, ofCity: true };
  return { src: COUNTRY[countryCode.toUpperCase()] ?? "/images/journey-graduates.jpg", ofCity: false };
}
