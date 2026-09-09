export type ScreenId = 
  | 'mapa-tactico' 
  | 'ant-hill-core' 
  | 'arbol-evolutivo' 
  | 'enjambre-militar' 
  | 'feromonas-diplomacia';

export type Season = 'Primavera' | 'Verano' | 'Otoño' | 'Invierno';

export interface ColonyResources {
  alimento: number;
  alimentoMax: number;
  alimentoDelta: number;
  agua: number;
  aguaMax: number;
  aguaDelta: number;
  material: number;
  materialMax: number;
  materialDelta: number;
  poblacion: number;
  poblacionMax: number;
  poblacionLibre: number;
  poblacionRehab: number;
  puntosVictoria: number;
}

export interface ColonyRival {
  id: string;
  name: string;
  color: string;
  colorHex: string;
  pv: number;
  status: 'Activo' | 'Hostil' | 'Paz' | 'Aliado';
  attitude: string;
  description: string;
  leader: string;
}

export interface GameCard {
  id: string;
  name: string;
  type: 'Investigación' | 'Estructura' | 'Militar';
  costText: string;
  costFood: number;
  costWater: number;
  costMaterial: number;
  reqText: string;
  pv: number;
  description: string;
  scrapText: string;
  scrapFood: number;
  scrapWater: number;
  scrapMaterial: number;
  borderClass: string;
}

export interface TacticalNode {
  id: string;
  name: string;
  type: 'base' | 'agro' | 'agua' | 'defensa' | 'material' | 'enemigo';
  badge: string;
  title: string;
  subtitle: string;
  unitsText: string;
  x: number;
  y: number;
  owner: 'roja' | 'azul' | 'verde' | 'neutral';
  colorHex: string;
  description: string;
  production: string;
  defBonus: number;
}

export interface ChamberBuilding {
  id: string;
  name: string;
  level: number;
  productionText: string;
  description: string;
  assignedWorkers: number;
  maxWorkers: number;
  workerType: 'Obreras' | 'Soldados' | 'Sanadoras' | 'Nodrizas';
  accentColor: string;
}

export interface MutationNode {
  id: string;
  name: string;
  category: 'Armadura' | 'Metabolismo' | 'Percepción';
  costDNA: number;
  unlocked: boolean;
  pv: number;
  description: string;
  benefit: string;
  icon: string;
  parentId?: string;
}

export interface CasteUnit {
  id: string;
  name: string;
  role: string;
  count: number;
  costFoodPerTurn: number;
  power: number;
  description: string;
  icon: string;
  color: string;
}

export interface LegionSquad {
  id: string;
  name: string;
  location: string;
  soldierCount: number;
  majorCount: number;
  morale: number; // 0-100
  mission: 'Guardia Territorial' | 'Defensa del Manantial' | 'Reconocimiento Sigiloso';
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'primary' | 'success' | 'warning' | 'error';
}

export interface LogEntry {
  id: string;
  turn: number;
  round: number;
  season: Season;
  text: string;
  timestamp: string;
  type: 'action' | 'combat' | 'season' | 'diplomacy';
}
