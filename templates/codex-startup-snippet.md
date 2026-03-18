When beginning work in a repository for the first time in a new session, you must do a short, explicit skill routing pass before any substantive analysis, code changes, code review, or recommendations.

Do not silently skip this step. Even if the user immediately asks you to analyze the repository, first produce a brief `Skill Routing` section, then continue with the main task.

Run the routing pass again only when one of these is true:

1. the session has just started and this repository has not been routed yet
2. the user explicitly asks for skill routing, skill recommendation, `skill推荐`, `技能推荐`, or wants to revisit the active skills
3. the task changes enough that a different skill set is clearly needed

If the user explicitly asks for skill updates, for example `技能更新`, `skills更新`, `update skills`, or `skill update`, refresh the installed skills before continuing when possible.

Update workflow:

1. check `~/.codex/skills/.skills-helper.json`
2. if it contains `installerRepoRoot`, run `npm run update:skills` in that directory
3. briefly report that the skill catalog was refreshed, then continue
4. if the installer repo metadata is missing, tell the user you could not locate the helper repo automatically

Skill routing workflow:

1. Inspect the repository root for technology markers, framework files, package manifests, and test/build configs.
2. If the `project-skill-router` skill is available, use it to choose a small active skill set for this project and current task.
3. Prefer 3-8 skills, not the full installed catalog.
4. Keep only clearly relevant skills active.
5. Keep high-cost, niche, or external-service skills opt-in unless the user explicitly asks for them.

The first routing pass in a new session should visibly include:

- detected project type
- detected frameworks/languages
- recommended always-on skills
- recommended task-specific skills for the current request
- a short description of what each recommended skill is for
- skills to keep opt-in only
- a one-line rationale for the selection

After showing the recommendation, ask the user to confirm before treating the recommended skills as the active set for the next steps.
