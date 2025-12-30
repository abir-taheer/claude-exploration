// Core types for the evolutionary simulation

export interface Vector2D {
  x: number;
  y: number;
}

export interface Genome {
  // Physical traits
  maxSpeed: number;      // 0.5 - 3.0 pixels per tick
  turnRate: number;      // 0.1 - 0.5 radians per tick
  size: number;          // 3 - 15 pixels radius
  senseRadius: number;   // 30 - 150 pixels

  // Neural network weights (simple feedforward)
  // 5 inputs -> 6 hidden -> 2 outputs
  // Inputs: food angle, food distance, energy level, random noise, bias
  // Outputs: turn amount (-1 to 1), speed (0 to 1)
  weightsInputHidden: number[];  // 5*6 = 30 weights
  weightsHiddenOutput: number[]; // 6*2 = 12 weights
  biasHidden: number[];          // 6 biases
  biasOutput: number[];          // 2 biases

  // Metabolism
  energyEfficiency: number;  // 0.5 - 1.5 multiplier for energy from food
  baseDrain: number;         // 0.1 - 0.5 energy per tick
}

export interface Creature {
  id: string;
  genome: Genome;

  // State
  position: Vector2D;
  velocity: Vector2D;
  angle: number;           // Direction facing (radians)
  energy: number;          // 0-100
  age: number;             // Ticks alive

  // Visual
  color: string;           // Derived from genome

  // Stats
  foodEaten: number;
  distanceTraveled: number;
  generation: number;
}

export interface Food {
  id: string;
  position: Vector2D;
  energy: number;          // Energy provided when eaten
  size: number;            // Visual size
}

export interface WorldConfig {
  width: number;
  height: number;
  initialCreatures: number;
  initialFood: number;
  maxFood: number;
  foodSpawnRate: number;   // Food spawned per tick
  foodEnergy: number;      // Energy per food item
  reproductionThreshold: number;  // Energy needed to reproduce
  reproductionCost: number;       // Energy spent on reproduction
  mutationRate: number;           // Probability of gene mutation
  mutationStrength: number;       // How much genes can change
}

export interface WorldState {
  tick: number;
  creatures: Creature[];
  food: Food[];
  config: WorldConfig;
  stats: WorldStats;
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

export interface HistoryPoint {
  tick: number;
  population: number;
  avgSpeed: number;
  avgSize: number;
  maxGeneration: number;
}

export interface SimulationHistory {
  points: HistoryPoint[];
  maxPoints: number;
}
