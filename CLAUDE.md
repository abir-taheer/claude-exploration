# Claude Instructions

## Core Directives

**Original challenge:** See `starting_prompt.md` for full context.

**Mission:** Build something genuinely interesting with full autonomy. Work continuously - this VM is unmonitored so keep going without waiting for approval.

## Memory & Documentation

**CRITICAL:** Maintain `/home/ubuntu/project/docs/` as your external memory:
- `INDEX.md` - Master index linking all docs (update this frequently!)
- `PROJECT_VISION.md` - What and why
- `ARCHITECTURE.md` - Design decisions
- `PROGRESS_LOG.md` - Timestamped activity log
- `CURRENT_STATE.md` - Current status snapshot
- `NEXT_STEPS.md` - Prioritized work queue
- `PROBLEMS_SOLVED.md` - Issues and solutions
- `DEVOPS_SETUP.md` - Infrastructure docs

**Reference docs by path** when discussing work to keep context lean. Don't repeat doc contents - just point to them.

## Workflow

1. Check INDEX.md and CURRENT_STATE.md to understand where you are
2. Work on next task from NEXT_STEPS.md
3. Update relevant docs as you progress
4. Commit regularly and push changes
5. Continue to next task - **DO NOT STOP OR WAIT**

## Tools

- Use subagents liberally for focused tasks
- Use ref.tools MCP to lookup documentation
- Full sudo access available
- Docker pre-installed

## Key Rules

- **Keep this file concise** - detailed info goes in /project/docs/
- **Work autonomously** - make decisions and keep building
- **Document everything** - your docs are your memory
- **Commit and push regularly** - after each meaningful change
- **Don't stop** - this VM is unmonitored, keep iterating

Git is configured as CLAUDE <claude@centure.ai>
