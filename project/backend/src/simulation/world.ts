// World simulation: manages creatures, food, and simulation loop

import { Creature, Food, WorldConfig, WorldState, WorldStats, Vector2D } from './types';
import {
  createRandomCreature,
  createCreature,
  getCreatureInput,
  think,
  move,
  metabolize,
  reproduce,
  mutateGenome,
} from './creature';

let foodIdCounter = 0;

function generateFoodId(): string {
  return `f_${++foodIdCounter}`;
}

function createFood(worldWidth: number, worldHeight: number, energy: number): Food {
  return {
    id: generateFoodId(),
    position: {
      x: Math.random() * worldWidth,
      y: Math.random() * worldHeight,
    },
    energy,
    size: 4 + energy / 5,
  };
}

function distance(a: Vector2D, b: Vector2D, worldWidth: number, worldHeight: number): number {
  // Account for world wrapping
  let dx = Math.abs(a.x - b.x);
  let dy = Math.abs(a.y - b.y);
  if (dx > worldWidth / 2) dx = worldWidth - dx;
  if (dy > worldHeight / 2) dy = worldHeight - dy;
  return Math.sqrt(dx * dx + dy * dy);
}

function angleTo(from: Vector2D, to: Vector2D, worldWidth: number, worldHeight: number): number {
  // Account for world wrapping
  let dx = to.x - from.x;
  let dy = to.y - from.y;
  if (dx > worldWidth / 2) dx -= worldWidth;
  if (dx < -worldWidth / 2) dx += worldWidth;
  if (dy > worldHeight / 2) dy -= worldHeight;
  if (dy < -worldHeight / 2) dy += worldHeight;
  return Math.atan2(dy, dx);
}

export function createDefaultConfig(): WorldConfig {
  return {
    width: 800,
    height: 600,
    initialCreatures: 30,
    initialFood: 100,
    maxFood: 200,
    foodSpawnRate: 0.5,
    foodEnergy: 20,
    reproductionThreshold: 80,
    reproductionCost: 40,
    mutationRate: 0.1,
    mutationStrength: 0.3,
  };
}

export function createWorld(config: WorldConfig): WorldState {
  const creatures: Creature[] = [];
  const food: Food[] = [];

  // Spawn initial creatures
  for (let i = 0; i < config.initialCreatures; i++) {
    creatures.push(createRandomCreature(config.width, config.height));
  }

  // Spawn initial food
  for (let i = 0; i < config.initialFood; i++) {
    food.push(createFood(config.width, config.height, config.foodEnergy));
  }

  return {
    tick: 0,
    creatures,
    food,
    config,
    stats: calculateStats(creatures),
  };
}

function calculateStats(creatures: Creature[]): WorldStats {
  if (creatures.length === 0) {
    return {
      totalCreaturesEver: 0,
      totalDeaths: 0,
      totalBirths: 0,
      currentPopulation: 0,
      averageEnergy: 0,
      averageAge: 0,
      averageSpeed: 0,
      averageSize: 0,
      oldestCreature: 0,
      maxGeneration: 0,
    };
  }

  const totalEnergy = creatures.reduce((sum, c) => sum + c.energy, 0);
  const totalAge = creatures.reduce((sum, c) => sum + c.age, 0);
  const totalSpeed = creatures.reduce((sum, c) => sum + c.genome.maxSpeed, 0);
  const totalSize = creatures.reduce((sum, c) => sum + c.genome.size, 0);
  const maxAge = Math.max(...creatures.map(c => c.age));
  const maxGen = Math.max(...creatures.map(c => c.generation));

  return {
    totalCreaturesEver: 0, // Updated externally
    totalDeaths: 0,        // Updated externally
    totalBirths: 0,        // Updated externally
    currentPopulation: creatures.length,
    averageEnergy: totalEnergy / creatures.length,
    averageAge: totalAge / creatures.length,
    averageSpeed: totalSpeed / creatures.length,
    averageSize: totalSize / creatures.length,
    oldestCreature: maxAge,
    maxGeneration: maxGen,
  };
}

// Find nearest food within creature's sensing radius
function findNearestFood(
  creature: Creature,
  food: Food[],
  worldWidth: number,
  worldHeight: number
): { food: Food; distance: number; angle: number } | null {
  let nearest: { food: Food; distance: number; angle: number } | null = null;

  for (const f of food) {
    const dist = distance(creature.position, f.position, worldWidth, worldHeight);
    if (dist <= creature.genome.senseRadius) {
      if (!nearest || dist < nearest.distance) {
        const angle = angleTo(creature.position, f.position, worldWidth, worldHeight);
        // Convert to relative angle
        let relativeAngle = angle - creature.angle;
        while (relativeAngle > Math.PI) relativeAngle -= Math.PI * 2;
        while (relativeAngle < -Math.PI) relativeAngle += Math.PI * 2;
        nearest = { food: f, distance: dist, angle: relativeAngle };
      }
    }
  }

  return nearest;
}

// Check if creature can eat food
function checkFoodCollision(creature: Creature, food: Food): boolean {
  const dist = Math.sqrt(
    Math.pow(creature.position.x - food.position.x, 2) +
    Math.pow(creature.position.y - food.position.y, 2)
  );
  return dist < creature.genome.size + food.size;
}

export function simulateTick(world: WorldState): {
  births: Creature[];
  deaths: Creature[];
  foodEaten: Food[];
} {
  const { creatures, food, config } = world;
  const births: Creature[] = [];
  const deaths: Creature[] = [];
  const foodEaten: Food[] = [];

  // Process each creature
  for (const creature of creatures) {
    // Find nearest food
    const nearestFood = findNearestFood(creature, food, config.width, config.height);

    // Get neural input
    const input = getCreatureInput(
      creature,
      nearestFood ? { angle: nearestFood.angle, distance: nearestFood.distance } : null
    );

    // Think and decide
    const decision = think(creature, input);

    // Move
    move(creature, decision, config.width, config.height);

    // Metabolize (energy drain)
    metabolize(creature);

    // Check for food eating
    for (const f of food) {
      if (!foodEaten.includes(f) && checkFoodCollision(creature, f)) {
        creature.energy += f.energy * creature.genome.energyEfficiency;
        creature.energy = Math.min(100, creature.energy);
        creature.foodEaten++;
        foodEaten.push(f);
        break; // Only eat one food per tick
      }
    }

    // Check for reproduction
    if (creature.energy >= config.reproductionThreshold) {
      creature.energy -= config.reproductionCost;
      const child = reproduce(creature, config.mutationRate, config.mutationStrength);
      // Keep child in bounds
      child.position.x = Math.max(0, Math.min(config.width, child.position.x));
      child.position.y = Math.max(0, Math.min(config.height, child.position.y));
      births.push(child);
    }

    // Check for death
    if (creature.energy <= 0) {
      deaths.push(creature);
    }
  }

  // Remove dead creatures
  for (const dead of deaths) {
    const index = creatures.indexOf(dead);
    if (index > -1) {
      creatures.splice(index, 1);
    }
  }

  // Remove eaten food
  for (const eaten of foodEaten) {
    const index = food.indexOf(eaten);
    if (index > -1) {
      food.splice(index, 1);
    }
  }

  // Add newborn creatures
  creatures.push(...births);

  // Spawn new food
  if (food.length < config.maxFood && Math.random() < config.foodSpawnRate) {
    food.push(createFood(config.width, config.height, config.foodEnergy));
  }

  // Update tick counter
  world.tick++;

  // Update stats
  world.stats = {
    ...calculateStats(creatures),
    totalCreaturesEver: world.stats.totalCreaturesEver + births.length,
    totalDeaths: world.stats.totalDeaths + deaths.length,
    totalBirths: world.stats.totalBirths + births.length,
  };

  return { births, deaths, foodEaten };
}

// Serializable state for sending to clients
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

export function serializeState(world: WorldState): SerializedState {
  return {
    tick: world.tick,
    creatures: world.creatures.map(c => ({
      id: c.id,
      x: c.position.x,
      y: c.position.y,
      angle: c.angle,
      size: c.genome.size,
      energy: c.energy,
      color: c.color,
      generation: c.generation,
    })),
    food: world.food.map(f => ({
      id: f.id,
      x: f.position.x,
      y: f.position.y,
      size: f.size,
    })),
    stats: world.stats,
    config: {
      width: world.config.width,
      height: world.config.height,
    },
  };
}
