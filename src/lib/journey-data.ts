import {
  Country,
  CountryOption,
  IntakeOption,
  IntakePeriod,
  JourneyStep,
  University,
} from "@/types/journey";

// Country options with flags
export const countries: CountryOption[] = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    popular_universities: [
      { id: "harvard", name: "Harvard University", country: "US", city: "Cambridge, MA" },
      { id: "mit", name: "MIT", country: "US", city: "Cambridge, MA" },
      { id: "stanford", name: "Stanford University", country: "US", city: "Stanford, CA" },
      { id: "columbia", name: "Columbia University", country: "US", city: "New York, NY" },
      { id: "nyu", name: "New York University", country: "US", city: "New York, NY" },
      { id: "ucla", name: "UCLA", country: "US", city: "Los Angeles, CA" },
      { id: "uc-berkeley", name: "UC Berkeley", country: "US", city: "Berkeley, CA" },
      { id: "upenn", name: "University of Pennsylvania", country: "US", city: "Philadelphia, PA" },
      { id: "yale", name: "Yale University", country: "US", city: "New Haven, CT" },
      { id: "princeton", name: "Princeton University", country: "US", city: "Princeton, NJ" },
    ],
  },
  {
    code: "UK",
    name: "United Kingdom",
    flag: "🇬🇧",
    popular_universities: [
      { id: "oxford", name: "University of Oxford", country: "UK", city: "Oxford" },
      { id: "cambridge", name: "University of Cambridge", country: "UK", city: "Cambridge" },
      { id: "imperial", name: "Imperial College London", country: "UK", city: "London" },
      { id: "ucl", name: "University College London", country: "UK", city: "London" },
      { id: "lse", name: "London School of Economics", country: "UK", city: "London" },
      { id: "edinburgh", name: "University of Edinburgh", country: "UK", city: "Edinburgh" },
      { id: "manchester", name: "University of Manchester", country: "UK", city: "Manchester" },
      { id: "kings", name: "King's College London", country: "UK", city: "London" },
      { id: "warwick", name: "University of Warwick", country: "UK", city: "Coventry" },
      { id: "bristol", name: "University of Bristol", country: "UK", city: "Bristol" },
    ],
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    popular_universities: [
      { id: "uoft", name: "University of Toronto", country: "CA", city: "Toronto, ON" },
      { id: "ubc", name: "University of British Columbia", country: "CA", city: "Vancouver, BC" },
      { id: "mcgill", name: "McGill University", country: "CA", city: "Montreal, QC" },
      { id: "waterloo", name: "University of Waterloo", country: "CA", city: "Waterloo, ON" },
      { id: "mcmaster", name: "McMaster University", country: "CA", city: "Hamilton, ON" },
      { id: "ualberta", name: "University of Alberta", country: "CA", city: "Edmonton, AB" },
      { id: "western", name: "Western University", country: "CA", city: "London, ON" },
      { id: "queens", name: "Queen's University", country: "CA", city: "Kingston, ON" },
      { id: "calgary", name: "University of Calgary", country: "CA", city: "Calgary, AB" },
      { id: "ottawa", name: "University of Ottawa", country: "CA", city: "Ottawa, ON" },
    ],
  },
];

// Intake periods
export const intakeOptions: IntakeOption[] = [
  { id: "fall-2025", label: "Fall 2025", startDate: new Date(2025, 8, 1) },
  { id: "spring-2026", label: "Spring 2026", startDate: new Date(2026, 0, 15) },
  { id: "fall-2026", label: "Fall 2026", startDate: new Date(2026, 8, 1) },
  { id: "spring-2027", label: "Spring 2027", startDate: new Date(2027, 0, 15) },
];

// Get country by code
export function getCountryByCode(code: Country): CountryOption | undefined {
  return countries.find((c) => c.code === code);
}

// Get universities for a country
export function getUniversitiesByCountry(code: Country): University[] {
  const country = getCountryByCode(code);
  return country?.popular_universities ?? [];
}

// Get intake option by ID
export function getIntakeById(id: IntakePeriod): IntakeOption | undefined {
  return intakeOptions.find((i) => i.id === id);
}

// Format date for display
function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// Generate journey timeline based on user inputs
export function generateJourneyTimeline(
  country: Country,
  intake: IntakePeriod,
  _university?: string
): JourneyStep[] {
  void _university;

  const intakeOption = getIntakeById(intake);
  if (!intakeOption) return [];

  const startDate = intakeOption.startDate;
  const now = new Date();

  // Calculate dates working backwards from intake
  // These are approximate timelines - adjust as needed
  const applicationStart = new Date(startDate);
  applicationStart.setMonth(applicationStart.getMonth() - 10);

  const applicationEnd = new Date(startDate);
  applicationEnd.setMonth(applicationEnd.getMonth() - 6);

  const admissionStart = new Date(applicationEnd);
  const admissionEnd = new Date(startDate);
  admissionEnd.setMonth(admissionEnd.getMonth() - 4);

  const visaStart = new Date(admissionEnd);
  const visaEnd = new Date(startDate);
  visaEnd.setMonth(visaEnd.getMonth() - 2);

  const tuitionStart = new Date(visaEnd);
  const tuitionEnd = new Date(startDate);
  tuitionEnd.setMonth(tuitionEnd.getMonth() - 1);

  const flightStart = new Date(tuitionEnd);
  const flightEnd = new Date(startDate);
  flightEnd.setDate(flightEnd.getDate() - 14);

  const accommodationStart = new Date(tuitionStart);
  const accommodationEnd = new Date(startDate);
  accommodationEnd.setDate(accommodationEnd.getDate() - 7);

  const pickupDate = new Date(startDate);
  pickupDate.setDate(pickupDate.getDate() - 3);

  const settlementStart = new Date(startDate);
  const settlementEnd = new Date(startDate);
  settlementEnd.setMonth(settlementEnd.getMonth() + 1);

  // Country-specific visa name
  const visaName = country === "US" ? "F-1 Visa" : country === "UK" ? "Student Visa" : "Study Permit";

  const steps: JourneyStep[] = [
    {
      id: 1,
      title: "Application & Fees",
      description: "Submit applications and pay application fees to your chosen universities",
      icon: "FileText",
      startDate: applicationStart,
      endDate: applicationEnd,
      status: now >= applicationStart ? "ready" : "upcoming",
    },
    {
      id: 2,
      title: "Admission & Acceptance",
      description: "Receive offers, compare options, and accept your preferred university",
      icon: "GraduationCap",
      startDate: admissionStart,
      endDate: admissionEnd,
      status: "upcoming",
    },
    {
      id: 3,
      title: `${visaName} Application`,
      description: `Apply for your ${visaName} with document preparation and interview support`,
      icon: "Stamp",
      startDate: visaStart,
      endDate: visaEnd,
      status: "upcoming",
    },
    {
      id: 4,
      title: "Tuition Payment",
      description: "Pay your tuition fees with the best exchange rates and lowest transfer fees",
      icon: "CreditCard",
      startDate: tuitionStart,
      endDate: tuitionEnd,
      status: "upcoming",
    },
    {
      id: 5,
      title: "Flight Booking",
      description: "Book your flight with student-friendly options and baggage allowances",
      icon: "Plane",
      startDate: flightStart,
      endDate: flightEnd,
      status: "upcoming",
    },
    {
      id: 6,
      title: "Accommodation",
      description: "Secure your housing - dorms, apartments, or homestays",
      icon: "Home",
      startDate: accommodationStart,
      endDate: accommodationEnd,
      status: "upcoming",
    },
    {
      id: 7,
      title: "Airport Pickup",
      description: "Arrange reliable airport pickup for a stress-free arrival",
      icon: "Car",
      startDate: pickupDate,
      endDate: pickupDate,
      status: "upcoming",
    },
    {
      id: 8,
      title: "Settlement Support",
      description: "Get help with bank accounts, SIM cards, local registration, and more",
      icon: "MapPin",
      startDate: settlementStart,
      endDate: settlementEnd,
      status: "upcoming",
    },
  ];

  // Add formatted date strings for display
  return steps.map((step) => ({
    ...step,
    dateRange:
      step.startDate.getTime() === step.endDate.getTime()
        ? formatMonth(step.startDate)
        : `${formatMonth(step.startDate)} - ${formatMonth(step.endDate)}`,
  }));
}

// Comprehensive list of source countries for international students
// Organized by region, covering Africa, Asia, Middle East, Latin America, and others
// Note: Countries on US/UN sanction lists have been removed
export const sourceCountries = [
  // Africa - West
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "SN", name: "Senegal" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "CM", name: "Cameroon" },
  { code: "BJ", name: "Benin" },
  { code: "TG", name: "Togo" },
  { code: "BF", name: "Burkina Faso" },
  { code: "ML", name: "Mali" },
  { code: "NE", name: "Niger" },
  { code: "GN", name: "Guinea" },
  { code: "SL", name: "Sierra Leone" },
  { code: "LR", name: "Liberia" },
  { code: "GM", name: "Gambia" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "CV", name: "Cape Verde" },
  { code: "MR", name: "Mauritania" },

  // Africa - East
  { code: "KE", name: "Kenya" },
  { code: "ET", name: "Ethiopia" },
  { code: "TZ", name: "Tanzania" },
  { code: "UG", name: "Uganda" },
  { code: "RW", name: "Rwanda" },
  { code: "BI", name: "Burundi" },
  { code: "SO", name: "Somalia" },
  { code: "ER", name: "Eritrea" },
  { code: "DJ", name: "Djibouti" },
  { code: "MW", name: "Malawi" },
  { code: "MZ", name: "Mozambique" },
  { code: "MG", name: "Madagascar" },
  { code: "MU", name: "Mauritius" },
  { code: "SC", name: "Seychelles" },
  { code: "KM", name: "Comoros" },

  // Africa - Southern
  { code: "ZA", name: "South Africa" },
  { code: "ZW", name: "Zimbabwe" },
  { code: "ZM", name: "Zambia" },
  { code: "BW", name: "Botswana" },
  { code: "NA", name: "Namibia" },
  { code: "AO", name: "Angola" },
  { code: "SZ", name: "Eswatini" },
  { code: "LS", name: "Lesotho" },

  // Africa - Central
  { code: "CD", name: "Democratic Republic of the Congo" },
  { code: "CG", name: "Republic of the Congo" },
  { code: "GA", name: "Gabon" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },

  // Africa - North
  { code: "EG", name: "Egypt" },
  { code: "MA", name: "Morocco" },
  { code: "DZ", name: "Algeria" },
  { code: "TN", name: "Tunisia" },

  // Asia - South
  { code: "IN", name: "India" },
  { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" },
  { code: "LK", name: "Sri Lanka" },
  { code: "NP", name: "Nepal" },
  { code: "BT", name: "Bhutan" },
  { code: "MV", name: "Maldives" },
  { code: "AF", name: "Afghanistan" },

  // Asia - Southeast
  { code: "PH", name: "Philippines" },
  { code: "VN", name: "Vietnam" },
  { code: "ID", name: "Indonesia" },
  { code: "MY", name: "Malaysia" },
  { code: "TH", name: "Thailand" },
  { code: "MM", name: "Myanmar" },
  { code: "KH", name: "Cambodia" },
  { code: "LA", name: "Laos" },
  { code: "SG", name: "Singapore" },
  { code: "BN", name: "Brunei" },
  { code: "TL", name: "Timor-Leste" },

  // Asia - East
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "TW", name: "Taiwan" },
  { code: "HK", name: "Hong Kong" },
  { code: "MO", name: "Macau" },
  { code: "MN", name: "Mongolia" },

  // Asia - Central
  { code: "KZ", name: "Kazakhstan" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "KG", name: "Kyrgyzstan" },

  // Middle East
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "QA", name: "Qatar" },
  { code: "KW", name: "Kuwait" },
  { code: "BH", name: "Bahrain" },
  { code: "OM", name: "Oman" },
  { code: "YE", name: "Yemen" },
  { code: "JO", name: "Jordan" },
  { code: "PS", name: "Palestine" },
  { code: "TR", name: "Turkey" },
  { code: "CY", name: "Cyprus" },

  // Latin America - South
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
  { code: "CO", name: "Colombia" },
  { code: "PE", name: "Peru" },
  { code: "CL", name: "Chile" },
  { code: "EC", name: "Ecuador" },
  { code: "BO", name: "Bolivia" },
  { code: "PY", name: "Paraguay" },
  { code: "UY", name: "Uruguay" },
  { code: "GY", name: "Guyana" },
  { code: "SR", name: "Suriname" },

  // Latin America - Central & Caribbean
  { code: "MX", name: "Mexico" },
  { code: "GT", name: "Guatemala" },
  { code: "HN", name: "Honduras" },
  { code: "SV", name: "El Salvador" },
  { code: "NI", name: "Nicaragua" },
  { code: "CR", name: "Costa Rica" },
  { code: "PA", name: "Panama" },
  { code: "BZ", name: "Belize" },
  { code: "DO", name: "Dominican Republic" },
  { code: "HT", name: "Haiti" },
  { code: "JM", name: "Jamaica" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "BB", name: "Barbados" },
  { code: "BS", name: "Bahamas" },

  // North America
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },

  // Europe
  { code: "UK", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "IE", name: "Ireland" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "HU", name: "Hungary" },
  { code: "RO", name: "Romania" },
  { code: "BG", name: "Bulgaria" },
  { code: "GR", name: "Greece" },
  { code: "HR", name: "Croatia" },
  { code: "RS", name: "Serbia" },
  { code: "UA", name: "Ukraine" },
  { code: "BY", name: "Belarus" },

  // Oceania
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "FJ", name: "Fiji" },
  { code: "PG", name: "Papua New Guinea" },

  // Other
  { code: "OT", name: "Other" },
];

export const destinationCountries = [
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IE", name: "Ireland" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "SE", name: "Sweden" },
  { code: "FI", name: "Finland" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "HU", name: "Hungary" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "SG", name: "Singapore" },
  { code: "MY", name: "Malaysia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "QA", name: "Qatar" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "TR", name: "Turkey" },
  { code: "ZA", name: "South Africa" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "OT", name: "Other" },
];
