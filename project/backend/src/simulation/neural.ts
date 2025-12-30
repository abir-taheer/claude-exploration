// Simple feedforward neural network for creature decision making

import { Genome } from './types';

// Activation function: tanh (outputs -1 to 1)
function tanh(x: number): number {
  return Math.tanh(x);
}

// Sigmoid for speed output (0 to 1)
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export interface NeuralInput {
  foodAngle: number;      // -1 to 1 (normalized from -PI to PI)
  foodDistance: number;   // 0 to 1 (normalized, 1 = far/no food)
  preyAngle: number;      // -1 to 1 (angle to nearest prey creature)
  preyDistance: number;   // 0 to 1 (distance to nearest prey)
  predatorAngle: number;  // -1 to 1 (angle to nearest predator)
  energyLevel: number;    // 0 to 1 (normalized from 0-100)
  bias: number;           // Always 1
}

export interface NeuralOutput {
  turn: number;           // -1 to 1 (left to right)
  speed: number;          // 0 to 1 (stop to max)
  attack: number;         // 0 to 1 (threshold for attacking)
}

const INPUT_SIZE = 7;
const HIDDEN_SIZE = 8;
const OUTPUT_SIZE = 3;

export function runNeuralNetwork(input: NeuralInput, genome: Genome): NeuralOutput {
  const inputs = [
    input.foodAngle,
    input.foodDistance,
    input.preyAngle,
    input.preyDistance,
    input.predatorAngle,
    input.energyLevel,
    input.bias,
  ];

  // Input -> Hidden layer
  const hidden: number[] = [];
  for (let h = 0; h < HIDDEN_SIZE; h++) {
    let sum = genome.biasHidden[h] || 0;
    for (let i = 0; i < INPUT_SIZE; i++) {
      const weight = genome.weightsInputHidden[h * INPUT_SIZE + i] || 0;
      sum += inputs[i] * weight;
    }
    hidden.push(tanh(sum));
  }

  // Hidden -> Output layer
  const outputs: number[] = [];
  for (let o = 0; o < OUTPUT_SIZE; o++) {
    let sum = genome.biasOutput[o] || 0;
    for (let h = 0; h < HIDDEN_SIZE; h++) {
      const weight = genome.weightsHiddenOutput[o * HIDDEN_SIZE + h] || 0;
      sum += hidden[h] * weight;
    }
    outputs.push(sum);
  }

  return {
    turn: tanh(outputs[0]),            // -1 to 1
    speed: sigmoid(outputs[1]),        // 0 to 1
    attack: sigmoid(outputs[2]),       // 0 to 1
  };
}

// Calculate total weight count for genome initialization
export function getTotalWeights(): { inputHidden: number; hiddenOutput: number; biasHidden: number; biasOutput: number } {
  return {
    inputHidden: INPUT_SIZE * HIDDEN_SIZE,   // 7*8 = 56
    hiddenOutput: HIDDEN_SIZE * OUTPUT_SIZE, // 8*3 = 24
    biasHidden: HIDDEN_SIZE,                 // 8
    biasOutput: OUTPUT_SIZE,                 // 3
  };
}
