// Types shared between frontend and backend
export interface ACHTransaction {
  id: string;
  // Debit Information
  drRoutingNumber: string;
  drAccountNumber: string; // This will be masked on the frontend
  drId: string;
  drName: string;
  // Credit Information
  crRoutingNumber: string;
  crAccountNumber: string; // This will be masked on the frontend
  crId: string;
  crName: string;
  // Transaction Details
  amount: number;
  effectiveDate: string;
  // Metadata
  senderIp?: string;
  senderDetails?: string;
  createdAt: string;
  updatedAt: string;
  status: TransactionStatus;
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface NACHAFile {
  id: string;
  filename: string;
  content?: string;
  effectiveDate: string;
  transactionCount: number;
  totalAmount: number;
  createdAt: string;
  transmitted: boolean;
  transmittedAt?: string;
}

export interface FederalHoliday {
  id: string;
  name: string;
  date: string;
  year: number;
  recurring: boolean;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  VIEWER = 'viewer'
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateTransactionRequest {
  drRoutingNumber: string;
  drAccountNumber: string;
  drId: string;
  drName: string;
  crRoutingNumber: string;
  crAccountNumber: string;
  crId: string;
  crName: string;
  amount: number;
  effectiveDate: string;
  senderDetails?: string;
}

export interface TransactionStats {
  totalTransactions: number;
  pendingTransactions: number;
  processedTransactions: number;
  failedTransactions: number;
  totalAmount: number;
  averageAmount: number;
}

export interface NACHAGenerationStats {
  totalFiles: number;
  transmittedFiles: number;
  pendingFiles: number;
  totalTransactionCount: number;
  totalAmount: number;
  averageFileSize: number;
}

export interface SFTPSettings {
  host: string;
  port: string;
  username: string;
  password: string;
  privateKeyPath: string;
}

export interface ACHSettings {
  immediateDestination: string;
  immediateOrigin: string;
  companyName: string;
  companyId: string;
  companyDiscretionaryData: string;
}

export interface BusinessDayInfo {
  date: string;
  isBusinessDay: boolean;
  isHoliday: boolean;
  isWeekend: boolean;
  dayOfWeek: string;
}