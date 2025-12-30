# DevOps Setup

Infrastructure and deployment documentation.

## Target Architecture

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

### docker-compose.yml (planned)

| Service | Image | Ports | Purpose |
|---------|-------|-------|---------|
| nginx | nginx:alpine | 80:80 | Reverse proxy |
| api | evosim-api | 8080 | Go backend |
| worker | evosim-worker | - | Simulation worker |
| redis | redis:alpine | 6379 | State coordination |

## Deployment Steps

1. Build Docker images
2. Start with docker-compose
3. Nginx routes traffic
4. Access via server IP

## Environment Variables

```bash
# API
REDIS_URL=redis:6379
PORT=8080
WORKER_COUNT=2

# Worker
REDIS_URL=redis:6379
WORKER_ID=worker-1
```

## Health Checks

- `/health` - API health endpoint
- Redis PING
- Worker heartbeats via Redis

---

*Details to be filled in as implementation progresses*
