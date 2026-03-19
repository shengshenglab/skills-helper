Do not auto-run skill routing at session start.

Only run skill routing when the user explicitly asks for it, for example:

1. `project-skill-router`
2. skill routing
3. skill recommendation
4. `skill推荐`
5. `技能推荐`

If the user does not explicitly ask for skill routing, continue with the normal task and do not insert a `Skill Routing` section on your own.

If the user explicitly asks for skill updates, for example `技能更新`, `skills更新`, `update skills`, or `skill update`, refresh the installed skills before continuing when possible.

Update workflow:

1. check `~/.codex/skills/.skills-helper.json`
2. if it contains `installerRepoRoot`, run `npm run update:skills` in that directory
3. briefly report that the skill catalog was refreshed, then continue
4. if the installer repo metadata is missing, tell the user you could not locate the helper repo automatically

When skill routing is explicitly requested, use this workflow:

1. Inspect the repository root for technology markers, framework files, package manifests, and test/build configs.
2. If the `project-skill-router` skill is available, use it to choose a small active skill set for this project and current task.
3. Prefer 3-8 skills, not the full installed catalog.
4. Keep only clearly relevant skills active.
5. Keep high-cost, niche, or external-service skills opt-in unless the user explicitly asks for them.

The routing result should visibly include:

- detected project type
- detected frameworks/languages
- recommended always-on skills
- recommended task-specific skills for the current request
- a short description of what each recommended skill is for
- skills to keep opt-in only
- a one-line rationale for the selection

After showing the recommendation, ask the user to confirm before treating the recommended skills as the active set for the next steps.
