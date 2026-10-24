import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastState {
  show: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastState;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [toast.show, onClose]);

  if (!toast.show) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 animate-in slide-in-from-bottom-5 duration-200">
      {toast.type === 'error' ? (
        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      )}
      <span className="text-xs font-semibold">{toast.message}</span>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-0.5 rounded transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
