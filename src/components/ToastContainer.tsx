import React from 'react';
import { useGame } from '../context/GameContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGame();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none flex flex-col gap-2.5 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`pointer-events-auto cursor-pointer transition-all duration-300 transform translate-y-0 opacity-100 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[0_12px_28px_rgba(0,0,0,0.8)] backdrop-blur-xl border ${
            toast.type === 'success'
              ? 'bg-[#1a520c]/90 border-[#99d781]/60 text-[#eae1dd]'
              : toast.type === 'warning'
              ? 'bg-[#393431]/95 border-[#f06536]/70 text-[#eae1dd]'
              : toast.type === 'error'
              ? 'bg-[#690005]/95 border-[#ffb4ab]/60 text-[#eae1dd]'
              : 'bg-[#231f1d]/95 border-[#ffb59d]/40 text-[#eae1dd]'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === 'success'
                ? 'bg-[#99d781] text-[#083900]'
                : toast.type === 'warning'
                ? 'bg-[#f06536] text-[#521400]'
                : toast.type === 'error'
                ? 'bg-[#ffb4ab] text-[#690005]'
                : 'bg-[#ffb59d] text-[#5d1800]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {toast.type === 'success'
                ? 'check_circle'
                : toast.type === 'warning'
                ? 'warning'
                : toast.type === 'error'
                ? 'error'
                : 'notifications'}
            </span>
          </div>
          <div className="flex flex-col leading-snug flex-1">
            <span className="font-headline font-bold text-sm tracking-tight">{toast.title}</span>
            <span className="text-xs text-[#e1bfb5] line-clamp-2">{toast.message}</span>
          </div>
          <button
            type="button"
            className="text-[#a88a81] hover:text-white text-xs px-1"
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
