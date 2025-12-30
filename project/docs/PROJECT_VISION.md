# EvoSim - Distributed Evolutionary Simulation Platform

## The Vision

EvoSim is a web-based platform where artificial creatures evolve in real-time. Watch as simple organisms develop complex behaviors through natural selection - seeking food, avoiding threats, and adapting to their environment.

## Why This Project?

1. **Visually Captivating** - There's something mesmerizing about watching evolution happen in real-time
2. **Computationally Interesting** - The simulation can be distributed across workers, demonstrating real distributed systems patterns
3. **Educational** - Helps understand natural selection, genetic algorithms, and emergent behavior
4. **Creative Freedom** - The aesthetic can be beautiful and artistic
5. **Novel Angle** - Most evolutionary simulations are desktop apps; this is a web-based, distributed implementation

## Core Concepts

### Creatures
- Each creature has a **genome** - a set of numbers encoding:
  - Movement speed
  - Turn rate
  - Sensing radius
  - Size
  - Neural network weights for decision-making
- Creatures move around a 2D world seeking food
- Energy depletes over time; eating food restores it
- When energy reaches 0, creature dies
- Creatures with enough energy can reproduce (with mutations)

### World
- 2D continuous space with food sources
- Food regenerates over time
- Can add obstacles, zones with different properties
- Multiple worlds can run in parallel

### Selection Pressure
- Survival of the fittest happens naturally
- Users can adjust:
  - Food scarcity
  - Energy costs
  - Mutation rates
  - Add predators or other pressures

## Technical Goals

1. **Real-time Visualization** - Smooth 60fps rendering of creatures
2. **Scalable Simulation** - Distribute work across multiple Docker containers
3. **Interactive** - Users can modify parameters live
4. **Persistent** - Save interesting populations/genomes to database
5. **Production-Ready** - Proper DevOps with Docker, nginx, monitoring

## Success Criteria

- Watch 100+ creatures evolving in real-time in a browser
- See measurable evolution over time (speed, behavior)
- Distributed workers handling simulation load
- Clean, responsive web UI
- Accessible via public IP
