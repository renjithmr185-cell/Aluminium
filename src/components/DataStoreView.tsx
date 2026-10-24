import React, { useState } from 'react';
import {
  Database,
  Save,
  Download,
  Upload,
  RotateCcw,
  Clock,
  HardDrive,
  FileCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  CompanyProfile,
  Transaction,
  DataStoreSnapshot,
  DataStoreStats,
} from '../types';
import { formatCurrency } from '../utils/storage';

interface DataStoreViewProps {
  company: CompanyProfile;
  categories: string[];
  transactions: Transaction[];
  snapshots: DataStoreSnapshot[];
  stats: DataStoreStats;
  totalLiquidity: number;
  onCreateSnapshot: (name: string) => void;
  onRestoreSnapshot: (snapshot: DataStoreSnapshot) => void;
  onDeleteSnapshot: (id: string) => void;
  onExportJson: () => void;
  onExportAllCsv: () => void;
  onImportJson: (file: File) => void;
  onResetAllData: () => void;
  onForceSync: () => void;
}

export const DataStoreView: React.FC<DataStoreViewProps> = ({
  company,
  categories,
  transactions,
  snapshots,
  stats,
  totalLiquidity,
  onCreateSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
  onExportJson,
  onExportAllCsv,
  onImportJson,
  onResetAllData,
  onForceSync,
}) => {
  const [snapshotName, setSnapshotName] = useState('');
  const [justSynced, setJustSynced] = useState(false);

  const handleCreateSnapshotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateSnapshot(snapshotName);
    setSnapshotName('');
  };

  const handleSyncClick = () => {
    onForceSync();
    setJustSynced(true);
    setTimeout(() => setJustSynced(false), 2500);
  };

  const formattedLastSaved = stats.lastSavedAt
    ? new Date(stats.lastSavedAt).toLocaleString()
    : 'Just now';

  return (
    <div className="space-y-6">
      {/* Top Console Banner */}
      <div className="bg-[#0d1627] rounded-2xl border border-[#1b2840] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Offline-First Persistence Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Data Store Management Console
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your ledger database, create instant time-machine snapshots, backup, restore, and verify storage integrity.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleSyncClick}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            {justSynced ? (
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
            ) : (
              <Save className="w-4 h-4 text-slate-950" />
            )}
            <span>{justSynced ? 'Data Store Synced!' : 'Sync to Data Store'}</span>
          </button>
        </div>
      </div>

      {/* 4 Storage Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Records */}
        <div className="bg-[#0d1627] border border-[#1b2840] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Stored Transactions</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums">
            {stats.transactionsCount}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Categories: {stats.categoriesCount}</span>
            <span className="text-slate-600">·</span>
            <span>Profile: Verified</span>
          </div>
        </div>

        {/* Card 2: Total Storage Size */}
        <div className="bg-[#0d1627] border border-[#1b2840] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Data Store Size</span>
            <HardDrive className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-sky-400 font-mono tabular-nums">
            {stats.storageSizeFormatted}
          </div>
          <div className="text-[11px] text-slate-400">
            Engine: LocalStorage + Offline Cache
          </div>
        </div>

        {/* Card 3: Last Auto-Save */}
        <div className="bg-[#0d1627] border border-[#1b2840] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Last Committed</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono truncate">
            {formattedLastSaved}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Auto-Save on every entry</span>
          </div>
        </div>

        {/* Card 4: Snapshots Count */}
        <div className="bg-[#0d1627] border border-[#1b2840] rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Saved Snapshots</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">
            {stats.snapshotsCount}
          </div>
          <div className="text-[11px] text-slate-400">
            1-Click Restore Points
          </div>
        </div>
      </div>

      {/* Snapshots Engine & Time Machine */}
      <div className="bg-[#0d1627] border border-[#1b2840] rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#18263e]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Data Store Restore Points (Snapshots)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Create instant backup points before reconciliations, audits, or month-end closings.
            </p>
          </div>
        </div>

        {/* Create Snapshot Form */}
        <form onSubmit={handleCreateSnapshotSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            placeholder="Name your snapshot (e.g. End of Month Reconciliation, Day 22 Closed)..."
            className="flex-1 px-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600"
          />
          <button
            type="submit"
            className="bg-[#18253b] hover:bg-[#223553] text-white border border-[#273a5a] font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Create Snapshot</span>
          </button>
        </form>

        {/* Snapshots List */}
        <div className="space-y-2.5">
          {snapshots.length === 0 ? (
            <div className="py-8 text-center bg-[#080f1d] rounded-xl border border-[#18263e] p-6 space-y-1">
              <p className="text-xs font-semibold text-slate-400">
                No snapshots created yet.
              </p>
              <p className="text-[11px] text-slate-500">
                Use the field above to take a point-in-time snapshot of your ledger data.
              </p>
            </div>
          ) : (
            snapshots.map((s) => {
              const formattedDate = new Date(s.createdAt).toLocaleString();
              return (
                <div
                  key={s.id}
                  className="p-3.5 bg-[#080f1d] rounded-xl border border-[#18263e] hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-bold text-white text-sm">
                        {s.name}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                        {s.transactionsCount} txs
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Liquidity: {formatCurrency(s.totalLiquidity, s.currency, 3)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Created: {formattedDate}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onRestoreSnapshot(s)}
                      className="px-3 py-1.5 bg-[#142034] hover:bg-[#1c2e4b] text-emerald-400 border border-emerald-900/60 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteSnapshot(s.id)}
                      title="Delete Snapshot"
                      className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-950/50 rounded-lg border border-transparent hover:border-rose-900/40 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Backup, Import & Maintenance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup & Export Hub */}
        <div className="bg-[#0d1627] border border-[#1b2840] rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#18263e]">
            <Download className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm sm:text-base">
              Export &amp; Backup Center
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Download your full data store records for offline safekeeping or spreadsheet analysis.
          </p>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onExportJson}
              className="w-full bg-[#080f1d] hover:bg-[#121c2e] text-white border border-[#1b2840] p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/50 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px]">
                  JSON
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Complete Data Store Backup</div>
                  <div className="text-[10px] text-slate-500">Includes all ledger entries, profiles &amp; categories</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              type="button"
              onClick={onExportAllCsv}
              className="w-full bg-[#080f1d] hover:bg-[#121c2e] text-white border border-[#1b2840] p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-950/50 text-sky-400 flex items-center justify-center font-mono font-bold text-[10px]">
                  CSV
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Export Ledger to CSV / Excel</div>
                  <div className="text-[10px] text-slate-500">Compatible with Microsoft Excel, Google Sheets</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Import & Restore Hub */}
        <div className="bg-[#0d1627] border border-[#1b2840] rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#18263e]">
            <Upload className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-white text-sm sm:text-base">
              Import &amp; Restore Center
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Upload previously exported JSON backups to seamlessly restore transactions.
          </p>

          <div className="p-4 bg-[#080f1d] border border-[#1b2840] rounded-xl flex flex-col items-center justify-center text-center space-y-3">
            <Upload className="w-8 h-8 text-slate-500" />
            <div>
              <p className="text-xs font-semibold text-slate-300">
                Upload Backup File (.json)
              </p>
              <p className="text-[11px] text-slate-500">
                Select your previously downloaded ledger JSON file
              </p>
            </div>
            <label className="bg-[#18253b] hover:bg-[#20324e] text-emerald-400 border border-[#243755] px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer">
              <span>Choose File</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    onImportJson(f);
                    e.target.value = '';
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-950/10 border border-rose-900/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
            Clear Data Store
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Reset all recorded transactions and restore default balances. Make sure to download a JSON backup first.
          </p>
        </div>
        <button
          type="button"
          onClick={onResetAllData}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition cursor-pointer shrink-0"
        >
          <Trash2 className="w-4 h-4" />
          <span>Reset All Data</span>
        </button>
      </div>
    </div>
  );
};
