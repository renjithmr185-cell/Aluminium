import React from 'react';
import { Calculator } from 'lucide-react';
import { DailySummary, CompanyProfile } from '../types';
import { formatCurrency } from '../utils/storage';

interface DailySummaryProps {
  summary: DailySummary;
  company: CompanyProfile;
  selectedDate: string;
}

export const DailySummaryCard: React.FC<DailySummaryProps> = ({
  summary,
  company,
  selectedDate,
}) => {
  const currency = company.currency;
  const decimals = company.decimals;

  return (
    <div className="bg-[#0d1627] rounded-2xl border border-[#1b2840] shadow-xl p-5 sm:p-6 space-y-5">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#18263e]">
        <div className="flex items-center space-x-2.5">
          <Calculator className="w-5 h-5 text-emerald-400" />
          <h3 className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-white">
            Summary of the Day
          </h3>
        </div>
        <div className="bg-[#091120] text-emerald-400 border border-[#18263e] px-3 py-1 rounded-lg text-xs font-mono font-bold">
          {selectedDate}
        </div>
      </div>

      {/* 4 Financial Inflow/Outflow Boxes (Exact layout from screenshot) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Cash In */}
        <div className="bg-[#080f1d] p-3.5 sm:p-4 rounded-xl border border-[#1a2842]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Cash In
          </div>
          <div className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono tracking-tight mt-1 tabular-nums">
            +{formatCurrency(summary.cashIn, currency, decimals)}
          </div>
        </div>

        {/* Cash Out */}
        <div className="bg-[#080f1d] p-3.5 sm:p-4 rounded-xl border border-[#1a2842]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Cash Out
          </div>
          <div className="text-base sm:text-lg font-extrabold text-rose-400 font-mono tracking-tight mt-1 tabular-nums">
            -{formatCurrency(summary.cashOut, currency, decimals)}
          </div>
        </div>

        {/* Received Bank */}
        <div className="bg-[#080f1d] p-3.5 sm:p-4 rounded-xl border border-[#1a2842]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Received Bank
          </div>
          <div className="text-base sm:text-lg font-extrabold text-sky-400 font-mono tracking-tight mt-1 tabular-nums">
            +{formatCurrency(summary.bankIn, currency, decimals)}
          </div>
        </div>

        {/* Bank Out */}
        <div className="bg-[#080f1d] p-3.5 sm:p-4 rounded-xl border border-[#1a2842]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Bank Out
          </div>
          <div className="text-base sm:text-lg font-extrabold text-purple-400 font-mono tracking-tight mt-1 tabular-nums">
            -{formatCurrency(summary.bankOut, currency, decimals)}
          </div>
        </div>
      </div>

      {/* Balances Breakdown List (Exact layout from screenshot) */}
      <div className="space-y-2.5 pt-2 text-xs sm:text-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span>Start of Day Cash Opening:</span>
          <span className="font-mono font-semibold text-emerald-400 tabular-nums">
            {formatCurrency(summary.openingCash, currency, decimals)}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>End of Day Cash Closing:</span>
          <span className="font-mono font-bold text-emerald-400 tabular-nums">
            {formatCurrency(summary.closingCash, currency, decimals)}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400 pt-1">
          <span>Start of Day Bank Opening:</span>
          <span className="font-mono font-semibold text-sky-400 tabular-nums">
            {formatCurrency(summary.openingBank, currency, decimals)}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>End of Day Bank Closing:</span>
          <span className="font-mono font-bold text-sky-400 tabular-nums">
            {formatCurrency(summary.closingBank, currency, decimals)}
          </span>
        </div>

        <div className="pt-3 border-t border-[#18263e] flex items-center justify-between">
          <span className="font-bold text-white text-xs sm:text-sm">
            Combined Day Closing:
          </span>
          <span className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono tabular-nums">
            {formatCurrency(summary.totalClosingLiquidity, currency, decimals)}
          </span>
        </div>
      </div>
    </div>
  );
};
