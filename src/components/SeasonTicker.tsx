import React from 'react';
import { useGame } from '../context/GameContext';

export const SeasonTicker: React.FC = () => {
  const { 
    season, 
    year, 
    resources, 
    quickTrade, 
    addToast 
  } = useGame();

  const getSeasonDescription = () => {
    switch (season) {
      case 'Primavera':
        return 'Bonificación de Alimento (+2 extra) • Sin consumo invernal';
      case 'Verano':
        return 'Consumo de Agua duplicado • Cosechas miceliales aceleradas (+3 Alimento)';
      case 'Otoño':
        return 'Recolección máxima de Material (+4) • Preparación para hibernación';
      case 'Invierno':
        return 'Helada profunda: consumo de 2 Alimentos por ronda • Actividad reducida';
    }
  };

  const copyInviteLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('https://evolia.game/room/EVO-784').then(() => {
        addToast('Enlace Copiado', 'Link de invitación listo para compartir: #EVO-784', 'success');
      });
    } else {
      addToast('Sala #EVO-784', 'Código copiado al portapapeles.');
    }
  };

  return (
    <div className="w-full flex flex-col z-30">
      {/* Top Match Bar */}
      <div className="w-full bg-[#1f1b19] border-b border-[#393431] px-4 md:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Mode Switch */}
          <div className="flex items-center gap-1 bg-[#231f1d] p-1 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] border border-[#393431]">
            <button
              type="button"
              onClick={() => addToast('Modo IA', 'Partida local contra IA táctica activa.')}
              className="bg-[#f06536] text-[#521400] text-[11px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-[0_2px_0_rgba(0,0,0,0.4)]"
            >
              <span className="material-symbols-outlined text-[15px]">smart_toy</span>
              <span>Partida vs IA (Bots)</span>
            </button>
            <button
              type="button"
              onClick={() => addToast('Multijugador', 'Conectado a la sala en red #EVO-784.')}
              className="text-[#e1bfb5] hover:text-[#eae1dd] text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">language</span>
              <span>Multijugador Online (Salas Web)</span>
            </button>
          </div>

          {/* Room Pill */}
          <div className="flex items-center gap-2 bg-[#2e2927] px-3 py-1 rounded-full border border-[#393431]">
            <span className="text-[11px] font-bold text-[#a88a81] uppercase tracking-wider">Sala:</span>
            <span className="text-xs font-bold text-[#56d6f5]">#EVO-784</span>
            <span className="w-2 h-2 rounded-full bg-[#99d781] animate-pulse"></span>
          </div>

          {/* AI Bots Status */}
          <div className="hidden xl:flex items-center gap-2 bg-[#231f1d] px-3 py-1 rounded-full border border-[#393431]">
            <span className="w-2 h-2 rounded-full bg-[#56d6f5]"></span>
            <span className="text-xs text-[#e1bfb5]">Azul:</span>
            <span className="text-[10px] bg-[#56d6f5]/20 text-[#56d6f5] px-1.5 py-0.5 rounded font-bold">Bot Táctico</span>
            <span className="text-[#59413a]">•</span>
            <span className="w-2 h-2 rounded-full bg-[#99d781]"></span>
            <span className="text-xs text-[#e1bfb5]">Verde:</span>
            <span className="text-[10px] bg-[#99d781]/20 text-[#99d781] px-1.5 py-0.5 rounded font-bold">En Espera / Bot Fácil</span>
          </div>
        </div>

        {/* User Status & Invite */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-[#231f1d] px-3 py-1 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] border border-[#56d6f5]/30">
            <span className="material-symbols-outlined text-[18px] text-[#56d6f5]">account_circle</span>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] text-[#99d781] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#99d781]"></span> Conectado con Google
              </span>
              <span className="text-xs text-[#eae1dd] font-medium truncate max-w-[150px]">carmesialpha@gmail.com</span>
            </div>
          </div>

          <button
            type="button"
            onClick={copyInviteLink}
            className="bg-[#393431] hover:bg-[#3d3836] text-[#e1bfb5] hover:text-[#eae1dd] text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 active:scale-95 transition-all border border-[#59413a]"
            title="Compartir enlace de la sala"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span>Invitar</span>
          </button>
        </div>
      </div>

      {/* Season & Live Resource Tokens */}
      <section className="w-full bg-[#231f1d] px-4 md:px-6 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.5)] border-b border-[#393431]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Season Capsule */}
          <div className="season-pill-bg flex items-center gap-3 px-4 py-1.5 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_0_15px_rgba(153,215,129,0.15)] border border-[#99d781]/30 hover:scale-[1.02] transition-transform">
            <div className="w-8 h-8 rounded-full bg-[#1a520c] text-[#99d781] flex items-center justify-center shadow-[0_0_8px_rgba(153,215,129,0.5)]">
              <span className="material-symbols-outlined text-[18px]">nature</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline text-lg font-bold text-[#99d781] leading-none uppercase">
                  {season}
                </span>
                <span className="bg-[#99d781]/20 text-[#99d781] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase animate-pulse">
                  Año {year}
                </span>
              </div>
              <span className="text-xs text-[#e1bfb5]">{getSeasonDescription()}</span>
            </div>
          </div>

          {/* Resource Pods */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Alimento */}
            <div 
              className="relative group flex items-center gap-2.5 bg-[#2e2927] hover:bg-[#3d3836] px-3.5 py-1.5 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] hover:shadow-[0_0_12px_rgba(240,101,54,0.4)] cursor-pointer hover:-translate-y-0.5 transition-all border border-[#393431]"
              onClick={() => addToast('Alimento', `Stock: ${resources.alimento}/${resources.alimentoMax}. Producción proyectada: +${resources.alimentoDelta} por ciclo.`)}
            >
              <span className="material-symbols-outlined text-[#f06536] text-[20px] group-hover:scale-110 transition-transform">restaurant</span>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-[#a88a81] uppercase">Alimento</span>
                <span className="font-headline text-lg font-bold text-[#ffb59d] tracking-tight tabular-nums">
                  {resources.alimento}<span className="text-xs text-[#e1bfb5]">/{resources.alimentoMax}</span>
                </span>
              </div>
              <span className="absolute -top-1.5 -right-1 bg-[#1a520c] text-[#99d781] text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#99d781]/40 shadow">
                +{resources.alimentoDelta}
              </span>
            </div>

            {/* Agua */}
            <div 
              className="relative group flex items-center gap-2.5 bg-[#2e2927] hover:bg-[#3d3836] px-3.5 py-1.5 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] hover:shadow-[0_0_12px_rgba(86,214,245,0.4)] cursor-pointer hover:-translate-y-0.5 transition-all border border-[#393431]"
              onClick={() => addToast('Agua', `Stock: ${resources.agua}/${resources.aguaMax}. Manantial aporta +${resources.aguaDelta} por ciclo.`)}
            >
              <span className="material-symbols-outlined text-[#56d6f5] text-[20px] group-hover:scale-110 transition-transform">water_drop</span>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-[#a88a81] uppercase">Agua</span>
                <span className="font-headline text-lg font-bold text-[#56d6f5] tracking-tight tabular-nums">
                  {resources.agua}<span className="text-xs text-[#e1bfb5]">/{resources.aguaMax}</span>
                </span>
              </div>
              <span className="absolute -top-1.5 -right-1 bg-[#009eba] text-[#001f26] text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#56d6f5]/40 shadow">
                +{resources.aguaDelta}
              </span>
            </div>

            {/* Material */}
            <div 
              className="relative group flex items-center gap-2.5 bg-[#2e2927] hover:bg-[#3d3836] px-3.5 py-1.5 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] hover:shadow-[0_0_12px_rgba(153,215,129,0.4)] cursor-pointer hover:-translate-y-0.5 transition-all border border-[#393431]"
              onClick={() => addToast('Material', `Stock: ${resources.material}/${resources.materialMax}. Resina y corteza para obras.`)}
            >
              <span className="material-symbols-outlined text-[#99d781] text-[20px] group-hover:scale-110 transition-transform">grass</span>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-[#a88a81] uppercase">Material</span>
                <span className="font-headline text-lg font-bold text-[#99d781] tracking-tight tabular-nums">
                  {resources.material}<span className="text-xs text-[#e1bfb5]">/{resources.materialMax}</span>
                </span>
              </div>
              <span className="absolute -top-1.5 -right-1 bg-[#1a520c] text-[#99d781] text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#99d781]/40 shadow">
                +{resources.materialDelta}
              </span>
            </div>

            {/* Población */}
            <div 
              className="flex items-center gap-2.5 bg-[#2e2927] hover:bg-[#3d3836] px-3.5 py-1.5 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] hover:shadow-[0_0_12px_rgba(255,181,157,0.3)] cursor-pointer hover:-translate-y-0.5 transition-all border border-[#393431]"
              onClick={() => addToast('Censo de Población', `${resources.poblacion}/${resources.poblacionMax} unidades totales: ${resources.poblacionLibre} libres, ${resources.poblacionRehab} en rehabilitación.`)}
            >
              <span className="material-symbols-outlined text-[#ffb59d] text-[20px]">bug_report</span>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-[#a88a81] uppercase">Población</span>
                <span className="font-headline text-lg font-bold text-[#eae1dd] tracking-tight tabular-nums">
                  {resources.poblacion}<span className="text-xs text-[#e1bfb5]">/{resources.poblacionMax}</span>
                </span>
              </div>
              <div className="flex flex-col pl-1 border-l border-[#59413a]">
                <span className="text-[10px] font-bold text-[#99d781]">{resources.poblacionLibre} Libres</span>
                <span className="text-[10px] font-bold text-[#ffb4ab]">{resources.poblacionRehab} Rehab</span>
              </div>
            </div>

            {/* Puntos de Victoria */}
            <div 
              className="flex items-center gap-2.5 bg-[#f06536]/20 hover:bg-[#f06536]/30 px-4 py-1.5 rounded-full cursor-pointer hover:scale-105 transition-all border border-[#f06536]/40 shadow-[0_0_12px_rgba(240,101,54,0.25)]"
              onClick={() => addToast('Puntos de Victoria', `${resources.puntosVictoria} PV acumulados. Líder de la partida.`)}
            >
              <span className="material-symbols-outlined text-[#f06536] text-[20px] animate-pulse">military_tech</span>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-[#ffb59d] uppercase">Proyección</span>
                <span className="font-headline text-lg font-bold text-[#ffb59d]">
                  {resources.puntosVictoria} PV
                </span>
              </div>
            </div>
          </div>

          {/* Quick Trade Pill Trigger */}
          <button
            type="button"
            onClick={quickTrade}
            className="btn-tactile bg-[#393431] hover:bg-[#3d3836] hover:border-[#ffb59d]/50 text-[#eae1dd] text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_3px_0_rgba(0,0,0,0.5)] active:translate-y-[2px] transition-all border border-[#59413a]"
          >
            <span className="material-symbols-outlined text-[#ffb59d] text-[18px]">currency_exchange</span>
            <span>Comercio 2:1 <span className="text-[#a88a81] text-[10px] font-bold">(-1 AP)</span></span>
          </button>
        </div>
      </section>
    </div>
  );
};
