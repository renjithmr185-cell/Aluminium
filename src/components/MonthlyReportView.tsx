import React, { useState, useMemo } from 'react';
import { Download, CalendarDays, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction, CompanyProfile } from '../types';
import { formatCurrency } from '../utils/storage';

interface MonthlyReportViewProps {
  company: CompanyProfile;
  transactions: Transaction[];
  currentDate: string;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  company,
  transactions,
  currentDate,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => currentDate.slice(0, 7));

  const currency = company.currency;
  const decimals = company.decimals;

  // Transactions within selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Aggregate monthly totals
  const monthlyMetrics = useMemo(() => {
    let totalCashIn = 0;
    let totalCashOut = 0;
    let totalBankIn = 0;
    let totalBankOut = 0;

    for (const t of monthTransactions) {
      if (t.type === 'cash_in') totalCashIn += t.amount;
      else if (t.type === 'cash_out') totalCashOut += t.amount;
      else if (t.type === 'bank_in') totalBankIn += t.amount;
      else if (t.type === 'bank_out') totalBankOut += t.amount;
    }

    const totalInflow = totalCashIn + totalBankIn;
    const totalOutflow = totalCashOut + totalBankOut;
    const netSavings = totalInflow - totalOutflow;

    return {
      totalCashIn,
      totalCashOut,
      totalBankIn,
      totalBankOut,
      totalInflow,
      totalOutflow,
      netSavings,
      count: monthTransactions.length,
    };
  }, [monthTransactions]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { in: number; out: number }>();
    for (const t of monthTransactions) {
      const cur = map.get(t.category) || { in: 0, out: 0 };
      if (t.type === 'cash_in' || t.type === 'bank_in') {
        cur.in += t.amount;
      } else {
        cur.out += t.amount;
      }
      map.set(t.category, cur);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].out + b[1].in - (a[1].out + a[1].in));
  }, [monthTransactions]);

  return (
    <div className="space-y-6">
      {/* Top Bar with Month Picker */}
      <div className="bg-[#0d1627] rounded-2xl border border-[#1b2840] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Monthly Summary &amp; Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregate inflow, outflow, and net cash flow for the selected month
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <CalendarDays className="w-4 h-4 text-emerald-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 bg-[#080f1d] border border-[#1b2840] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Month Inflows */}
        <div className="bg-[#0d1627] border border-[#1b2840] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Total Month Inflows</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-2 tabular-nums">
            +{formatCurrency(monthlyMetrics.totalInflow, currency, decimals)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
            <span>Cash In: {formatCurrency(monthlyMetrics.totalCashIn, currency, decimals)}</span>
            <span>Bank In: {formatCurrency(monthlyMetrics.totalBankIn, currency, decimals)}</span>
          </div>
        </div>

        {/* Total Month Outflows */}
        <div className="bg-[#0d1627] border border-[#1b2840] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Total Month Outflows</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono mt-2 tabular-nums">
            -{formatCurrency(monthlyMetrics.totalOutflow, currency, decimals)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
            <span>Cash Out: {formatCurrency(monthlyMetrics.totalCashOut, currency, decimals)}</span>
            <span>Bank Out: {formatCurrency(monthlyMetrics.totalBankOut, currency, decimals)}</span>
          </div>
        </div>

        {/* Net Monthly Flow */}
        <div className="bg-[#0d1627] border border-[#1b2840] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Net Monthly Flow</span>
            <span className="text-[10px] font-mono bg-[#080f1d] px-2 py-0.5 rounded text-slate-400 border border-[#1b2840]">
              {monthlyMetrics.count} txs
            </span>
          </div>
          <div
            className={`text-2xl font-extrabold font-mono mt-2 tabular-nums ${
              monthlyMetrics.netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {monthlyMetrics.netSavings >= 0 ? '+' : ''}
            {formatCurrency(monthlyMetrics.netSavings, currency, decimals)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Combined cash and bank net change for {selectedMonth}
          </p>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-[#0d1627] border border-[#1b2840] rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-white text-base">
          Category Distribution for {selectedMonth}
        </h3>

        {categoryBreakdown.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No transactions recorded in {selectedMonth}.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#1b2840]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080f1d] text-slate-400 uppercase font-bold text-[11px] border-b border-[#1b2840]">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Inflow Total (+)</th>
                  <th className="py-2.5 px-3 text-right">Outflow Total (-)</th>
                  <th className="py-2.5 px-3 text-right">Net Category Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#142033]">
                {categoryBreakdown.map(([cat, val]) => {
                  const net = val.in - val.out;
                  return (
                    <tr key={cat} className="hover:bg-[#080f1d]/50">
                      <td className="py-2.5 px-3 font-semibold text-white">{cat}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                        {val.in > 0 ? `+${formatCurrency(val.in, currency, decimals)}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                        {val.out > 0 ? `-${formatCurrency(val.out, currency, decimals)}` : '—'}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-bold ${
                          net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {net >= 0 ? '+' : ''}
                        {formatCurrency(net, currency, decimals)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
