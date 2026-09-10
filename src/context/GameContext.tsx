import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ScreenId, 
  Season, 
  ColonyResources, 
  ColonyRival, 
  GameCard, 
  TacticalNode, 
  ChamberBuilding, 
  MutationNode, 
  CasteUnit, 
  LegionSquad, 
  ToastMessage, 
  LogEntry 
} from '../types';
import { 
  initialResources, 
  initialRivals, 
  initialCards, 
  initialTacticalNodes, 
  initialChambers, 
  initialMutations, 
  initialCastes, 
  initialLegions 
} from '../data/gameData';
import { 
  playTapSound, 
  playChitSound, 
  playTurnPassSound, 
  playVictorySound, 
  setSoundMuted, 
  getSoundMuted 
} from '../utils/audio';

interface GameContextType {
  // Navigation
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;

  // Turn & Season
  turn: number;
  round: number;
  season: Season;
  year: number;
  actionPoints: number;
  maxActionPoints: number;
  isPassingTurn: boolean;
  passTurn: () => void;
  consumeActionPoint: (cost?: number) => boolean;

  // Drawers
  colonyDrawerOpen: boolean;
  toggleColonyDrawer: () => void;
  buildingsDrawerOpen: boolean;
  toggleBuildingsDrawer: () => void;
  sidebarMobileOpen: boolean;
  setSidebarMobileOpen: (open: boolean) => void;

  // Resources
  resources: ColonyResources;
  updateResource: (key: keyof ColonyResources, delta: number) => void;
  quickTrade: () => void;

  // Colonies & Rivals
  rivals: ColonyRival[];
  updateRivalPv: (id: string, delta: number) => void;
  updateRivalStatus: (id: string, status: ColonyRival['status']) => void;

  // Hand Cards
  cards: GameCard[];
  playCard: (cardId: string) => void;
  scrapCard: (cardId: string) => void;

  // Tactical Map
  nodes: TacticalNode[];
  selectedNode: TacticalNode;
  setSelectedNodeId: (nodeId: string) => void;
  mapZoom: number;
  adjustZoom: (delta: number) => void;
  resetZoom: () => void;

  // Buildings & Chambers
  chambers: ChamberBuilding[];
  adjustChamberWorker: (chamberId: string, delta: number) => void;
  hasWonderBuilt: boolean;
  buildWonder: () => void;

  // Rehabilitation Infirmary
  healInjuredUnit: (method: 'hospital' | 'food') => void;

  // Combat Modal
  combatModalOpen: boolean;
  openCombatModal: () => void;
  closeCombatModal: () => void;

  // Genetic Tree
  mutations: MutationNode[];
  dnaPoints: number;
  unlockMutation: (mutationId: string) => void;

  // Castes & Legions
  castes: CasteUnit[];
  adjustCasteCount: (casteId: string, delta: number) => void;
  legions: LegionSquad[];
  updateLegionMorale: (legionId: string, delta: number) => void;

  // Modals (Log & Rules)
  logModalOpen: boolean;
  setLogModalOpen: (open: boolean) => void;
  rulesModalOpen: boolean;
  setRulesModalOpen: (open: boolean) => void;

  // Audio Mute State
  soundMuted: boolean;
  toggleSoundMuted: () => void;

  // Toasts & Logs
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  logs: LogEntry[];
  addLog: (text: string, type?: LogEntry['type']) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreenState] = useState<ScreenId>('mapa-tactico');
  const [turn, setTurn] = useState<number>(1);
  const [round, setRound] = useState<number>(2);
  const [season, setSeason] = useState<Season>('Primavera');
  const [year, setYear] = useState<number>(1);
  const [actionPoints, setActionPoints] = useState<number>(3);
  const [maxActionPoints, setMaxActionPoints] = useState<number>(3);
  const [isPassingTurn, setIsPassingTurn] = useState<boolean>(false);

  const [colonyDrawerOpen, setColonyDrawerOpen] = useState<boolean>(true);
  const [buildingsDrawerOpen, setBuildingsDrawerOpen] = useState<boolean>(true);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState<boolean>(false);

  const [resources, setResources] = useState<ColonyResources>(initialResources);
  const [rivals, setRivals] = useState<ColonyRival[]>(initialRivals);
  const [cards, setCards] = useState<GameCard[]>(initialCards);
  const [nodes, setNodes] = useState<TacticalNode[]>(initialTacticalNodes);
  const [selectedNode, setSelectedNode] = useState<TacticalNode>(initialTacticalNodes[0]);
  const [mapZoom, setMapZoom] = useState<number>(1);

  const [chambers, setChambers] = useState<ChamberBuilding[]>(initialChambers);
  const [hasWonderBuilt, setHasWonderBuilt] = useState<boolean>(false);

  const [mutations, setMutations] = useState<MutationNode[]>(initialMutations);
  const [dnaPoints, setDnaPoints] = useState<number>(6);

  const [castes, setCastes] = useState<CasteUnit[]>(initialCastes);
  const [legions, setLegions] = useState<LegionSquad[]>(initialLegions);

  const [combatModalOpen, setCombatModalOpen] = useState<boolean>(false);
  const [logModalOpen, setLogModalOpen] = useState<boolean>(false);
  const [rulesModalOpen, setRulesModalOpen] = useState<boolean>(false);
  const [soundMuted, setSoundMutedState] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-0',
      turn: 1,
      round: 1,
      season: 'Primavera',
      text: 'Inicio del Año 1. Nido Carmesí emerge tras la helada. Reina Carmesí inicia postura.',
      timestamp: '15:20',
      type: 'season',
    },
    {
      id: 'log-1',
      turn: 1,
      round: 2,
      season: 'Primavera',
      text: 'Exploración del Manantial de Rocío: Agua dulce asegurada (+3/turno). Disputado con Colonia Azul.',
      timestamp: '15:24',
      type: 'action',
    },
  ]);

  const addToast = (title: string, message: string, type: ToastMessage['type'] = 'primary') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3600);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addLog = (text: string, type: LogEntry['type'] = 'action') => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      turn,
      round,
      season,
      text,
      timestamp: timeStr,
      type,
    };
    setLogs((prev) => [newEntry, ...prev]);
  };

  const consumeActionPoint = (cost: number = 1): boolean => {
    if (actionPoints < cost) {
      addToast('Sin AP Suficientes', `Esta acción requiere ${cost} AP. Pasa el turno para restaurar tus acciones.`, 'warning');
      return false;
    }
    setActionPoints((prev) => Math.max(0, prev - cost));
    return true;
  };

  const toggleSoundMuted = () => {
    const next = !soundMuted;
    setSoundMutedState(next);
    setSoundMuted(next);
    addToast('Audio', next ? 'Sonido silenciado.' : 'Sonido activado.', 'primary');
  };

  const setCurrentScreen = (screen: ScreenId) => {
    playTapSound();
    setCurrentScreenState(screen);
    setSidebarMobileOpen(false);
  };

  const toggleColonyDrawer = () => {
    playTapSound();
    setColonyDrawerOpen((prev) => !prev);
  };

  const toggleBuildingsDrawer = () => {
    playTapSound();
    setBuildingsDrawerOpen((prev) => !prev);
  };

  const setSelectedNodeId = (nodeId: string) => {
    playChitSound();
    const found = nodes.find((n) => n.id === nodeId);
    if (found) {
      setSelectedNode(found);
      addToast('Nódulo Táctico', `Seleccionado: ${found.name}`, 'primary');
    }
  };

  const adjustZoom = (delta: number) => {
    playTapSound();
    setMapZoom((prev) => Math.max(0.7, Math.min(1.4, prev + delta)));
  };

  const resetZoom = () => {
    playTapSound();
    setMapZoom(1);
    addToast('Cámara', 'Vista reenfocada en Nido Carmesí.', 'primary');
  };

  const updateResource = (key: keyof ColonyResources, delta: number) => {
    setResources((prev) => {
      const current = prev[key];
      const maxKey = (key + 'Max') as keyof ColonyResources;
      const maxVal = prev[maxKey] !== undefined ? (prev[maxKey] as number) : 999;
      const nextVal = Math.max(0, Math.min(current + delta, maxVal));
      return { ...prev, [key]: nextVal };
    });
  };

  const quickTrade = () => {
    if (actionPoints < 1) {
      addToast('Sin AP', 'Requiere 1 Acción (AP) para comerciar.', 'warning');
      return;
    }
    if (resources.material < 2) {
      addToast('Falta Material', 'Se requieren al menos 2 Materiales para comerciar.', 'warning');
      return;
    }
    playChitSound();
    setActionPoints((ap) => ap - 1);
    setResources((prev) => ({
      ...prev,
      material: Math.max(0, prev.material - 2),
      alimento: Math.min(prev.alimentoMax, prev.alimento + 1),
    }));
    addToast('Comercio Exitoso', '2 Materiales convertidos en 1 Alimento (-1 AP).', 'success');
    addLog('Comercio 2:1 ejecutado: -2 Materiales, +1 Alimento.', 'action');
  };

  const updateRivalPv = (id: string, delta: number) => {
    setRivals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, pv: Math.max(0, r.pv + delta) } : r))
    );
  };

  const updateRivalStatus = (id: string, status: ColonyRival['status']) => {
    setRivals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const playCard = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    if (actionPoints < 1) {
      addToast('Sin AP', 'No tienes suficientes Puntos de Acción (-1 AP).', 'warning');
      return;
    }
    if (resources.material < card.costMaterial || resources.agua < card.costWater || resources.alimento < card.costFood) {
      addToast('Recursos Insuficientes', `Coste: ${card.costText}`, 'warning');
      return;
    }

    playChitSound();
    setActionPoints((ap) => ap - 1);
    setResources((prev) => ({
      ...prev,
      material: prev.material - card.costMaterial,
      agua: prev.agua - card.costWater,
      alimento: prev.alimento - card.costFood,
      puntosVictoria: prev.puntosVictoria + card.pv,
    }));
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    addToast('Estructura Construida', `¡${card.name} añadida a la colonia (+${card.pv} PV)!`, 'success');
    addLog(`Construcción completada: ${card.name} (+${card.pv} PV).`, 'action');
  };

  const scrapCard = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    if (actionPoints < 1) {
      addToast('Sin AP', 'Desguazar requiere 1 Acción (-1 AP).', 'warning');
      return;
    }

    playChitSound();
    setActionPoints((ap) => ap - 1);
    setResources((prev) => ({
      ...prev,
      material: Math.min(prev.materialMax, prev.material + card.scrapMaterial),
      agua: Math.min(prev.aguaMax, prev.agua + card.scrapWater),
      alimento: Math.min(prev.alimentoMax, prev.alimento + card.scrapFood),
    }));
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    addToast('Carta Desguazada', `Rescatado: ${card.scrapText}`, 'primary');
    addLog(`Desguace de ${card.name}: obtenidos ${card.scrapText}.`, 'action');
  };

  const adjustChamberWorker = (chamberId: string, delta: number) => {
    const ch = chambers.find((c) => c.id === chamberId);
    if (!ch) return;
    const target = ch.assignedWorkers + delta;
    if (target < 0 || target > ch.maxWorkers) return;

    if (delta > 0 && resources.poblacionLibre <= 0) {
      addToast('Sin Obreras Libres', 'Toda tu población está asignada.', 'warning');
      return;
    }

    playTapSound();
    setChambers((prev) =>
      prev.map((c) => (c.id === chamberId ? { ...c, assignedWorkers: target } : c))
    );
    setResources((prev) => ({
      ...prev,
      poblacionLibre: Math.max(0, prev.poblacionLibre - delta),
    }));
    addToast('Gestión de Casta', `${ch.name}: ${target} ${ch.workerType} asignadas.`, 'primary');
  };

  const buildWonder = () => {
    if (hasWonderBuilt) {
      addToast('Hito Ya Construido', 'La Gran Metrópolis de Arcilla ya está en pie.', 'warning');
      return;
    }
    if (resources.material < 5 || resources.alimento < 3) {
      addToast('Faltan Recursos', 'Coste: 5 Materiales y 3 Alimentos.', 'warning');
      return;
    }
    if (resources.poblacion < 6) {
      addToast('Falta Población', 'Requiere Población ≥ 6.', 'warning');
      return;
    }

    playVictorySound();
    setHasWonderBuilt(true);
    setMaxActionPoints((prev) => prev + 1);
    setActionPoints((prev) => prev + 1);
    setResources((prev) => ({
      ...prev,
      material: prev.material - 5,
      alimento: prev.alimento - 3,
      puntosVictoria: prev.puntosVictoria + 7,
    }));
    addToast('¡HITO CONCLUIDO!', '¡Gran Metrópolis de Arcilla terminada! +7 PV y +1 Acción Permanente.', 'success');
    addLog('¡Gran Metrópolis de Arcilla finalizada! +7 PV, +1 AP permanente.', 'action');
  };

  const healInjuredUnit = (method: 'hospital' | 'food') => {
    if (resources.poblacionRehab <= 0) {
      addToast('Sin Heridos', 'No hay unidades en la Cámara de Rehabilitación.', 'primary');
      return;
    }
    if (method === 'food' && resources.alimento < 2) {
      addToast('Falta Alimento', 'Se requieren 2 raciones de Alimento.', 'warning');
      return;
    }

    playChitSound();
    setResources((prev) => ({
      ...prev,
      alimento: method === 'food' ? prev.alimento - 2 : prev.alimento,
      poblacionRehab: prev.poblacionRehab - 1,
      poblacionLibre: prev.poblacionLibre + 1,
    }));
    addToast('Unidad Recuperada', method === 'hospital' ? 'Curada gratis por el Hospital de Campaña.' : 'Curada pagando 2 Alimentos.', 'success');
    addLog('Unidad herida rehabilitada e integrada a la reserva libre.', 'action');
  };

  const unlockMutation = (mutationId: string) => {
    const mut = mutations.find((m) => m.id === mutationId);
    if (!mut) return;
    if (mut.unlocked) {
      addToast('Genética', 'Esta mutación ya está integrada en el genoma.', 'primary');
      return;
    }
    if (dnaPoints < mut.costDNA) {
      addToast('Falta ADN / Mutágeno', `Requiere ${mut.costDNA} puntos de ADN.`, 'warning');
      return;
    }
    if (mut.parentId) {
      const parent = mutations.find((m) => m.id === mut.parentId);
      if (parent && !parent.unlocked) {
        addToast('Mutación Bloqueada', `Debes desbloquear primero: ${parent.name}.`, 'warning');
        return;
      }
    }

    playVictorySound();
    setDnaPoints((prev) => prev - mut.costDNA);
    setMutations((prev) =>
      prev.map((m) => (m.id === mutationId ? { ...m, unlocked: true } : m))
    );
    setResources((prev) => ({
      ...prev,
      puntosVictoria: prev.puntosVictoria + mut.pv,
    }));
    addToast('Genoma Evolucionado', `Mutación ${mut.name} desbloqueada (+${mut.pv} PV).`, 'success');
    addLog(`Evolución genética: ${mut.name} desbloqueada (+${mut.pv} PV). Beneficio: ${mut.benefit}`, 'action');
  };

  const adjustCasteCount = (casteId: string, delta: number) => {
    const c = castes.find((item) => item.id === casteId);
    if (!c) return;
    const target = c.count + delta;
    if (target < 0) return;

    if (delta > 0) {
      if (resources.poblacionLibre < delta) {
        addToast('Sin Población Libre', 'No hay crías maduras disponibles en reserva.', 'warning');
        return;
      }
      if (resources.alimento < Math.abs(delta) * 1) {
        addToast('Falta Alimento', 'Se requiere 1 Alimento por cada nueva unidad metamorfoseada.', 'warning');
        return;
      }
    }

    playChitSound();
    setCastes((prev) =>
      prev.map((item) => (item.id === casteId ? { ...item, count: target } : item))
    );
    setResources((prev) => ({
      ...prev,
      poblacionLibre: Math.max(0, prev.poblacionLibre - delta),
      alimento: delta > 0 ? prev.alimento - delta : prev.alimento,
      poblacion: prev.poblacion + delta,
    }));
    addToast('Casta Modificada', `${c.name}: ${target} unidades en activo.`, 'primary');
  };

  const updateLegionMorale = (legionId: string, delta: number) => {
    playTapSound();
    setLegions((prev) =>
      prev.map((l) => (l.id === legionId ? { ...l, morale: Math.max(0, Math.min(100, l.morale + delta)) } : l))
    );
  };

  const openCombatModal = () => {
    playChitSound();
    setCombatModalOpen(true);
  };

  const closeCombatModal = () => {
    playTapSound();
    setCombatModalOpen(false);
  };

  const passTurn = () => {
    if (isPassingTurn) return;
    setIsPassingTurn(true);
    playTurnPassSound();

    // Calculate production
    const prodFood = resources.alimentoDelta;
    const prodWater = resources.aguaDelta;
    const prodMat = resources.materialDelta;

    // Advance round / season
    const seasonsList: Season[] = ['Primavera', 'Verano', 'Otoño', 'Invierno'];
    let nextRound = round + 1;
    let nextSeason = season;
    let nextYear = year;

    if (nextRound > 4) {
      nextRound = 1;
      const currentIdx = seasonsList.indexOf(season);
      if (currentIdx === seasonsList.length - 1) {
        nextSeason = 'Primavera';
        nextYear += 1;
      } else {
        nextSeason = seasonsList[currentIdx + 1];
      }
    }

    setRound(nextRound);
    setSeason(nextSeason);
    setYear(nextYear);
    setTurn((t) => t + 1);
    setActionPoints(maxActionPoints);
    setDnaPoints((dna) => dna + 1);

    // Apply harvest
    setResources((prev) => ({
      ...prev,
      alimento: Math.min(prev.alimentoMax, prev.alimento + prodFood),
      agua: Math.min(prev.aguaMax, prev.agua + prodWater),
      material: Math.min(prev.materialMax, prev.material + prodMat),
    }));

    // Simulate AI rival movements
    setTimeout(() => {
      const blueDelta = Math.floor(Math.random() * 2);
      const greenDelta = Math.floor(Math.random() * 2);
      updateRivalPv('azul', blueDelta);
      updateRivalPv('verde', greenDelta);

      addToast(
        'Ronda Avanzada',
        `Cosecha: +${prodFood} Alimento, +${prodWater} Agua, +${prodMat} Mat. AP restaurados (${maxActionPoints}/${maxActionPoints}).`,
        'success'
      );
      addLog(`Fin de Ronda. Transición a ${nextSeason} (Año ${nextYear}, Ronda ${nextRound}). Producción recolectada.`, 'season');
      setIsPassingTurn(false);
    }, 450);
  };

  return (
    <GameContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        turn,
        round,
        season,
        year,
        actionPoints,
        maxActionPoints,
        isPassingTurn,
        passTurn,
        consumeActionPoint,
        colonyDrawerOpen,
        toggleColonyDrawer,
        buildingsDrawerOpen,
        toggleBuildingsDrawer,
        sidebarMobileOpen,
        setSidebarMobileOpen,
        resources,
        updateResource,
        quickTrade,
        rivals,
        updateRivalPv,
        updateRivalStatus,
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
        healInjuredUnit,
        combatModalOpen,
        openCombatModal,
        closeCombatModal,
        mutations,
        dnaPoints,
        unlockMutation,
        castes,
        adjustCasteCount,
        legions,
        updateLegionMorale,
        logModalOpen,
        setLogModalOpen,
        rulesModalOpen,
        setRulesModalOpen,
        soundMuted,
        toggleSoundMuted,
        toasts,
        addToast,
        removeToast,
        logs,
        addLog,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
