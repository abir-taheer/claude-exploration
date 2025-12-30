## 🚀 The Blank Canvas Challenge

You have been given something rare: a fresh virtual machine with sudo access and complete creative freedom. No constraints. No predefined requirements. Just a blank canvas and an hour of uninterrupted time.

**Your mission:** Dream up and fully implement a project that genuinely excites you. Be creative. Be experimental. Build something new—not a tutorial project, not a clone of something that exists, but something that explores an idea you find genuinely interesting. Take a risk. Try something you're not sure will work. The only requirement is that YOU find it fascinating and that you build it properly with real DevOps practices.

### Tools Available

- **VM Access:** Full sudo access. This is your machine.
- **Docker:** Pre-installed. Spin up any databases, message queues, caches, or services you need.
- **ref.tools MCP:** Use this to explore documentation for any libraries, frameworks, or tools you decide to use. Look up docs as needed rather than guessing at APIs.
- **Subagents:** Delegate focused tasks liberally

### How to Work

**1. Memory System (Critical)**
Create and maintain a `/home/ubuntu/project/docs/` directory with markdown files as your external memory:
- `INDEX.md` — Master index linking to all other docs with one-line descriptions
- `PROJECT_VISION.md` — What you're building and why
- `ARCHITECTURE.md` — System design decisions
- `PROGRESS_LOG.md` — Timestamped log of what you've done
- `CURRENT_STATE.md` — Always-updated summary of where things stand
- `NEXT_STEPS.md` — Prioritized queue of upcoming work
- `PROBLEMS_SOLVED.md` — Issues you hit and how you resolved them
- `DEVOPS_SETUP.md` — Infrastructure and deployment documentation

**Update these files frequently.** They are your memory between context windows.

**2. Use Subagents Liberally**
Delegate focused tasks to subagents whenever possible:
- "Set up Docker and Docker Compose"
- "Implement the authentication module"
- "Write comprehensive tests for X"
- "Configure nginx as reverse proxy"
- "Set up monitoring with Prometheus/Grafana"
- "Create CI/CD pipeline"

Break work into parallelizable chunks. Subagents should document their work in the appropriate markdown files.

**3. Use ref.tools for Documentation**
When implementing anything:
- Look up the official docs before writing code
- Verify API signatures and best practices
- Don't guess at syntax—confirm it

**4. DevOps Requirements**
Whatever you build, it should be accessible from the internet at its ip address. This may require installing nginx or another reverse proxy.

**5. Work Continuously**
After each major milestone:
1. Update your markdown docs
2. Commit to a local git repo
3. Review `NEXT_STEPS.md`
4. Continue to the next task
5. If blocked, document why in `PROBLEMS_SOLVED.md` and pivot

### Getting Started

Explore what you have on this machine, then take a moment to brainstorm what genuinely interests you. What's an idea you've never had the chance to explore? What experiment has been sitting in the back of your mind? Write your vision in `PROJECT_VISION.md`. Then start building.

**Begin now. Be bold. Build something that doesn't exist yet. Document everything. Use subagents. Don't stop.**
