// Main API server with WebSocket support

import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { createWorld, createDefaultConfig, simulateTick, serializeState, WorldState, WorldConfig, HistoryPoint, DietType } from '../simulation';

const PORT = process.env.PORT || 8080;
const BASE_TICK_RATE = 60; // Target 60 FPS
const HISTORY_INTERVAL = 30; // Record history every 30 ticks (0.5 seconds)
const MAX_HISTORY_POINTS = 500; // Keep last ~4 minutes of history

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// Game state
let world: WorldState;
let isRunning = true;
let tickInterval: ReturnType<typeof setInterval> | null = null;
let simulationSpeed = 1; // 1x, 2x, 4x speed multiplier
let history: HistoryPoint[] = [];

// Connected clients
const clients = new Set<WebSocket>();

// Initialize world
function initWorld(config?: Partial<WorldConfig>) {
  const defaultConfig = createDefaultConfig();
  world = createWorld({ ...defaultConfig, ...config });
  history = []; // Clear history on reset
  console.log(`World initialized with ${world.creatures.length} creatures and ${world.food.length} food`);
}

// Record history point
function recordHistory() {
  if (world.tick % HISTORY_INTERVAL === 0) {
    // Count creatures by diet type
    const herbivores = world.creatures.filter(c => c.genome.dietType === DietType.Herbivore).length;
    const carnivores = world.creatures.filter(c => c.genome.dietType === DietType.Carnivore).length;
    const omnivores = world.creatures.filter(c => c.genome.dietType === DietType.Omnivore).length;

    const point: HistoryPoint = {
      tick: world.tick,
      population: world.stats.currentPopulation,
      avgSpeed: world.stats.averageSpeed,
      avgSize: world.stats.averageSize,
      maxGeneration: world.stats.maxGeneration,
      herbivores,
      carnivores,
      omnivores,
    };
    history.push(point);
    if (history.length > MAX_HISTORY_POINTS) {
      history.shift();
    }
  }
}

// Broadcast state to all clients
function broadcastState() {
  if (clients.size === 0) return;

  const state = serializeState(world);
  const message = JSON.stringify({ type: 'state', data: state });

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Simulation loop
function runSimulation() {
  if (!isRunning) return;

  // Run multiple ticks based on speed multiplier
  for (let i = 0; i < simulationSpeed; i++) {
    simulateTick(world);
    recordHistory();

    // Respawn if extinction
    if (world.creatures.length === 0) {
      console.log('Extinction event! Respawning creatures...');
      initWorld(world.config);
      break;
    }
  }

  broadcastState();

  // Log stats periodically
  if (world.tick % 300 === 0) {
    console.log(`Tick ${world.tick}: ${world.stats.currentPopulation} creatures, gen ${world.stats.maxGeneration}`);
  }
}

// Start simulation loop
function startSimulation() {
  if (tickInterval) return;
  isRunning = true;
  const tickInterval_ms = 1000 / BASE_TICK_RATE;
  tickInterval = setInterval(runSimulation, tickInterval_ms);
  console.log(`Simulation started at ${BASE_TICK_RATE} FPS (${simulationSpeed}x speed)`);
}

// Stop simulation loop
function stopSimulation() {
  isRunning = false;
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
  console.log('Simulation stopped');
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  // Send initial state
  const state = serializeState(world);
  ws.send(JSON.stringify({ type: 'state', data: state }));
  ws.send(JSON.stringify({ type: 'config', data: world.config }));
  ws.send(JSON.stringify({ type: 'history', data: history }));
  ws.send(JSON.stringify({ type: 'speed', data: simulationSpeed }));

  // Handle messages from client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      handleClientMessage(ws, data);
    } catch (error) {
      console.error('Failed to parse client message:', error);
    }
  });

  // Handle disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Handle client messages
function handleClientMessage(ws: WebSocket, message: { type: string; data?: unknown }) {
  switch (message.type) {
    case 'pause':
      stopSimulation();
      broadcast({ type: 'paused' });
      break;

    case 'resume':
      startSimulation();
      broadcast({ type: 'resumed' });
      break;

    case 'reset':
      console.log('Resetting world...');
      initWorld(message.data as Partial<WorldConfig>);
      broadcast({ type: 'reset' });
      // Immediately broadcast new state after reset
      broadcastState();
      break;

    case 'updateConfig':
      if (message.data && typeof message.data === 'object') {
        world.config = { ...world.config, ...message.data as Partial<WorldConfig> };
        broadcast({ type: 'config', data: world.config });
      }
      break;

    case 'getStats':
      ws.send(JSON.stringify({ type: 'stats', data: world.stats }));
      break;

    case 'setSpeed':
      const newSpeed = Number(message.data);
      if ([1, 2, 4, 8].includes(newSpeed)) {
        simulationSpeed = newSpeed;
        broadcast({ type: 'speed', data: simulationSpeed });
        console.log(`Speed set to ${simulationSpeed}x`);
      }
      break;

    case 'getHistory':
      ws.send(JSON.stringify({ type: 'history', data: history }));
      break;

    default:
      console.log('Unknown message type:', message.type);
  }
}

// Broadcast to all clients
function broadcast(message: { type: string; data?: unknown }) {
  const json = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

// REST API endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', tick: world?.tick || 0, clients: clients.size });
});

app.get('/api/stats', (req, res) => {
  res.json(world.stats);
});

app.get('/api/history', (req, res) => {
  res.json(history);
});

app.get('/api/speed', (req, res) => {
  res.json({ speed: simulationSpeed });
});

app.post('/api/speed', (req, res) => {
  const newSpeed = Number(req.body.speed);
  if ([1, 2, 4, 8].includes(newSpeed)) {
    simulationSpeed = newSpeed;
    broadcast({ type: 'speed', data: simulationSpeed });
    res.json({ speed: simulationSpeed });
  } else {
    res.status(400).json({ error: 'Speed must be 1, 2, 4, or 8' });
  }
});

app.get('/api/config', (req, res) => {
  res.json(world.config);
});

app.post('/api/config', (req, res) => {
  world.config = { ...world.config, ...req.body };
  broadcast({ type: 'config', data: world.config });
  res.json(world.config);
});

app.post('/api/reset', (req, res) => {
  initWorld(req.body);
  broadcast({ type: 'reset' });
  res.json({ success: true });
});

app.post('/api/pause', (req, res) => {
  stopSimulation();
  broadcast({ type: 'paused' });
  res.json({ success: true });
});

app.post('/api/resume', (req, res) => {
  startSimulation();
  broadcast({ type: 'resumed' });
  res.json({ success: true });
});

// Start server
initWorld();
startSimulation();

server.listen(PORT, () => {
  console.log(`EvoSim server running on port ${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  stopSimulation();
  server.close();
  process.exit(0);
});

export { app, server };
