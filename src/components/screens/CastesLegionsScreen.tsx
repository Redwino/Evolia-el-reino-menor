import React from 'react';
import { useGame } from '../../context/GameContext';

export const CastesLegionsScreen: React.FC = () => {
  const { 
    castes, 
    adjustCasteCount, 
    legions, 
    updateLegionMorale, 
    resources, 
    addToast 
  } = useGame();

  const handleReinforceLegion = (legionId: string) => {
    updateLegionMorale(legionId, 5);
    addToast('Legión Reforzada', 'Moral de la escuadra incrementada (+5 Moral).', 'success');
  };

  return (
    <div className="flex-1 w-full bg-[#161311] p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header Title & Census Overview */}
        <div className="flex flex-wrap items-center justify-between bg-[#231f1d] p-5 rounded-2xl border border-[#393431] shadow-lg gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#f06536] text-[#521400] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[28px]">shield</span>
            </div>
            <div>
              <h2 className="font-headline text-2xl font-bold text-[#ffb59d] tracking-tight">
                Castas Biológicas & Legiones del Enjambre
              </h2>
              <p className="text-xs text-[#e1bfb5]">
                Microgestión de individuos adultos y despliegue militar en los túneles del estrato.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#2e2927] px-4 py-2 rounded-full border border-[#393431] flex items-center gap-3">
              <span className="text-xs text-[#a88a81]">Población Libre:</span>
              <span className="font-headline text-base font-bold text-[#99d781] tabular-nums">
                {resources.poblacionLibre} Crías Maduras
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 1: CASTES MANAGEMENT WITH QUAD-PILL STEPPERS [-3, -1, +1, +3] */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold text-[#eae1dd] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb59d] text-[20px]">group_work</span>
              Censo de Castas (Control Rápido de Eclosión)
            </h3>
            <span className="text-xs text-[#a88a81]">
              Utiliza la botonera táctil rocker ([-3] [-1] | [+1] [+3]) para reasignar efectivos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {castes.map((caste) => (
              <div
                key={caste.id}
                className="bg-[#1f1b19] p-4 rounded-2xl border border-[#393431] flex flex-col justify-between gap-3 shadow-md hover:border-[#ffb59d]/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: caste.color }}
                    />
                    <span className="text-[10px] font-bold bg-[#2e2927] text-[#a88a81] px-2 py-0.5 rounded-full">
                      Poder: {caste.power}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="material-symbols-outlined text-[20px] text-[#ffb59d]">
                      {caste.icon}
                    </span>
                    <h4 className="font-headline text-sm font-bold text-[#eae1dd]">
                      {caste.name}
                    </h4>
                  </div>

                  <p className="text-[11px] text-[#e1bfb5] mt-1 leading-snug">{caste.role}</p>
                </div>

                {/* Primary Numeric Readout & Quad-Pill Rocker */}
                <div className="bg-[#231f1d] p-3 rounded-xl border border-[#393431] flex flex-col items-center gap-2 shadow-inner">
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline text-3xl font-extrabold text-[#ffb59d] tabular-nums">
                      {caste.count}
                    </span>
                    <span className="text-xs text-[#a88a81]">unidades</span>
                  </div>

                  {/* Quad-Pill Rocker Steppers ([-3] [-1] | [+1] [+3]) as specified in Formicarium Design */}
                  <div className="flex items-center gap-1.5 w-full justify-center pt-1">
                    {/* Decrements */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => adjustCasteCount(caste.id, -3)}
                        disabled={caste.count < 3}
                        className="btn-tactile chit-token w-9 h-8 rounded-full bg-[#2e2927] hover:bg-[#3d3836] text-[#ffb4ab] text-xs font-bold flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-all"
                        title="Desasignar 3 unidades"
                      >
                        -3
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustCasteCount(caste.id, -1)}
                        disabled={caste.count < 1}
                        className="btn-tactile chit-token w-9 h-8 rounded-full bg-[#2e2927] hover:bg-[#3d3836] text-[#ffb4ab] text-xs font-bold flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-all"
                        title="Desasignar 1 unidad"
                      >
                        -1
                      </button>
                    </div>

                    <span className="text-[#59413a] font-bold">|</span>

                    {/* Increments */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => adjustCasteCount(caste.id, 1)}
                        className="btn-tactile chit-token w-9 h-8 rounded-full bg-[#1a520c] hover:bg-[#236812] text-[#99d781] text-xs font-bold flex items-center justify-center transition-all"
                        title="Metamorfosear 1 unidad (+1 Alimento)"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustCasteCount(caste.id, 3)}
                        className="btn-tactile chit-token w-9 h-8 rounded-full bg-[#f06536] hover:bg-[#ffb59d] text-[#521400] text-xs font-bold flex items-center justify-center transition-all shadow-[0_2px_4px_rgba(240,101,54,0.4)]"
                        title="Metamorfosear 3 unidades (+3 Alimentos)"
                      >
                        +3
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: MILITARY LEGIONS & SQUAD FORMATIONS */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold text-[#eae1dd] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#f06536] text-[20px]">military_tech</span>
              Escuadrones de Marcha & Posiciones de Guardia
            </h3>
            <span className="text-xs text-[#a88a81]">Despliegue táctico en el mapa de superficie y manantiales</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {legions.map((legion) => (
              <div
                key={legion.id}
                className="bg-[#1f1b19] p-4 rounded-2xl border border-[#393431] flex flex-col gap-3 shadow-md hover:border-[#f06536]/40 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <h4 className="font-headline text-sm font-bold text-[#ffb59d]">
                      {legion.name}
                    </h4>
                    <span className="text-xs text-[#e1bfb5] flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[14px] text-[#56d6f5]">location_on</span>
                      {legion.location}
                    </span>
                  </div>
                  <span className="text-[10px] bg-[#2e2927] text-[#99d781] px-2 py-0.5 rounded-full font-bold border border-[#99d781]/30">
                    {legion.mission}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center bg-[#231f1d] p-2 rounded-xl border border-[#393431]">
                  <div>
                    <span className="text-[10px] text-[#a88a81]">Soldados</span>
                    <p className="font-headline text-base font-bold text-[#eae1dd]">{legion.soldierCount}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#a88a81]">Majors Cabezones</span>
                    <p className="font-headline text-base font-bold text-[#f06536]">{legion.majorCount}</p>
                  </div>
                </div>

                {/* Morale Progress */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#a88a81]">Cohesión y Moral</span>
                    <span className="font-bold text-[#99d781]">{legion.morale}%</span>
                  </div>
                  <div className="w-full bg-[#2e2927] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#99d781] h-full rounded-full transition-all duration-300"
                      style={{ width: `${legion.morale}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-[#393431]">
                  <button
                    type="button"
                    onClick={() => handleReinforceLegion(legion.id)}
                    className="flex-1 btn-tactile bg-[#2e2927] hover:bg-[#3d3836] text-[#eae1dd] text-xs font-semibold py-1.5 rounded-full flex items-center justify-center gap-1 border border-[#393431]"
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#ffb59d]">campaign</span>
                    <span>Arenga de Feromona</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
