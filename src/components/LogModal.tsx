import React from 'react';
import { useGame } from '../context/GameContext';

export const LogModal: React.FC = () => {
  const { logModalOpen, setLogModalOpen, logs } = useGame();

  if (!logModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#110d0c]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#231f1d] rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 border border-[#59413a] max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-[#393431] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffb59d] text-[24px]">
              history_edu
            </span>
            <span className="font-headline text-2xl font-bold text-[#eae1dd]">
              Bitácora de la Colonia
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLogModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#393431] flex items-center justify-center text-[#eae1dd] hover:text-[#ffb59d] hover:scale-110 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
          {logs.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                item.type === 'season'
                  ? 'bg-[#1a520c]/30 border-[#99d781]/40'
                  : item.type === 'combat'
                  ? 'bg-[#93000a]/30 border-[#ffb4ab]/40'
                  : 'bg-[#1f1b19] border-[#393431]'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-[#a88a81]">
                <span className="text-[#ffb59d]">
                  T{item.turn} • R{item.round} • {item.season}
                </span>
                <span>{item.timestamp}</span>
              </div>
              <p className="text-xs text-[#eae1dd] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-[#393431]">
          <button
            type="button"
            onClick={() => setLogModalOpen(false)}
            className="bg-[#393431] hover:bg-[#3d3836] text-[#eae1dd] text-xs font-semibold px-5 py-2 rounded-full transition-all"
          >
            Cerrar Bitácora
          </button>
        </div>
      </div>
    </div>
  );
};
