export type Role = "admin" | "customer";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: Role;
  avatar_url: string | null;
};

// Only the existing table used in Phase 1 is modeled here.
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
