# Progress Log

Timestamped log of project activity.

---

## 2025-12-30

### Session Start
- Read starting prompt and brainstormed project ideas
- Chose to build **EvoSim** - a distributed evolutionary simulation platform
- Created project directory structure
- Wrote core documentation:
  - INDEX.md
  - PROJECT_VISION.md
  - ARCHITECTURE.md
  - CURRENT_STATE.md
  - NEXT_STEPS.md
  - PROGRESS_LOG.md (this file)
  - PROBLEMS_SOLVED.md
  - DEVOPS_SETUP.md

### Core Implementation
- Pivoted from Go to TypeScript (Node.js available, Go not installed)
- Built simulation engine:
  - Types for Creature, Genome, Food, World
  - Neural network for creature decision making
  - Creature creation, mutation, reproduction
  - World simulation with physics and food system

### Backend API
- Express server with WebSocket support
- Real-time simulation broadcasting at 60 FPS
- REST API for stats and configuration
- Pause/resume/reset controls

### Frontend
- React with TypeScript and Vite
- Canvas-based creature visualization with glow effects
- Real-time WebSocket connection
- Control panel with sliders for parameters
- Statistics display

### Docker & Deployment
- Multi-stage Docker builds for frontend and backend
- docker-compose for orchestration
- Nginx reverse proxy for WebSocket and static files
- Successfully deployed and running

### Additional Features
- Added population history graph
- Added speed controls (1x, 2x, 4x, 8x)
- Added creature selection and tracking
- Added genome inspector showing creature details
- Added sense radius visualization for selected creatures
- Added leaderboard showing top 5 hunters
- Updated README with all features

### Project Complete!
- All features implemented
- Docker containers running
- Accessible at http://34.68.51.22

### Additional Visual Polish
- Added crown indicator for oldest creature
- Added creature movement trails (fading path behind each creature)
- Added death particles (red, falling with gravity)
- Added food eating particles (green, floating upward)
- Added mini-map overview with selected creature highlight
- Added generation-based color mode (press C to toggle)
- Added auto-pause when tab is hidden (saves CPU resources)
- Added fullscreen mode (press F to toggle)
- Updated README with keyboard shortcuts section

### Major Feature: Predator-Prey Ecosystem
- Added three diet types: Herbivore, Carnivore, Omnivore
- Herbivores (green) eat plants, are numerous, vulnerable to predators
- Carnivores (red) hunt other creatures, fewer but powerful
- Omnivores (purple) eat both plants and smaller creatures
- Extended neural network: 7 inputs -> 8 hidden -> 3 outputs
- New inputs: prey angle/distance, predator angle
- New output: attack decision
- New genome traits: attackPower, defense
- Diet types can evolve through mutation
- Visual indicators: emoji icons in leaderboard, colors by diet type
- Creature inspector shows diet type and kill count
