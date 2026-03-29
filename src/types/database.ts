export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          is_verified: boolean;
          badge: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          is_verified?: boolean;
          badge?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          is_verified?: boolean;
          badge?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          recipient_id: string | null;
          sender_id: string | null;
          content: string;
          is_anonymous: boolean;
          answer: string | null;
          answered_at: string | null;
          likes_count: number;
          answers_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id?: string | null;
          sender_id?: string | null;
          content: string;
          is_anonymous?: boolean;
          answer?: string | null;
          answered_at?: string | null;
          likes_count?: number;
          answers_count?: number;
          created_at?: string;
        };
        Update: {
          answer?: string | null;
          answered_at?: string | null;
          likes_count?: number;
          answers_count?: number;
        };
        Relationships: [];
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
