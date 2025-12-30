# EvoSim Architecture

## System Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│    Nginx    │────▶│   Backend   │
│  (React +   │     │   Reverse   │     │  (Go API)   │
│   Canvas)   │◀────│   Proxy     │◀────│             │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
              ┌─────▼─────┐             ┌─────▼─────┐             ┌─────▼─────┐
              │  Worker   │             │  Worker   │             │  Worker   │
              │  Node 1   │             │  Node 2   │             │  Node N   │
              └─────┬─────┘             └─────┬─────┘             └─────┬─────┘
                    │                          │                          │
                    └──────────────────────────┼──────────────────────────┘
                                               │
                                        ┌──────▼──────┐
                                        │    Redis    │
                                        │ (Pub/Sub +  │
                                        │   State)    │
                                        └─────────────┘
```

## Components

### 1. Frontend (React + Canvas)
- **Framework**: React with TypeScript
- **Rendering**: HTML5 Canvas (potentially WebGL for performance)
- **Features**:
  - Real-time creature visualization
  - Control panel for simulation parameters
  - Statistics dashboard
  - Population graphs over time

### 2. Backend API (Node.js/TypeScript)
- **Framework**: Express with ws for WebSockets
- **Responsibilities**:
  - WebSocket connections for real-time updates
  - REST API for configuration
  - Run simulation loop
  - Aggregate statistics
- **Why Node.js**: Already available, TypeScript for type safety, single language with frontend

### 3. Simulation Engine (TypeScript)
- **Responsibilities**:
  - Run physics/movement simulation
  - Execute creature neural networks
  - Handle reproduction and death
  - Report state changes
- **Scaling**: Can run multiple workers, each handling a region of the world

### 4. Redis
- **Pub/Sub**: Real-time state updates between workers and API
- **State Cache**: Current creature positions for fast access
- **Queue**: Work distribution to workers

### 5. Nginx
- Reverse proxy to backend
- Serve static frontend files
- WebSocket proxying

## Data Flow

1. **Simulation Tick** (every 16ms for 60fps):
   - Workers update creature positions
   - Workers publish state to Redis
   - API aggregates and sends via WebSocket to clients

2. **User Interaction**:
   - User changes parameter in UI
   - Frontend sends to API via WebSocket
   - API broadcasts to workers via Redis

## Creature Genome Structure

```go
type Genome struct {
    // Physical traits
    MaxSpeed     float64  // 0.5 - 2.0
    TurnRate     float64  // 0.1 - 0.5
    Size         float64  // 5 - 20 pixels
    SenseRadius  float64  // 20 - 100 pixels

    // Neural network weights
    // Simple: 4 inputs -> 4 hidden -> 2 outputs
    // Inputs: nearest food angle, distance, energy level, random
    // Outputs: turn amount, speed
    Weights      [24]float64

    // Metabolism
    EnergyEfficiency float64  // How much energy from food
    BaseDrain        float64  // Energy drain per tick
}
```

## Simulation Algorithm

```
For each tick:
    1. For each creature:
        a. Sense environment (nearby food, creatures)
        b. Run neural network to get movement decision
        c. Apply movement (with physics)
        d. Consume energy based on movement
        e. Check for food collision -> eat
        f. Check energy <= 0 -> die
        g. Check energy > threshold -> reproduce

    2. Spawn new food if needed
    3. Broadcast state update
```

## Docker Composition

- `evosim-api`: Main Go backend
- `evosim-worker-1..N`: Simulation workers
- `evosim-redis`: State coordination
- `evosim-frontend`: Static file server (or built into nginx)
- `nginx`: Reverse proxy

## File Structure

```
project/
├── backend/
│   ├── cmd/
│   │   ├── api/          # API server entry point
│   │   └── worker/       # Worker entry point
│   ├── internal/
│   │   ├── simulation/   # Core simulation logic
│   │   ├── creature/     # Creature and genome
│   │   └── world/        # World state management
│   ├── go.mod
│   └── go.sum
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── canvas/       # Rendering logic
│   │   └── hooks/        # WebSocket hooks
│   └── package.json
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.worker
│   └── docker-compose.yml
└── docs/
    └── (documentation)
```
