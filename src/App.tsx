/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Database,
  CheckCircle2,
} from 'lucide-react';
import {
  Transaction,
  CompanyProfile,
  TransferDirection,
  DataStoreSnapshot,
} from './types';
import {
  loadCompanyProfile,
  saveCompanyProfile,
  loadCategories,
  saveCategories,
  loadTransactions,
  saveTransactions,
  loadSnapshots,
  createSnapshot,
  deleteSnapshot,
  getDataStoreStats,
  calculateDailySummary,
  calculateOverallLiquidity,
  getTodayDateString,
  formatDateToDisplay,
  exportToCSV,
  DEFAULT_COMPANY,
  DEFAULT_CATEGORIES,
} from './utils/storage';
import { Header, ActiveTab } from './components/Header';
import { DataEntryForm } from './components/DataEntryForm';
import { DailySummaryCard } from './components/DailySummaryCards';
import { DailyLedgerTable } from './components/DailyLedgerTable';
import { DailyReportView } from './components/DailyReportView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { DataStoreView } from './components/DataStoreView';
import { PrintDailySheet } from './components/PrintDailySheet';
import { SettingsModal } from './components/SettingsModal';
import { CategoryModal } from './components/CategoryModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast, ToastState } from './components/Toast';

export default function App() {
  // Global State
  const [company, setCompany] = useState<CompanyProfile>(() => loadCompanyProfile());
  const [categories, setCategories] = useState<string[]>(() => loadCategories());
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [snapshots, setSnapshots] = useState<DataStoreSnapshot[]>(() => loadSnapshots());
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [activeTab, setActiveTab] = useState<ActiveTab>('entry');

  // Interactive UI State
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '' });

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    confirmVariant?: 'danger' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  // Balances
  const dailySummary = useMemo(() => {
    return calculateDailySummary(selectedDate, transactions, company);
  }, [selectedDate, transactions, company]);

  const totalOverallLiquidity = useMemo(() => {
    return calculateOverallLiquidity(transactions, company);
  }, [transactions, company]);

  const dataStoreStats = useMemo(() => {
    return getDataStoreStats(company, categories, transactions);
  }, [company, categories, transactions, snapshots]);

  // Standard Transaction Save
  const handleSaveStandard = (data: Omit<Transaction, 'id'>, existingId?: string) => {
    if (existingId) {
      const updated = transactions.map((t) =>
        t.id === existingId ? { ...data, id: existingId } : t
      );
      setTransactions(updated);
      saveTransactions(updated);
      setEditingTransaction(null);
      showToast('Transaction saved to Data Store');
    } else {
      const newTx: Transaction = {
        ...data,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      saveTransactions(updated);
      showToast('Transaction stored successfully');
    }
  };

  // Cash <-> Bank Transfer Contra Save
  const handleSaveTransfer = (
    direction: TransferDirection,
    amount: number,
    reference: string,
    description: string,
    tags: string[],
    date: string,
    time: string
  ) => {
    const pairId = `contra-${Date.now()}`;

    if (direction === 'cash_to_bank') {
      const cashOutTx: Transaction = {
        id: `tx-${Date.now()}-1`,
        date,
        time,
        type: 'cash_out',
        amount,
        category: 'Bank Deposit',
        description: description || 'Cash deposited into bank account',
        reference: reference || 'CASH-DEP',
        paymentMethod: 'Cash',
        tags: [...tags, 'Transfer', 'CashToBank'],
        transferPairId: pairId,
      };

      const bankInTx: Transaction = {
        id: `tx-${Date.now()}-2`,
        date,
        time,
        type: 'bank_in',
        amount,
        category: 'Bank Deposit',
        description: description || 'Cash deposit received at bank',
        reference: reference || 'BANK-DEP',
        paymentMethod: 'Bank Transfer',
        tags: [...tags, 'Transfer', 'CashToBank'],
        transferPairId: pairId,
      };

      const updated = [cashOutTx, bankInTx, ...transactions];
      setTransactions(updated);
      saveTransactions(updated);
      showToast(`Transfer saved to Data Store (${company.currency} ${amount.toFixed(company.decimals)})`);
    } else {
      const bankOutTx: Transaction = {
        id: `tx-${Date.now()}-1`,
        date,
        time,
        type: 'bank_out',
        amount,
        category: 'ATM Withdrawal',
        description: description || 'Cash withdrawn from bank account / ATM',
        reference: reference || 'ATM-WDL',
        paymentMethod: 'Bank Transfer',
        tags: [...tags, 'Transfer', 'BankToCash'],
        transferPairId: pairId,
      };

      const cashInTx: Transaction = {
        id: `tx-${Date.now()}-2`,
        date,
        time,
        type: 'cash_in',
        amount,
        category: 'ATM Withdrawal',
        description: description || 'Cash withdrawal added to cash drawer',
        reference: reference || 'CASH-WDL',
        paymentMethod: 'Cash',
        tags: [...tags, 'Transfer', 'BankToCash'],
        transferPairId: pairId,
      };

      const updated = [bankOutTx, cashInTx, ...transactions];
      setTransactions(updated);
      saveTransactions(updated);
      showToast(`Transfer saved to Data Store (${company.currency} ${amount.toFixed(company.decimals)})`);
    }
  };

  // Edit
  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setActiveTab('entry');
    const el = document.getElementById('data-entry-form-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Duplicate
  const handleDuplicate = (tx: Transaction) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: selectedDate,
      time: new Date().toTimeString().slice(0, 5),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);
    showToast(`Duplicated ${tx.category} entry`);
  };

  // Delete
  const handleDelete = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Transaction?',
      message: `Are you sure you want to permanently delete this ${
        target?.category || 'transaction'
      } (${company.currency} ${target?.amount.toFixed(company.decimals)})?`,
      confirmLabel: 'Delete Entry',
      confirmVariant: 'danger',
      onConfirm: () => {
        let updated: Transaction[];
        if (target?.transferPairId) {
          updated = transactions.filter((t) => t.transferPairId !== target.transferPairId);
          showToast('Deleted contra transfer pair');
        } else {
          updated = transactions.filter((t) => t.id !== id);
          showToast('Transaction removed from Data Store');
        }
        setTransactions(updated);
        saveTransactions(updated);
        if (editingTransaction?.id === id) {
          setEditingTransaction(null);
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Snapshot Handlers
  const handleCreateSnapshot = (name: string) => {
    const snap = createSnapshot(name, company, categories, transactions, totalOverallLiquidity);
    setSnapshots(loadSnapshots());
    showToast(`Data Store snapshot "${snap.name}" saved`);
  };

  const handleRestoreSnapshot = (snapshot: DataStoreSnapshot) => {
    setConfirmModal({
      isOpen: true,
      title: `Restore Snapshot "${snapshot.name}"?`,
      message: `This will restore ${snapshot.transactionsCount} transactions and company configuration saved on ${new Date(snapshot.createdAt).toLocaleString()}.`,
      confirmLabel: 'Restore Snapshot',
      confirmVariant: 'primary',
      onConfirm: () => {
        setCompany(snapshot.data.company);
        setCategories(snapshot.data.categories);
        setTransactions(snapshot.data.transactions);
        saveCompanyProfile(snapshot.data.company);
        saveCategories(snapshot.data.categories);
        saveTransactions(snapshot.data.transactions);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(`Restored snapshot "${snapshot.name}" successfully`);
      },
    });
  };

  const handleDeleteSnapshot = (id: string) => {
    const updated = deleteSnapshot(id);
    setSnapshots(updated);
    showToast('Snapshot removed');
  };

  const handleForceSync = () => {
    saveCompanyProfile(company);
    saveCategories(categories);
    saveTransactions(transactions);
    showToast('All data verified & committed to Data Store');
  };

  // Settings save
  const handleSaveCompany = (updated: CompanyProfile) => {
    setCompany(updated);
    saveCompanyProfile(updated);
    showToast('Company profile & balances saved to Data Store');
  };

  const handleSaveCategories = (updated: string[]) => {
    setCategories(updated);
    saveCategories(updated);
  };

  const handleQuickAddCategory = (newCat: string) => {
    const updated = [...categories, newCat];
    setCategories(updated);
    saveCategories(updated);
    showToast(`Category "${newCat}" stored`);
  };

  // Export & Print
  const handlePrint = () => {
    window.print();
  };

  const handleExportTodayCsv = () => {
    exportToCSV(transactions, selectedDate);
    showToast(`Exported CSV for ${selectedDate}`);
  };

  const handleExportAllCsv = () => {
    exportToCSV(transactions);
    showToast('Exported complete ledger to CSV');
  };

  const handleExportJson = () => {
    const data = {
      company,
      categories,
      transactions,
      snapshots,
      exportedAt: new Date().toISOString(),
      version: '2.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ledger_DataStore_Backup_${selectedDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Data Store JSON backup downloaded');
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.company) {
          setCompany(parsed.company);
          saveCompanyProfile(parsed.company);
        }
        if (Array.isArray(parsed.categories)) {
          setCategories(parsed.categories);
          saveCategories(parsed.categories);
        }
        if (Array.isArray(parsed.transactions)) {
          setTransactions(parsed.transactions);
          saveTransactions(parsed.transactions);
        }
        if (Array.isArray(parsed.snapshots)) {
          setSnapshots(parsed.snapshots);
          localStorage.setItem('cb_datastore_snapshots_v2', JSON.stringify(parsed.snapshots));
        }
        showToast('Data Store restored successfully');
      } catch (err) {
        console.error('Import failed', err);
        showToast('Invalid backup JSON format', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAllData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset All Data Store Records?',
      message:
        'Warning: This action will erase all transactions, restore default categories, and reset opening balances. Please make sure you have downloaded a backup.',
      confirmLabel: 'Reset Data Store',
      confirmVariant: 'danger',
      onConfirm: () => {
        localStorage.clear();
        setCompany(DEFAULT_COMPANY);
        setCategories(DEFAULT_CATEGORIES);
        setTransactions([]);
        setSnapshots([]);
        saveCompanyProfile(DEFAULT_COMPANY);
        saveCategories(DEFAULT_CATEGORIES);
        saveTransactions([]);
        setEditingTransaction(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setIsSettingsOpen(false);
        showToast('Data Store reset to default initial state');
      },
    });
  };

  const handleTodayClick = () => {
    setSelectedDate(getTodayDateString());
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar with Data Store Tab */}
      <Header
        company={company}
        totalLiquidity={totalOverallLiquidity}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewEntryClick={() => {
          setActiveTab('entry');
          const el = document.getElementById('data-entry-form-container');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
      />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 no-print">
        {/* Page Sub-Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeTab === 'entry' && 'Data Entry Console'}
                {activeTab === 'daily_report' && 'Daily Ledger Statement'}
                {activeTab === 'monthly_report' && 'Monthly Overview'}
                {activeTab === 'data_store' && 'Data Store Console'}
              </h1>
              {activeTab === 'entry' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('data_store')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/30 transition cursor-pointer"
                  title="View Data Store status & backups"
                >
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>Data Store Active</span>
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {activeTab === 'entry' &&
                'Record cash in, cash out, received bank, and bank out transactions'}
              {activeTab === 'daily_report' &&
                'Audit breakdown of opening balances, inflows, outflows, and closing liquidity'}
              {activeTab === 'monthly_report' &&
                'Monthly cash & bank flow distribution and category analytics'}
              {activeTab === 'data_store' &&
                'Persistence metrics, snapshots, automated backup, and data recovery'}
            </p>
          </div>

          {/* Date Selector Island */}
          {activeTab !== 'data_store' && (
            <div className="flex items-center space-x-2 bg-[#0d1627] border border-[#1b2840] rounded-2xl px-3.5 py-2 shadow-md">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400 text-xs">Entry Date:</span>
                <div className="relative flex items-center">
                  <span className="text-white font-mono font-bold text-sm tracking-wide">
                    {formatDateToDisplay(selectedDate)}
                  </span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-1 pl-2 border-l border-[#1b2840]">
                <button
                  type="button"
                  onClick={handlePrevDay}
                  title="Previous Day"
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleTodayClick}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedDate === getTodayDateString()
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-[#152238] hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNextDay}
                  title="Next Day"
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'data_store' && (
            <div className="flex items-center space-x-2 bg-[#0d1627] border border-[#1b2840] rounded-2xl px-3.5 py-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-semibold">Continuous Auto-Save:</span>
              <span className="text-emerald-400 font-mono font-bold">Enabled</span>
            </div>
          )}
        </div>

        {/* Tab 1: DATA ENTRY CONSOLE */}
        {activeTab === 'entry' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form */}
            <div className="lg:col-span-7">
              <DataEntryForm
                company={company}
                categories={categories}
                selectedDate={selectedDate}
                editingTransaction={editingTransaction}
                onSaveStandard={handleSaveStandard}
                onSaveTransfer={handleSaveTransfer}
                onCancelEdit={() => setEditingTransaction(null)}
                onOpenQuickAddCategory={() => setIsCategoryModalOpen(true)}
              />
            </div>

            {/* Right Column: Summary of the Day + Entries for [Date] */}
            <div className="lg:col-span-5 space-y-6">
              <DailySummaryCard
                summary={dailySummary}
                company={company}
                selectedDate={selectedDate}
              />

              <DailyLedgerTable
                transactions={transactions}
                selectedDate={selectedDate}
                company={company}
                activeEditingId={editingTransaction?.id}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onExportDayCsv={handleExportTodayCsv}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Daily Report Summary */}
        {activeTab === 'daily_report' && (
          <DailyReportView
            company={company}
            summary={dailySummary}
            transactions={transactions}
            selectedDate={selectedDate}
            onPrint={handlePrint}
            onExportCsv={handleExportTodayCsv}
          />
        )}

        {/* Tab 3: Monthly Summary */}
        {activeTab === 'monthly_report' && (
          <MonthlyReportView
            company={company}
            transactions={transactions}
            currentDate={selectedDate}
          />
        )}

        {/* Tab 4: DATA STORE CONSOLE (NEW) */}
        {activeTab === 'data_store' && (
          <DataStoreView
            company={company}
            categories={categories}
            transactions={transactions}
            snapshots={snapshots}
            stats={dataStoreStats}
            totalLiquidity={totalOverallLiquidity}
            onCreateSnapshot={handleCreateSnapshot}
            onRestoreSnapshot={handleRestoreSnapshot}
            onDeleteSnapshot={handleDeleteSnapshot}
            onExportJson={handleExportJson}
            onExportAllCsv={handleExportAllCsv}
            onImportJson={handleImportJson}
            onResetAllData={handleResetAllData}
            onForceSync={handleForceSync}
          />
        )}
      </main>

      {/* Printable A4 Daily Sheet */}
      <PrintDailySheet
        company={company}
        summary={dailySummary}
        transactions={transactions}
        selectedDate={selectedDate}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        company={company}
        categories={categories}
        onClose={() => setIsSettingsOpen(false)}
        onSaveCompany={handleSaveCompany}
        onSaveCategories={handleSaveCategories}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onExportAllCsv={handleExportAllCsv}
        onResetAllData={handleResetAllData}
      />

      {/* Quick Add Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        existingCategories={categories}
        onClose={() => setIsCategoryModalOpen(false)}
        onAdd={handleQuickAddCategory}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        confirmVariant={confirmModal.confirmVariant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Feedback Toast */}
      <Toast toast={toast} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />
    </div>
  );
}
