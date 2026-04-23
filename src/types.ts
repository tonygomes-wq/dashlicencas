export enum LicenseStatus {
  Vencido = 'VENCIDO',
  VenceHoje = 'VENCE HOJE',
  VenceEm7Dias = 'VENCE EM 7 DIAS',
  OK = 'OK'
}

export type RenewalStatus = 'Pendente' | 'Em Negociação' | 'Renovado' | 'Cancelado';

export interface BaseItem {
  id: number;
  renewalStatus: RenewalStatus;
}

export interface BitdefenderLicense extends BaseItem {
  company: string;
  contactPerson: string;
  email: string;
  expirationDate: string | null; // YYYY-MM-DD
  totalLicenses: number;
  licenseKey: string;
}

export interface BitdefenderLicenseWithStatus extends BitdefenderLicense {
  remainingDays: number;
  status: LicenseStatus;
}

export interface FortigateDevice extends BaseItem {
  serial: string;
  model: string;
  client: string;
  email: string;
  vencimento: string | null; // YYYY-MM-DD
  registrationDate: string | null; // YYYY-MM-DD
}

export interface FortigateDeviceWithStatus extends FortigateDevice {
  remainingDays: number;
  status: LicenseStatus;
}

// --- Tipos Office 365 ---

export interface O365Client {
  id: string; // UUID
  clientName: string;
  contactEmail: string | null;
}

export interface O365License extends BaseItem {
  id: number;
  clientId: string; // UUID do cliente
  username: string;
  email: string;
  password: string | null;
  licenseType: string;
  renewalStatus: RenewalStatus;
}

export interface O365LicenseWithClient extends O365License {
  clientName: string;
}

// --- Novos Tipos GMAIL ---

export interface GmailClient {
  id: string; // UUID
  clientName: string;
  contactEmail: string | null;
}

export interface GmailLicense extends BaseItem {
  id: number;
  clientId: string; // UUID do cliente
  username: string;
  email: string;
  password: string | null;
  licenseType: string;
  renewalStatus: RenewalStatus;
}

export interface GmailLicenseWithClient extends GmailLicense {
  clientName: string;
}


export interface EmailHistory {
  id: number;
  userId: string | null;
  recipientEmail: string;
  subject: string;
  bodyPreview: string | null;
  productType: 'bitdefender' | 'fortigate';
  itemId: number;
  sentAt: string;
}

// Migrated to more detailed type below

export type UserRole = 'admin' | 'user';

export interface UserPermissions {
  dashboards: {
    bitdefender: boolean;
    fortigate: boolean;
    o365: boolean;
    gmail: boolean;
    network: boolean;
  };
  actions: {
    edit: boolean;
    delete: boolean;
  };
  client_access_all: boolean | Record<string, boolean>; // Support both global boolean and per-dashboard map
  client_access?: {
    bitdefender?: string[];
    fortigate?: string[];
    o365?: string[];
    gmail?: string[];
  };
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  is_active?: boolean;
  permissions?: UserPermissions;
}

export interface UserWithDetails extends User {
  two_factor_enabled: boolean;
  last_login: string | null;
  created_at: string;
}

// --- Hardware Inventory Types ---

export type DeviceType = 'Desktop' | 'Notebook' | 'Servidor' | 'Workstation' | 'Outro';
export type DeviceStatus = 'Ativo' | 'Inativo' | 'Manutenção' | 'Descartado';
export type StorageType = 'SSD' | 'HDD' | 'NVMe' | 'M.2';
export type WarrantyStatus = 'Expirada' | 'Expira em 30 dias' | 'Válida';

export interface StorageDevice {
  id?: string;
  type: StorageType;
  capacity: number; // Em GB
  manufacturer?: string;
  model?: string;
  interface?: string; // Ex: "SATA", "PCIe"
}

export interface HardwareDevice {
  id: number;
  deviceName: string;
  deviceType: DeviceType;
  clientName: string;
  location?: string;
  
  // Processador
  cpuModel: string;
  cpuCores?: number;
  cpuFrequency?: string; // Ex: "3.2 GHz"
  
  // Memória RAM
  ramSize: number; // Em GB
  ramType?: string; // Ex: "DDR4", "DDR5"
  ramSpeed?: string; // Ex: "3200 MHz"
  
  // Armazenamento
  storageDevices: StorageDevice[];
  
  // Sistema Operacional
  osName?: string;
  osVersion?: string;
  
  // Rede
  macAddress?: string;
  ipAddress?: string;
  
  // Informações Adicionais
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string; // YYYY-MM-DD
  warrantyExpiration?: string; // YYYY-MM-DD
  notes?: string;
  
  // Controle
  status: DeviceStatus;
  lastUpdate?: string;
  userId?: number;
}

export interface HardwareWithWarrantyStatus extends HardwareDevice {
  warrantyDaysRemaining: number;
  warrantyStatus: WarrantyStatus;
}