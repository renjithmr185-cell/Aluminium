import {
  CompanyProfile,
  DailySummary,
  Transaction,
  DataStoreSnapshot,
  DataStoreStats,
} from '../types';

export const DEFAULT_COMPANY: CompanyProfile = {
  name: "Personal & Household Ledger",
  tagline: "Real-Time Cash & Bank Flow Manager",
  address: "Muscat, Sultanate of Oman",
  phone: "+968 9123 4567",
  email: "accounts@ledger.local",
  taxId: "OM-TAX-98231",
  currency: "OMR",
  decimals: 3,
  baseOpeningCash: 350.0,
  baseOpeningBank: 4200.0,
};

export const DEFAULT_CATEGORIES: string[] = [
  "Salary & Earnings",
  "Sales Revenue",
  "Client Payment",
  "Groceries & Household",
  "Utilities & Bills",
  "Rent & Housing",
  "Dining & Food",
  "Transportation & Fuel",
  "Healthcare & Medical",
  "Shopping & Personal",
  "Bank Deposit",
  "ATM Withdrawal",
  "Investments & Savings",
  "Miscellaneous Expense",
];

export const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "Cheque",
  "Card POS",
  "Online",
  "Other",
];

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDateToDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10) - 1;
  const day = parts[2];
  const dateObj = new Date(parseInt(year, 10), month, parseInt(day, 10));
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day}-${monthNames[dateObj.getMonth()]}-${year}`;
}

const STORAGE_KEYS = {
  COMPANY: "cb_company_profile_v2",
  CATEGORIES: "cb_ledger_categories_v2",
  TRANSACTIONS: "cb_ledger_transactions_v2",
  SNAPSHOTS: "cb_datastore_snapshots_v2",
  LAST_SAVED: "cb_datastore_last_saved",
};

export function loadCompanyProfile(): CompanyProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANY);
    if (!raw) return DEFAULT_COMPANY;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_COMPANY, ...parsed };
  } catch {
    return DEFAULT_COMPANY;
  }
}

export function saveCompanyProfile(profile: CompanyProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(profile));
    touchLastSaved();
  } catch (err) {
    console.error("Failed to save company profile", err);
  }
}

export function loadCategories(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) return DEFAULT_CATEGORIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    touchLastSaved();
  } catch (err) {
    console.error("Failed to save categories", err);
  }
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTransactions(txs: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
    touchLastSaved();
  } catch (err) {
    console.error("Failed to save transactions", err);
  }
}

function touchLastSaved(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
  } catch {}
}

export function getLastSavedTimestamp(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
    return raw || new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

// Snapshots / Backup restore points
export function loadSnapshots(): DataStoreSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSnapshots(snapshots: DataStoreSnapshot[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
  } catch (err) {
    console.error("Failed to save snapshots", err);
  }
}

export function createSnapshot(
  name: string,
  company: CompanyProfile,
  categories: string[],
  transactions: Transaction[],
  totalLiquidity: number
): DataStoreSnapshot {
  const snapshots = loadSnapshots();
  const newSnapshot: DataStoreSnapshot = {
    id: `snap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim() || `Snapshot ${new Date().toLocaleDateString()}`,
    createdAt: new Date().toISOString(),
    transactionsCount: transactions.length,
    totalLiquidity,
    currency: company.currency,
    data: {
      company,
      categories,
      transactions,
    },
  };
  const updated = [newSnapshot, ...snapshots];
  saveSnapshots(updated);
  return newSnapshot;
}

export function deleteSnapshot(id: string): DataStoreSnapshot[] {
  const snapshots = loadSnapshots();
  const updated = snapshots.filter((s) => s.id !== id);
  saveSnapshots(updated);
  return updated;
}

export function getDataStoreStats(
  company: CompanyProfile,
  categories: string[],
  transactions: Transaction[]
): DataStoreStats {
  const snapshots = loadSnapshots();
  let totalBytes = 0;
  try {
    totalBytes += (localStorage.getItem(STORAGE_KEYS.COMPANY) || '').length * 2;
    totalBytes += (localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '').length * 2;
    totalBytes += (localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '').length * 2;
    totalBytes += (localStorage.getItem(STORAGE_KEYS.SNAPSHOTS) || '').length * 2;
  } catch {
    totalBytes = 2048;
  }

  const kb = totalBytes / 1024;
  const storageSizeFormatted =
    kb >= 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(2)} KB`;

  return {
    transactionsCount: transactions.length,
    categoriesCount: categories.length,
    storageSizeBytes: totalBytes,
    storageSizeFormatted,
    lastSavedAt: getLastSavedTimestamp(),
    snapshotsCount: snapshots.length,
  };
}

export function calculateDailySummary(
  date: string,
  transactions: Transaction[],
  company: CompanyProfile
): DailySummary {
  let priorCashIn = 0;
  let priorCashOut = 0;
  let priorBankIn = 0;
  let priorBankOut = 0;

  let dayCashIn = 0;
  let dayCashOut = 0;
  let dayBankIn = 0;
  let dayBankOut = 0;

  let entryCount = 0;

  for (const t of transactions) {
    if (t.date < date) {
      if (t.type === 'cash_in') priorCashIn += t.amount;
      else if (t.type === 'cash_out') priorCashOut += t.amount;
      else if (t.type === 'bank_in') priorBankIn += t.amount;
      else if (t.type === 'bank_out') priorBankOut += t.amount;
    } else if (t.date === date) {
      entryCount++;
      if (t.type === 'cash_in') dayCashIn += t.amount;
      else if (t.type === 'cash_out') dayCashOut += t.amount;
      else if (t.type === 'bank_in') dayBankIn += t.amount;
      else if (t.type === 'bank_out') dayBankOut += t.amount;
    }
  }

  const openingCash = company.baseOpeningCash + priorCashIn - priorCashOut;
  const openingBank = company.baseOpeningBank + priorBankIn - priorBankOut;

  const closingCash = openingCash + dayCashIn - dayCashOut;
  const closingBank = openingBank + dayBankIn - dayBankOut;

  return {
    date,
    openingCash,
    cashIn: dayCashIn,
    cashOut: dayCashOut,
    closingCash,
    openingBank,
    bankIn: dayBankIn,
    bankOut: dayBankOut,
    closingBank,
    totalClosingLiquidity: closingCash + closingBank,
    entryCount,
  };
}

export function calculateOverallLiquidity(
  transactions: Transaction[],
  company: CompanyProfile
): number {
  let totalCashIn = 0;
  let totalCashOut = 0;
  let totalBankIn = 0;
  let totalBankOut = 0;

  for (const t of transactions) {
    if (t.type === 'cash_in') totalCashIn += t.amount;
    else if (t.type === 'cash_out') totalCashOut += t.amount;
    else if (t.type === 'bank_in') totalBankIn += t.amount;
    else if (t.type === 'bank_out') totalBankOut += t.amount;
  }

  const netCash = company.baseOpeningCash + totalCashIn - totalCashOut;
  const netBank = company.baseOpeningBank + totalBankIn - totalBankOut;
  return netCash + netBank;
}

export function formatCurrency(amount: number, currency: string, decimals: number = 3): string {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const space = currency.length > 1 ? ' ' : '';
  const sign = amount < 0 ? '-' : '';
  return `${sign}${currency}${space}${formatted}`;
}

export function exportToCSV(transactions: Transaction[], dateFilter?: string): void {
  const filtered = dateFilter
    ? transactions.filter((t) => t.date === dateFilter)
    : transactions;

  const headers = [
    "ID",
    "Date",
    "Time",
    "Type",
    "Category",
    "Description",
    "Tags",
    "Reference",
    "Payment Method",
    "Amount",
  ];

  const rows = filtered.map((t) => [
    `"${t.id}"`,
    `"${t.date}"`,
    `"${t.time || ''}"`,
    `"${t.type}"`,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${(t.tags || []).join('; ')}"`,
    `"${(t.reference || '').replace(/"/g, '""')}"`,
    `"${t.paymentMethod}"`,
    t.amount.toFixed(3),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const fileName = dateFilter
    ? `Daily_Cash_Report_${dateFilter}.csv`
    : `All_Transactions_Ledger_${getTodayDateString()}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
