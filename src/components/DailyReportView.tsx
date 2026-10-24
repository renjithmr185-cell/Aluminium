import React, { useState, useMemo } from 'react';
import { Printer, Download, Search, Filter } from 'lucide-react';
import { Transaction, DailySummary, CompanyProfile, TransactionType } from '../types';
import { formatCurrency } from '../utils/storage';

interface DailyReportViewProps {
  company: CompanyProfile;
  summary: DailySummary;
  transactions: Transaction[];
  selectedDate: string;
  onPrint: () => void;
  onExportCsv: () => void;
}

export const DailyReportView: React.FC<DailyReportViewProps> = ({
  company,
  summary,
  transactions,
  selectedDate,
  onPrint,
  onExportCsv,
}) => {
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [search, setSearch] = useState('');

  const dayTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === selectedDate);
  }, [transactions, selectedDate]);

  const filtered = useMemo(() => {
    return dayTransactions.filter((t) => {
      const matchType = filterType === 'all' || t.type === filterType;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.category.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.reference && t.reference.toLowerCase().includes(q)) ||
        (t.paymentMethod && t.paymentMethod.toLowerCase().includes(q));
      return matchType && matchSearch;
    });
  }, [dayTransactions, filterType, search]);

  const currency = company.currency;
  const decimals = company.decimals;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0d1627] rounded-2xl border border-[#1b2840] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Daily Report Summary
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete daily ledger statement and opening/closing cash &amp; bank balances for {selectedDate}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onPrint}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print A4 Statement</span>
          </button>

          <button
            onClick={onExportCsv}
            className="bg-[#111c30] hover:bg-[#18263f] text-slate-200 border border-[#1b2840] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Account Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cash Box */}
        <div className="bg-[#0d1627] border border-[#1b2840] rounded-2xl p-5 space-y-2.5 text-xs">
          <div className="font-bold text-slate-200 uppercase pb-2 border-b border-[#18263e] flex justify-between">
            <span>Cash Drawer Account</span>
            <span className="text-emerald-400 font-mono">Day Statement</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Start of Day Opening Cash:</span>
            <span className="font-mono text-white font-semibold">
              {formatCurrency(summary.openingCash, currency, decimals)}
            </span>
          </div>
          <div className="flex justify-between text-emerald-400 font-medium">
            <span>(+) Total Cash In:</span>
            <span className="font-mono font-bold">
              +{formatCurrency(summary.cashIn, currency, decimals)}
            </span>
          </div>
          <div className="flex justify-between text-rose-400 font-medium">
            <span>(-) Total Cash Out:</span>
            <span className="font-mono font-bold">
              -{formatCurrency(summary.cashOut, currency, decimals)}
            </span>
          </div>
          <div className="pt-2 border-t border-[#18263e] flex justify-between font-bold text-sm text-white">
            <span>End of Day Closing Cash:</span>
            <span className="font-mono text-emerald-400">
              {formatCurrency(summary.closingCash, currency, decimals)}
            </span>
          </div>
        </div>

        {/* Bank Box */}
        <div className="bg-[#0d1627] border border-[#1b2840] rounded-2xl p-5 space-y-2.5 text-xs">
          <div className="font-bold text-slate-200 uppercase pb-2 border-b border-[#18263e] flex justify-between">
            <span>Bank Account</span>
            <span className="text-sky-400 font-mono">Day Statement</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Start of Day Opening Bank:</span>
            <span className="font-mono text-white font-semibold">
              {formatCurrency(summary.openingBank, currency, decimals)}
            </span>
          </div>
          <div className="flex justify-between text-sky-400 font-medium">
            <span>(+) Total Received Bank:</span>
            <span className="font-mono font-bold">
              +{formatCurrency(summary.bankIn, currency, decimals)}
            </span>
          </div>
          <div className="flex justify-between text-purple-400 font-medium">
            <span>(-) Total Bank Out:</span>
            <span className="font-mono font-bold">
              -{formatCurrency(summary.bankOut, currency, decimals)}
            </span>
          </div>
          <div className="pt-2 border-t border-[#18263e] flex justify-between font-bold text-sm text-white">
            <span>End of Day Closing Bank:</span>
            <span className="font-mono text-sky-400">
              {formatCurrency(summary.closingBank, currency, decimals)}
            </span>
          </div>
        </div>
      </div>

      {/* Combined Day Closing Total */}
      <div className="bg-[#0b1424] border border-[#18263e] rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-bold text-slate-400">
            Combined End of Day Closing Liquidity
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
            {formatCurrency(summary.totalClosingLiquidity, currency, decimals)}
          </div>
        </div>
        <span className="text-xs font-mono bg-[#142238] text-slate-300 px-3 py-1 rounded-lg">
          {summary.entryCount} total entries
        </span>
      </div>

      {/* Itemized Day Table */}
      <div className="bg-[#0d1627] border border-[#1b2840] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-white text-base">
            Day Transactions Register ({filtered.length})
          </h3>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter entries..."
                className="pl-8 pr-3 py-1.5 bg-[#080f1d] border border-[#1b2840] rounded-lg text-xs text-white placeholder:text-slate-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-1.5 bg-[#080f1d] border border-[#1b2840] rounded-lg text-xs text-white"
            >
              <option value="all">All Types</option>
              <option value="cash_in">Cash In</option>
              <option value="cash_out">Cash Out</option>
              <option value="bank_in">Bank In</option>
              <option value="bank_out">Bank Out</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#1b2840]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080f1d] text-slate-400 uppercase font-bold text-[11px] border-b border-[#1b2840]">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Category / Description</th>
                <th className="py-2.5 px-3">Voucher Ref</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3 text-right">Inflow (+)</th>
                <th className="py-2.5 px-3 text-right">Outflow (-)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#142033]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No transactions match the selected criteria for this day.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isInflow = t.type === 'cash_in' || t.type === 'bank_in';
                  return (
                    <tr key={t.id} className="hover:bg-[#080f1d]/50">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{t.time}</td>
                      <td className="py-2.5 px-3 font-bold uppercase text-[11px]">
                        {t.type.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-white block">{t.category}</span>
                        {t.description && <span className="text-slate-400 text-[11px]">{t.description}</span>}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{t.reference || '—'}</td>
                      <td className="py-2.5 px-3 text-slate-400">{t.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        {isInflow ? `+${formatCurrency(t.amount, currency, decimals)}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">
                        {!isInflow ? `-${formatCurrency(t.amount, currency, decimals)}` : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
