import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { playDiceRollSound, playVictorySound } from '../utils/audio';

export const CombatModal: React.FC = () => {
  const { combatModalOpen, closeCombatModal, addToast, updateResource } = useGame();

  const [atkDice, setAtkDice] = useState<number[]>([5, 4, 2]);
  const [defDice, setDefDice] = useState<number[]>([4, 3]);
  const [combatStance, setCombatStance] = useState<'saqueo' | 'captura'>('saqueo');
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [clashResult, setClashResult] = useState<string | null>(null);

  if (!combatModalOpen) return null;

  const rollCombat = () => {
    setIsRolling(true);
    setClashResult(null);
    playDiceRollSound();

    let count = 0;
    const interval = setInterval(() => {
      setAtkDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      setDefDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      count++;
      if (count >= 6) {
        clearInterval(interval);
        const finalAtk = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ];
        const finalDef = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ];
        setAtkDice(finalAtk);
        setDefDice(finalDef);
        setIsRolling(false);

        const maxAtk = Math.max(...finalAtk);
        const maxDef = Math.max(...finalDef);

        if (maxAtk > maxDef) {
          playVictorySound();
          if (combatStance === 'saqueo') {
            setClashResult(`¡VICTORIA CARMESÍ! Tirada atacante (${maxAtk}) superó a la defensora (${maxDef}). Saqueas +3 Alimento y +2 Agua.`);
            updateResource('alimento', 3);
            updateResource('agua', 2);
            addToast('¡Victoria en Combate!', `Saqueo exitoso contra Colonia Azul. +3 Alimento, +2 Agua.`, 'success');
          } else {
            setClashResult(`¡TERRITORIO TOMADO! Asalto exitoso (${maxAtk} vs ${maxDef}). Posición enemiga neutralizada (+1 PV).`);
            updateResource('puntosVictoria', 1);
            addToast('¡Puesto Capturado!', 'Colonia Roja gana +1 PV por conquista territorial.', 'success');
          }
        } else {
          setClashResult(`DEFENSA ENEMIGA EXITOSA: Tirada defensora (${maxDef}) neutralizó la ofensiva (${maxAtk}). 1 unidad aliada trasladada a Rehabilitación.`);
          updateResource('poblacionRehab', 1);
          updateResource('poblacionLibre', -1);
          addToast('Asalto Rechazado', 'Defensa enemiga contuvo el ataque. Unidad herida pasa a la enfermería.', 'warning');
        }
      }
    }, 80);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#110d0c]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#231f1d] rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 border border-[#59413a]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#393431] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffb4ab] text-[26px] animate-bounce">
              swords
            </span>
            <span className="font-headline text-2xl font-bold text-[#eae1dd]">
              Simulador de Combate
            </span>
          </div>
          <button
            type="button"
            onClick={closeCombatModal}
            className="w-8 h-8 rounded-full bg-[#393431] flex items-center justify-center text-[#eae1dd] hover:text-[#ffb59d] hover:scale-110 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Clash Stance */}
        <div className="flex items-center justify-center gap-4 bg-[#2e2927] p-2 rounded-full border border-[#393431]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="combat-type"
              checked={combatStance === 'saqueo'}
              onChange={() => setCombatStance('saqueo')}
              className="accent-[#f06536]"
            />
            <span className="text-xs font-bold text-[#eae1dd]">Objetivo: Saqueo de Recursos</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="combat-type"
              checked={combatStance === 'captura'}
              onChange={() => setCombatStance('captura')}
              className="accent-[#f06536]"
            />
            <span className="text-xs font-bold text-[#eae1dd]">Objetivo: Captura Territorial</span>
          </label>
        </div>

        {/* Dice Arena */}
        <div className="grid grid-cols-2 gap-4">
          {/* Atacante */}
          <div className="bg-[#1f1b19] p-4 rounded-xl flex flex-col items-center gap-2 text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border-t-2 border-[#f06536]">
            <span className="text-xs font-bold text-[#ffb59d] uppercase">Atacante (Colonia Roja)</span>
            <div className="flex items-center gap-2 py-1">
              {atkDice.map((val, idx) => (
                <span
                  key={idx}
                  className={`w-11 h-11 rounded-lg bg-[#f06536] text-[#521400] flex items-center justify-center font-headline text-2xl font-black shadow-md ${
                    isRolling ? 'animate-spin' : 'hover:scale-105 transition-transform'
                  }`}
                >
                  {val}
                </span>
              ))}
            </div>
            <span className="text-xs text-[#e1bfb5]">Fuerza Ofensiva: 3 Dados</span>
          </div>

          {/* Defensor */}
          <div className="bg-[#1f1b19] p-4 rounded-xl flex flex-col items-center gap-2 text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border-t-2 border-[#56d6f5]">
            <span className="text-xs font-bold text-[#56d6f5] uppercase">Defensor (Colonia Azul)</span>
            <div className="flex items-center gap-2 py-1">
              {defDice.map((val, idx) => (
                <span
                  key={idx}
                  className={`w-11 h-11 rounded-lg bg-[#393431] text-[#56d6f5] flex items-center justify-center font-headline text-2xl font-black shadow-md border border-[#56d6f5]/30 ${
                    isRolling ? 'animate-spin' : 'hover:scale-105 transition-transform'
                  }`}
                >
                  {val}
                </span>
              ))}
            </div>
            <span className="text-xs text-[#e1bfb5]">Fuerza Defensiva: 2 Dados</span>
          </div>
        </div>

        {/* Result Callout */}
        {clashResult && (
          <div className={`p-3 rounded-xl border text-xs font-semibold ${
            clashResult.includes('VICTORIA') || clashResult.includes('TOMADO')
              ? 'bg-[#1a520c]/70 border-[#99d781] text-[#b4f39b]'
              : 'bg-[#690005]/70 border-[#ffb4ab] text-[#ffdad6]'
          }`}>
            {clashResult}
          </div>
        )}

        {/* Rules Note */}
        <div className="bg-[#1f1b19] p-3 rounded-xl text-xs text-[#e1bfb5] border-l-2 border-[#a88a81] leading-relaxed">
          <p>• <strong>Regla de desempates:</strong> En Saqueo, los empates favorecen al defensor. En Captura, la tirada mayor absoluta define la baja.</p>
          <p>• Las bajas aliadas pasan a la <strong>Cámara de Rehabilitación</strong> si el Hospital tiene capacidad activa.</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={closeCombatModal}
            className="bg-[#393431] hover:bg-[#3d3836] text-[#eae1dd] text-xs font-semibold px-4 py-2 rounded-full transition-all active:scale-95"
          >
            Cerrar
          </button>
          <button
            type="button"
            disabled={isRolling}
            onClick={rollCombat}
            className="btn-shimmer bg-[#f06536] hover:bg-[#ffb59d] text-[#521400] hover:text-[#5d1800] font-headline font-bold text-sm px-6 py-2.5 rounded-full flex items-center gap-2 shadow-[0_3px_0_rgba(0,0,0,0.5)] active:scale-95 transition-all"
          >
            <span>{isRolling ? 'Tirando Dados...' : 'Lanzar Dados de Ataque'}</span>
            <span className="material-symbols-outlined text-[18px]">casino</span>
          </button>
        </div>
      </div>
    </div>
  );
};
