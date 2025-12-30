// Main API server with WebSocket support

import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { createWorld, createDefaultConfig, simulateTick, serializeState, WorldState, WorldConfig } from '../simulation';

const PORT = process.env.PORT || 8080;
const TICK_RATE = 60; // Target 60 FPS
const TICK_INTERVAL = 1000 / TICK_RATE;

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

// Connected clients
const clients = new Set<WebSocket>();

// Initialize world
function initWorld(config?: Partial<WorldConfig>) {
  const defaultConfig = createDefaultConfig();
  world = createWorld({ ...defaultConfig, ...config });
  console.log(`World initialized with ${world.creatures.length} creatures and ${world.food.length} food`);
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

  simulateTick(world);
  broadcastState();

  // Log stats periodically
  if (world.tick % 300 === 0) {
    console.log(`Tick ${world.tick}: ${world.stats.currentPopulation} creatures, gen ${world.stats.maxGeneration}`);
  }

  // Respawn if extinction
  if (world.creatures.length === 0) {
    console.log('Extinction event! Respawning creatures...');
    initWorld(world.config);
  }
}

// Start simulation loop
function startSimulation() {
  if (tickInterval) return;
  isRunning = true;
  tickInterval = setInterval(runSimulation, TICK_INTERVAL);
  console.log(`Simulation started at ${TICK_RATE} FPS`);
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
      initWorld(message.data as Partial<WorldConfig>);
      broadcast({ type: 'reset' });
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
