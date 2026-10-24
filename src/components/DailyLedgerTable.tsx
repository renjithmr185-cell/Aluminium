import React, { useMemo } from 'react';
import {
  FileText,
  Edit2,
  Trash2,
  Copy,
  ArrowDownCircle,
  ArrowUpCircle,
  Building,
  CreditCard,
  Tag,
  Download,
} from 'lucide-react';
import { Transaction, TransactionType, CompanyProfile } from '../types';
import { formatCurrency } from '../utils/storage';

interface DailyLedgerTableProps {
  transactions: Transaction[];
  selectedDate: string;
  company: CompanyProfile;
  activeEditingId?: string;
  onEdit: (tx: Transaction) => void;
  onDuplicate: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onExportDayCsv: () => void;
}

export const DailyLedgerTable: React.FC<DailyLedgerTableProps> = ({
  transactions,
  selectedDate,
  company,
  activeEditingId,
  onEdit,
  onDuplicate,
  onDelete,
  onExportDayCsv,
}) => {
  const dayTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === selectedDate);
  }, [transactions, selectedDate]);

  const currency = company.currency;
  const decimals = company.decimals;

  const getTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'cash_in':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded-md">
            <ArrowDownCircle className="w-3 h-3 text-emerald-400" />
            <span>Cash In</span>
          </span>
        );
      case 'cash_out':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/40 border border-rose-800/60 px-2 py-0.5 rounded-md">
            <ArrowUpCircle className="w-3 h-3 text-rose-400" />
            <span>Cash Out</span>
          </span>
        );
      case 'bank_in':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 bg-sky-950/40 border border-sky-800/60 px-2 py-0.5 rounded-md">
            <Building className="w-3 h-3 text-sky-400" />
            <span>Received Bank</span>
          </span>
        );
      case 'bank_out':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 bg-purple-950/40 border border-purple-800/60 px-2 py-0.5 rounded-md">
            <CreditCard className="w-3 h-3 text-purple-400" />
            <span>Bank Out</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0d1627] rounded-2xl border border-[#1b2840] shadow-xl p-5 sm:p-6 space-y-4">
      {/* Header (Exact layout from screenshot: ENTRIES FOR 2026-10-22 and 0 entries badge) */}
      <div className="flex items-center justify-between pb-3 border-b border-[#18263e]">
        <h3 className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-white">
          Entries for {selectedDate}
        </h3>
        <div className="flex items-center space-x-2">
          {dayTransactions.length > 0 && (
            <button
              onClick={onExportDayCsv}
              title="Export CSV"
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-[#091120] border border-[#18263e] hover:bg-slate-800 transition cursor-pointer"
            >
              <Download className="w-3 h-3 text-sky-400" />
              <span>CSV</span>
            </button>
          )}
          <span className="bg-[#080f1d] text-slate-300 font-mono text-xs px-3 py-1 rounded-full border border-[#18263e]">
            {dayTransactions.length} entries
          </span>
        </div>
      </div>

      {/* Content Area */}
      {dayTransactions.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#091120] border border-[#18263e] flex items-center justify-center text-slate-600">
            <FileText className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">
              No entries recorded for {selectedDate}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Fill out the form on the left to record your daily cash &amp; bank movements.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {dayTransactions.map((tx) => {
            const isInflow = tx.type === 'cash_in' || tx.type === 'bank_in';
            const isEditing = activeEditingId === tx.id;

            return (
              <div
                key={tx.id}
                className={`p-3.5 bg-[#080f1d] rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isEditing
                    ? 'border-amber-500/80 bg-amber-950/20 ring-1 ring-amber-500/50'
                    : 'border-[#18263e] hover:border-slate-700'
                }`}
              >
                {/* Left Meta & Particulars */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    {getTypeBadge(tx.type)}
                    <span className="font-bold text-white text-xs sm:text-sm">
                      {tx.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {tx.time}
                    </span>
                    <span className="text-[10px] bg-[#121c2f] text-slate-400 px-1.5 py-0.5 rounded border border-[#1c2c47]">
                      {tx.paymentMethod}
                    </span>
                  </div>

                  {tx.description && (
                    <p className="text-xs text-slate-300 leading-snug">
                      {tx.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    {tx.reference && (
                      <span className="text-[10px] font-mono text-slate-400 bg-[#0e1728] px-2 py-0.5 rounded border border-[#1b2840]">
                        Ref: {tx.reference}
                      </span>
                    )}

                    {tx.tags && tx.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {tx.tags.map((tg) => (
                          <span
                            key={tg}
                            className="text-[10px] text-emerald-400/90 flex items-center gap-0.5"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            <span>#{tg}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#142033]">
                  <div className="text-right">
                    <div
                      className={`font-mono font-extrabold text-sm sm:text-base tabular-nums ${
                        isInflow ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isInflow ? '+' : '-'}
                      {formatCurrency(tx.amount, currency, decimals)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 pl-2 border-l border-[#1b2840]">
                    <button
                      type="button"
                      onClick={() => onEdit(tx)}
                      title="Edit transaction"
                      className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-900/40 rounded-lg transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDuplicate(tx)}
                      title="Duplicate transaction"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(tx.id)}
                      title="Delete transaction"
                      className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-900/40 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
