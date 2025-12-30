// Creature management: creation, mutation, reproduction

import { Creature, Genome, Vector2D } from './types';
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

// Generate color from genome traits
function genomeToColor(genome: Genome): string {
  // Map traits to RGB components
  const r = Math.floor(128 + (genome.maxSpeed / 3) * 127);
  const g = Math.floor(128 + (genome.energyEfficiency - 0.5) * 127);
  const b = Math.floor(128 + (genome.senseRadius / 150) * 127);
  return `rgb(${Math.min(255, r)}, ${Math.min(255, g)}, ${Math.min(255, b)})`;
}

export function createRandomGenome(): Genome {
  const weights = getTotalWeights();

  return {
    maxSpeed: randomRange(0.5, 3.0),
    turnRate: randomRange(0.1, 0.5),
    size: randomRange(3, 15),
    senseRadius: randomRange(30, 150),

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

export function mutateGenome(parent: Genome, rate: number, strength: number): Genome {
  const shouldMutate = () => Math.random() < rate;

  return {
    maxSpeed: shouldMutate() ? mutateValue(parent.maxSpeed, 0.5, 3.0, strength) : parent.maxSpeed,
    turnRate: shouldMutate() ? mutateValue(parent.turnRate, 0.1, 0.5, strength * 0.1) : parent.turnRate,
    size: shouldMutate() ? mutateValue(parent.size, 3, 15, strength * 3) : parent.size,
    senseRadius: shouldMutate() ? mutateValue(parent.senseRadius, 30, 150, strength * 20) : parent.senseRadius,

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

// Get neural network input for a creature
export function getCreatureInput(
  creature: Creature,
  nearestFood: { angle: number; distance: number } | null
): NeuralInput {
  return {
    foodAngle: nearestFood ? nearestFood.angle / Math.PI : 0,
    foodDistance: nearestFood ? Math.min(1, nearestFood.distance / creature.genome.senseRadius) : 1,
    energyLevel: creature.energy / 100,
    noise: (Math.random() - 0.5) * 0.2,
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
export function metabolize(creature: Creature): void {
  // Base drain + size penalty (bigger creatures need more energy)
  const sizePenalty = creature.genome.size * 0.01;
  creature.energy -= creature.genome.baseDrain + sizePenalty;
  creature.age++;
}
