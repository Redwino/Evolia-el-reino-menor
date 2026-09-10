import React from 'react';
import { useGame } from '../../context/GameContext';

export const AnthillScreen: React.FC = () => {
  const { resources, updateResource, addToast, consumeActionPoint, addLog } = useGame();

  const handleExcavate = () => {
    if (resources.material < 3) {
      addToast('Falta Material', 'Excavar una nueva cámara requiere 3 Materiales.', 'warning');
      return;
    }
    if (!consumeActionPoint(1)) return;
    updateResource('material', -3);
    updateResource('poblacionMax', 2);
    updateResource('puntosVictoria', 1);
    addToast('¡Nueva Cámara Excavada!', 'Galería expandida en estrato profundo: +2 Capacidad de Población, +1 PV (-1 AP).', 'success');
    addLog('Nueva galería excavada en el estrato profundo (+2 Capacidad de Población, +1 PV).', 'action');
  };

  const handleFeedQueen = () => {
    if (resources.alimento < 2) {
      addToast('Falta Alimento', 'Alimentar a la Reina requiere 2 Alimentos.', 'warning');
      return;
    }
    updateResource('alimento', -2);
    updateResource('poblacionLibre', 1);
    updateResource('poblacion', 1);
    addToast('Jalea Real Aportada', 'La Reina Carmesí produce una nueva larva sana (+1 Población).', 'success');
  };

  const handleMoistenNursery = () => {
    if (resources.agua < 1) {
      addToast('Falta Agua', 'Se requiere 1 gota de Agua pura.', 'warning');
      return;
    }
    updateResource('agua', -1);
    addToast('Humedad Regulada', 'Guardería protegida contra la deshidratación micelial.', 'success');
  };

  return (
    <div className="flex-1 w-full bg-[#161311] p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header Title */}
        <div className="flex items-center justify-between bg-[#231f1d] p-5 rounded-2xl border border-[#393431] shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#f06536] text-[#521400] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[28px]">nest_multi_room</span>
            </div>
            <div>
              <h2 className="font-headline text-2xl font-bold text-[#ffb59d] tracking-tight">
                Nido Subterráneo: Nido Carmesí
              </h2>
              <p className="text-xs text-[#e1bfb5]">
                Corte transversal del hormiguero. Profundidad máxima alcanzada: -85 cm bajo el mantillo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExcavate}
              className="btn-shimmer bg-[#f06536] hover:bg-[#ffb59d] text-[#521400] hover:text-[#5d1800] font-headline font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-2 shadow-[0_3px_0_rgba(0,0,0,0.4)] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">handyman</span>
              <span>Excavar Nueva Galería (-3 🌿, -1 AP)</span>
            </button>
          </div>
        </div>

        {/* Cross-Section Stratum Layout */}
        <div className="flex flex-col gap-6">
          {/* ESTRATO 1: SUPERFICIAL */}
          <div className="bg-[#1f1b19] rounded-2xl border border-[#59413a] p-5 flex flex-col gap-4 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#393431] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#99d781] uppercase tracking-wider bg-[#1a520c]/40 px-2.5 py-1 rounded-full border border-[#99d781]/30">
                  Estrato 1 • Superficie & Corona (-5 a -15 cm)
                </span>
                <span className="text-xs text-[#a88a81]">Suelo de pinocha, mantillo y calor solar</span>
              </div>
              <span className="text-xs text-[#e1bfb5] font-semibold">Ventilación: 98% Óptima</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Chamber 1: Montículo de Acceso */}
              <div className="bg-[#231f1d] p-4 rounded-xl border border-[#393431] flex flex-col gap-2 hover:border-[#ffb59d]/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-sm text-[#eae1dd]">Montículo de Entrada</span>
                  <span className="text-[10px] bg-[#393431] text-[#ffb59d] font-bold px-2 py-0.5 rounded">Centinelas</span>
                </div>
                <p className="text-xs text-[#e1bfb5]">
                  Cono de acículas de pino y arcilla que frena inundaciones pluviales.
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#393431]">
                  <span className="text-xs text-[#a88a81]">Guarnición: 2 Soldados</span>
                  <span className="text-xs text-[#99d781] font-bold">Sin intrusiones</span>
                </div>
              </div>

              {/* Chamber 2: Galería de Acarreo */}
              <div className="bg-[#231f1d] p-4 rounded-xl border border-[#393431] flex flex-col gap-2 hover:border-[#ffb59d]/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-sm text-[#eae1dd]">Túnel de Acarreo Rápido</span>
                  <span className="text-[10px] bg-[#1a520c] text-[#99d781] font-bold px-2 py-0.5 rounded">Logística</span>
                </div>
                <p className="text-xs text-[#e1bfb5]">
                  Arteria pavimentada con saliva y tierra prensada para transporte de hojas.
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#393431]">
                  <span className="text-xs text-[#a88a81]">Flujo: 4 Obreras/min</span>
                  <span className="text-xs text-[#99d781] font-bold">+1 Material pasivo</span>
                </div>
              </div>

              {/* Chamber 3: Cámara de Descarte */}
              <div className="bg-[#231f1d] p-4 rounded-xl border border-[#393431] flex flex-col gap-2 hover:border-[#ffb59d]/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-sm text-[#eae1dd]">Vertedero & Micosis</span>
                  <span className="text-[10px] bg-[#393431] text-[#a88a81] font-bold px-2 py-0.5 rounded">Higiene</span>
                </div>
                <p className="text-xs text-[#e1bfb5]">
                  Cámara aislada donde las obreras viejas depositan exoesqueletos y desechos.
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#393431]">
                  <span className="text-xs text-[#a88a81]">Infección: 0%</span>
                  <span className="text-xs text-[#56d6f5] font-bold">Aislada</span>
                </div>
              </div>
            </div>
          </div>

          {/* ESTRATO 2: MEDIO */}
          <div className="bg-[#1f1b19] rounded-2xl border border-[#59413a] p-5 flex flex-col gap-4 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#393431] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#ffb59d] uppercase tracking-wider bg-[#f06536]/20 px-2.5 py-1 rounded-full border border-[#f06536]/40">
                  Estrato 2 • Núcleo Vital & Crianza (-25 a -50 cm)
                </span>
                <span className="text-xs text-[#a88a81]">Temperatura constante (24°C) y humedad controlada</span>
              </div>
              <span className="text-xs text-[#99d781] font-semibold">Postura Activa</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Chamber 1: Cámara Real de la Reina */}
              <div className="bg-[#231f1d] p-4 rounded-xl border border-[#f06536]/50 flex flex-col gap-2 hover:shadow-[0_0_16px_rgba(240,101,54,0.3)] transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-sm text-[#ffb59d] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#f06536]">stars</span>
                    Cámara Real de la Reina
                  </span>
                  <span className="text-[10px] bg-[#f06536]/30 text-[#ffb59d] font-bold px-2 py-0.5 rounded">Vital</span>
                </div>
                <p className="text-xs text-[#e1bfb5]">
                  Residencia de la Reina Carmesí V. Las nodrizas la acicalan y alimentan con jalea.
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#393431]">
                  <button
                    type="button"
                    onClick={handleFeedQueen}
                    className="btn-tactile bg-[#f06536] text-[#521400] text-[10px] font-bold px-3 py-1.5 rounded-full"
                  >
                    Alimentar con Jalea (-2 🍖)
                  </button>
                  <span className="text-xs text-[#99d781] font-bold">+1 Cría</span>
                </div>
              </div>

              {/* Chamber 2: Guardería de Crías */}
              <div className="bg-[#231f1d] p-4 rounded-xl border border-[#56d6f5]/40 flex flex-col gap-2 hover:shadow-[0_0_16px_rgba(86,214,245,0.3)] transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-sm text-[#56d6f5] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#56d6f5]">egg</span>
                    Guardería de Larvas y Capullos
                  </span>
                  <span className="text-[10px] bg-[#56d6f5]/20 text-[#56d6f5] font-bold px-2 py-0.5 rounded">Crianza</span>
                </div>
                <p className="text-xs text-[#e1bfb5]">
                  Pilas de huevos translúcidos y capullos de seda. Requiere humedad constante.
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#393431]">
                  <button
                    type="button"
                    onClick={handleMoistenNursery}
                    className="btn-tactile bg-[#2e2927] hover:bg-[#3d3836] text-[#56d6f5] text-[10px] font-bold px-3 py-1.5 rounded-full border border-[#56d6f5]/40"
                  >
                    Humectar (-1 💧)
                  </button>
                  <span className="text-xs text-[#eae1dd]">Humedad 88%</span>
                </div>
              </div>

              {/* Chamber 3: Granja Fúngica */}
              <div className="bg-[#231f1d] p-4 rounded-xl border border-[#99d781]/40 flex flex-col gap-2 hover:shadow-[0_0_16px_rgba(153,215,129,0.3)] transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-sm text-[#99d781] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#99d781]">psychiatry</span>
                    Huerto Micelial Subterráneo
                  </span>
                  <span className="text-[10px] bg-[#1a520c] text-[#99d781] font-bold px-2 py-0.5 rounded">Biomasa</span>
                </div>
                <p className="text-xs text-[#e1bfb5]">
                  Cultivo simbiótico de gongilidios proteicos alimentados con hojas masticadas.
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#393431]">
                  <span className="text-xs text-[#e1bfb5]">Rendimiento: Alto</span>
                  <span className="text-xs text-[#99d781] font-bold">+4 Alimento/ciclo</span>
                </div>
              </div>
            </div>
          </div>

          {/* ESTRATO 3: PROFUNDO */}
          <div className="bg-[#1f1b19] rounded-2xl border border-[#59413a] p-5 flex flex-col gap-4 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#393431] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#56d6f5] uppercase tracking-wider bg-[#009eba]/20 px-2.5 py-1 rounded-full border border-[#56d6f5]/40">
                  Estrato 3 • Reservas & Cripta (-55 a -85 cm)
                </span>
                <span className="text-xs text-[#a88a81]">Roca madre compacta, alta presión y seguridad contra el invierno</span>
              </div>
              <span className="text-xs text-[#e1bfb5] font-semibold">Reserva Protegida</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Silo de Semillas */}
              <div className="bg-[#231f1d] p-4 rounded-xl border border-[#393431] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-sm text-[#eae1dd]">Silo de Semillas y Resina</span>
                  <span className="text-[10px] bg-[#393431] text-[#99d781] font-bold px-2 py-0.5 rounded">Capacidad +5</span>
                </div>
                <p className="text-xs text-[#e1bfb5]">
                  Granero impermeable donde se almacenan granos despicados para evitar germinación.
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#393431]">
                  <span className="text-xs text-[#a88a81]">Capacidad: 20/20</span>
                  <span className="text-xs text-[#99d781] font-bold">100% Hermético</span>
                </div>
              </div>

              {/* Pozo Freático */}
              <div className="bg-[#231f1d] p-4 rounded-xl border border-[#393431] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-sm text-[#56d6f5]">Pozo Freático Profundo</span>
                  <span className="text-[10px] bg-[#009eba]/30 text-[#56d6f5] font-bold px-2 py-0.5 rounded">+3 Agua</span>
                </div>
                <p className="text-xs text-[#e1bfb5]">
                  Humedad absorbida directamente de las aguas subterráneas que filtran por la arcilla.
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#393431]">
                  <span className="text-xs text-[#a88a81]">Caudal: Inagotable</span>
                  <span className="text-xs text-[#56d6f5] font-bold">Agua Filtrada</span>
                </div>
              </div>

              {/* Frente de Excavación Activo */}
              <div className="bg-[#231f1d] p-4 rounded-xl border border-[#f06536]/40 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-sm text-[#ffb59d]">Frente de Excavación</span>
                  <span className="text-[10px] bg-[#f06536]/20 text-[#ffb59d] font-bold px-2 py-0.5 rounded">Expansión</span>
                </div>
                <p className="text-xs text-[#e1bfb5]">
                  Túnel ciego listo para ensancharse con nuevas cámaras de alados o talleres de mandíbulas.
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#393431]">
                  <span className="text-xs text-[#a88a81]">Coste: 3 🌿</span>
                  <button
                    type="button"
                    onClick={handleExcavate}
                    className="btn-tactile bg-[#f06536] text-[#521400] text-[10px] font-bold px-3 py-1 rounded-full"
                  >
                    Ensanchar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
