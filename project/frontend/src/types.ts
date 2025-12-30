// Shared types for EvoSim frontend

export interface SerializedCreature {
  id: string;
  x: number;
  y: number;
  angle: number;
  size: number;
  energy: number;
  color: string;
  generation: number;
}

export interface SerializedFood {
  id: string;
  x: number;
  y: number;
  size: number;
}

export interface WorldStats {
  totalCreaturesEver: number;
  totalDeaths: number;
  totalBirths: number;
  currentPopulation: number;
  averageEnergy: number;
  averageAge: number;
  averageSpeed: number;
  averageSize: number;
  oldestCreature: number;
  maxGeneration: number;
}

export interface WorldConfig {
  width: number;
  height: number;
  initialCreatures: number;
  initialFood: number;
  maxFood: number;
  foodSpawnRate: number;
  foodEnergy: number;
  reproductionThreshold: number;
  reproductionCost: number;
  mutationRate: number;
  mutationStrength: number;
}

export interface SerializedState {
  tick: number;
  creatures: SerializedCreature[];
  food: SerializedFood[];
  stats: WorldStats;
  config: {
    width: number;
    height: number;
  };
}

export interface ServerMessage {
  type: 'state' | 'config' | 'stats' | 'paused' | 'resumed' | 'reset';
  data?: SerializedState | WorldConfig | WorldStats;
}
