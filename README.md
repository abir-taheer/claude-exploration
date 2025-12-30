# EvoSim - Evolutionary Simulation Platform

**Watch artificial life evolve in real-time!**

EvoSim is a web-based evolutionary simulation where creatures with neural network brains compete for survival. Watch as natural selection shapes behavior across generations.

## Live Demo

**[View Live Simulation →](http://34.68.51.22)**

## What You're Seeing

Each colored blob is a **creature** with:
- A **neural network brain** that decides how to move
- A **genome** encoding physical traits (speed, size, sensing radius)
- An **energy bar** showing remaining life
- Inherited traits from parents (with mutations)

**Green dots** are food. Creatures must eat to survive and reproduce.

## How Evolution Works

1. **Survival Pressure**: Creatures lose energy over time and when moving
2. **Food Competition**: Only creatures that find food survive
3. **Reproduction**: Well-fed creatures (80+ energy) spawn offspring
4. **Mutation**: Offspring inherit genes with small random changes
5. **Selection**: Over generations, better food-finders dominate

## The Neural Network

Each creature has a simple feedforward neural network:

```
Inputs (5)           Hidden (6)           Outputs (2)
├─ Food angle    ──┐                  ┌── Turn direction
├─ Food distance ──┼── [weights] ─────┼── Speed
├─ Energy level  ──┤
├─ Random noise  ──┤
└─ Bias          ──┘
```

The network weights are encoded in the creature's genome and evolve over generations.

## Genome Traits

| Trait | Range | Effect |
|-------|-------|--------|
| Max Speed | 0.5-3.0 | How fast the creature can move |
| Turn Rate | 0.1-0.5 | How quickly it can change direction |
| Size | 3-15px | Body size (bigger = more energy drain) |
| Sense Radius | 30-150px | How far it can detect food |
| Energy Efficiency | 0.5-1.5x | How much energy gained from food |
| Base Drain | 0.1-0.5 | Passive energy loss per tick |
| Neural Weights | 50 values | Brain connection strengths |

## Features

### Real-Time Visualization
- **60 FPS rendering** with smooth creature movement
- **Click to select** any creature and track it
- **Sense radius** shown as dashed circle around selected creature
- **Energy bars** above each creature showing health
- **Movement trails** showing where each creature has been
- **Newborn glow** - white aura around recently born creatures
- **Crown indicator** - golden crown above the oldest living creature
- **Death particles** - red particles burst when creatures die
- **Eating particles** - green particles float up when food is consumed

### Population History Graph
- Track **population** and **generation** over time
- Blue line shows population size
- Orange line shows maximum generation reached

### Leaderboard
- See the **top 5 hunters** by food eaten
- Click any entry to select and track that creature
- Gold, silver, bronze highlighting for top 3

### Mini-Map
- Overlay in top-right showing world overview
- Green dots for food, colored dots for creatures
- Yellow highlight shows selected creature location

### Speed Controls
- **1x, 2x, 4x, 8x** speed multipliers
- Run evolution faster to see changes over time

### Creature Inspector
- Click a creature to see detailed stats
- View genome traits: size, speed, sense radius
- Track age and total food eaten
- Watch stats update in real-time

## Controls

- **Pause/Resume**: Stop or continue the simulation
- **Reset**: Start fresh with random creatures
- **Speed**: 1x, 2x, 4x, 8x simulation speed
- **Mutation Rate**: How often genes mutate (higher = more variation)
- **Mutation Strength**: How much genes change when mutating
- **Food Spawn Rate**: How quickly new food appears
- **Max Food**: Maximum food items in the world
- **Reproduction Threshold**: Energy needed to reproduce

## Observing Evolution

Over time, you'll notice:
- Creatures becoming faster at finding food
- Optimal sizes emerging (balance of visibility vs. energy cost)
- Sensing radius adapting to food density
- Neural networks developing food-seeking behaviors

## Tech Stack

| Component | Technology |
|-----------|------------|
| Simulation Engine | TypeScript, Neural Networks |
| Backend | Node.js, Express, WebSocket |
| Frontend | React, HTML5 Canvas |
| Infrastructure | Docker, Nginx |

## Running Locally

```bash
# Clone the repo
git clone https://github.com/abir-taheer/claude-exploration.git
cd claude-exploration/project

# Start with Docker
docker compose up -d

# Access at http://localhost
```

## Project Structure

```
project/
├── backend/           # Simulation engine + API
│   └── src/
│       ├── simulation/  # Core evolution logic
│       │   ├── creature.ts   # Creature & genome
│       │   ├── neural.ts     # Neural network
│       │   └── world.ts      # World simulation
│       └── api/
│           └── server.ts     # WebSocket server
├── frontend/          # React visualization
│   └── src/
│       ├── components/
│       │   ├── SimulationCanvas.tsx  # Main canvas renderer
│       │   ├── ControlPanel.tsx      # Config controls
│       │   ├── HistoryGraph.tsx      # Population graph
│       │   ├── CreatureInspector.tsx # Selected creature details
│       │   └── Leaderboard.tsx       # Top hunters
│       └── hooks/
│           └── useSimulation.ts      # WebSocket connection
└── docker/            # Deployment config
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Server health + tick count |
| `GET /api/stats` | Population statistics |
| `GET /api/config` | Current configuration |
| `GET /api/history` | Population history data |
| `GET /api/speed` | Current simulation speed |
| `POST /api/speed` | Set speed (1, 2, 4, or 8) |
| `POST /api/pause` | Pause simulation |
| `POST /api/resume` | Resume simulation |
| `POST /api/reset` | Reset with new creatures |
| `WS /ws` | Real-time state updates |

## Statistics Tracked

- Current population count
- Total births and deaths
- Average energy, speed, size
- Maximum generation reached
- Oldest living creature

---

*Built with curiosity by Claude - an AI exploring what it means to create life.*
