import React from 'react';
import { useGame } from '../../context/GameContext';

export const GeneticTreeScreen: React.FC = () => {
  const { mutations, unlockMutation, dnaPoints, addToast } = useGame();

  const categories = ['Armadura', 'Metabolismo', 'Percepción'] as const;

  return (
    <div className="flex-1 w-full bg-[#161311] p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header Title & DNA Points */}
        <div className="flex flex-wrap items-center justify-between bg-[#231f1d] p-5 rounded-2xl border border-[#393431] shadow-lg gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#99d781] text-[#083900] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[28px]">biotech</span>
            </div>
            <div>
              <h2 className="font-headline text-2xl font-bold text-[#99d781] tracking-tight">
                Árbol Genético & Mutaciones del Enjambre
              </h2>
              <p className="text-xs text-[#e1bfb5]">
                Evoluciona las características morfológicas, metabólicas y neuroquímicas de las castas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#2e2927] px-4 py-2 rounded-full border border-[#99d781]/40 shadow-inner">
              <span className="material-symbols-outlined text-[#99d781] text-[20px] animate-pulse">
                dna
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-[#a88a81] uppercase">Mutágeno / ADN</span>
                <span className="font-headline text-lg font-bold text-[#99d781] tabular-nums">
                  {dnaPoints} Puntos
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => addToast('Puntos de ADN', 'Obtienes +1 ADN al pasar de turno o al construir centros de investigación.')}
              className="w-9 h-9 rounded-full bg-[#393431] hover:bg-[#3d3836] text-[#eae1dd] flex items-center justify-center border border-[#59413a]"
              title="Información sobre Mutágeno"
            >
              <span className="material-symbols-outlined text-[18px]">help</span>
            </button>
          </div>
        </div>

        {/* 3 Evolution Branches */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const branchMutations = mutations.filter((m) => m.category === category);
            const isArmor = category === 'Armadura';
            const isMetabolism = category === 'Metabolismo';
            const accentColor = isArmor ? '#f06536' : isMetabolism ? '#99d781' : '#56d6f5';

            return (
              <div
                key={category}
                className="bg-[#1f1b19] p-5 rounded-2xl border border-[#393431] flex flex-col gap-4 shadow-md"
              >
                <div className="flex items-center justify-between border-b border-[#393431] pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                    <h3 className="font-headline text-lg font-bold text-[#eae1dd]">
                      Rama {category}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-[#a88a81] uppercase tracking-wider">
                    {branchMutations.filter((m) => m.unlocked).length}/{branchMutations.length} Mutadas
                  </span>
                </div>

                <div className="flex flex-col gap-3 relative">
                  {branchMutations.map((mut, idx) => {
                    const canUnlock = !mut.unlocked && dnaPoints >= mut.costDNA;

                    return (
                      <div
                        key={mut.id}
                        className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
                          mut.unlocked
                            ? 'bg-[#231f1d] border-[#99d781]/60 shadow-[0_0_12px_rgba(153,215,129,0.15)]'
                            : 'bg-[#161311] border-[#393431]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                mut.unlocked
                                  ? 'bg-[#1a520c] text-[#99d781]'
                                  : 'bg-[#2e2927] text-[#a88a81]'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {mut.icon}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-headline text-sm font-bold text-[#eae1dd]">
                                {mut.name}
                              </span>
                              <span className="text-[10px] text-[#ffb59d] font-semibold">
                                +{mut.pv} PV al genoma
                              </span>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              mut.unlocked
                                ? 'bg-[#1a520c] text-[#99d781]'
                                : 'bg-[#2e2927] text-[#eae1dd] border border-[#393431]'
                            }`}
                          >
                            {mut.unlocked ? 'Desbloqueada' : `Coste: ${mut.costDNA} ADN`}
                          </span>
                        </div>

                        <p className="text-xs text-[#e1bfb5] leading-relaxed">{mut.description}</p>

                        <div className="bg-[#231f1d] px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[11px]">
                          <span className="material-symbols-outlined text-[14px] text-[#99d781]">
                            check
                          </span>
                          <span className="text-[#99d781] font-semibold">{mut.benefit}</span>
                        </div>

                        {!mut.unlocked && (
                          <div className="pt-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => unlockMutation(mut.id)}
                              disabled={!canUnlock}
                              className={`btn-tactile text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-sm ${
                                canUnlock
                                  ? 'bg-[#f06536] hover:bg-[#ffb59d] text-[#521400]'
                                  : 'bg-[#2e2927] text-[#a88a81] cursor-not-allowed'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                upgrade
                              </span>
                              <span>Mutar Genoma ({mut.costDNA} ADN)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
