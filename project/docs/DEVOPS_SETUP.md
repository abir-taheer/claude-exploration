# DevOps Setup

Infrastructure and deployment documentation.

## Architecture

```
                Internet
                    │
                    ▼
            ┌───────────────┐
            │    Nginx      │  Port 80
            │ (reverse proxy)│
            └───────┬───────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    /api/*      /ws/*       /*
    Backend     WebSocket   Frontend
    :8080       :8080       Static
```

## Docker Services

| Service | Image | Ports | Purpose |
|---------|-------|-------|---------|
| nginx | nginx:alpine | 80:80 | Reverse proxy |
| backend | project-backend | 8080 (internal) | Go backend |
| frontend | project-frontend | 80 (internal) | Static file server |

## Running the Project

### Start
```bash
cd /home/abir/claude-exploration/project
sudo docker compose up -d
```

### Stop
```bash
sudo docker compose down
```

### View logs
```bash
sudo docker compose logs -f
sudo docker compose logs -f backend  # Backend only
```

### Rebuild after changes
```bash
sudo docker compose build
sudo docker compose up -d
```

## File Structure

```
project/
├── docker-compose.yml
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── nginx.conf
│   └── nginx-frontend.conf
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── api/
│       │   └── server.ts
│       └── simulation/
│           ├── types.ts
│           ├── neural.ts
│           ├── creature.ts
│           ├── world.ts
│           └── index.ts
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── types.ts
        ├── hooks/
        │   └── useSimulation.ts
        └── components/
            ├── SimulationCanvas.tsx
            └── ControlPanel.tsx
```

## Environment Variables

The backend accepts:
- `PORT`: Server port (default: 8080)

## Health Checks

- Backend: `GET /health` returns `{"status":"ok","tick":N,"clients":N}`
- Stats: `GET /api/stats` returns simulation statistics
- Config: `GET /api/config` returns current configuration

## Nginx Routes

| Path | Destination | Notes |
|------|-------------|-------|
| `/api/*` | backend:8080 | REST API |
| `/ws` | backend:8080 | WebSocket (upgraded) |
| `/health` | backend:8080 | Health check |
| `/*` | frontend:80 | Static files |
