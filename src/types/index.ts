// Shared TypeScript types for the Awards Automation Platform

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'VENDOR';

export type ProductCategory = 'TROPHY' | 'MEDAL' | 'PLAQUE' | 'JERSEY' | 'HOODIE' | 'OTHER';

export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'READY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

// ─── Core entities ───────────────────────────────────────────────────────────

export interface User {
  id:        string;
  name:      string;
  email:     string;
  role:      UserRole;
  address?:  string;
  lat?:      number;
  lng?:      number;
  phone?:    string;
  createdAt: string;
}

export interface Product {
  id:                 string;
  name:               string;
  category:           ProductCategory;
  description:        string;
  basePrice:          number;
  imageUrl?:          string;
  customizableFields: CustomizableFields;
  isActive:           boolean;
}

export interface CustomizableFields {
  text?:        { label: string; maxLength: number };
  font?:        { options: string[] };
  color?:       { label: string; type: string };
  size?:        { options: string[]; priceModifier?: number[] };
  logoUpload?:  { enabled: boolean; label: string };
  border?:      { options: string[] };
  ribbonColor?: { options: string[]; label: string };
  fabric?:      { options: string[]; priceModifier?: number[] };
  printMethod?: { options: string[]; priceModifier?: number[] };
  quantity?:    { min: number; priceBreaks?: Array<{ qty: number; discount: number }> };
}

export interface Vendor {
  id:            string;
  name:          string;
  email:         string;
  phone?:        string;
  address:       string;
  lat:           number;
  lng:           number;
  serviceRadius: number;
  isHQ:          boolean;
  isActive:      boolean;
  capacity:      number;
  serviceAreas:  string[];
}

export interface Order {
  id:                string;
  userId:            string;
  user?:             User;
  assignedVendorId?: string;
  vendor?:           Vendor;
  status:            OrderStatus;
  totalPrice:        number;
  customerLat?:      number;
  customerLng?:      number;
  customerAddress?:  string;
  estimatedDelivery?: string;
  stripeSessionId?:  string;
  isExpressDelivery: boolean;
  routingNotes?:     string;
  notes?:            string;
  items:             OrderItem[];
  designs:           Design[];
  createdAt:         string;
  updatedAt:         string;
}

export interface OrderItem {
  id:             string;
  orderId:        string;
  productId:      string;
  product?:       Product;
  quantity:       number;
  unitPrice:      number;
  customizations?: Record<string, unknown>;
}

export interface Design {
  id:          string;
  orderId:     string;
  text?:       string;
  font?:       string;
  color?:      string;
  fontSize?:   number;
  imageUrl?:   string;
  layoutData?: Record<string, unknown>;
}

export interface Inventory {
  id:        string;
  vendorId:  string;
  vendor?:   Vendor;
  productId: string;
  product?:  Product;
  stock:     number;
}

export interface Notification {
  id:        string;
  orderId?:  string;
  userId?:   string;
  type:      string;
  title:     string;
  message:   string;
  isRead:    boolean;
  createdAt: string;
}

// ─── Cart / Design state ─────────────────────────────────────────────────────

export interface CartItem {
  productId:      string;
  product:        Product;
  quantity:       number;
  unitPrice:      number;
  customizations: Record<string, unknown>;
  designSnapshot?: DesignState;
}

export interface DesignState {
  text?:       string;
  font?:       string;
  color?:      string;
  fontSize?:   number;
  imageUrl?:   string;
  layoutData?: Record<string, unknown>;
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?:    T;
  error?:   string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data:     T[];
  total:    number;
  page:     number;
  pageSize: number;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface DailyRevenue {
  date:    string;
  revenue: number;
  orders:  number;
}

export interface VendorPerformance {
  vendorId:     string;
  vendorName:   string;
  totalOrders:  number;
  completedOrders: number;
  revenue:      number;
  avgDeliveryDays: number;
}
