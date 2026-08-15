import type {
  AIJobStatus,
  EventMode,
  EventStatus,
  EventType,
  RegistrationStatus,
  ResourceType,
  SourceTrustLevel,
  UserRole,
} from "./constants";

export interface DatabaseUser {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  full_name: string | null;
  college_id: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  user_id: string;
  branch: string | null;
  year: number | null;
  skills: string[];
  portfolio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeacherProfile {
  user_id: string;
  department: string | null;
  designation: string | null;
  research_area: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollegeProfile {
  user_id: string;
  college_name: string;
  affiliation_number: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: "college" | "company" | "startup" | "nonprofit" | "community";
  website: string | null;
  verified: boolean;
  created_at: string;
}

export interface EventRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: EventType;
  mode: EventMode;
  status: EventStatus;
  organizer_id: string;
  organization_id: string | null;
  source_url: string | null;
  start_date: string;
  end_date: string | null;
  application_deadline: string | null;
  venue: string | null;
  city: string | null;
  max_seats: number | null;
  prize_pool: string | null;
  eligibility: string | null;
  tags: string[];
  cover_url: string | null;
  last_verified_at: string | null;
  is_ai_sourced: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  identity_status: "not_required" | "pending" | "verified" | "failed";
  aadhaar_verified: boolean;
  digilocker_ref: string | null;
  answers: Record<string, string>;
  registered_at: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string | null;
  category: string | null;
  year: number | null;
  paper_url: string | null;
  file_url: string | null;
  uploaded_by: string | null;
  is_public: boolean;
  created_at: string;
}

export interface StartupIdea {
  id: string;
  user_id: string;
  title: string;
  pitch: string;
  problem: string;
  solution: string;
  stage: "idea" | "mvp" | "launched";
  team_size: number;
  upvotes: number;
  created_at: string;
}

export interface ResourceRecord {
  id: string;
  title: string;
  type: ResourceType;
  description: string | null;
  source_url: string;
  official_site: boolean;
  is_verified: boolean;
  posted_by: string | null;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  admin_id: string;
  type: "crewin" | "college" | "skill" | "startup";
  is_public: boolean;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  author_id: string;
  content: string;
  moderation_status: "pending" | "approved" | "removed";
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  status: "open" | "resolved" | "closed";
  assigned_admin_id: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface SourceRecord {
  id: string;
  url: string;
  source_type: "official" | "rss" | "social" | "ai_discovered";
  trust_level: SourceTrustLevel;
  last_checked_at: string | null;
  active: boolean;
  created_at: string;
}

export interface VerificationRecord {
  id: string;
  event_id: string;
  checks_passed: string[];
  ai_risk_score: number | null;
  ai_review_notes: string | null;
  reviewer_id: string | null;
  result: "approved" | "rejected" | "needs_changes";
  reviewed_at: string | null;
  created_at: string;
}

export interface AIJob {
  id: string;
  type: "source_hackathon" | "verify_event" | "summarize_paper" | "classify_opportunity";
  status: AIJobStatus;
  input_payload: Record<string, unknown>;
  output_payload: Record<string, unknown> | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip: string | null;
  created_at: string;
}
