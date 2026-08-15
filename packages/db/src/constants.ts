export const USER_ROLES = ["student", "teacher", "college", "organizer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  teacher: "Teacher",
  college: "College / Institution",
  organizer: "Event Organizer",
  admin: "Admin",
};

export const EVENT_TYPES = [
  "hackathon",
  "problem-solving",
  "ideathon",
  "internship",
  "workshop",
  "startup-competition",
  "research",
  "community",
  "session",
  "freelancing",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_MODE = ["online", "offline", "hybrid"] as const;
export type EventMode = (typeof EVENT_MODE)[number];

export const EVENT_STATUS = [
  "pending",
  "ai_reviewed",
  "in_review",
  "approved",
  "live",
  "rejected",
  "cancelled",
  "completed",
  "stale",
] as const;
export type EventStatus = (typeof EVENT_STATUS)[number];

export const REGISTRATION_STATUS = [
  "pending",
  "identity_pending",
  "confirmed",
  "cancelled",
  "attended",
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUS)[number];

export const SOURCE_TRUST_LEVEL = ["official", "partner", "user", "ai_discovered"] as const;
export type SourceTrustLevel = (typeof SOURCE_TRUST_LEVEL)[number];

export const RESOURCE_TYPE = [
  "internship",
  "job",
  "funding",
  "legal",
  "freelance",
  "scholarship",
] as const;
export type ResourceType = (typeof RESOURCE_TYPE)[number];

export const AI_JOB_STATUS = ["queued", "running", "completed", "failed"] as const;
export type AIJobStatus = (typeof AI_JOB_STATUS)[number];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  hackathon: "Hackathon",
  "problem-solving": "Problem Solving",
  ideathon: "Creative Ideas",
  internship: "Internship",
  workshop: "Workshop",
  "startup-competition": "Startup Competition",
  research: "Research",
  community: "Community",
  session: "Free Online Session",
  freelancing: "Freelancing",
};
