export type Role = "admin" | "customer";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: Role;
  avatar_url: string | null;
};

export type Vehicle = {
  id: string;
  name: string;
  brand: string;
  model: string | null;
  registration_number: string;
  vehicle_type: "car" | "van";
  year: number | null;
  seats: number | null;
  transmission: "automatic" | "manual" | null;
  fuel_type: "petrol" | "diesel" | "hybrid" | "electric" | null;
  price_per_day: number;
  description: string | null;
  status: "available" | "maintenance" | "inactive";
  created_at: string;
  updated_at: string;
};

export type VehicleImage = {
  id: string;
  vehicle_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
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
      vehicles: {
        Row: Vehicle;
        Insert: Omit<Vehicle, "id" | "created_at" | "updated_at"> & Partial<Pick<Vehicle, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Vehicle, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      vehicle_images: {
        Row: VehicleImage;
        Insert: Omit<VehicleImage, "id" | "created_at"> & Partial<Pick<VehicleImage, "id" | "created_at">>;
        Update: Partial<Omit<VehicleImage, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
