import React from 'react';
import {
  Wallet,
  PenSquare,
  Calendar,
  FileText,
  Database,
  Plus,
  Settings,
} from 'lucide-react';
import { CompanyProfile } from '../types';
import { formatCurrency } from '../utils/storage';

export type ActiveTab = 'entry' | 'daily_report' | 'monthly_report' | 'data_store';

interface HeaderProps {
  company: CompanyProfile;
  totalLiquidity: number;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  onNewEntryClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  totalLiquidity,
  activeTab,
  onTabChange,
  onOpenSettings,
  onNewEntryClick,
}) => {
  return (
    <header className="bg-[#070d18] text-white sticky top-0 z-40 border-b border-[#142033] no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3">
          {/* Brand & Wordmark */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => onTabChange('entry')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
                  {company.name || "Personal & Household Ledger"}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                <span>{company.tagline || "Real-Time Cash & Bank Flow Manager"}</span>
                <span className="text-slate-600">·</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{company.currency || "OMR"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links (Matches screenshot + Data Store Option) */}
          <nav className="hidden md:flex items-center space-x-2">
            {/* Data Entry */}
            <button
              onClick={() => onTabChange('entry')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'entry'
                  ? 'bg-[#0f2d2e] text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#121c2e]'
              }`}
            >
              <PenSquare className="w-4 h-4 text-emerald-400" />
              <span>Data Entry</span>
            </button>

            {/* Daily Report Summary */}
            <button
              onClick={() => onTabChange('daily_report')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'daily_report'
                  ? 'bg-[#0f2d2e] text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#121c2e]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Daily Report</span>
            </button>

            {/* Monthly Summary */}
            <button
              onClick={() => onTabChange('monthly_report')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'monthly_report'
                  ? 'bg-[#0f2d2e] text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#121c2e]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Monthly Summary</span>
            </button>

            {/* Data Store Option */}
            <button
              onClick={() => onTabChange('data_store')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'data_store'
                  ? 'bg-[#0f2d2e] text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#121c2e]'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Data Store</span>
            </button>
          </nav>

          {/* Right Action Island */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Net Liquidity Pill */}
            <div className="bg-[#0b1424] border border-[#18263e] rounded-xl px-3.5 py-1.5 flex flex-col justify-center">
              <div className="flex items-center space-x-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Net Liquidity</span>
              </div>
              <div className="text-xs sm:text-sm font-bold font-mono text-emerald-400 tabular-nums">
                {formatCurrency(totalLiquidity, company.currency, company.decimals)}
              </div>
            </div>

            {/* + Button */}
            <button
              onClick={onNewEntryClick}
              title="Add New Transaction"
              className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center justify-center transition shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              title="Settings & Opening Balances"
              className="w-10 h-10 rounded-xl bg-[#0e1728] hover:bg-[#15233d] text-slate-400 hover:text-white border border-[#1b2840] flex items-center justify-center transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Submenu Tabs */}
        <div className="md:hidden flex items-center space-x-1 py-2 border-t border-[#142033] overflow-x-auto text-xs">
          <button
            onClick={() => onTabChange('entry')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === 'entry' ? 'bg-[#0f2d2e] text-emerald-400' : 'text-slate-400'
            }`}
          >
            Data Entry
          </button>
          <button
            onClick={() => onTabChange('daily_report')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === 'daily_report' ? 'bg-[#0f2d2e] text-emerald-400' : 'text-slate-400'
            }`}
          >
            Daily Report
          </button>
          <button
            onClick={() => onTabChange('monthly_report')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === 'monthly_report' ? 'bg-[#0f2d2e] text-emerald-400' : 'text-slate-400'
            }`}
          >
            Monthly Summary
          </button>
          <button
            onClick={() => onTabChange('data_store')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === 'data_store' ? 'bg-[#0f2d2e] text-emerald-400' : 'text-slate-400'
            }`}
          >
            Data Store
          </button>
        </div>
      </div>
    </header>
  );
};
