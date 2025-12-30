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
  energyLevel: number;    // 0 to 1 (normalized from 0-100)
  noise: number;          // Random noise for exploration
  bias: number;           // Always 1
}

export interface NeuralOutput {
  turn: number;           // -1 to 1 (left to right)
  speed: number;          // 0 to 1 (stop to max)
}

const INPUT_SIZE = 5;
const HIDDEN_SIZE = 6;
const OUTPUT_SIZE = 2;

export function runNeuralNetwork(input: NeuralInput, genome: Genome): NeuralOutput {
  const inputs = [
    input.foodAngle,
    input.foodDistance,
    input.energyLevel,
    input.noise,
    input.bias,
  ];

  // Input -> Hidden layer
  const hidden: number[] = [];
  for (let h = 0; h < HIDDEN_SIZE; h++) {
    let sum = genome.biasHidden[h];
    for (let i = 0; i < INPUT_SIZE; i++) {
      sum += inputs[i] * genome.weightsInputHidden[h * INPUT_SIZE + i];
    }
    hidden.push(tanh(sum));
  }

  // Hidden -> Output layer
  const outputs: number[] = [];
  for (let o = 0; o < OUTPUT_SIZE; o++) {
    let sum = genome.biasOutput[o];
    for (let h = 0; h < HIDDEN_SIZE; h++) {
      sum += hidden[h] * genome.weightsHiddenOutput[o * HIDDEN_SIZE + h];
    }
    outputs.push(sum);
  }

  return {
    turn: tanh(outputs[0]),           // -1 to 1
    speed: sigmoid(outputs[1]),        // 0 to 1
  };
}

// Calculate total weight count for genome initialization
export function getTotalWeights(): { inputHidden: number; hiddenOutput: number; biasHidden: number; biasOutput: number } {
  return {
    inputHidden: INPUT_SIZE * HIDDEN_SIZE,   // 30
    hiddenOutput: HIDDEN_SIZE * OUTPUT_SIZE, // 12
    biasHidden: HIDDEN_SIZE,                 // 6
    biasOutput: OUTPUT_SIZE,                 // 2
  };
}
