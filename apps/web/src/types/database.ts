export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          role: string;
          full_name: string | null;
          college_id: string | null;
          is_verified: boolean;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string | null;
          role?: string;
          full_name?: string | null;
          college_id?: string | null;
          is_verified?: boolean;
          bio?: string | null;
          avatar_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];      };
      student_profiles: {
        Row: {
          user_id: string;
          branch: string | null;
          year: number | null;
          skills: string[];
          portfolio_url: string | null;
          headline: string | null;
          resume_url: string | null;
          resume_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          branch?: string | null;
          year?: number | null;
          skills?: string[];
          portfolio_url?: string | null;
          headline?: string | null;
          resume_url?: string | null;
          resume_name?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["student_profiles"]["Insert"]>;
        Relationships: [];      };
      events: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          type: string;
          mode: string;
          status: string;
          organizer_id: string | null;
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
        };
        Insert: {
          title: string;
          slug: string;
          description: string;
          type: string;
          mode?: string;
          status?: string;
          organizer_id?: string | null;
          organization_id?: string | null;
          source_url?: string | null;
          start_date: string;
          end_date?: string | null;
          application_deadline?: string | null;
          venue?: string | null;
          city?: string | null;
          max_seats?: number | null;
          prize_pool?: string | null;
          eligibility?: string | null;
          tags?: string[];
          cover_url?: string | null;
          is_ai_sourced?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];      };
      event_registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: string;
          identity_status: string;
          aadhaar_verified: boolean;
          digilocker_ref: string | null;
          answers: Record<string, unknown>;
          registered_at: string;
        };
        Insert: {
          event_id: string;
          user_id: string;
          status?: string;
          identity_status?: string;
          aadhaar_verified?: boolean;
          digilocker_ref?: string | null;
          answers?: Record<string, unknown>;
        };
        Update: Partial<Database["public"]["Tables"]["event_registrations"]["Insert"]>;
        Relationships: [];      };
      verifications: {
        Row: {
          id: string;
          event_id: string;
          checks_passed: string[];
          ai_risk_score: number | null;
          ai_review_notes: string | null;
          reviewer_id: string | null;
          result: string;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          event_id: string;
          checks_passed?: string[];
          ai_risk_score?: number | null;
          ai_review_notes?: string | null;
          reviewer_id?: string | null;
          result: string;
          reviewed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["verifications"]["Insert"]>;
        Relationships: [];      };
      research_papers: {
        Row: {
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
        };
        Insert: {
          title: string;
          authors?: string[];
          abstract?: string | null;
          category?: string | null;
          year?: number | null;
          paper_url?: string | null;
          file_url?: string | null;
          uploaded_by?: string | null;
          is_public?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["research_papers"]["Insert"]>;
        Relationships: [];      };
      startup_ideas: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          pitch: string;
          problem: string;
          solution: string;
          stage: string;
          team_size: number;
          upvotes: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          pitch: string;
          problem: string;
          solution: string;
          stage?: string;
          team_size?: number;
          upvotes?: number;
        };
        Update: Partial<Database["public"]["Tables"]["startup_ideas"]["Insert"]>;
        Relationships: [];      };
      resources: {
        Row: {
          id: string;
          title: string;
          type: string;
          description: string | null;
          source_url: string;
          official_site: boolean;
          is_verified: boolean;
          posted_by: string | null;
          created_at: string;
        };
        Insert: {
          title: string;
          type: string;
          description?: string | null;
          source_url: string;
          official_site?: boolean;
          is_verified?: boolean;
          posted_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["resources"]["Insert"]>;
        Relationships: [];      };
      communities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          admin_id: string;
          type: string;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          admin_id: string;
          type?: string;
          is_public?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["communities"]["Insert"]>;
        Relationships: [];      };
      community_posts: {
        Row: {
          id: string;
          community_id: string;
          author_id: string;
          content: string;
          moderation_status: string;
          created_at: string;
        };
        Insert: {
          community_id: string;
          author_id: string;
          content: string;
          moderation_status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["community_posts"]["Insert"]>;
        Relationships: [];      };
      chat_conversations: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          assigned_admin_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          status?: string;
          assigned_admin_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["chat_conversations"]["Insert"]>;
        Relationships: [];      };
      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          conversation_id: string;
          sender_id: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Insert"]>;
        Relationships: [];      };
      ai_jobs: {
        Row: {
          id: string;
          type: string;
          status: string;
          input_payload: Record<string, unknown>;
          output_payload: Record<string, unknown> | null;
          error: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          type: string;
          status?: string;
          input_payload?: Record<string, unknown>;
          output_payload?: Record<string, unknown> | null;
          error?: string | null;
          completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ai_jobs"]["Insert"]>;
        Relationships: [];      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Record<string, unknown>;
          ip: string | null;
          created_at: string;
        };
        Insert: {
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Record<string, unknown>;
          ip?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
        Relationships: [];      };
    };
    Views: Record<string, never>;
    Functions: {
      upvote_startup_idea: {
        Args: { p_idea_id: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
  };
}
