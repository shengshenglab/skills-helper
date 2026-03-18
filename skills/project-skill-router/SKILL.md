---
name: project-skill-router
description: Analyze a repository at the start of work, identify its stack and risk areas, and choose a focused set of skills to use for the current project.
---

# Project Skill Router

Use this skill at the start of work in a repository to avoid overloading the session with too many skills.

In a new session, when a repository is first encountered, the routing result should be shown explicitly before substantive work starts. Keep it brief but visible, then continue with the user's actual request.

When this skill is invoked explicitly, do not just list skill names. Recommend the skills, give a short plain-language description for each one, and then ask the user whether to activate the recommended set.

Common explicit trigger phrases include:

- `project-skill-router`
- skill routing
- skill recommendation
- `skill推荐`
- `技能推荐`

## Goals

- Detect the project's language, framework, and major tooling
- Pick a small set of always-on skills
- Add task-specific skills only when they are clearly relevant
- Keep expensive or niche skills opt-in by default
- Avoid rerunning the same routing step unless the session is new, the task changes materially, or the user asks for it
- Make the recommendation actionable by explaining what each recommended skill is for
- Wait for user confirmation before treating the recommended set as the active skill set

## Routing Rules

### Always Consider

- `coding-standards`
- `tdd-workflow`
- `verification-loop`
- `security-review`
- `documentation-lookup`

### Add Based On Project Signals

- Next.js or React app: `frontend-patterns`, `e2e-testing`, `nextjs-turbopack`
- Backend/API app: `backend-patterns`, `api-design`
- Docker present: `docker-patterns`
- Database migrations present: `database-migrations`
- Django: `django-patterns`, `django-security`, `django-verification`
- Laravel: `laravel-patterns`, `laravel-security`, `laravel-verification`
- Spring Boot: `springboot-patterns`, `springboot-security`, `springboot-verification`
- Python service: `python-patterns`, `python-testing`
- Go service: `golang-patterns`, `golang-testing`
- Rust project: `rust-patterns`, `rust-testing`
- iOS/Swift project: `swiftui-patterns` or concurrency-focused Swift skills
- MCP/server work: `mcp-server-patterns`
- Research-heavy tasks: `search-first`, `market-research`, `deep-research`

### Keep Opt-In Unless Requested

- `deep-research`
- `market-research`
- `exa-search`
- `fal-ai-media`
- `video-editing`
- `dmux-workflows`
- `autonomous-loops`
- other domain-specific business skills

## Output Format

```markdown
## Skill Routing

Project type: ...
Detected stack: ...

Recommended skills:
- skill-name: one-line purpose

Always-on skills:
- ...

Task-specific skills:
- ...

Opt-in only:
- ...

Why:
- ...

Activation:
- Ask the user to confirm before activating the recommended skill set.
```
