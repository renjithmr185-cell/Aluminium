import React, { useState } from 'react';
import {
  Building,
  Coins,
  Tags,
  Database,
  X,
  Save,
  Download,
  Upload,
  Trash2,
  Plus,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { CompanyProfile } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  company: CompanyProfile;
  categories: string[];
  onClose: () => void;
  onSaveCompany: (updated: CompanyProfile) => void;
  onSaveCategories: (updated: string[]) => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onExportAllCsv: () => void;
  onResetAllData: () => void;
}

const POPULAR_CURRENCIES = [
  { code: 'OMR', name: 'OMR - Omani Rial', defaultDecimals: 3 },
  { code: '$', name: '$ - US Dollar', defaultDecimals: 2 },
  { code: 'AED', name: 'AED - UAE Dirham', defaultDecimals: 2 },
  { code: 'SAR', name: 'SAR - Saudi Riyal', defaultDecimals: 2 },
  { code: 'QAR', name: 'QAR - Qatari Riyal', defaultDecimals: 2 },
  { code: 'KWD', name: 'KWD - Kuwaiti Dinar', defaultDecimals: 3 },
  { code: 'BHD', name: 'BHD - Bahraini Dinar', defaultDecimals: 3 },
  { code: '₹', name: '₹ - Indian Rupee', defaultDecimals: 2 },
  { code: '€', name: '€ - Euro', defaultDecimals: 2 },
  { code: '£', name: '£ - British Pound', defaultDecimals: 2 },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  company,
  categories,
  onClose,
  onSaveCompany,
  onSaveCategories,
  onExportJson,
  onImportJson,
  onExportAllCsv,
  onResetAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'balances' | 'categories' | 'backup'>('balances');

  const [formData, setFormData] = useState<CompanyProfile>(company);
  const [categoryList, setCategoryList] = useState<string[]>(categories);
  const [newCatInput, setNewCatInput] = useState('');
  const [catError, setCatError] = useState('');

  React.useEffect(() => {
    setFormData(company);
    setCategoryList(categories);
  }, [company, categories, isOpen]);

  if (!isOpen) return null;

  const handleCurrencyChange = (code: string) => {
    const cur = POPULAR_CURRENCIES.find((c) => c.code === code);
    setFormData({
      ...formData,
      currency: code,
      decimals: cur?.defaultDecimals ?? 2,
    });
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompany(formData);
    onSaveCategories(categoryList);
    onClose();
  };

  const handleAddCategory = () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (categoryList.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setCatError('Category already exists');
      return;
    }
    const updated = [...categoryList, trimmed];
    setCategoryList(updated);
    setNewCatInput('');
    setCatError('');
    onSaveCategories(updated);
  };

  const handleRemoveCategory = (catToRemove: string) => {
    if (categoryList.length <= 1) {
      setCatError('At least one category is required');
      return;
    }
    const updated = categoryList.filter((c) => c !== catToRemove);
    setCategoryList(updated);
    onSaveCategories(updated);
  };

  const handleResetCategories = () => {
    setCategoryList(DEFAULT_CATEGORIES);
    onSaveCategories(DEFAULT_CATEGORIES);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1627] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#1b2840] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#18263e] bg-[#070d18] text-white">
          <div>
            <h2 className="text-base sm:text-lg font-bold">Ledger Configuration &amp; Settings</h2>
            <p className="text-xs text-slate-400">
              Customize company details, currency, base opening balances &amp; categories
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-[#18263e] bg-[#09101d] px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('balances')}
            className={`py-2 px-3 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'balances'
                ? 'bg-[#0d1627] border-t border-x border-[#1b2840] text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>Opening Balances &amp; Currency</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-3 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#0d1627] border-t border-x border-[#1b2840] text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-sky-400" />
            <span>Profile Information</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-3 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-[#0d1627] border-t border-x border-[#1b2840] text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tags className="w-3.5 h-3.5 text-purple-400" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2 px-3 text-xs font-semibold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-[#0d1627] border-t border-x border-[#1b2840] text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Backup &amp; Reset</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Tab: Balances & Currency */}
          {activeTab === 'balances' && (
            <div className="space-y-4">
              <div className="bg-[#091120] border border-[#192842] rounded-xl p-3.5 flex items-start space-x-3 text-xs text-sky-300">
                <AlertCircle className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Opening Balances logic:</strong> Base opening balances set your initial funds. Each day&apos;s opening balance is computed automatically from prior days&apos; net flow, maintaining 100% ledger audit consistency.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Currency Symbol *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                  >
                    {POPULAR_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-[#080f1d]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Decimal Precision
                  </label>
                  <select
                    value={formData.decimals}
                    onChange={(e) =>
                      setFormData({ ...formData, decimals: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={3} className="bg-[#080f1d]">3 Decimals (0.000 - OMR, KWD, BHD)</option>
                    <option value={2} className="bg-[#080f1d]">2 Decimals (0.00 - USD, EUR, AED, SAR, INR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#080f1d] p-4 rounded-xl border border-emerald-900/60">
                  <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    Base Opening Cash Balance ({formData.currency})
                  </label>
                  <input
                    type="number"
                    step={formData.decimals === 3 ? '0.001' : '0.01'}
                    value={formData.baseOpeningCash}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        baseOpeningCash: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2 bg-[#050912] border border-[#1b2840] rounded-lg text-lg font-mono font-extrabold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Default: OMR 350.000
                  </span>
                </div>

                <div className="bg-[#080f1d] p-4 rounded-xl border border-sky-900/60">
                  <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
                    Base Opening Bank Balance ({formData.currency})
                  </label>
                  <input
                    type="number"
                    step={formData.decimals === 3 ? '0.001' : '0.01'}
                    value={formData.baseOpeningBank}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        baseOpeningBank: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2 bg-[#050912] border border-[#1b2840] rounded-lg text-lg font-mono font-extrabold text-sky-400 focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Default: OMR 4,200.000
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Ledger Title / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Personal & Household Ledger"
                  className="w-full px-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Real-Time Cash & Bank Flow Manager"
                  className="w-full px-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+968 9123 4567"
                    className="w-full px-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="accounts@ledger.local"
                    className="w-full px-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Address / City
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Muscat, Oman"
                  className="w-full px-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Tab: Categories */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newCatInput}
                  onChange={(e) => {
                    setNewCatInput(e.target.value);
                    if (catError) setCatError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                  placeholder="Enter new category name..."
                  className="flex-1 px-3.5 py-2 bg-[#080f1d] border border-[#1b2840] rounded-xl text-xs text-white placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {catError && <p className="text-xs text-rose-400">{catError}</p>}

              <div className="border border-[#1b2840] rounded-xl p-3 max-h-56 overflow-y-auto space-y-1.5 bg-[#080f1d]">
                {categoryList.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between px-3 py-1.5 bg-[#0d1627] rounded-lg border border-[#18263e] text-xs text-slate-200"
                  >
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleResetCategories}
                  className="text-xs text-slate-400 hover:text-white underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to standard categories</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab: Backup */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="bg-[#080f1d] p-4 rounded-xl border border-[#1b2840] space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Backup &amp; Export
                </h4>
                <p className="text-xs text-slate-400">
                  Save all transactions, opening balances, and categories safely to a file.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onExportJson}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Backup</span>
                  </button>

                  <button
                    type="button"
                    onClick={onExportAllCsv}
                    className="bg-[#121c2e] hover:bg-[#1a2842] text-slate-200 border border-[#1b2840] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Export CSV (Excel)</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#080f1d] p-4 rounded-xl border border-[#1b2840] space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Restore from JSON
                </h4>
                <p className="text-xs text-slate-400">
                  Upload an existing JSON backup to restore all ledger records.
                </p>
                <label className="inline-flex items-center space-x-2 bg-[#121c2e] hover:bg-[#1a2842] text-white border border-[#1b2840] px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>Select JSON File</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-900/60 space-y-2">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Reset Data
                </h4>
                <p className="text-xs text-rose-300">
                  Erases all entered transactions and restores default settings.
                </p>
                <button
                  type="button"
                  onClick={onResetAllData}
                  className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset All Ledger Data</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-[#070d18] border-t border-[#18263e] space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
