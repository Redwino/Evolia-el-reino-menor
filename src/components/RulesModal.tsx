import React from 'react';
import { useGame } from '../context/GameContext';

export const RulesModal: React.FC = () => {
  const { rulesModalOpen, setRulesModalOpen } = useGame();

  if (!rulesModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#110d0c]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#231f1d] rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 border border-[#59413a] max-h-[88vh]">
        <div className="flex items-center justify-between border-b border-[#393431] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffb59d] text-[24px]">
              menu_book
            </span>
            <span className="font-headline text-2xl font-bold text-[#eae1dd]">
              Reglamento 4X: Evolia - El Reino Menor
            </span>
          </div>
          <button
            type="button"
            onClick={() => setRulesModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#393431] flex items-center justify-center text-[#eae1dd] hover:text-[#ffb59d] hover:scale-110 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 text-xs text-[#e1bfb5] leading-relaxed">
          <section className="bg-[#1f1b19] p-3.5 rounded-xl border border-[#393431]">
            <h4 className="font-headline text-sm font-bold text-[#ffb59d] uppercase mb-1">
              1. Economía de Acciones (3 AP por Turno)
            </h4>
            <p>
              Cada jugador dispone de <strong>3 Puntos de Acción (AP)</strong> por turno para ejecutar movimientos, construcción, asignación de obreras, comercio o declarar incursiones militares. Al pulsar <em>Pasar Turno</em>, se recolecta la producción del nido y los AP se regeneran al máximo.
            </p>
          </section>

          <section className="bg-[#1f1b19] p-3.5 rounded-xl border border-[#393431]">
            <h4 className="font-headline text-sm font-bold text-[#99d781] uppercase mb-1">
              2. Cartas Multifunción (Construir vs Desguazar)
            </h4>
            <p>
              Cada carta de desarrollo tiene doble utilidad:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><strong>Jugar / Construir (-1 AP):</strong> Paga el coste en materiales y alimentos para emplazar la estructura o investigación, desbloqueando bonos permanentes y Puntos de Victoria (PV).</li>
              <li><strong>Desguazar (-1 AP):</strong> Descarta la carta para recuperar entre el 50% y 66% de su valor en materias primas inmediatas sin requisitos previos.</li>
            </ul>
          </section>

          <section className="bg-[#1f1b19] p-3.5 rounded-xl border border-[#393431]">
            <h4 className="font-headline text-sm font-bold text-[#56d6f5] uppercase mb-1">
              3. Ciclos Estacionales y Helada
            </h4>
            <p>
              El juego avanza en 4 rondas por año:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><strong>Primavera:</strong> Bonificación de +2 Alimento. Inmune al consumo invernal.</li>
              <li><strong>Verano:</strong> Doble gasto hídrico en larvas, pero cosechas aceleradas.</li>
              <li><strong>Otoño:</strong> Máxima recolección de celulosa y resina vegetal.</li>
              <li><strong>Invierno:</strong> Las colonias deben pagar 2 raciones por ronda o sufrir bajas por congelación si no han desarrollado grasa criogénica.</li>
            </ul>
          </section>

          <section className="bg-[#1f1b19] p-3.5 rounded-xl border border-[#393431]">
            <h4 className="font-headline text-sm font-bold text-[#f06536] uppercase mb-1">
              4. Condición de Victoria
            </h4>
            <p>
              La primera colonia en alcanzar <strong>15 Puntos de Victoria (PV)</strong> o en completar la <strong>Gran Metrópolis de Arcilla (+7 PV, +1 AP permanente)</strong> asegurará la hegemonía del Reino Menor y ganará la partida.
            </p>
          </section>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#393431]">
          <button
            type="button"
            onClick={() => setRulesModalOpen(false)}
            className="bg-[#f06536] hover:bg-[#ffb59d] text-[#521400] font-bold text-xs px-5 py-2 rounded-full transition-all shadow-[0_2px_0_rgba(0,0,0,0.4)]"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
