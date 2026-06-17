// Shared admin dashboard types.
// Extracted from src/pages/AdminDashboard.tsx for reuse and readability.

export interface Booking {
  id: string;
  name: string;
  city: string | null;
  email: string | null;
  phone: string | null;
  workshop: string;
  session_info: string | null;
  participants: number | null;
  booking_date: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  partner_id: string | null;
  source: string | null;
  room_number: string | null;
  gross_amount: number | null;
  commission_rate: number | null;
  commission_amount: number | null;
  commission_status: string | null;
  qr_variant_code: string | null;
  qr_variant_scope: string | null;
}

export interface PartnerLite {
  id: string;
  name: string;
  type: string;
  brand_color: string | null;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  region: string | null;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  delivery_fee: number;
  grand_total: number;
  status: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  images: string[];
  category: string;
  stock: number;
  is_sold_out: boolean;
  is_promotion: boolean;
  promotion_label: string | null;
  dimensions: string | null;
}

export interface StoreSection {
  id: string;
  title_en: string;
  title_ar: string;
  title_es: string;
  title_fr: string;
  description_en: string;
  description_ar: string;
  description_es: string;
  description_fr: string;
  enabled: boolean;
  sort_order: number;
  donation: boolean;
}

export interface Availability {
  id: string;
  date: string;
  workshop: string;
  is_available: boolean;
}

export interface ManagedUser {
  user_id: string;
  email: string;
  created_at: string;
  role: string;
  last_sign_in_at: string | null;
}
