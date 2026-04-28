// User Types
export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: number;
  email: string;
  role: string;
  isActive: boolean;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
  refreshToken?: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

// Bitdefender Types
export interface BitdefenderLicense {
  id: number;
  user_id: number;
  company: string;
  contact_person: string | null;
  email: string | null;
  expiration_date: string | null;
  total_licenses: number;
  license_key: string | null;
  renewal_status: string;
  client_api_key: string | null;
  client_access_url: string | null;
  used_slots: number;
  total_slots: number;
  license_usage_percent: number;
  license_usage_alert: boolean;
  license_usage_last_sync: Date | null;
  notes: string | null;
  created_at: Date;
}

export interface BitdefenderLicenseResponse {
  id: number;
  userId: number;
  company: string;
  contactPerson: string | null;
  email: string | null;
  expirationDate: string | null;
  totalLicenses: number;
  licenseKey: string | null;
  renewalStatus: string;
  clientApiKey: string | null;
  clientAccessUrl: string | null;
  usedSlots: number;
  totalSlots: number;
  licenseUsagePercent: number;
  licenseUsageAlert: boolean;
  licenseUsageLastSync: Date | null;
  notes: string | null;
  createdAt: Date;
}

// FortiGate Types
export interface FortigateDevice {
  id: number;
  user_id: number;
  serial: string;
  model: string | null;
  client: string | null;
  vencimento: string | null;
  registration_date: string | null;
  email: string | null;
  renewal_status: string;
  api_token: string | null;
  api_ip: string | null;
  notes: string | null;
  created_at: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request with User
export interface AuthRequest extends Express.Request {
  user?: JWTPayload;
}
