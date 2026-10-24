export type TransactionType = 'cash_in' | 'cash_out' | 'bank_in' | 'bank_out';

export type EntryMode = 'standard' | 'transfer';

export type TransferDirection = 'cash_to_bank' | 'bank_to_cash';

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Cheque' | 'Card POS' | 'Online' | 'Other';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  reference?: string;
  paymentMethod: PaymentMethod;
  tags?: string[];
  transferPairId?: string; // Links paired contra entries (e.g. Cash -> Bank)
}

export interface CompanyProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  currency: string;
  decimals: number;
  baseOpeningCash: number;
  baseOpeningBank: number;
}

export interface DailySummary {
  date: string;
  openingCash: number;
  cashIn: number;
  cashOut: number;
  closingCash: number;
  openingBank: number;
  bankIn: number;
  bankOut: number;
  closingBank: number;
  totalClosingLiquidity: number;
  entryCount: number;
}

export interface DataStoreSnapshot {
  id: string;
  name: string;
  createdAt: string; // ISO string
  transactionsCount: number;
  totalLiquidity: number;
  currency: string;
  data: {
    company: CompanyProfile;
    categories: string[];
    transactions: Transaction[];
  };
}

export interface DataStoreStats {
  transactionsCount: number;
  categoriesCount: number;
  storageSizeBytes: number;
  storageSizeFormatted: string;
  lastSavedAt: string;
  snapshotsCount: number;
}
