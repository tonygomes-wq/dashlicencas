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
  notes?: string | null; // Observações e informações extras
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
  notes?: string | null; // Observações e informações extras
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
    hardware: boolean;
    hr: boolean; // 🆕 Módulo RH
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
    hardware?: string[];
    hr?: string[]; // 🆕 Módulo RH (reservado para futuro filtro por departamento)
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

// ========================================================================
// HR MODULE TYPES - Gestão de Recursos Humanos
// ========================================================================

// --- Enums para RH ---
export type Gender = 'M' | 'F' | 'Outro' | 'Não informar';
export type MaritalStatus = 'Solteiro' | 'Casado' | 'Divorciado' | 'Viúvo' | 'União Estável';
export type ContractType = 'CLT' | 'PJ' | 'Estagiário' | 'Temporário' | 'Aprendiz';
export type EmployeeStatus = 'Ativo' | 'Afastado' | 'Férias' | 'Demitido';
export type VacationStatus = 'Solicitada' | 'Aprovada' | 'Rejeitada' | 'Concluída' | 'Cancelada';
export type LeaveStatus = 'Ativo' | 'Concluído' | 'Cancelado';
export type BenefitStatus = 'Ativo' | 'Inativo' | 'Cancelado';
export type LeaveType = 'Licença Médica' | 'Licença Maternidade' | 'Licença Paternidade' | 'Licença Sem Vencimento' | 'Afastamento INSS' | 'Outro';

// --- Employee (Funcionário) ---
export interface Employee {
  id: number;
  user_id: number;
  
  // Dados Pessoais
  full_name: string;
  cpf: string;
  rg?: string | null;
  rg_issuer?: string | null;
  rg_issue_date?: string | null; // YYYY-MM-DD
  birth_date?: string | null; // YYYY-MM-DD
  gender?: Gender | null;
  marital_status?: MaritalStatus | null;
  nationality?: string | null;
  
  // Contato
  personal_email?: string | null;
  corporate_email?: string | null;
  phone?: string | null;
  mobile_phone?: string | null;
  
  // Endereço
  zip_code?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  
  // Dados Profissionais
  position: string;
  department?: string | null;
  hire_date: string; // YYYY-MM-DD
  termination_date?: string | null; // YYYY-MM-DD
  contract_type: ContractType;
  status: EmployeeStatus;
  salary?: number | null;
  work_hours?: string | null;
  
  // Observações e Anexos
  notes?: string | null;
  photo_url?: string | null;
  
  // Auditoria
  created_at: string;
  updated_at: string;
}

// --- Vacation (Férias) ---
export interface Vacation {
  id: number;
  employee_id: number;
  employee_name?: string; // Join com hr_employees
  
  // Período Aquisitivo
  acquisition_start?: string | null; // YYYY-MM-DD
  acquisition_end?: string | null; // YYYY-MM-DD
  
  // Férias Solicitadas
  vacation_start: string; // YYYY-MM-DD
  vacation_end: string; // YYYY-MM-DD
  days_requested: number;
  cash_bonus_days: number;
  
  // Status e Aprovação
  status: VacationStatus;
  requested_at: string;
  approved_by?: number | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  
  // Observações
  notes?: string | null;
  
  // Auditoria
  created_at: string;
  updated_at: string;
}

// --- Leave (Afastamento) ---
export interface Leave {
  id: number;
  employee_id: number;
  employee_name?: string; // Join com hr_employees
  
  // Dados do Afastamento
  leave_type: LeaveType;
  start_date: string; // YYYY-MM-DD
  expected_return_date?: string | null; // YYYY-MM-DD
  actual_return_date?: string | null; // YYYY-MM-DD
  
  // Detalhes
  reason?: string | null;
  notes?: string | null;
  document_url?: string | null;
  
  // Status
  status: LeaveStatus;
  
  // Auditoria
  created_at: string;
  updated_at: string;
}

// --- Benefit (Benefício) ---
export interface Benefit {
  id: number;
  employee_id: number;
  employee_name?: string; // Join com hr_employees
  
  // Tipo de Benefício
  benefit_type: string;
  description?: string | null;
  
  // Valores
  monthly_value?: number | null;
  
  // Vigência
  start_date: string; // YYYY-MM-DD
  end_date?: string | null; // YYYY-MM-DD
  status: BenefitStatus;
  
  // Observações
  notes?: string | null;
  
  // Auditoria
  created_at: string;
  updated_at: string;
}

// --- Document (Documento) ---
export interface HRDocument {
  id: number;
  employee_id: number;
  
  // Dados do Documento
  document_type: string;
  document_name: string;
  file_url: string;
  file_size?: number | null;
  mime_type?: string | null;
  
  // Observações
  description?: string | null;
  
  // Auditoria
  uploaded_by: number;
  uploaded_by_name?: string; // Join com users
  created_at: string;
}

// --- HR Statistics (Estatísticas) ---
export interface HRStats {
  total_employees: number;
  by_status: Array<{
    status: EmployeeStatus;
    count: number;
  }>;
  by_department: Array<{
    department: string | null;
    count: number;
  }>;
  by_contract: Array<{
    contract_type: ContractType;
    count: number;
  }>;
  birthdays_this_month: Array<{
    id: number;
    full_name: string;
    birth_date: string;
  }>;
  upcoming_vacations: Vacation[];
  active_leaves: Leave[];
}