import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export const TestModal: React.FC = () => {
  const {
    testModalOpen,
    setTestModalOpen,
    boostResourcesForTest,
    addAPForTest,
    unlockAllMutationsForTest,
    triggerInvasionForTest,
    advanceSeasonForTest,
    resetGameForTest,
    actionPoints,
    maxActionPoints,
    resources,
    season,
    year,
    round,
    turn,
    addToast
  } = useGame();

  const [activeTab, setActiveTab] = useState<'sandbox' | 'deploy' | 'stats'>('sandbox');
  const [copied, setCopied] = useState(false);

  if (!testModalOpen) return null;

  const copyDeployGuide = () => {
    const text = `Pasos para activar https://redwino.github.io/Evolia-el-reino-menor/ :
1. Ve al repositorio en GitHub: https://github.com/redwino/Evolia-el-reino-menor
2. Entra en Settings -> Pages (menú lateral izquierdo).
3. En "Build and deployment" -> "Source", selecciona "GitHub Actions".
4. ¡Listo! El workflow automático (.github/workflows/deploy.yml) compilará y publicará la web jugable en ~1 minuto.`;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    addToast('Guía Copiada', 'Instrucciones copiadas al portapapeles.', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#110d0c]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#231f1d] rounded-2xl p-5 md:p-6 shadow-[0_20px_40px_rgba(0,0,0,0.9)] flex flex-col gap-4 border border-[#f06536]/50 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#393431] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#f06536] text-[26px]">
              science
            </span>
            <div>
              <h3 className="font-headline text-xl md:text-2xl font-bold text-[#eae1dd]">
                Banco de Pruebas Táctico
              </h3>
              <p className="text-[11px] text-[#a88a81]">
                Herramientas de prueba del simulador y guía de despliegue web
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTestModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#393431] flex items-center justify-center text-[#eae1dd] hover:text-[#ffb59d] hover:scale-110 active:scale-95 transition-all"
            aria-label="Cerrar modal de pruebas"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-[#393431] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('sandbox')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'sandbox'
                ? 'bg-[#f06536] text-[#521400] shadow-sm'
                : 'bg-[#2e2927] text-[#e1bfb5] hover:bg-[#393431]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Acciones Rápidas (Sandbox)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('deploy')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'deploy'
                ? 'bg-[#f06536] text-[#521400] shadow-sm'
                : 'bg-[#2e2927] text-[#e1bfb5] hover:bg-[#393431]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">public</span>
            <span>Activar en GitHub Pages</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'stats'
                ? 'bg-[#f06536] text-[#521400] shadow-sm'
                : 'bg-[#2e2927] text-[#e1bfb5] hover:bg-[#393431]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">monitoring</span>
            <span>Variables en Vivo</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'sandbox' && (
            <div className="flex flex-col gap-3.5 text-xs">
              <div className="p-3 bg-[#1a1715] rounded-xl border border-[#393431]">
                <p className="text-[#eae1dd] font-semibold mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#ffb59d] text-[18px]">bolt</span>
                  Acelerar Simulación de Juego
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => boostResourcesForTest()}
                    className="p-3 rounded-xl bg-[#2a2422] hover:bg-[#382f2c] border border-[#59413a] text-left flex items-start gap-2.5 transition-all hover:border-[#ffb59d]"
                  >
                    <span className="material-symbols-outlined text-[#99d781] text-[22px] shrink-0 mt-0.5">
                      inventory_2
                    </span>
                    <div>
                      <div className="font-bold text-[#eae1dd]">Recargar Almacén (+25 de c/u)</div>
                      <div className="text-[11px] text-[#a88a81] mt-0.5">
                        Alimento, Agua, Material, +10 ADN y 5 AP.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => addAPForTest(3)}
                    className="p-3 rounded-xl bg-[#2a2422] hover:bg-[#382f2c] border border-[#59413a] text-left flex items-start gap-2.5 transition-all hover:border-[#ffb59d]"
                  >
                    <span className="material-symbols-outlined text-[#ffb59d] text-[22px] shrink-0 mt-0.5">
                      electric_bolt
                    </span>
                    <div>
                      <div className="font-bold text-[#eae1dd]">Añadir +3 Puntos de Acción (AP)</div>
                      <div className="text-[11px] text-[#a88a81] mt-0.5">
                        Permite ejecutar más movimientos y excavaciones.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => unlockAllMutationsForTest()}
                    className="p-3 rounded-xl bg-[#2a2422] hover:bg-[#382f2c] border border-[#59413a] text-left flex items-start gap-2.5 transition-all hover:border-[#ffb59d]"
                  >
                    <span className="material-symbols-outlined text-[#56d6f5] text-[22px] shrink-0 mt-0.5">
                      biotech
                    </span>
                    <div>
                      <div className="font-bold text-[#eae1dd]">Desbloquear Árbol Genético</div>
                      <div className="text-[11px] text-[#a88a81] mt-0.5">
                        Aplica todas las mutaciones al enjambre (+5 PV).
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerInvasionForTest()}
                    className="p-3 rounded-xl bg-[#2a2422] hover:bg-[#382f2c] border border-[#59413a] text-left flex items-start gap-2.5 transition-all hover:border-[#ffb59d]"
                  >
                    <span className="material-symbols-outlined text-[#f06536] text-[22px] shrink-0 mt-0.5">
                      casino
                    </span>
                    <div>
                      <div className="font-bold text-[#eae1dd]">Probar Batalla (Dados d6)</div>
                      <div className="text-[11px] text-[#a88a81] mt-0.5">
                        Abre el simulador de combate contra invasores.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => advanceSeasonForTest()}
                    className="p-3 rounded-xl bg-[#2a2422] hover:bg-[#382f2c] border border-[#59413a] text-left flex items-start gap-2.5 transition-all hover:border-[#ffb59d]"
                  >
                    <span className="material-symbols-outlined text-[#e1bfb5] text-[22px] shrink-0 mt-0.5">
                      update
                    </span>
                    <div>
                      <div className="font-bold text-[#eae1dd]">Avanzar Ronda / Estación</div>
                      <div className="text-[11px] text-[#a88a81] mt-0.5">
                        Calcula cosechas y simula turnos de IA rival.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => resetGameForTest()}
                    className="p-3 rounded-xl bg-[#2a2422] hover:bg-[#482020] border border-[#59413a] text-left flex items-start gap-2.5 transition-all hover:border-[#ffb59d]"
                  >
                    <span className="material-symbols-outlined text-[#ff6e6e] text-[22px] shrink-0 mt-0.5">
                      restart_alt
                    </span>
                    <div>
                      <div className="font-bold text-[#ffb59d]">Reiniciar Partida a Cero</div>
                      <div className="text-[11px] text-[#a88a81] mt-0.5">
                        Restaura nido, recursos y mapa al Año 1.
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="flex flex-col gap-3 text-xs text-[#e1bfb5] leading-relaxed">
              <div className="bg-[#1f1b19] p-4 rounded-xl border border-[#f06536]/40">
                <div className="flex items-center gap-2 text-[#ffb59d] font-bold text-sm mb-1">
                  <span className="material-symbols-outlined text-[20px]">help</span>
                  ¿Por qué actualmente no carga en https://redwino.github.io/Evolia-el-reino-menor/?
                </div>
                <p>
                  GitHub Pages es un servidor de archivos estáticos. Si solo subes el código fuente (.tsx), los navegadores no pueden ejecutar TypeScript directamente y la pantalla queda en blanco o con error 404 de scripts.
                </p>
                <p className="mt-1.5">
                  <strong>¡Ya dejamos todo preparado!</strong> Hemos generado el archivo <code className="text-[#ffb59d] bg-black/40 px-1.5 py-0.5 rounded">.github/workflows/deploy.yml</code> y configurado rutas relativas universales (<code className="text-[#ffb59d] bg-black/40 px-1.5 py-0.5 rounded">base: './'</code>).
                </p>
              </div>

              <div className="bg-[#1f1b19] p-4 rounded-xl border border-[#393431] flex flex-col gap-2.5">
                <h4 className="font-bold text-[#eae1dd] text-sm uppercase tracking-wide">
                  Actívalo en 3 Pasos en tu GitHub:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-[#eae1dd]">
                  <li>
                    Abre tu repositorio en:{' '}
                    <a
                      href="https://github.com/redwino/Evolia-el-reino-menor"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ffb59d] underline hover:text-white"
                    >
                      github.com/redwino/Evolia-el-reino-menor
                    </a>
                  </li>
                  <li>
                    Haz clic en la pestaña <strong>Settings</strong> (Configuración) arriba a la derecha, y en el menú lateral izquierdo haz clic en <strong>Pages</strong>.
                  </li>
                  <li>
                    En la sección <strong>Build and deployment</strong> &gt; <strong>Source</strong>, cambia la opción de <em>Deploy from a branch</em> a <strong>GitHub Actions</strong>.
                  </li>
                </ol>
                <div className="mt-2 pt-2 border-t border-[#393431] flex items-center justify-between">
                  <span className="text-[11px] text-[#a88a81]">
                    Al hacer push, GitHub ejecutará automáticamente el build y en 1 minuto estará online.
                  </span>
                  <button
                    type="button"
                    onClick={copyDeployGuide}
                    className="bg-[#2e2927] hover:bg-[#3d3836] text-[#ffb59d] font-bold text-xs px-3 py-1.5 rounded-full border border-[#59413a] flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copied ? 'check' : 'content_copy'}
                    </span>
                    <span>{copied ? '¡Copiado!' : 'Copiar Instrucciones'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-[#1f1b19] p-2.5 rounded-xl border border-[#393431] text-center">
                  <span className="text-[10px] text-[#a88a81] uppercase block font-bold">Tiempo</span>
                  <span className="text-base font-bold text-[#ffb59d]">{season}</span>
                  <span className="text-[10px] text-[#e1bfb5] block">Año {year} · R{round}</span>
                </div>
                <div className="bg-[#1f1b19] p-2.5 rounded-xl border border-[#393431] text-center">
                  <span className="text-[10px] text-[#a88a81] uppercase block font-bold">Acciones (AP)</span>
                  <span className="text-base font-bold text-[#99d781]">{actionPoints} / {maxActionPoints}</span>
                  <span className="text-[10px] text-[#e1bfb5] block">Turno {turn}</span>
                </div>
                <div className="bg-[#1f1b19] p-2.5 rounded-xl border border-[#393431] text-center">
                  <span className="text-[10px] text-[#a88a81] uppercase block font-bold">Puntos Victoria</span>
                  <span className="text-base font-bold text-[#f06536]">{resources.puntosVictoria} PV</span>
                  <span className="text-[10px] text-[#e1bfb5] block">Meta: 15 PV</span>
                </div>
                <div className="bg-[#1f1b19] p-2.5 rounded-xl border border-[#393431] text-center">
                  <span className="text-[10px] text-[#a88a81] uppercase block font-bold">Población</span>
                  <span className="text-base font-bold text-[#56d6f5]">{resources.poblacion} / {resources.poblacionMax}</span>
                  <span className="text-[10px] text-[#e1bfb5] block">Libres: {resources.poblacionLibre}</span>
                </div>
              </div>

              <div className="bg-[#1f1b19] p-3 rounded-xl border border-[#393431]">
                <div className="text-[11px] font-bold text-[#a88a81] uppercase mb-1.5">
                  Balance de Recursos de la Colonia
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between border-b border-[#2e2927] pb-1">
                    <span className="text-[#eae1dd]">Alimento:</span>
                    <span className="text-[#99d781]">{resources.alimento}/{resources.alimentoMax} (+{resources.alimentoDelta}/ciclo)</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2e2927] pb-1">
                    <span className="text-[#eae1dd]">Agua Dulce:</span>
                    <span className="text-[#56d6f5]">{resources.agua}/{resources.aguaMax} (+{resources.aguaDelta}/ciclo)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#eae1dd]">Materiales de Nido:</span>
                    <span className="text-[#ffb59d]">{resources.material}/{resources.materialMax} (+{resources.materialDelta}/ciclo)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#393431]">
          <div className="text-[11px] text-[#a88a81]">
            El simulador funciona de forma local y en producción.
          </div>
          <button
            type="button"
            onClick={() => setTestModalOpen(false)}
            className="bg-[#f06536] hover:bg-[#ffb59d] text-[#521400] font-bold text-xs px-5 py-2 rounded-full transition-all"
          >
            Cerrar Banco de Pruebas
          </button>
        </div>
      </div>
    </div>
  );
};
