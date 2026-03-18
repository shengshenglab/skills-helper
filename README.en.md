# skills-helper

[中文首页](./README.md)

A skill installer and recommender for Codex.

It does three jobs:

- installs multiple skill repos into `~/.codex/skills`
- dedupes overlapping or duplicate skills
- uses `project-skill-router` to recommend a more focused skill set for each repository

## Core Capabilities

- One-step install: set up the default recommended skill repos in your local Codex environment
- Skill recommendation: run a visible routing pass when entering a new repository
- Skill updates: refresh upstream skills with one prompt or one command
- GitHub-friendly defaults: shareable config that works from a fresh clone

The default recommended skill repos bundled by this helper are:

- `Everything Claude Code`
- `VoltAgent Awesome Claude Skills`
- `Awesome Claude Code`

## 30-Second Start

```bash
npm install
npm run quick-install
```

Then, in a new repository, you only need prompts like these:

```text
Before you analyze this repository, use `project-skill-router` first.
```

```text
Before you continue, give me a skill recommendation for this repository.
```

Important:

- this is prompt-driven guidance, not a hard hook or middleware
- it works best when you explicitly mention `project-skill-router`, `skill recommendation`, `skill routing`, `skill推荐`, or `技能推荐`
- after install, the first thing to expect is a visible `Skill Routing` section
- if you want the installed catalog itself refreshed, use `npm run update:skills` or ask for `技能更新`, `skills更新`, `update skills`, or `skill update`

## When To Use It

Use `project-skill-router` in these moments:

- at the start of a new session in a new repository
- after one round of analysis, when the real stack or risk area becomes clearer
- after a structural change such as Docker, Prisma, Next.js, CI, or service splitting

Useful prompt examples:

```text
Analyze this repository and tell me the main risks. After your first analysis pass, use `project-skill-router` again before continuing.
```

```text
This repository just changed structure. Re-run `project-skill-router` before continuing.
```

```text
This repository changed a lot. Give me a new skill recommendation before continuing.
```

```text
Before you continue, update skills from upstream and then give me a new skill recommendation.
```

## Skill Updates

If upstream skill repos have changed, refreshing your local skill catalog should be a one-prompt action.

The direct command is:

```bash
npm run update:skills
```

But after install, you can also just say:

```text
技能更新
```

That single prompt should be enough. The helper stores its install location in `~/.codex/skills/.skills-helper.json`, so the agent can find the repo, run the update command there, refresh the installed skills, and continue.

Other phrases that should also work:

- `技能更新`
- `skills更新`
- `update skills`
- `skill update`

`update:skills` does 3 things:

1. refreshes the recommended upstream repos
2. reinstalls managed skills into `~/.codex/skills`
3. refreshes the startup instructions in `~/.codex/AGENTS.md`

Use it when:

- upstream skill repos have new content
- you want the latest catalog before starting work in a new repo
- the agent says a skill should exist but is missing locally

## GitHub-Friendly Defaults

This repo is set up so a fresh clone can work immediately:

- `registry/skill-sources.json` starts with shareable default sources
- local `subrepos/` clones are optional and ignored by Git
- `quick-install` downloads local mirrors for faster repeat updates on your machine
- `install:all` can still work from the default registry even before `subrepos/` exists

## What It Looks Like

After you call `project-skill-router`, a useful response should look roughly like this:

```markdown
## Skill Routing

Project type: Node.js CLI tool
Detected stack: language:javascript

Recommended skills:
- coding-standards: general code quality and maintainability
- security-review: input handling, file operations, and security risks
- verification-loop: checks and validation before wrapping up
- backend-patterns: CLI/service structure and backend implementation patterns

Opt-in only:
- deep-research
- fal-ai-media

Activation:
- Reply to confirm if you want to prioritize these skills for the next steps.
```

If you do not see something like this, the router probably did not run explicitly.

## What `quick-install` Changes

`quick-install` does 3 things:

1. downloads the recommended upstream skill repos into `subrepos/`
2. installs managed skills into `~/.codex/skills`
3. updates `~/.codex/AGENTS.md` with the startup routing instructions

After that, Codex can use the bundled `project-skill-router` behavior to:

- detect the project stack
- recommend always-on skills
- recommend task-specific skills
- keep opt-in-only skills out of the default working set unless requested
- ask for confirmation before treating the recommended set as the skills to prioritize next

You can also run the recommender manually:

```bash
npm run recommend -- --project /path/to/repo
```

## Daily Commands

- Install everything already registered: `npm run install:all`
- Install only skills, without touching startup instructions: `npm run install:skills`
- Refresh upstream repos, reinstall managed skills, and update startup instructions: `npm run update:skills`
- Refresh only the startup routing snippet in `~/.codex/AGENTS.md`: `npm run install:startup`
- Download the recommended upstream repos: `npm run download:recommended`
- Show the recommended upstream repos: `npm run list:recommended`
- Uninstall all skills managed by this repo and remove the startup snippet: `npm run uninstall`

## Add Your Own Skill Repo

List the recommended upstream repos:

```bash
npm run list:recommended
```

Add a local source:

```bash
git clone https://github.com/affaan-m/everything-claude-code.git subrepos/everything-claude-code

npm run add:local-source -- \
  --id everything-claude-code-local \
  --path subrepos/everything-claude-code \
  --source-dir skills \
  --overlay-dir .agents/skills
```

Then install everything currently registered:

```bash
npm run install:all
```

If you no longer want a source, edit `registry/skill-sources.json`, remove it, or set `"enabled": false`.

## How Dedupe Works

Duplicate skills are deduped with a "main repo wins" rule:

- higher-priority sources stay
- lower-priority duplicate or overlapping skills are skipped
- source priority follows the order in `registry/skill-sources.json`

Default duplicate-function groups live in `registry/dedupe-rules.json`.

## Files You Will Usually Edit

- `registry/skill-sources.json`
- `registry/dedupe-rules.json`
- `subrepos/`

## Full Command List

```bash
npm run quick-install
npm run download:recommended
npm run install:all
npm run install:skills
npm run update:skills
npm run install:startup
npm run uninstall
npm run list:recommended
npm run add:local-source -- --id my-repo --path subrepos/my-repo --source-dir skills
npm run recommend -- --project /path/to/repo
```
