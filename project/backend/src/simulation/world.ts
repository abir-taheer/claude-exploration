// World simulation: manages creatures, food, and simulation loop

import { Creature, DietType, Food, WorldConfig, WorldState, WorldStats, Vector2D } from './types';
import {
  createRandomCreature,
  createCreature,
  genomeToColor,
  getCreatureInput,
  think,
  move,
  metabolize,
  reproduce,
  mutateGenome,
  TargetInfo,
} from './creature';

let foodIdCounter = 0;

// Food hotspots - areas where food spawns more frequently
// These create interesting competition zones
interface Hotspot {
  x: number;
  y: number;
  radius: number;
  probability: number; // 0-1, chance to spawn here vs random
}

let hotspots: Hotspot[] = [];

function initializeHotspots(worldWidth: number, worldHeight: number): void {
  // Create 3-5 random hotspots
  const count = 3 + Math.floor(Math.random() * 3);
  hotspots = [];
  for (let i = 0; i < count; i++) {
    hotspots.push({
      x: 50 + Math.random() * (worldWidth - 100),
      y: 50 + Math.random() * (worldHeight - 100),
      radius: 60 + Math.random() * 80,
      probability: 0.4 + Math.random() * 0.3, // 40-70% of food spawns near hotspots
    });
  }
}

function generateFoodId(): string {
  return `f_${++foodIdCounter}`;
}

function createFood(worldWidth: number, worldHeight: number, energy: number): Food {
  let x: number, y: number;

  // 60% chance to spawn near a hotspot
  if (hotspots.length > 0 && Math.random() < 0.6) {
    const hotspot = hotspots[Math.floor(Math.random() * hotspots.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * hotspot.radius;
    x = hotspot.x + Math.cos(angle) * dist;
    y = hotspot.y + Math.sin(angle) * dist;
    // Wrap around edges
    x = ((x % worldWidth) + worldWidth) % worldWidth;
    y = ((y % worldHeight) + worldHeight) % worldHeight;
  } else {
    // Random position
    x = Math.random() * worldWidth;
    y = Math.random() * worldHeight;
  }

  return {
    id: generateFoodId(),
    position: { x, y },
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
    energyDrainMultiplier: 0.5, // Lower = longer lifespan (0.5 = half the normal drain)
  };
}

export function createWorld(config: WorldConfig): WorldState {
  const creatures: Creature[] = [];
  const food: Food[] = [];

  // Initialize food hotspots
  initializeHotspots(config.width, config.height);

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

// Find nearest food within creature's sensing radius (only for herbivores/omnivores)
function findNearestFood(
  creature: Creature,
  food: Food[],
  worldWidth: number,
  worldHeight: number
): { food: Food; distance: number; angle: number } | null {
  // Carnivores don't eat plants
  if (creature.genome.dietType === DietType.Carnivore) return null;

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

// Check if creature A can hunt creature B
function canHunt(hunter: Creature, prey: Creature): boolean {
  // Herbivores can't hunt
  if (hunter.genome.dietType === DietType.Herbivore) return false;

  // Carnivores hunt herbivores and smaller omnivores
  // Omnivores hunt smaller herbivores
  const hunterSize = hunter.genome.size;
  const preySize = prey.genome.size;

  if (hunter.genome.dietType === DietType.Carnivore) {
    // Carnivores can hunt herbivores of any size, or smaller omnivores
    if (prey.genome.dietType === DietType.Herbivore) return true;
    if (prey.genome.dietType === DietType.Omnivore && hunterSize > preySize * 0.8) return true;
    return false;
  }

  if (hunter.genome.dietType === DietType.Omnivore) {
    // Omnivores can hunt smaller herbivores
    if (prey.genome.dietType === DietType.Herbivore && hunterSize > preySize) return true;
    return false;
  }

  return false;
}

// Check if creature A should flee from creature B
function shouldFlee(creature: Creature, other: Creature): boolean {
  return canHunt(other, creature);
}

// Find nearest prey within creature's sensing radius
function findNearestPrey(
  creature: Creature,
  creatures: Creature[],
  worldWidth: number,
  worldHeight: number
): { prey: Creature; distance: number; angle: number } | null {
  let nearest: { prey: Creature; distance: number; angle: number } | null = null;

  for (const other of creatures) {
    if (other.id === creature.id) continue;
    if (!canHunt(creature, other)) continue;

    const dist = distance(creature.position, other.position, worldWidth, worldHeight);
    if (dist <= creature.genome.senseRadius) {
      if (!nearest || dist < nearest.distance) {
        const angle = angleTo(creature.position, other.position, worldWidth, worldHeight);
        let relativeAngle = angle - creature.angle;
        while (relativeAngle > Math.PI) relativeAngle -= Math.PI * 2;
        while (relativeAngle < -Math.PI) relativeAngle += Math.PI * 2;
        nearest = { prey: other, distance: dist, angle: relativeAngle };
      }
    }
  }

  return nearest;
}

// Find nearest predator within creature's sensing radius
function findNearestPredator(
  creature: Creature,
  creatures: Creature[],
  worldWidth: number,
  worldHeight: number
): TargetInfo | null {
  let nearest: TargetInfo | null = null;
  let nearestDist = Infinity;

  for (const other of creatures) {
    if (other.id === creature.id) continue;
    if (!shouldFlee(creature, other)) continue;

    const dist = distance(creature.position, other.position, worldWidth, worldHeight);
    if (dist <= creature.genome.senseRadius && dist < nearestDist) {
      const angle = angleTo(creature.position, other.position, worldWidth, worldHeight);
      let relativeAngle = angle - creature.angle;
      while (relativeAngle > Math.PI) relativeAngle -= Math.PI * 2;
      while (relativeAngle < -Math.PI) relativeAngle += Math.PI * 2;
      nearest = { distance: dist, angle: relativeAngle };
      nearestDist = dist;
    }
  }

  return nearest;
}

// Check if hunter catches prey (attack succeeds)
function checkAttackSuccess(hunter: Creature, prey: Creature): boolean {
  const attackDist = hunter.genome.size + prey.genome.size;
  const dist = Math.sqrt(
    Math.pow(hunter.position.x - prey.position.x, 2) +
    Math.pow(hunter.position.y - prey.position.y, 2)
  );

  if (dist > attackDist) return false;

  // Attack roll: higher attack power vs higher defense
  const attackRoll = hunter.genome.attackPower * (0.5 + Math.random() * 0.5);
  const defenseRoll = prey.genome.defense * (0.5 + Math.random() * 0.5);

  return attackRoll > defenseRoll;
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
  kills: Array<{ hunter: Creature; prey: Creature }>;
} {
  const { creatures, food, config } = world;
  const births: Creature[] = [];
  const deaths: Creature[] = [];
  const foodEaten: Food[] = [];
  const kills: Array<{ hunter: Creature; prey: Creature }> = [];
  const deadIds = new Set<string>();

  // Process each creature
  for (const creature of creatures) {
    // Skip if already dead from being hunted
    if (deadIds.has(creature.id)) continue;

    // Find nearest food (for herbivores/omnivores)
    const nearestFood = findNearestFood(creature, food, config.width, config.height);

    // Find nearest prey (for carnivores/omnivores)
    const nearestPrey = findNearestPrey(creature, creatures, config.width, config.height);

    // Find nearest predator (for fleeing)
    const nearestPredator = findNearestPredator(creature, creatures, config.width, config.height);

    // Get neural input with all targets
    const input = getCreatureInput(
      creature,
      nearestFood ? { angle: nearestFood.angle, distance: nearestFood.distance } : null,
      nearestPrey ? { angle: nearestPrey.angle, distance: nearestPrey.distance } : null,
      nearestPredator
    );

    // Think and decide
    const decision = think(creature, input);

    // Move
    move(creature, decision, config.width, config.height);

    // Metabolize (energy drain)
    metabolize(creature, config.energyDrainMultiplier);

    // Check for hunting (carnivores/omnivores with high attack output)
    if (decision.attack > 0.5 && nearestPrey && !deadIds.has(nearestPrey.prey.id)) {
      if (checkAttackSuccess(creature, nearestPrey.prey)) {
        // Successful hunt!
        const energyGained = nearestPrey.prey.energy * creature.genome.energyEfficiency * 0.5;
        creature.energy += energyGained;
        creature.energy = Math.min(100, creature.energy);
        creature.creaturesKilled++;

        deadIds.add(nearestPrey.prey.id);
        kills.push({ hunter: creature, prey: nearestPrey.prey });
      }
    }

    // Check for food eating (herbivores/omnivores only)
    if (creature.genome.dietType !== DietType.Carnivore) {
      for (const f of food) {
        if (!foodEaten.includes(f) && checkFoodCollision(creature, f)) {
          // Omnivores are less efficient at eating plants (jack of all trades)
          const dietMultiplier = creature.genome.dietType === DietType.Omnivore ? 0.6 : 1.0;
          creature.energy += f.energy * creature.genome.energyEfficiency * dietMultiplier;
          creature.energy = Math.min(100, creature.energy);
          creature.foodEaten++;
          foodEaten.push(f);
          break; // Only eat one food per tick
        }
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

    // Check for death (starvation)
    if (creature.energy <= 0) {
      deaths.push(creature);
      deadIds.add(creature.id);
    }
  }

  // Add killed creatures to deaths
  for (const kill of kills) {
    if (!deaths.includes(kill.prey)) {
      deaths.push(kill.prey);
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

  // Diet diversity re-seeding: periodically check if any diet type is missing and re-introduce
  // This happens every ~300 ticks (5 seconds) with a small chance to add a new creature
  if (world.tick % 300 === 0 && creatures.length > 5) {
    const herbivoreCount = creatures.filter(c => c.genome.dietType === DietType.Herbivore).length;
    const carnivoreCount = creatures.filter(c => c.genome.dietType === DietType.Carnivore).length;
    const omnivoreCount = creatures.filter(c => c.genome.dietType === DietType.Omnivore).length;

    // If a diet type is completely missing or very rare, spawn one
    if (herbivoreCount === 0 || (herbivoreCount < 3 && Math.random() < 0.3)) {
      const newCreature = createRandomCreature(config.width, config.height);
      newCreature.genome.dietType = DietType.Herbivore;
      newCreature.color = genomeToColor(newCreature.genome);
      creatures.push(newCreature);
    }
    if (carnivoreCount === 0 || (carnivoreCount < 2 && Math.random() < 0.2)) {
      const newCreature = createRandomCreature(config.width, config.height);
      newCreature.genome.dietType = DietType.Carnivore;
      newCreature.color = genomeToColor(newCreature.genome);
      creatures.push(newCreature);
    }
    if (omnivoreCount === 0 && Math.random() < 0.1) {
      const newCreature = createRandomCreature(config.width, config.height);
      newCreature.genome.dietType = DietType.Omnivore;
      newCreature.color = genomeToColor(newCreature.genome);
      creatures.push(newCreature);
    }
  }

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

  return { births, deaths, foodEaten, kills };
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
  senseRadius: number;
  maxSpeed: number;
  age: number;
  foodEaten: number;
  creaturesKilled: number;
  dietType: string;
}

export interface SerializedFood {
  id: string;
  x: number;
  y: number;
  size: number;
}

export interface SerializedHotspot {
  x: number;
  y: number;
  radius: number;
}

export interface SerializedState {
  tick: number;
  creatures: SerializedCreature[];
  food: SerializedFood[];
  hotspots: SerializedHotspot[];
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
      senseRadius: c.genome.senseRadius,
      maxSpeed: c.genome.maxSpeed,
      age: c.age,
      foodEaten: c.foodEaten,
      creaturesKilled: c.creaturesKilled,
      dietType: c.genome.dietType,
    })),
    food: world.food.map(f => ({
      id: f.id,
      x: f.position.x,
      y: f.position.y,
      size: f.size,
    })),
    hotspots: hotspots.map(h => ({
      x: h.x,
      y: h.y,
      radius: h.radius,
    })),
    stats: world.stats,
    config: {
      width: world.config.width,
      height: world.config.height,
    },
  };
}
