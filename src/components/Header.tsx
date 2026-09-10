import React from 'react';
import { useGame } from '../context/GameContext';

export const Header: React.FC = () => {
  const { 
    turn, 
    round, 
    season, 
    year, 
    actionPoints, 
    maxActionPoints, 
    passTurn, 
    isPassingTurn,
    soundMuted,
    toggleSoundMuted,
    setLogModalOpen,
    setRulesModalOpen,
    sidebarMobileOpen,
    setSidebarMobileOpen,
    addToast
  } = useGame();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1f1b19]/95 backdrop-blur-xl border-b border-[#393431] shadow-[0_4px_24px_rgba(0,0,0,0.7)] h-20">
      <div className="h-full w-full px-4 md:px-6 flex items-center justify-between gap-3">
        {/* Left: Brand & Turn Status */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarMobileOpen(!sidebarMobileOpen)}
            className="lg:hidden w-10 h-10 rounded-full bg-[#2e2927] hover:bg-[#3d3836] text-[#eae1dd] flex items-center justify-center border border-[#393431] active:scale-95 transition-transform"
            aria-label="Abrir menú de navegación"
            title="Menú de Navegación"
          >
            <span className="material-symbols-outlined text-[22px]">
              {sidebarMobileOpen ? 'close' : 'menu'}
            </span>
          </button>

          <div 
            className="flex items-center gap-2.5 group cursor-pointer"
            onClick={() => addToast('Evolia', 'El Reino Menor: Gestor táctico 4X subterráneo.')}
          >
            <div className="w-10 h-10 rounded-full bg-[#f06536] flex items-center justify-center text-[#521400] shadow-[0_2px_10px_rgba(240,101,54,0.45)] transition-transform group-hover:scale-110 group-hover:rotate-12 duration-200">
              <span className="material-symbols-outlined text-[24px]">pest_control</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-xl font-extrabold text-[#ffb59d] tracking-tight leading-none uppercase group-hover:text-[#ffdbd0] transition-colors">
                EVOLIA
              </span>
              <span className="text-[11px] font-bold text-[#a88a81] tracking-wider uppercase">
                El Reino Menor
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-[#231f1d] px-3.5 py-1.5 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-[#393431]/50 hover:border-[#99d781]/40 transition-all">
            <span className="material-symbols-outlined text-[#99d781] text-[18px]">
              schedule
            </span>
            <span className="text-xs text-[#eae1dd]">Turno {turn} / Ronda {round}</span>
            <span className="text-[#59413a]">•</span>
            <span className="text-xs text-[#99d781] font-semibold">{season} Año {year}</span>
          </div>
        </div>

        {/* Center: Colony, Weather & AP counter */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-2 bg-[#2e2927] px-3 py-1.5 rounded-full border border-[#393431]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f06536] animate-pulse shadow-[0_0_8px_rgba(240,101,54,0.8)]"></span>
            <span className="text-[11px] font-bold text-[#e1bfb5] uppercase tracking-wider">Colonia Roja:</span>
            <span className="text-xs text-[#ffb59d] font-bold">Nido Carmesí</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-[#393431] px-3 py-1.5 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] border border-[#56d6f5]/20">
            <span className="material-symbols-outlined text-[#56d6f5] text-[18px]">
              filter_drama
            </span>
            <span className="text-[11px] font-bold text-[#56d6f5] uppercase tracking-wider">Rocío Matutino</span>
            <span className="text-xs text-[#e1bfb5]">(+1 Humedad)</span>
          </div>

          {/* Action Points Pod */}
          <div 
            className="flex items-center gap-2 bg-[#2e2927] px-3 py-1.5 rounded-full border border-[#ffb59d]/25 shadow-sm"
            title="Puntos de Acción Disponibles en este turno"
          >
            <span className="material-symbols-outlined text-[#ffb59d] text-[18px]">bolt</span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: maxActionPoints }).map((_, i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i < actionPoints
                      ? 'bg-[#ffb59d] ap-active-dot'
                      : 'bg-[#393431] border border-[#59413a]'
                  }`}
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-[#eae1dd] font-bold ml-1 tabular-nums">
              {actionPoints}/{maxActionPoints} AP
            </span>
          </div>
        </div>

        {/* Right: Pass Turn & Aux Tools */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={passTurn}
            disabled={isPassingTurn}
            className={`btn-shimmer bg-[#f06536] hover:bg-[#ffb59d] text-[#521400] hover:text-[#5d1800] font-headline font-extrabold px-4 md:px-5 h-10 md:h-11 rounded-full flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(240,101,54,0.45)] hover:shadow-[0_6px_22px_rgba(240,101,54,0.65)] hover:-translate-y-0.5 active:translate-y-[2px] active:scale-95 transition-all text-xs md:text-sm uppercase tracking-wide ${
              isPassingTurn ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            <span>{isPassingTurn ? 'Procesando...' : 'Pasar Turno'}</span>
            <span className="material-symbols-outlined text-[18px] md:text-[20px]">
              fast_forward
            </span>
          </button>

          <div className="flex items-center gap-1 bg-[#231f1d] p-1 rounded-full border border-[#393431]">
            <button
              type="button"
              onClick={() => setLogModalOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#e1bfb5] hover:bg-[#393431] hover:text-[#eae1dd] hover:scale-105 active:scale-95 transition-all"
              title="Registro de Combates y Colonia"
            >
              <span className="material-symbols-outlined text-[18px]">history_edu</span>
            </button>

            <button
              type="button"
              onClick={toggleSoundMuted}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#e1bfb5] hover:bg-[#393431] hover:text-[#eae1dd] hover:scale-105 active:scale-95 transition-all"
              title={soundMuted ? 'Activar Sonido' : 'Silenciar Sonido'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {soundMuted ? 'volume_off' : 'volume_up'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRulesModalOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#e1bfb5] hover:bg-[#393431] hover:text-[#eae1dd] hover:scale-105 active:scale-95 transition-all"
              title="Reglamento y Opciones del Tablero"
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
            </button>
          </div>

          <div 
            className="w-8 h-8 rounded-full bg-[#ffb59d] flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#ffb59d] hover:ring-offset-2 hover:ring-offset-[#161311] transition-all"
            title="Perfil de Jugador: damian.nqn.91@gmail.com"
            onClick={() => addToast('Comandante', 'Reina Carmesí V - Jugador Activo')}
          >
            <span className="material-symbols-outlined text-[#5d1800] text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};
