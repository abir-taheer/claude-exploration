// Creature management: creation, mutation, reproduction

import { Creature, DietType, Genome, Vector2D } from './types';
import { getTotalWeights, NeuralInput, NeuralOutput, runNeuralNetwork } from './neural';

let creatureIdCounter = 0;

function generateId(): string {
  return `c_${++creatureIdCounter}_${Date.now().toString(36)}`;
}

// Generate a random number in range
function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// Generate a random neural network weight
function randomWeight(): number {
  return (Math.random() - 0.5) * 2; // -1 to 1
}

// Generate color from genome traits - now based on diet type
export function genomeToColor(genome: Genome): string {
  // Base color by diet type
  switch (genome.dietType) {
    case DietType.Herbivore:
      // Green-ish creatures (plant eaters)
      const hGreen = Math.floor(180 + (genome.energyEfficiency - 0.5) * 75);
      const hBlue = Math.floor(80 + (genome.senseRadius / 150) * 80);
      return `rgb(80, ${Math.min(255, hGreen)}, ${Math.min(255, hBlue)})`;

    case DietType.Carnivore:
      // Red-ish creatures (predators)
      const cRed = Math.floor(180 + genome.attackPower * 75);
      const cGreen = Math.floor(40 + (genome.maxSpeed / 3) * 60);
      return `rgb(${Math.min(255, cRed)}, ${Math.min(255, cGreen)}, 60)`;

    case DietType.Omnivore:
      // Purple-ish creatures (eat everything)
      const oRed = Math.floor(150 + genome.attackPower * 50);
      const oBlue = Math.floor(150 + genome.defense * 50);
      return `rgb(${Math.min(255, oRed)}, 80, ${Math.min(255, oBlue)})`;

    default:
      return `rgb(128, 128, 128)`;
  }
}

// Get random diet type with weighted distribution
function randomDietType(): DietType {
  const roll = Math.random();
  if (roll < 0.5) return DietType.Herbivore;  // 50% herbivores
  if (roll < 0.8) return DietType.Omnivore;   // 30% omnivores
  return DietType.Carnivore;                   // 20% carnivores
}

export function createRandomGenome(): Genome {
  const weights = getTotalWeights();
  const dietType = randomDietType();

  return {
    maxSpeed: randomRange(0.5, 3.0),
    turnRate: randomRange(0.1, 0.5),
    size: randomRange(3, 15),
    senseRadius: randomRange(30, 150),

    dietType,
    attackPower: randomRange(0.3, 1.0),
    defense: randomRange(0.3, 1.0),

    weightsInputHidden: Array.from({ length: weights.inputHidden }, randomWeight),
    weightsHiddenOutput: Array.from({ length: weights.hiddenOutput }, randomWeight),
    biasHidden: Array.from({ length: weights.biasHidden }, randomWeight),
    biasOutput: Array.from({ length: weights.biasOutput }, randomWeight),

    energyEfficiency: randomRange(0.5, 1.5),
    baseDrain: randomRange(0.1, 0.5),
  };
}

export function createCreature(
  position: Vector2D,
  genome: Genome,
  generation: number = 0
): Creature {
  const angle = Math.random() * Math.PI * 2;

  return {
    id: generateId(),
    genome,
    position: { ...position },
    velocity: { x: 0, y: 0 },
    angle,
    energy: 50,
    age: 0,
    color: genomeToColor(genome),
    foodEaten: 0,
    creaturesKilled: 0,
    distanceTraveled: 0,
    generation,
  };
}

export function createRandomCreature(worldWidth: number, worldHeight: number): Creature {
  const position = {
    x: Math.random() * worldWidth,
    y: Math.random() * worldHeight,
  };
  return createCreature(position, createRandomGenome(), 0);
}

// Mutate a genome value
function mutateValue(value: number, min: number, max: number, strength: number): number {
  const mutation = (Math.random() - 0.5) * 2 * strength;
  return Math.max(min, Math.min(max, value + mutation));
}

// Mutate an array of weights
function mutateWeights(weights: number[], rate: number, strength: number): number[] {
  return weights.map(w => {
    if (Math.random() < rate) {
      return Math.max(-2, Math.min(2, w + (Math.random() - 0.5) * 2 * strength));
    }
    return w;
  });
}

// Mutate diet type (rare, only 5% chance when mutation occurs)
function mutateDietType(parentDiet: DietType): DietType {
  if (Math.random() > 0.05) return parentDiet;
  // Small chance to shift diet type
  const types = [DietType.Herbivore, DietType.Omnivore, DietType.Carnivore];
  const currentIndex = types.indexOf(parentDiet);
  // Can only shift to adjacent diet (herbivore <-> omnivore <-> carnivore)
  if (currentIndex === 0) return DietType.Omnivore;
  if (currentIndex === 2) return DietType.Omnivore;
  return Math.random() < 0.5 ? DietType.Herbivore : DietType.Carnivore;
}

export function mutateGenome(parent: Genome, rate: number, strength: number): Genome {
  const shouldMutate = () => Math.random() < rate;

  return {
    maxSpeed: shouldMutate() ? mutateValue(parent.maxSpeed, 0.5, 3.0, strength) : parent.maxSpeed,
    turnRate: shouldMutate() ? mutateValue(parent.turnRate, 0.1, 0.5, strength * 0.1) : parent.turnRate,
    size: shouldMutate() ? mutateValue(parent.size, 3, 15, strength * 3) : parent.size,
    senseRadius: shouldMutate() ? mutateValue(parent.senseRadius, 30, 150, strength * 20) : parent.senseRadius,

    dietType: shouldMutate() ? mutateDietType(parent.dietType) : parent.dietType,
    attackPower: shouldMutate() ? mutateValue(parent.attackPower, 0.3, 1.0, strength * 0.2) : parent.attackPower,
    defense: shouldMutate() ? mutateValue(parent.defense, 0.3, 1.0, strength * 0.2) : parent.defense,

    weightsInputHidden: mutateWeights(parent.weightsInputHidden, rate, strength),
    weightsHiddenOutput: mutateWeights(parent.weightsHiddenOutput, rate, strength),
    biasHidden: mutateWeights(parent.biasHidden, rate, strength),
    biasOutput: mutateWeights(parent.biasOutput, rate, strength),

    energyEfficiency: shouldMutate() ? mutateValue(parent.energyEfficiency, 0.5, 1.5, strength * 0.2) : parent.energyEfficiency,
    baseDrain: shouldMutate() ? mutateValue(parent.baseDrain, 0.1, 0.5, strength * 0.1) : parent.baseDrain,
  };
}

export function reproduce(
  parent: Creature,
  mutationRate: number,
  mutationStrength: number
): Creature {
  const childGenome = mutateGenome(parent.genome, mutationRate, mutationStrength);

  // Spawn near parent
  const offset = 20;
  const position = {
    x: parent.position.x + (Math.random() - 0.5) * offset,
    y: parent.position.y + (Math.random() - 0.5) * offset,
  };

  return createCreature(position, childGenome, parent.generation + 1);
}

// Target info for neural input
export interface TargetInfo {
  angle: number;
  distance: number;
}

// Get neural network input for a creature
export function getCreatureInput(
  creature: Creature,
  nearestFood: TargetInfo | null,
  nearestPrey: TargetInfo | null,
  nearestPredator: TargetInfo | null
): NeuralInput {
  return {
    foodAngle: nearestFood ? nearestFood.angle / Math.PI : 0,
    foodDistance: nearestFood ? Math.min(1, nearestFood.distance / creature.genome.senseRadius) : 1,
    preyAngle: nearestPrey ? nearestPrey.angle / Math.PI : 0,
    preyDistance: nearestPrey ? Math.min(1, nearestPrey.distance / creature.genome.senseRadius) : 1,
    predatorAngle: nearestPredator ? nearestPredator.angle / Math.PI : 0,
    energyLevel: creature.energy / 100,
    bias: 1,
  };
}

// Run creature's brain and get movement decision
export function think(creature: Creature, input: NeuralInput): NeuralOutput {
  return runNeuralNetwork(input, creature.genome);
}

// Update creature position based on neural output
export function move(
  creature: Creature,
  decision: NeuralOutput,
  worldWidth: number,
  worldHeight: number
): void {
  // Apply turn
  creature.angle += decision.turn * creature.genome.turnRate;

  // Normalize angle
  while (creature.angle > Math.PI) creature.angle -= Math.PI * 2;
  while (creature.angle < -Math.PI) creature.angle += Math.PI * 2;

  // Calculate velocity
  const speed = decision.speed * creature.genome.maxSpeed;
  creature.velocity.x = Math.cos(creature.angle) * speed;
  creature.velocity.y = Math.sin(creature.angle) * speed;

  // Update position
  const oldX = creature.position.x;
  const oldY = creature.position.y;

  creature.position.x += creature.velocity.x;
  creature.position.y += creature.velocity.y;

  // Wrap around world edges
  if (creature.position.x < 0) creature.position.x += worldWidth;
  if (creature.position.x >= worldWidth) creature.position.x -= worldWidth;
  if (creature.position.y < 0) creature.position.y += worldHeight;
  if (creature.position.y >= worldHeight) creature.position.y -= worldHeight;

  // Track distance
  const dx = creature.position.x - oldX;
  const dy = creature.position.y - oldY;
  creature.distanceTraveled += Math.sqrt(dx * dx + dy * dy);

  // Energy cost of movement (faster = more costly)
  const movementCost = speed * 0.01 * (creature.genome.size / 10);
  creature.energy -= movementCost;
}

// Apply base metabolism drain
export function metabolize(creature: Creature, drainMultiplier: number = 1.0): void {
  // Base drain + size penalty (bigger creatures need more energy)
  const sizePenalty = creature.genome.size * 0.01;
  creature.energy -= (creature.genome.baseDrain + sizePenalty) * drainMultiplier;
  creature.age++;
}
