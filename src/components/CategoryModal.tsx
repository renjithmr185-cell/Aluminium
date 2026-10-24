import React, { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  existingCategories: string[];
  onClose: () => void;
  onAdd: (categoryName: string) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  existingCategories,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a category name');
      return;
    }
    if (
      existingCategories.some(
        (c) => c.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      setError('This category already exists');
      return;
    }

    onAdd(trimmed);
    setName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1627] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#1b2840] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#18263e] mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 text-emerald-400 flex items-center justify-center border border-emerald-800/40">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">
              Add New Category
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Freelance, Education, Vehicle"
              className="w-full px-3.5 py-2.5 bg-[#080f1d] border border-[#1b2840] rounded-xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
