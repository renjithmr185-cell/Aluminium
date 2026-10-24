import React, { useState, useEffect, useRef } from 'react';
import {
  PlusCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Building,
  CreditCard,
  Plus,
  ArrowLeftRight,
  Save,
  RotateCcw,
  X,
  Tag,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  EntryMode,
  TransferDirection,
  PaymentMethod,
  CompanyProfile,
} from '../types';
import { getCurrentTimeString, PAYMENT_METHODS } from '../utils/storage';

interface DataEntryFormProps {
  company: CompanyProfile;
  categories: string[];
  selectedDate: string;
  editingTransaction: Transaction | null;
  onSaveStandard: (tx: Omit<Transaction, 'id'>, id?: string) => void;
  onSaveTransfer: (
    direction: TransferDirection,
    amount: number,
    reference: string,
    description: string,
    tags: string[],
    date: string,
    time: string
  ) => void;
  onCancelEdit: () => void;
  onOpenQuickAddCategory: () => void;
}

export const DataEntryForm: React.FC<DataEntryFormProps> = ({
  company,
  categories,
  selectedDate,
  editingTransaction,
  onSaveStandard,
  onSaveTransfer,
  onCancelEdit,
  onOpenQuickAddCategory,
}) => {
  const [entryMode, setEntryMode] = useState<EntryMode>('standard');

  // Standard Form State
  const [type, setType] = useState<TransactionType>('cash_in');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>(categories[0] || 'Salary & Earnings');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [reference, setReference] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);

  // Transfer Form State
  const [transferDirection, setTransferDirection] = useState<TransferDirection>('cash_to_bank');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferRef, setTransferRef] = useState<string>('');
  const [transferDesc, setTransferDesc] = useState<string>('');
  const [transferTagInput, setTransferTagInput] = useState<string>('');
  const [transferTags, setTransferTags] = useState<string[]>([]);

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Sync category if list changes
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [categories, category]);

  // Sync when editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      setEntryMode('standard');
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setPaymentMethod(editingTransaction.paymentMethod || 'Cash');
      setReference(editingTransaction.reference || '');
      setDescription(editingTransaction.description || '');
      setTags(editingTransaction.tags || []);
      setTimeout(() => amountInputRef.current?.focus(), 60);
    }
  }, [editingTransaction]);

  const handleTypeSelect = (newType: TransactionType) => {
    setType(newType);
    if (!editingTransaction) {
      if (newType === 'cash_in' || newType === 'cash_out') {
        setPaymentMethod('Cash');
      } else {
        setPaymentMethod('Bank Transfer');
      }
    }
  };

  const handleAddTag = () => {
    const val = tagInput.trim().replace(/^#/, '');
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddTransferTag = () => {
    const val = transferTagInput.trim().replace(/^#/, '');
    if (val && !transferTags.includes(val)) {
      setTransferTags([...transferTags, val]);
      setTransferTagInput('');
    }
  };

  const handleRemoveTransferTag = (tagToRemove: string) => {
    setTransferTags(transferTags.filter((t) => t !== tagToRemove));
  };

  const resetForm = () => {
    setType('cash_in');
    setAmount('');
    if (categories.length > 0) setCategory(categories[0]);
    setPaymentMethod('Cash');
    setReference('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setTransferAmount('');
    setTransferRef('');
    setTransferDesc('');
    setTransferTags([]);
    setTransferTagInput('');
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      amountInputRef.current?.focus();
      return;
    }

    onSaveStandard(
      {
        date: selectedDate,
        time: getCurrentTimeString(),
        type,
        amount: num,
        category: category || (categories[0] ?? 'General'),
        description: description.trim(),
        reference: reference.trim(),
        paymentMethod,
        tags,
      },
      editingTransaction?.id
    );

    if (!editingTransaction) {
      setAmount('');
      setDescription('');
      setReference('');
      setTags([]);
      setTimeout(() => amountInputRef.current?.focus(), 50);
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(transferAmount);
    if (isNaN(num) || num <= 0) {
      return;
    }

    onSaveTransfer(
      transferDirection,
      num,
      transferRef.trim(),
      transferDesc.trim() ||
        (transferDirection === 'cash_to_bank'
          ? 'Cash deposited to bank account'
          : 'Cash withdrawn from bank / ATM'),
      transferTags,
      selectedDate,
      getCurrentTimeString()
    );

    setTransferAmount('');
    setTransferRef('');
    setTransferDesc('');
    setTransferTags([]);
  };

  const isEditing = Boolean(editingTransaction);

  return (
    <div
      id="data-entry-form-container"
      className="bg-[#0d1627] rounded-2xl border border-[#1b2840] shadow-xl p-5 sm:p-6"
    >
      {/* Form Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#18263e] mb-5">
        <div className="flex items-center space-x-2.5">
          <PlusCircle className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
            {isEditing ? 'Edit Ledger Transaction' : 'New Ledger Transaction'}
          </h2>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel Edit</span>
          </button>
        )}
      </div>

      {/* Top Segmented Mode Switcher (Standard vs Cash <-> Bank Transfer) */}
      {!isEditing && (
        <div className="bg-[#080e1b] p-1 rounded-xl border border-[#18263e] grid grid-cols-2 gap-1 mb-5">
          <button
            type="button"
            onClick={() => setEntryMode('standard')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
              entryMode === 'standard'
                ? 'bg-[#18253b] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Standard Transaction</span>
          </button>

          <button
            type="button"
            onClick={() => setEntryMode('transfer')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
              entryMode === 'transfer'
                ? 'bg-[#18253b] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cash ⇄ Bank Transfer</span>
          </button>
        </div>
      )}

      {/* Standard Transaction Form */}
      {entryMode === 'standard' ? (
        <form onSubmit={handleStandardSubmit} className="space-y-4">
          {/* SELECT TRANSACTION TYPE * */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Transaction Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Cash In */}
              <button
                type="button"
                onClick={() => handleTypeSelect('cash_in')}
                className={`p-3 rounded-xl border-2 text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'cash_in'
                    ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400 shadow-sm'
                    : 'border-[#1b2840] hover:border-slate-700 bg-[#080f1d] text-slate-400'
                }`}
              >
                <ArrowDownCircle className={`w-5 h-5 ${type === 'cash_in' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold block leading-tight">Cash In</span>
              </button>

              {/* Cash Out */}
              <button
                type="button"
                onClick={() => handleTypeSelect('cash_out')}
                className={`p-3 rounded-xl border-2 text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'cash_out'
                    ? 'border-rose-500 bg-rose-950/30 text-rose-400 shadow-sm'
                    : 'border-[#1b2840] hover:border-slate-700 bg-[#080f1d] text-slate-400'
                }`}
              >
                <ArrowUpCircle className={`w-5 h-5 ${type === 'cash_out' ? 'text-rose-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold block leading-tight">Cash Out</span>
              </button>

              {/* Received Bank */}
              <button
                type="button"
                onClick={() => handleTypeSelect('bank_in')}
                className={`p-3 rounded-xl border-2 text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'bank_in'
                    ? 'border-sky-500 bg-sky-950/30 text-sky-400 shadow-sm'
                    : 'border-[#1b2840] hover:border-slate-700 bg-[#080f1d] text-slate-400'
                }`}
              >
                <Building className={`w-5 h-5 ${type === 'bank_in' ? 'text-sky-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold block leading-tight">Received Bank</span>
              </button>

              {/* Bank Out */}
              <button
                type="button"
                onClick={() => handleTypeSelect('bank_out')}
                className={`p-3 rounded-xl border-2 text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'bank_out'
                    ? 'border-purple-500 bg-purple-950/30 text-purple-400 shadow-sm'
                    : 'border-[#1b2840] hover:border-slate-700 bg-[#080f1d] text-slate-400'
                }`}
              >
                <CreditCard className={`w-5 h-5 ${type === 'bank_out' ? 'text-purple-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold block leading-tight">Bank Out</span>
              </button>
            </div>
          </div>

          {/* ROW 1: AMOUNT & CATEGORY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label htmlFor="tx-amount" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Amount ({company.currency}) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold font-mono text-xs">
                  {company.currency}
                </span>
                <input
                  id="tx-amount"
                  ref={amountInputRef}
                  type="number"
                  step={company.decimals === 3 ? '0.001' : '0.01'}
                  min="0.001"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={company.decimals === 3 ? '0.000' : '0.00'}
                  className="w-full pl-16 pr-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="tx-category" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={onOpenQuickAddCategory}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add New</span>
                </button>
              </div>
              <select
                id="tx-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#080f1d] text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ROW 2: PAYMENT METHOD & REFERENCE / RECEIPT # */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Method */}
            <div>
              <label htmlFor="tx-payment-method" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select
                id="tx-payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method} className="bg-[#080f1d] text-white">
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {/* Reference / Receipt # */}
            <div>
              <label htmlFor="tx-ref-input" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Reference / Receipt #
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-sm">
                  #
                </span>
                <input
                  id="tx-ref-input"
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. REC-8492"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* ROW 3: DESCRIPTION / PURPOSE */}
          <div>
            <label htmlFor="tx-desc-input" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Description / Purpose
            </label>
            <input
              id="tx-desc-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Weekly grocery haul, Consulting income from client..."
              className="w-full px-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600"
            />
          </div>

          {/* ROW 4: TAGS & LABELS (Exact match from screenshot) */}
          <div>
            <label htmlFor="tx-tags-input" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Tags &amp; Labels
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="tx-tags-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag and press enter (e.g. Tax, Vacation)"
                className="flex-1 px-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-[#18253b] hover:bg-[#20324f] text-slate-200 border border-[#243755] px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
              >
                <span>+ Tag</span>
              </button>
            </div>

            {/* Render active tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-[#15233c] text-emerald-300 border border-[#203352] px-2.5 py-0.5 rounded-lg text-xs font-medium"
                  >
                    <Tag className="w-3 h-3 text-emerald-400" />
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-slate-400 hover:text-white ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center space-x-3 pt-3">
            <button
              type="submit"
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 text-sm cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>{isEditing ? 'Update Transaction' : 'Save Transaction'}</span>
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-3 bg-[#111c30] hover:bg-[#18263f] text-slate-300 font-semibold rounded-xl text-sm border border-[#1b2840] transition flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </form>
      ) : (
        /* Cash <-> Bank Transfer Form */
        <form onSubmit={handleTransferSubmit} className="space-y-4">
          <div className="bg-[#091120] border border-[#192842] rounded-xl p-3.5 text-xs text-slate-300 flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Record a transfer between your cash drawer and bank account with automated contra accounting.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Transfer Direction *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTransferDirection('cash_to_bank')}
                className={`p-3 rounded-xl border-2 text-left transition flex items-center space-x-3 cursor-pointer ${
                  transferDirection === 'cash_to_bank'
                    ? 'border-sky-500 bg-sky-950/30 text-white'
                    : 'border-[#1b2840] bg-[#080f1d] text-slate-400'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-sky-900/40 text-sky-400 flex items-center justify-center font-bold">
                  ↓
                </div>
                <div>
                  <div className="font-bold text-xs">Deposit Cash into Bank</div>
                  <div className="text-[10px] text-slate-400">Cash Out (-) &amp; Bank In (+)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTransferDirection('bank_to_cash')}
                className={`p-3 rounded-xl border-2 text-left transition flex items-center space-x-3 cursor-pointer ${
                  transferDirection === 'bank_to_cash'
                    ? 'border-emerald-500 bg-emerald-950/30 text-white'
                    : 'border-[#1b2840] bg-[#080f1d] text-slate-400'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-900/40 text-emerald-400 flex items-center justify-center font-bold">
                  ↑
                </div>
                <div>
                  <div className="font-bold text-xs">Withdraw Cash from Bank / ATM</div>
                  <div className="text-[10px] text-slate-400">Bank Out (-) &amp; Cash In (+)</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tx-transfer-amount" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Transfer Amount ({company.currency}) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold font-mono text-xs">
                  {company.currency}
                </span>
                <input
                  id="tx-transfer-amount"
                  type="number"
                  step={company.decimals === 3 ? '0.001' : '0.01'}
                  min="0.001"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder={company.decimals === 3 ? '0.000' : '0.00'}
                  className="w-full pl-16 pr-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tx-transfer-ref" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Reference / Slip #
              </label>
              <input
                id="tx-transfer-ref"
                type="text"
                value={transferRef}
                onChange={(e) => setTransferRef(e.target.value)}
                placeholder="e.g. ATM-SLIP-401, DEP-998"
                className="w-full px-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="tx-transfer-desc" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <input
              id="tx-transfer-desc"
              type="text"
              value={transferDesc}
              onChange={(e) => setTransferDesc(e.target.value)}
              placeholder="e.g. Replenish petty cash drawer, Branch deposit slip #89"
              className="w-full px-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600"
            />
          </div>

          <div>
            <label htmlFor="tx-transfer-tags" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Tags &amp; Labels
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="tx-transfer-tags"
                type="text"
                value={transferTagInput}
                onChange={(e) => setTransferTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTransferTag();
                  }
                }}
                placeholder="Add tag and press enter (e.g. Contra, PettyCash)"
                className="flex-1 px-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={handleAddTransferTag}
                className="bg-[#18253b] hover:bg-[#20324f] text-slate-200 border border-[#243755] px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
              >
                <span>+ Tag</span>
              </button>
            </div>

            {transferTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {transferTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-[#15233c] text-sky-300 border border-[#203352] px-2.5 py-0.5 rounded-lg text-xs font-medium"
                  >
                    <Tag className="w-3 h-3 text-sky-400" />
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTransferTag(t)}
                      className="text-slate-400 hover:text-white ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 pt-3">
            <button
              type="submit"
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 text-sm cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4 text-slate-950" />
              <span>Record Transfer</span>
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-3 bg-[#111c30] hover:bg-[#18263f] text-slate-300 font-semibold rounded-xl text-sm border border-[#1b2840] transition flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
