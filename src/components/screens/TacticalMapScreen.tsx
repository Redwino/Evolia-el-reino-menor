import React from 'react';
import { useGame } from '../../context/GameContext';

export const TacticalMapScreen: React.FC = () => {
  const {
    colonyDrawerOpen,
    toggleColonyDrawer,
    buildingsDrawerOpen,
    toggleBuildingsDrawer,
    rivals,
    resources,
    healInjuredUnit,
    cards,
    playCard,
    scrapCard,
    nodes,
    selectedNode,
    setSelectedNodeId,
    mapZoom,
    adjustZoom,
    resetZoom,
    chambers,
    adjustChamberWorker,
    hasWonderBuilt,
    buildWonder,
    openCombatModal,
    passTurn,
    actionPoints,
    consumeActionPoint,
    addLog,
    quickTrade,
    updateResource,
    addToast
  } = useGame();

  const handleMoveUnits = () => {
    if (!consumeActionPoint(1)) return;
    addToast('Marcha Táctica', `Escuadrón movilizado hacia ${selectedNode.name}. Posición asegurada (-1 AP).`, 'primary');
    addLog(`Marcha táctica: Escuadrón avanzado a ${selectedNode.name} (-1 AP).`, 'action');
  };

  const handleExploreNode = () => {
    if (!consumeActionPoint(1)) return;
    updateResource('material', 2);
    addToast('Exploración Exitosa', `Suelo rastreado en ${selectedNode.name}: +2 Materiales añadidos (-1 AP).`, 'success');
    addLog(`Exploración en ${selectedNode.name}: recolectados +2 Materiales (-1 AP).`, 'action');
  };

  return (
    <div className="relative flex-1 w-full flex flex-col min-h-[calc(100vh-14rem)] overflow-hidden">
      {/* 4X INTERFACE STAGE (Collapsible Drawers + Map Center) */}
      <div className="relative flex-1 w-full flex overflow-hidden">
        {/* DRAWER 1 (LEFT): GESTIÓN GENERAL Y POBLACIÓN */}
        <div
          className={`shrink-0 bg-[#1f1b19] transition-all duration-300 z-30 flex flex-col shadow-[4px_0_20px_rgba(0,0,0,0.65)] border-r border-[#393431] overflow-hidden ${
            colonyDrawerOpen ? 'w-80' : 'w-0 p-0'
          }`}
        >
          {/* Drawer Header Bar */}
          <div className="p-4 bg-[#231f1d] flex items-center justify-between border-b border-[#393431]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb59d] text-[20px]">groups</span>
              <span className="font-headline text-lg font-bold text-[#ffb59d] tracking-tight">
                Colonia y Clan
              </span>
            </div>
            <button
              type="button"
              onClick={toggleColonyDrawer}
              className="w-8 h-8 rounded-full bg-[#393431] flex items-center justify-center text-[#e1bfb5] hover:text-[#eae1dd] hover:scale-105 active:scale-95 transition-all"
              title="Plegar panel"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back_ios_new</span>
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
            {/* 3 Colonies Diplomacy State */}
            <div className="bg-[#231f1d] p-3 rounded-xl flex flex-col gap-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] border border-[#393431]">
              <span className="text-[11px] font-bold text-[#a88a81] uppercase tracking-wider">
                Orden de Turno y Clanes
              </span>

              {rivals.map((rival) => {
                const isPlayer = rival.id === 'roja';
                return (
                  <div
                    key={rival.id}
                    onClick={() => addToast(rival.name, `${rival.attitude}. ${rival.description}`)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                      isPlayer
                        ? 'bg-[#2e2927] border-l-2 border-[#f06536] hover:bg-[#3d3836]'
                        : 'bg-[#1f1b19] hover:bg-[#2e2927]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shadow-sm"
                        style={{ backgroundColor: rival.colorHex }}
                      />
                      <span className={`text-xs font-bold ${isPlayer ? 'text-[#ffb59d]' : 'text-[#e1bfb5]'}`}>
                        {rival.name}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                          rival.status === 'Activo'
                            ? 'bg-[#f06536]/20 text-[#ffb59d]'
                            : rival.status === 'Hostil'
                            ? 'bg-[#93000a]/20 text-[#ffb4ab]'
                            : 'bg-[#1a520c]/20 text-[#99d781]'
                        }`}
                      >
                        {rival.status}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#eae1dd] tabular-nums">
                      {rival.pv} PV
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Population Census Micro-Widget */}
            <div className="bg-[#231f1d] p-3 rounded-xl flex flex-col gap-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] border border-[#393431]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#a88a81] uppercase tracking-wider">
                  Censo de Población ({resources.poblacion}/{resources.poblacionMax})
                </span>
                <span className="text-xs text-[#99d781] font-semibold">
                  Capacidad +{resources.poblacionMax - resources.poblacion}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div
                  className="bg-[#2e2927] hover:bg-[#3d3836] p-2 rounded-lg flex flex-col items-center cursor-pointer transition-all hover:scale-105"
                  onClick={() => addToast('Obreras de Campo', '3 unidades forrajeando en la superficie.')}
                >
                  <span className="font-headline text-lg font-bold text-[#99d781]">3</span>
                  <span className="text-[10px] text-[#e1bfb5]">Obreras Campo</span>
                </div>
                <div
                  className="bg-[#2e2927] hover:bg-[#3d3836] p-2 rounded-lg flex flex-col items-center cursor-pointer transition-all hover:scale-105"
                  onClick={() => addToast('Soldados', '2 unidades custodiando el perímetro del nido.')}
                >
                  <span className="font-headline text-lg font-bold text-[#ffb59d]">2</span>
                  <span className="text-[10px] text-[#e1bfb5]">Soldados Cuartel</span>
                </div>
                <div
                  className="bg-[#2e2927] hover:bg-[#3d3836] p-2 rounded-lg flex flex-col items-center cursor-pointer transition-all hover:scale-105"
                  onClick={() => addToast('Crías', '2 pupas en proceso de eclosión.')}
                >
                  <span className="font-headline text-lg font-bold text-[#56d6f5]">2</span>
                  <span className="text-[10px] text-[#e1bfb5]">Crías Incubando</span>
                </div>
                <div
                  className="bg-[#2e2927] hover:bg-[#3d3836] p-2 rounded-lg flex flex-col items-center cursor-pointer transition-all hover:scale-105"
                  onClick={() => addToast('Reserva', '1 unidad disponible para órdenes inmediatas.')}
                >
                  <span className="font-headline text-lg font-bold text-[#a88a81]">{resources.poblacionLibre}</span>
                  <span className="text-[10px] text-[#e1bfb5]">En Reserva</span>
                </div>
              </div>

              {/* Rehabilitation Infirmary Chit */}
              <div className="mt-1 bg-[#93000a]/20 border border-[#ffb4ab]/30 p-2.5 rounded-xl flex flex-col gap-1 hover:border-[#ffb4ab]/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#ffb4ab] uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] animate-pulse">local_hospital</span>
                    Cámara de Rehabilitación
                  </span>
                  <span className="text-[10px] font-bold bg-[#93000a]/30 text-[#ffb4ab] px-1.5 py-0.5 rounded">
                    {resources.poblacionRehab} Herida
                  </span>
                </div>
                <p className="text-[11px] text-[#e1bfb5]">Unidad mutilada en la refriega del manantial.</p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => healInjuredUnit('hospital')}
                    className="flex-1 bg-[#393431] hover:bg-[#1a520c] hover:text-[#99d781] text-[#eae1dd] text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[13px]">healing</span>
                    Hospital (Gratis)
                  </button>
                  <button
                    type="button"
                    onClick={() => healInjuredUnit('food')}
                    className="flex-1 bg-[#f06536] text-[#521400] hover:bg-[#ffb59d] text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[13px]">lunch_dining</span>
                    Pagar 2 🍖
                  </button>
                </div>
              </div>
            </div>

            {/* Development Hand Cards */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#ffb59d] text-[18px]">style</span>
                  <span className="text-[11px] font-bold text-[#a88a81] uppercase tracking-wider">
                    Mano de Cartas ({cards.length})
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-[#f06536]/20 text-[#ffb59d] px-2 py-0.5 rounded-full">
                  Multifunción
                </span>
              </div>

              <div className="bg-[#231f1d] p-2 rounded-lg flex items-start gap-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] border border-[#393431]">
                <span className="material-symbols-outlined text-[#56d6f5] text-[16px] shrink-0 mt-0.5">info</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#56d6f5] uppercase">Regla Multifunción (1 AP)</span>
                  <p className="text-[11px] text-[#e1bfb5] leading-tight">
                    Gasta 1 AP para construir la estructura o descartarla por 1 AP para cobrar su valor de desguace.
                  </p>
                </div>
              </div>

              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`card-tactile bg-[#231f1d] p-3 rounded-xl flex flex-col gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.4)] border border-[#393431] ${card.borderClass}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#eae1dd]">{card.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#393431] text-[#ffb59d]">
                          {card.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#a88a81]">
                        {card.reqText} • <strong className="text-[#ffb59d]">+{card.pv} PV</strong>
                      </span>
                    </div>
                    <span className="text-[10px] font-bold bg-[#2e2927] px-1.5 py-0.5 rounded text-[#eae1dd]">
                      {card.costText}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#e1bfb5] leading-relaxed">{card.description}</p>

                  <div className="bg-[#1f1b19] px-2 py-1 rounded flex items-center justify-between text-[10px]">
                    <span className="text-[#a88a81] font-bold uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-[#99d781] text-[13px]">recycling</span>
                      Desguace:
                    </span>
                    <span className="text-[#99d781] font-bold">
                      {card.scrapText} <span className="text-[#a88a81]">(-1 AP)</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => playCard(card.id)}
                      className="flex-1 bg-[#f06536] hover:bg-[#ffb59d] text-[#521400] hover:text-[#5d1800] text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-[0_2px_0_rgba(0,0,0,0.4)] active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[13px]">construction</span>
                      Construir (-1 AP)
                    </button>
                    <button
                      type="button"
                      onClick={() => scrapCard(card.id)}
                      className="bg-[#393431] hover:bg-[#1a520c] hover:text-[#99d781] text-[#eae1dd] text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all"
                      title="Descartar y rescatar materias primas"
                    >
                      <span className="material-symbols-outlined text-[13px]">recycling</span>
                      Desguazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toggle Drawer 1 Handle */}
        <button
          type="button"
          onClick={toggleColonyDrawer}
          className="z-30 h-16 w-6 self-center bg-[#2e2927] hover:bg-[#f06536] text-[#eae1dd] hover:text-[#521400] rounded-r-lg flex items-center justify-center shadow-[2px_0_8px_rgba(0,0,0,0.5)] transition-all hover:scale-105 active:scale-90 border-r border-y border-[#393431]"
          title="Plegar / Desplegar Panel Colonia"
        >
          <span className="material-symbols-outlined text-[18px]">
            {colonyDrawerOpen ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>

        {/* CENTRAL 4X TACTICAL TERRITORY MAP */}
        <div className="flex-1 relative flex flex-col bg-[#161311] overflow-hidden select-none" id="map-container">
          {/* Floating Atmospheric Spores */}
          <div className="spore-1 absolute w-2.5 h-2.5 rounded-full bg-[#99d781]/30 blur-[1px] pointer-events-none" style={{ top: '25%', left: '35%' }} />
          <div className="spore-2 absolute w-3.5 h-3.5 rounded-full bg-[#56d6f5]/25 blur-[1.5px] pointer-events-none" style={{ top: '55%', left: '60%' }} />
          <div className="spore-3 absolute w-2 h-2 rounded-full bg-[#f06536]/20 blur-[1px] pointer-events-none" style={{ top: '75%', left: '40%' }} />

          {/* Map Viewport Control Overlay */}
          <div className="absolute top-3 left-4 z-20 flex items-center gap-2">
            <div className="bg-[#1f1b19]/90 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.6)] border border-[#393431]">
              <span className="material-symbols-outlined text-[#f06536] text-[18px] animate-pulse">map</span>
              <span className="text-xs font-bold text-[#eae1dd]">
                Estrato Superior: Mantillo & Suelo Boscoso
              </span>
              <span className="w-2 h-2 rounded-full bg-[#99d781] shadow-[0_0_6px_rgba(153,215,129,0.8)]"></span>
            </div>
          </div>

          <div className="absolute top-3 right-4 z-20 flex items-center gap-1 bg-[#1f1b19]/90 backdrop-blur-md p-1 rounded-full border border-[#393431] shadow-lg">
            <button
              type="button"
              onClick={() => adjustZoom(0.1)}
              className="w-8 h-8 rounded-full bg-[#2e2927] hover:bg-[#f06536] hover:text-[#521400] flex items-center justify-center text-[#eae1dd] hover:scale-105 active:scale-95 transition-all"
              title="Acercar Cámara (+)"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
            <button
              type="button"
              onClick={() => adjustZoom(-0.1)}
              className="w-8 h-8 rounded-full bg-[#2e2927] hover:bg-[#f06536] hover:text-[#521400] flex items-center justify-center text-[#eae1dd] hover:scale-105 active:scale-95 transition-all"
              title="Alejar Cámara (-)"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="w-8 h-8 rounded-full bg-[#2e2927] hover:bg-[#f06536] hover:text-[#521400] flex items-center justify-center text-[#eae1dd] hover:scale-105 active:scale-95 transition-all"
              title="Centrar Base Central"
            >
              <span className="material-symbols-outlined text-[18px]">filter_center_focus</span>
            </button>
          </div>

          {/* Orthogonal & Hex Interconnected Node Map Area */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
            <div
              className="relative w-[780px] h-[520px] bg-[#110d0c] rounded-2xl p-4 shadow-[inset_0_4px_24px_rgba(0,0,0,0.85)] border border-[#393431] flex items-center justify-center overflow-hidden transition-transform duration-300"
              style={{ transform: `scale(${mapZoom})` }}
            >
              {/* Soil & Mycelium Path SVG Connectors with animated marching pheromone pulses */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none" strokeWidth="3">
                {/* Roja to Granja */}
                <line className="pheromone-line text-[#99d781]" stroke="currentColor" x1="224" y1="260" x2="224" y2="120" />
                {/* Roja to Manantial */}
                <line className="pheromone-line text-[#f06536]" stroke="currentColor" x1="224" y1="260" x2="394" y2="260" />
                {/* Roja to Fuerte */}
                <line className="pheromone-line text-[#ffb59d]" stroke="currentColor" x1="224" y1="260" x2="224" y2="400" />
                {/* Manantial to Fuerte */}
                <line className="pheromone-line text-[#59413a]" stroke="currentColor" x1="394" y1="260" x2="224" y2="400" />
                {/* Manantial to Bosque */}
                <line className="pheromone-line text-[#99d781]" stroke="currentColor" x1="394" y1="260" x2="564" y2="150" />
                {/* Manantial to Azul Rival */}
                <line className="pheromone-line text-[#56d6f5]" stroke="currentColor" x1="394" y1="260" x2="564" y2="380" />
                {/* Bosque to Azul Rival */}
                <line className="pheromone-line text-[#ffb4ab]" stroke="currentColor" x1="564" y1="150" x2="564" y2="380" />
              </svg>

              {/* MAP NODES */}
              {nodes.map((node) => {
                const isSelected = selectedNode.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{ left: `${node.x}px`, top: `${node.y}px` }}
                    className={`absolute w-32 ${
                      node.type === 'base' || node.type === 'enemigo' || node.type === 'agua' ? 'h-32' : 'h-28'
                    } rounded-2xl bg-[#2e2927] p-2.5 flex flex-col items-center justify-between cursor-pointer transition-all border group ${
                      isSelected
                        ? 'scale-110 shadow-[0_0_24px_rgba(240,101,54,0.6)] border-[#f06536] z-10 ring-2 ring-[#f06536]'
                        : 'shadow-[0_4px_16px_rgba(0,0,0,0.6)] border-[#393431] hover:scale-105 hover:border-[#ffb59d]/50'
                    }`}
                  >
                    {/* Pulsing Radar Ring for Key Nodes */}
                    {(node.type === 'base' || node.type === 'agua' || node.type === 'enemigo') && (
                      <div
                        className="radar-ring"
                        style={{ color: node.colorHex }}
                      />
                    )}

                    <div className="w-full flex items-center justify-between">
                      <span
                        className="text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm text-white uppercase"
                        style={{ backgroundColor: node.colorHex }}
                      >
                        {node.badge}
                      </span>
                      <span className="material-symbols-outlined text-[17px] text-[#e1bfb5] group-hover:scale-110 transition-transform">
                        {node.type === 'base'
                          ? 'home'
                          : node.type === 'agro'
                          ? 'psychiatry'
                          : node.type === 'agua'
                          ? 'water'
                          : node.type === 'defensa'
                          ? 'fort'
                          : node.type === 'material'
                          ? 'forest'
                          : 'swords'}
                      </span>
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <span className="font-headline text-xs font-bold text-[#eae1dd] leading-tight group-hover:text-[#ffb59d] transition-colors">
                        {node.title}
                      </span>
                      <span className="text-[10px] text-[#e1bfb5]">{node.subtitle}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-[#161311] px-2 py-0.5 rounded-full border border-[#393431]">
                      <span className="text-[10px] font-bold text-[#e1bfb5]">{node.unitsText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Node Tactical Info Banner / Selected Inspector */}
          <div className="bg-[#231f1d] px-6 py-2 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.5)] border-t border-[#393431] z-20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#f06536] text-[20px] animate-pulse">
                near_me
              </span>
              <span className="text-xs text-[#a88a81]">Nódulo Seleccionado:</span>
              <span className="font-headline text-sm font-bold text-[#ffb59d]">
                {selectedNode.name}
              </span>
              <span className="hidden md:inline-block text-xs text-[#e1bfb5]">
                ({selectedNode.production})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMoveUnits}
                className="btn-tactile bg-[#2e2927] hover:bg-[#3d3836] text-[#eae1dd] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#393431]"
              >
                <span className="material-symbols-outlined text-[16px] text-[#99d781]">
                  transfer_within_a_station
                </span>
                <span>Mover Tropas (Máx 5)</span>
              </button>

              <button
                type="button"
                onClick={handleExploreNode}
                className="btn-tactile bg-[#2e2927] hover:bg-[#3d3836] text-[#eae1dd] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#393431]"
              >
                <span className="material-symbols-outlined text-[16px] text-[#56d6f5]">
                  travel_explore
                </span>
                <span>Explorar Nódulo</span>
              </button>

              <button
                type="button"
                onClick={openCombatModal}
                className="btn-tactile btn-shimmer bg-[#f06536] text-[#521400] hover:bg-[#ffb59d] text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_2px_0_rgba(0,0,0,0.4)]"
              >
                <span className="material-symbols-outlined text-[16px]">swords</span>
                <span>Asaltar Posición</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toggle Drawer 2 Handle */}
        <button
          type="button"
          onClick={toggleBuildingsDrawer}
          className="z-30 h-16 w-6 self-center bg-[#2e2927] hover:bg-[#f06536] text-[#eae1dd] hover:text-[#521400] rounded-l-lg flex items-center justify-center shadow-[-2px_0_8px_rgba(0,0,0,0.5)] transition-all hover:scale-105 active:scale-90 border-l border-y border-[#393431]"
          title="Plegar / Desplegar Cámaras"
        >
          <span className="material-symbols-outlined text-[18px]">
            {buildingsDrawerOpen ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>

        {/* DRAWER 2 (RIGHT): INSPECCIÓN DE EDIFICIOS & ASIGNACIÓN */}
        <div
          className={`shrink-0 bg-[#1f1b19] transition-all duration-300 z-30 flex flex-col shadow-[-4px_0_20px_rgba(0,0,0,0.65)] border-l border-[#393431] overflow-hidden ${
            buildingsDrawerOpen ? 'w-96' : 'w-0 p-0'
          }`}
        >
          {/* Drawer Header Bar */}
          <div className="p-4 bg-[#231f1d] flex items-center justify-between border-b border-[#393431]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#99d781] text-[20px]">apartment</span>
              <span className="font-headline text-lg font-bold text-[#99d781] tracking-tight">
                Cámaras & Obras
              </span>
            </div>
            <button
              type="button"
              onClick={toggleBuildingsDrawer}
              className="w-8 h-8 rounded-full bg-[#393431] flex items-center justify-center text-[#e1bfb5] hover:text-[#eae1dd] hover:scale-105 active:scale-95 transition-all"
              title="Plegar panel"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_forward_ios</span>
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
            {/* Building 1: Granja */}
            <div className="card-tactile bg-[#231f1d] p-3 rounded-xl flex flex-col gap-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] border-l-2 border-[#99d781] border border-[#393431]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#1a520c] text-[#99d781] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">yard</span>
                  </div>
                  <span className="text-xs font-bold text-[#eae1dd]">Granja de Pulgones (Niv. 1)</span>
                </div>
                <span className="text-[10px] font-bold bg-[#1a520c]/40 text-[#99d781] px-2 py-0.5 rounded-full">
                  +4 🍖 / ronda
                </span>
              </div>
              <p className="text-[11px] text-[#e1bfb5]">Cría de áfidos en raíces subterráneas. Produce azúcar proteico.</p>
              <div className="flex items-center justify-between bg-[#2e2927] px-3 py-1 rounded-full mt-1">
                <span className="text-xs text-[#eae1dd]">
                  Obreras: <strong className="text-[#99d781]">{chambers[0].assignedWorkers}</strong> / {chambers[0].maxWorkers}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => adjustChamberWorker('farm', -1)}
                    className="w-6 h-6 rounded-full bg-[#393431] hover:bg-[#3d3836] text-[#eae1dd] font-bold text-xs flex items-center justify-center transition-transform active:scale-75 shadow"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustChamberWorker('farm', 1)}
                    className="w-6 h-6 rounded-full bg-[#99d781] text-[#083900] font-bold text-xs flex items-center justify-center transition-transform active:scale-75 shadow"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Building 2: Cuartel */}
            <div className="card-tactile bg-[#231f1d] p-3 rounded-xl flex flex-col gap-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] border-l-2 border-[#f06536] border border-[#393431]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#f06536] text-[#521400] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">shield</span>
                  </div>
                  <span className="text-xs font-bold text-[#eae1dd]">Cuartel de Asalto</span>
                </div>
                <span className="text-[10px] font-bold bg-[#f06536]/20 text-[#ffb59d] px-2 py-0.5 rounded-full">
                  Fuerza: 3 Dados
                </span>
              </div>
              <p className="text-[11px] text-[#e1bfb5]">Entrenamiento de mandíbulas esclerotizadas para incursiones bélicas.</p>
              <div className="flex items-center justify-between bg-[#2e2927] px-3 py-1 rounded-full mt-1">
                <span className="text-xs text-[#eae1dd]">
                  Soldados: <strong className="text-[#ffb59d]">{chambers[1].assignedWorkers}</strong> / {chambers[1].maxWorkers}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => adjustChamberWorker('barracks', -1)}
                    className="w-6 h-6 rounded-full bg-[#393431] hover:bg-[#3d3836] text-[#eae1dd] font-bold text-xs flex items-center justify-center transition-transform active:scale-75 shadow"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustChamberWorker('barracks', 1)}
                    className="w-6 h-6 rounded-full bg-[#f06536] text-[#521400] font-bold text-xs flex items-center justify-center transition-transform active:scale-75 shadow"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={openCombatModal}
                className="btn-shimmer mt-1 w-full bg-[#93000a] hover:bg-[#b4101b] text-white text-[11px] font-bold py-1.5 rounded-full flex items-center justify-center gap-1 transition-all active:scale-95 shadow"
              >
                <span className="material-symbols-outlined text-[15px]">military_tech</span>
                Declarar Conflicto (Saqueo / Captura)
              </button>
            </div>

            {/* Building 3: Hospital */}
            <div className="card-tactile bg-[#231f1d] p-3 rounded-xl flex flex-col gap-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] border-l-2 border-[#1a520c] border border-[#393431]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#393431] text-[#99d781] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">healing</span>
                  </div>
                  <span className="text-xs font-bold text-[#eae1dd]">Hospital de Campaña</span>
                </div>
                <span className="text-[10px] font-bold bg-[#1a520c]/40 text-[#99d781] px-2 py-0.5 rounded-full">
                  Mitiga 2 Bajas
                </span>
              </div>
              <p className="text-[11px] text-[#e1bfb5]">Cámaras con secreciones antifúngicas. Reduce muertes en combate a heridas.</p>
              <div className="flex items-center justify-between bg-[#2e2927] px-3 py-1 rounded-full mt-1">
                <span className="text-xs text-[#eae1dd]">
                  Sanadoras: <strong className="text-[#99d781]">{chambers[2].assignedWorkers}</strong> / {chambers[2].maxWorkers}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => adjustChamberWorker('hospital', -1)}
                    className="w-6 h-6 rounded-full bg-[#393431] hover:bg-[#3d3836] text-[#eae1dd] font-bold text-xs flex items-center justify-center transition-transform active:scale-75 shadow"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustChamberWorker('hospital', 1)}
                    className="w-6 h-6 rounded-full bg-[#99d781] text-[#083900] font-bold text-xs flex items-center justify-center transition-transform active:scale-75 shadow"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Building 4: Crianza */}
            <div className="card-tactile bg-[#231f1d] p-3 rounded-xl flex flex-col gap-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] border-l-2 border-[#56d6f5] border border-[#393431]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#009eba] text-[#001f26] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">egg</span>
                  </div>
                  <span className="text-xs font-bold text-[#eae1dd]">Cámara de Crianza</span>
                </div>
                <span className="text-[10px] font-bold bg-[#56d6f5]/20 text-[#56d6f5] px-2 py-0.5 rounded-full">
                  +1 Población Sig.
                </span>
              </div>
              <p className="text-[11px] text-[#e1bfb5]">Cuidado de huevos de la reina. Requiere flujo constante de agua limpia.</p>
              <div className="flex items-center justify-between bg-[#2e2927] px-3 py-1 rounded-full mt-1">
                <span className="text-xs text-[#eae1dd]">
                  Nodrizas: <strong className="text-[#56d6f5]">{chambers[3].assignedWorkers}</strong> / {chambers[3].maxWorkers}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => adjustChamberWorker('nursery', -1)}
                    className="w-6 h-6 rounded-full bg-[#393431] hover:bg-[#3d3836] text-[#eae1dd] font-bold text-xs flex items-center justify-center transition-transform active:scale-75 shadow"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustChamberWorker('nursery', 1)}
                    className="w-6 h-6 rounded-full bg-[#56d6f5] text-[#001f26] font-bold text-xs flex items-center justify-center transition-transform active:scale-75 shadow"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Building 5: Gran Metrópolis de Arcilla (Hito Wonder) */}
            <div className="card-tactile bg-[#f06536]/10 border border-[#f06536]/40 p-3 rounded-xl flex flex-col gap-1.5 shadow-[0_4px_16px_rgba(240,101,54,0.2)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ffb59d] text-[20px] animate-pulse">stars</span>
                  <span className="text-xs font-bold text-[#ffb59d]">Gran Metrópolis de Arcilla</span>
                </div>
                <span className="font-headline text-base font-bold text-[#ffb59d]">+7 PV</span>
              </div>
              <p className="text-[11px] text-[#e1bfb5]">
                Concede <strong className="text-[#ffb59d]">+1 Acción permanente</strong> por turno al completarse. Req: Población ≥ 6.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#a88a81]">Coste: 5 🌿 • 3 🍖</span>
                <button
                  type="button"
                  onClick={buildWonder}
                  disabled={hasWonderBuilt}
                  className={`btn-shimmer font-headline text-xs px-4 py-1.5 rounded-full font-bold transition-all shadow-md ${
                    hasWonderBuilt
                      ? 'bg-[#1a520c] text-[#99d781] cursor-default'
                      : 'bg-[#f06536] hover:bg-[#ffb59d] text-[#521400] active:scale-95'
                  }`}
                >
                  {hasWonderBuilt ? '✓ Construida' : 'Construir Obra'}
                </button>
              </div>
            </div>

            {/* Building 6: Almacén Silo */}
            <div className="bg-[#231f1d] p-3 rounded-xl flex items-center justify-between shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] border border-[#393431]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a88a81] text-[20px]">warehouse</span>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-bold text-[#eae1dd]">Silo de Granos y Resina</span>
                  <span className="text-[10px] text-[#e1bfb5]">Capacidad Máxima (+5 todos los recursos)</span>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-[#2e2927] text-[#99d781] px-2 py-0.5 rounded-full border border-[#99d781]/30">
                Activo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION HUD (BOTTOM CONSOLE) */}
      <section className="w-full bg-[#2e2927] px-4 md:px-6 py-2.5 shadow-[0_-4px_24px_rgba(0,0,0,0.7)] flex flex-col gap-2 border-t border-[#393431] z-30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Action Economy Command Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-[#a88a81] uppercase tracking-wider pr-1">
              Consola de Acciones:
            </span>
            <button
              type="button"
              onClick={handleMoveUnits}
              className="btn-tactile bg-[#231f1d] hover:bg-[#3d3836] text-[#eae1dd] text-xs px-3.5 h-10 rounded-full flex items-center gap-2 shadow-[0_3px_0_rgba(0,0,0,0.4)] active:translate-y-[2px] transition-all border border-[#393431]"
            >
              <span className="w-5 h-5 rounded-full bg-[#ffb59d]/20 text-[#ffb59d] flex items-center justify-center font-bold text-[10px]">
                1
              </span>
              <span>Asignar / Mover</span>
            </button>
            <button
              type="button"
              onClick={() => addToast('Construir Estructura', 'Selecciona una carta en la mano para erigir la cámara.')}
              className="btn-tactile bg-[#231f1d] hover:bg-[#3d3836] text-[#eae1dd] text-xs px-3.5 h-10 rounded-full flex items-center gap-2 shadow-[0_3px_0_rgba(0,0,0,0.4)] active:translate-y-[2px] transition-all border border-[#393431]"
            >
              <span className="w-5 h-5 rounded-full bg-[#99d781]/20 text-[#99d781] flex items-center justify-center font-bold text-[10px]">
                2
              </span>
              <span>Construir Estructura</span>
            </button>
            <button
              type="button"
              onClick={quickTrade}
              className="btn-tactile bg-[#231f1d] hover:bg-[#3d3836] text-[#eae1dd] text-xs px-3.5 h-10 rounded-full flex items-center gap-2 shadow-[0_3px_0_rgba(0,0,0,0.4)] active:translate-y-[2px] transition-all border border-[#393431]"
            >
              <span className="w-5 h-5 rounded-full bg-[#56d6f5]/20 text-[#56d6f5] flex items-center justify-center font-bold text-[10px]">
                3
              </span>
              <span>Intercambio 2:1</span>
            </button>
            <button
              type="button"
              onClick={openCombatModal}
              className="btn-tactile btn-shimmer bg-[#f06536] hover:bg-[#ffb59d] text-[#521400] hover:text-[#5d1800] text-xs font-bold px-4 h-10 rounded-full flex items-center gap-2 shadow-[0_3px_0_rgba(0,0,0,0.4)] active:translate-y-[2px] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">swords</span>
              <span>Ataque (Saqueo/Captura)</span>
            </button>
          </div>

          {/* Turn Passage Action Chit */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={passTurn}
              className="btn-shimmer bg-[#1a520c] hover:bg-[#99d781] text-[#99d781] hover:text-[#083900] font-headline text-xs md:text-sm px-5 h-10 rounded-full flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(0,0,0,0.45)] hover:shadow-[0_0_18px_rgba(153,215,129,0.5)] active:translate-y-[2px] active:scale-95 transition-all font-bold"
            >
              <span>Cerrar Turno → Colonia Azul</span>
              <span className="material-symbols-outlined text-[18px]">skip_next</span>
            </button>
          </div>
        </div>

        {/* Micro Production & Consumption Ticker Forecast */}
        <div className="flex items-center justify-between text-xs text-[#e1bfb5] pt-0.5 border-t border-[#393431]/50">
          <div className="flex items-center gap-3 flex-wrap">
            <span>
              Balance al final de ronda: <strong className="text-[#99d781]">+{resources.alimentoDelta} Alimento</strong>, <strong className="text-[#56d6f5]">+{resources.aguaDelta} Agua</strong>, <strong className="text-[#99d781]">+{resources.materialDelta} Material</strong>
            </span>
            <span>• Consumo invernal: <strong className="text-[#99d781]">0 (Inmune en Primavera)</strong></span>
          </div>
          <span className="text-[10px] font-bold text-[#a88a81] uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#99d781] animate-pulse"></span>
            Resolución Automática Activada
          </span>
        </div>
      </section>
    </div>
  );
};
