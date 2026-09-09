import React from 'react';
import { useGame } from '../../context/GameContext';
import { playChitSound, playVictorySound } from '../../utils/audio';

export const DiplomacyScreen: React.FC = () => {
  const { rivals, updateRivalStatus, resources, updateResource, addToast } = useGame();

  const handleSendTribute = (rivalId: string) => {
    if (resources.alimento < 2) {
      addToast('Falta Alimento', 'Se requieren 2 raciones de Alimento para el tributo.', 'warning');
      return;
    }
    playChitSound();
    updateResource('alimento', -2);
    updateRivalStatus(rivalId, 'Paz');
    addToast('Tributo de Feromonas Aceptado', 'Colonia Azul acepta el néctar dulce y cesa las hostilidades por 2 rondas.', 'success');
  };

  const handleDeclareWar = (rivalId: string) => {
    playChitSound();
    updateRivalStatus(rivalId, 'Hostil');
    addToast('Feromona de Alarma Liberada', 'Se declara estado de guerra. Soldados en máxima alerta.', 'warning');
  };

  const handleSignAlliance = (rivalId: string) => {
    playVictorySound();
    updateRivalStatus(rivalId, 'Aliado');
    updateResource('puntosVictoria', 1);
    addToast('Pacto de Simbiosis Firmado', 'Alianza consolidada con Colonia Verde (+1 PV). Rutas comerciales abiertas.', 'success');
  };

  return (
    <div className="flex-1 w-full bg-[#161311] p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header Title */}
        <div className="flex flex-wrap items-center justify-between bg-[#231f1d] p-5 rounded-2xl border border-[#393431] shadow-lg gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#56d6f5] text-[#001f26] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[28px]">hub</span>
            </div>
            <div>
              <h2 className="font-headline text-2xl font-bold text-[#56d6f5] tracking-tight">
                Red de Feromonas & Diplomacia de Clanes
              </h2>
              <p className="text-xs text-[#e1bfb5]">
                Vínculos químicos aéreos, tratados de no agresión y rutas de comercio de néctar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#2e2927] px-4 py-2 rounded-full border border-[#393431]">
            <span className="w-2 h-2 rounded-full bg-[#99d781] animate-pulse"></span>
            <span className="text-xs font-semibold text-[#eae1dd]">
              Canal de Antenas Activo (Frecuencia 44.2 kHz)
            </span>
          </div>
        </div>

        {/* CLANS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rivals.map((rival) => {
            const isPlayer = rival.id === 'roja';
            const isBlue = rival.id === 'azul';
            const isGreen = rival.id === 'verde';

            return (
              <div
                key={rival.id}
                className={`bg-[#1f1b19] p-5 rounded-2xl border flex flex-col justify-between gap-4 shadow-md transition-all ${
                  isPlayer
                    ? 'border-[#f06536]/60 shadow-[0_0_16px_rgba(240,101,54,0.15)]'
                    : isBlue
                    ? 'border-[#56d6f5]/40 hover:border-[#56d6f5]/70'
                    : 'border-[#99d781]/40 hover:border-[#99d781]/70'
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: rival.colorHex }}
                      />
                      <h3 className="font-headline text-lg font-bold text-[#eae1dd]">
                        {rival.name}
                      </h3>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        rival.status === 'Activo'
                          ? 'bg-[#f06536]/20 text-[#ffb59d]'
                          : rival.status === 'Hostil'
                          ? 'bg-[#93000a]/20 text-[#ffb4ab]'
                          : rival.status === 'Aliado'
                          ? 'bg-[#1a520c]/30 text-[#99d781] border border-[#99d781]/40'
                          : 'bg-[#1a520c]/20 text-[#99d781]'
                      }`}
                    >
                      {rival.status}
                    </span>
                  </div>

                  <div className="bg-[#231f1d] p-3 rounded-xl border border-[#393431] flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-[#a88a81] uppercase">Líder de Colonia:</span>
                    <span className="text-xs font-semibold text-[#eae1dd]">{rival.leader}</span>
                    <span className="text-[11px] text-[#ffb59d] font-bold mt-1">Puntos de Victoria: {rival.pv} PV</span>
                  </div>

                  <p className="text-xs text-[#e1bfb5] leading-relaxed">{rival.description}</p>
                </div>

                {/* Diplomatic Actions */}
                <div className="flex flex-col gap-2 pt-2 border-t border-[#393431]">
                  {isPlayer ? (
                    <div className="bg-[#2e2927] p-2.5 rounded-xl text-center">
                      <span className="text-xs text-[#ffb59d] font-bold">Tu Nido Central</span>
                      <p className="text-[11px] text-[#a88a81]">Emite feromona de agregación en un radio de 5 nódulos.</p>
                    </div>
                  ) : isBlue ? (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendTribute(rival.id)}
                        className="btn-tactile bg-[#2e2927] hover:bg-[#3d3836] text-[#ffb59d] text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-[#393431]"
                      >
                        <span className="material-symbols-outlined text-[16px]">redeem</span>
                        <span>Enviar Tributo de Néctar (-2 🍖)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclareWar(rival.id)}
                        className="btn-tactile bg-[#93000a]/30 hover:bg-[#93000a]/50 text-[#ffb4ab] text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-[#ffb4ab]/30"
                      >
                        <span className="material-symbols-outlined text-[16px]">swords</span>
                        <span>Declarar Hostilidad Abierta</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleSignAlliance(rival.id)}
                        className="btn-tactile bg-[#1a520c] hover:bg-[#236812] text-[#99d781] text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">handshake</span>
                        <span>Pacto de Simbiosis (+1 PV)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addToast('Ruta Abierta', 'Intercambio comercial garantizado durante la estación.', 'success')}
                        className="btn-tactile bg-[#2e2927] hover:bg-[#3d3836] text-[#eae1dd] text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 border border-[#393431]"
                      >
                        <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                        <span>Ruta de Intercambio de Néctar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Special Biohazard Encounter Widget: Ophiocordyceps Fungal Bloom */}
        <div className="bg-[#231f1d] p-5 rounded-2xl border border-[#93000a]/40 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px] animate-pulse">coronavirus</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-headline text-lg font-bold text-[#ffb4ab]">
                  Brote Parásito: Esporas de Ophiocordyceps
                </h4>
                <span className="text-[10px] bg-[#93000a] text-white font-bold px-2 py-0.5 rounded-full">
                  Peligro de Epidemia
                </span>
              </div>
              <p className="text-xs text-[#e1bfb5] mt-1 max-w-2xl">
                Cepa de hongo zombi detectada en las galerías orientales. Requiere que las obreras fumiguen los túneles con secreciones de ácido fórmico antes del invierno.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => addToast('Cuarentena y Fumigación', 'Obreras sellan la galería afectada y aplican ácido fórmico. Brote erradicado.', 'success')}
            className="btn-shimmer bg-[#f06536] hover:bg-[#ffb59d] text-[#521400] text-xs font-bold px-5 py-2.5 rounded-full shrink-0 shadow-md active:scale-95 transition-all"
          >
            Fumigar Galería con Ácido
          </button>
        </div>
      </div>
    </div>
  );
};
