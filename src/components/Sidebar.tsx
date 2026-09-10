import React from 'react';
import { useGame } from '../context/GameContext';
import { ScreenId } from '../types';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'mapa-tactico', label: 'Mapa Táctico', icon: 'explore' },
  { id: 'ant-hill-core', label: 'Nido Subterráneo', icon: 'nest_multi_room' },
  { id: 'arbol-evolutivo', label: 'Árbol Genético', icon: 'biotech' },
  { id: 'enjambre-militar', label: 'Castas y Legiones', icon: 'shield' },
  { id: 'feromonas-diplomacia', label: 'Feromonas y Clanes', icon: 'hub' },
];

export const Sidebar: React.FC = () => {
  const { currentScreen, setCurrentScreen, sidebarMobileOpen, setSidebarMobileOpen, addToast } = useGame();

  return (
    <>
      {/* Backdrop on mobile */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 top-20 bg-black/70 z-35 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-20 bottom-0 w-64 bg-[#1f1b19] z-40 flex flex-col p-4 border-r border-[#393431] shadow-[4px_0_20px_rgba(0,0,0,0.55)] transition-transform duration-300 ease-in-out ${
          sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
      <div className="px-3 py-1 mb-2">
        <span className="text-[11px] font-bold text-[#a88a81] uppercase tracking-wider">
          Cámaras y Sistemas
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-1.5">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentScreen(item.id)}
              className={`flex items-center gap-3 px-4 h-12 rounded-full transition-all text-left ${
                isActive
                  ? 'bg-[#f06536] text-[#521400] font-bold shadow-[0_3px_0_rgba(0,0,0,0.4)] scale-[1.02]'
                  : 'text-[#e1bfb5] hover:bg-[#2e2927] hover:text-[#eae1dd] hover:translate-x-1 active:scale-95'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${isActive ? 'text-[#521400]' : 'text-[#ffb59d]'}`}>
                {item.icon}
              </span>
              <span className="font-headline text-sm font-semibold tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Queen Vitality Pod */}
      <div 
        className="bg-[#231f1d] p-3 rounded-2xl flex flex-col gap-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-[#393431] group hover:border-[#99d781]/50 transition-all cursor-pointer"
        onClick={() => addToast('Reina Carmesí', 'Vitalidad óptima. La feromona real mantiene cohesionadas a las 8 castas del nido.', 'success')}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#99d781] uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#99d781] animate-ping"></span>
            Reina Carmesí
          </span>
          <span className="text-[11px] font-bold text-[#e1bfb5]">Vitalidad 100%</span>
        </div>
        <div className="w-full bg-[#393431] h-2 rounded-full overflow-hidden">
          <div className="bg-[#99d781] h-full w-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(153,215,129,0.8)]"></div>
        </div>
        <span className="text-[10px] text-[#a88a81]">Postura activa: +1 larva / ciclo</span>
      </div>
    </aside>
    </>
  );
};
