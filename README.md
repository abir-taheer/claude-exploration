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

## Creature Types

The simulation features three diet types that form a food chain:

| Type | Color | Diet | Behavior |
|------|-------|------|----------|
| 🌱 Herbivore | Green | Plants only | Grazes, flees from predators |
| 🔴 Carnivore | Red | Creatures only | Hunts herbivores and smaller omnivores |
| 🟣 Omnivore | Purple | Both | Versatile, hunts smaller herbivores |

Diet types can slowly evolve through mutation, allowing the ecosystem to adapt!

## How Evolution Works

1. **Survival Pressure**: Creatures lose energy over time and when moving
2. **Food Competition**: Herbivores compete for plants, carnivores hunt prey
3. **Predator-Prey**: Carnivores hunt herbivores; omnivores hunt smaller prey
4. **Reproduction**: Well-fed creatures (80+ energy) spawn offspring
5. **Mutation**: Offspring inherit genes with small random changes
6. **Selection**: Over generations, better hunters AND better evaders survive

## The Neural Network

Each creature has a feedforward neural network that processes sensory input:

```
Inputs (7)           Hidden (8)           Outputs (3)
├─ Food angle    ──┐                  ┌── Turn direction
├─ Food distance ──┤                  ├── Speed
├─ Prey angle    ──┼── [weights] ─────┼── Attack
├─ Prey distance ──┤
├─ Predator angle──┤
├─ Energy level  ──┤
└─ Bias          ──┘
```

The network weights are encoded in the creature's genome and evolve over generations.

## Genome Traits

| Trait | Range | Effect |
|-------|-------|--------|
| Diet Type | H/C/O | What the creature can eat |
| Max Speed | 0.5-3.0 | How fast the creature can move |
| Turn Rate | 0.1-0.5 | How quickly it can change direction |
| Size | 3-15px | Body size (bigger = more energy drain, better hunter) |
| Sense Radius | 30-150px | How far it can detect food, prey, and predators |
| Attack Power | 0.3-1.0 | Success rate when hunting |
| Defense | 0.3-1.0 | Ability to escape predators |
| Energy Efficiency | 0.5-1.5x | How much energy gained from food/prey |
| Base Drain | 0.1-0.5 | Passive energy loss per tick |
| Neural Weights | 91 values | Brain connection strengths |

## Features

### Real-Time Visualization
- **60 FPS rendering** with smooth creature movement
- **Click to select** any creature and track it
- **Sense radius** shown as dashed circle around selected creature
- **Energy bars** above each creature showing health
- **Movement trails** showing where each creature has been
- **Newborn glow** - white aura around recently born creatures
- **Crown indicator** - golden crown above the oldest living creature
- **Aging effects** - older creatures gradually slow down (70% speed at 30 seconds)
- **Death particles** - colored particles burst when creatures die (matches creature color)
- **Eating particles** - green particles float up when food is consumed
- **Food hotspots** - subtle green zones where food spawns more frequently
- **Event visualization** - pulsing circles show active events

### Random Events
The simulation features periodic random events that shake up the ecosystem:

| Event | Description | Duration |
|-------|-------------|----------|
| 🌿 Food Bonanza | 15-30 bonus food spawns in one area | 3 seconds |
| 🦋 Migration | 5-10 herbivores arrive as a group | 2 seconds |
| 🔴 Predator Surge | 2-4 strong carnivores appear | Instant |

### Population History Graph
- Track **population by diet type** over time
- Green line: Herbivore population
- Red line: Carnivore population
- Purple line: Omnivore population
- Orange dashed line: Maximum generation reached

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

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Pause/Resume simulation |
| R | Reset with new random creatures |
| 1-4 | Set speed (1x, 2x, 4x, 8x) |
| C | Toggle generation-based color mode |
| F | Toggle fullscreen mode |
| Escape | Deselect current creature |

## Quality of Life Features

- **Auto-pause**: Simulation pauses when tab is hidden to save CPU
- **Fullscreen mode**: Immersive viewing with F key
- **Mini-map**: Overview of the world in top-right corner
- **Creature tracking**: Click to select and follow any creature
- **Generation colors**: Toggle color mode to visualize evolutionary lineages

## Configuration Options

- **Mutation Rate**: How often genes mutate (higher = more variation)
- **Mutation Strength**: How much genes change when mutating
- **Food Spawn Rate**: How quickly new food appears
- **Max Food**: Maximum food items in the world
- **Reproduction Threshold**: Energy needed to reproduce
- **Lifespan (Energy Drain)**: Controls how fast creatures lose energy (lower = longer lifespan)
- **Guaranteed Hunting**: Toggle 100% hunt success rate for predators (default: off)

## Observing Evolution

Over time, you'll notice:
- Predator-prey dynamics (population oscillations between diet types)
- Herbivores developing evasion behaviors to escape carnivores
- Carnivores becoming faster and more accurate hunters
- Optimal sizes emerging (bigger hunters vs. smaller, more efficient herbivores)
- Sensing radius adapting to the current food/threat density
- Neural networks developing food-seeking and hunting/fleeing behaviors

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
