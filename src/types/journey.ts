// Journey Builder Types

export type Country = "US" | "UK" | "CA";

export interface CountryOption {
  code: Country;
  name: string;
  flag: string;
  popular_universities: University[];
}

export interface University {
  id: string;
  name: string;
  country: Country;
  city: string;
}

export type IntakePeriod = "fall-2025" | "spring-2026" | "fall-2026" | "spring-2027";

export interface IntakeOption {
  id: IntakePeriod;
  label: string;
  startDate: Date;
}

export interface ProgramDetails {
  university: string;
  program: string;
  intake: IntakePeriod;
  isUniversityUndecided: boolean;
}

export interface UserLocation {
  country: string;
  city?: string;
  detectedAutomatically: boolean;
}

export interface JourneyStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  startDate: Date;
  endDate: Date;
  status: "ready" | "upcoming" | "completed";
}

export interface JourneyData {
  country: Country | null;
  programDetails: ProgramDetails | null;
  location: UserLocation | null;
}

export interface WaitlistFormData {
  firstName: string;
  lastName: string;
  email: string;
  country: Country | null;
  university: string;
  program: string;
  intake: IntakePeriod | null;
  location: string;
}

// State management types
export type JourneyBuilderStep = 
  | "country" 
  | "program" 
  | "location" 
  | "timeline" 
  | "waitlist"
  | "success";

export interface JourneyBuilderState {
  currentStep: JourneyBuilderStep;
  data: JourneyData;
  isAnimating: boolean;
}

export type JourneyBuilderAction =
  | { type: "SET_COUNTRY"; payload: Country }
  | { type: "SET_PROGRAM_DETAILS"; payload: ProgramDetails }
  | { type: "SET_LOCATION"; payload: UserLocation }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "GO_TO_STEP"; payload: JourneyBuilderStep }
  | { type: "SET_ANIMATING"; payload: boolean }
  | { type: "RESET" };