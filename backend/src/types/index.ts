export interface ACHTransaction {
  id: string;
  // Debit Information
  drRoutingNumber: string;
  drAccountNumber: string;
  drId: string;
  drName: string;
  // Credit Information
  crRoutingNumber: string;
  crAccountNumber: string;
  crId: string;
  crName: string;
  // Transaction Details
  amount: number;
  effectiveDate: Date;
  // Metadata
  senderIp?: string;
  senderDetails?: string;
  createdAt: Date;
  updatedAt: Date;
  status: TransactionStatus;
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface EncryptedTransaction extends Omit<ACHTransaction, 'drAccountNumber' | 'crAccountNumber'> {
  drAccountNumberEncrypted: string;
  crAccountNumberEncrypted: string;
}

export interface NACHAFile {
  id: string;
  filename: string;
  content: string;
  effectiveDate: Date;
  transactionCount: number;
  totalAmount: number;
  createdAt: Date;
  transmitted: boolean;
  transmittedAt?: Date;
  encrypted?: boolean;
}

export interface FederalHoliday {
  id: string;
  name: string;
  date: Date;
  year: number;
  recurring: boolean;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  VIEWER = 'viewer'
}

export interface ApiResponse<T = any> {
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

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BusinessDayCalculatorOptions {
  holidays: Date[];
  excludeWeekends: boolean;
}