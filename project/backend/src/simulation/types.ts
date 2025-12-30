// Core types for the evolutionary simulation

// Creature diet types
export enum DietType {
  Herbivore = 'herbivore',   // Only eats plants
  Carnivore = 'carnivore',   // Only eats other creatures
  Omnivore = 'omnivore',     // Eats both plants and creatures
}

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

  // Diet type (determines what creature can eat)
  dietType: DietType;

  // Hunting traits (for carnivores/omnivores)
  attackPower: number;   // 0.3 - 1.0 damage multiplier
  defense: number;       // 0.3 - 1.0 damage reduction

  // Neural network weights (simple feedforward)
  // 7 inputs -> 8 hidden -> 3 outputs
  // Inputs: food angle, food distance, prey angle, prey distance, predator angle, energy level, bias
  // Outputs: turn amount (-1 to 1), speed (0 to 1), attack (0 or 1)
  weightsInputHidden: number[];  // 7*8 = 56 weights
  weightsHiddenOutput: number[]; // 8*3 = 24 weights
  biasHidden: number[];          // 8 biases
  biasOutput: number[];          // 3 biases

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
  creaturesKilled: number;
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
  energyDrainMultiplier: number;  // Multiplier for all energy drain (lower = longer lifespan)
  guaranteedHunting: boolean;     // If true, hunting always succeeds (no attack/defense roll)
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
  herbivores: number;
  carnivores: number;
  omnivores: number;
}

export interface SimulationHistory {
  points: HistoryPoint[];
  maxPoints: number;
}
