export type Role = "admin" | "customer";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: Role;
  avatar_url: string | null;
};

export type ProfileRecord = Profile & { created_at: string; updated_at: string };

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

export type BookingStatus = "pending" | "confirmed" | "active" | "completed" | "cancelled" | "rejected";
export type Booking = {
  id: string;
  user_id: string;
  vehicle_id: string;
  pickup_date: string;
  return_date: string;
  price_per_day: number;
  total_price: number;
  pickup_location: string;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  payment_method: "cash" | "bank_transfer";
  status: "pending" | "paid" | "failed";
  paid_at: string | null;
  created_at: string;
};

export type SessionProfile = Profile & { email: string | null };

// Only the existing table used in Phase 1 is modeled here.
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRecord;
        Insert: never;
        Update: Partial<Pick<Profile, "full_name" | "phone" | "avatar_url">>;
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
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, "id" | "created_at" | "updated_at"> & Partial<Pick<Booking, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Booking, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, "id" | "created_at"> & Partial<Pick<Payment, "id" | "created_at">>;
        Update: Partial<Omit<Payment, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_vehicle_available: {
        Args: { p_vehicle_id: string; p_pickup_date: string; p_return_date: string };
        Returns: boolean;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
