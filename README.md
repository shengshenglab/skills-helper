# skills-helper

[English README](./README.en.md)

一个面向 Codex 的 skill 安装器和推荐器。

它解决三件事：

- 把多个 skill repo 安装到 `~/.codex/skills`
- 对重复或功能重叠的 skills 做去重
- 在进入新仓库时，用 `project-skill-router` 推荐一组更聚焦的 skills

## 核心能力

- 一键安装：把默认推荐 skill repo 安装到本地 Codex 环境
- 技能推荐：进入新仓库时，先做一轮 skill routing
- 技能更新：上游 repo 更新后，可一句话或一条命令完成刷新
- GitHub 友好：默认配置适合直接公开分享，fresh clone 就能用

这个 helper 默认带的推荐 skill repo 是：

- `Everything Claude Code`
- `VoltAgent Awesome Claude Skills`
- `Awesome Claude Code`

## 30 秒上手

```bash
npm install
npm run quick-install
```

然后在一个新仓库里，你只需要会调用这个 skill：

```text
在分析这个仓库之前，先使用 `project-skill-router`。
```

```text
继续之前，先做一次技能推荐。
```

重要说明：

- 这套机制是提示驱动，不是硬 hook，也不是中间件
- 想让它更稳定，最直接的方法就是显式点名 `project-skill-router`、`技能推荐`、`skill推荐` 或 `skill routing`
- 安装完成后，你最应该期待看到的是一段可见的 `Skill Routing` 输出
- 如果你想刷新本地已安装的 skill 目录，可以执行 `npm run update:skills`，或者直接说 `技能更新`、`skills更新`、`update skills`

## 什么时候用

适合在这些时机调用 `project-skill-router`：

- 新 session 刚进入一个新仓库
- 先探索一轮后，真实技术重点变清楚了
- 仓库发生了结构变化，比如加了 Docker、Prisma、Next.js、CI，或者拆成多个服务

常用提示词：

```text
先分析这个仓库的主要风险点。完成第一轮分析后，再用 `project-skill-router`，然后继续。
```

```text
这个仓库刚发生了结构变化。请重新运行 `project-skill-router`，然后继续。
```

```text
这个仓库变化很大。继续之前，先重新做一次技能推荐。
```

```text
继续之前，先做一次技能更新，然后再给我新的技能推荐。
```

## 技能更新

如果上游 skill repo 有更新，刷新本地 skill 目录应该是一句提示词就能完成的事。

直接执行命令也可以：

```bash
npm run update:skills
```

但安装完成后，你也可以只说一句：

```text
技能更新
```

这一句就够了。helper 会把自己的安装路径写到 `~/.codex/skills/.skills-helper.json`，这样 agent 就能找到仓库目录，执行更新命令，刷新本地已安装的 skills，然后继续当前任务。

这些说法也可以触发更新：

- `技能更新`
- `skills更新`
- `update skills`
- `skill update`

`update:skills` 会做这几件事：

1. 刷新推荐的上游 repo
2. 重新安装受管理的 skills 到 `~/.codex/skills`
3. 刷新 `~/.codex/AGENTS.md` 里的启动说明

适合在这些时候用：

- 上游 skill repo 刚有更新
- 开始新仓库前，想先拿到最新 skill 目录
- agent 提示本地缺少某个本该存在的 skill

## 适合提交到 GitHub 的默认设置

现在这个仓库已经按适合共享的方式整理过：

- `registry/skill-sources.json` 默认就是可共享的 source 配置
- 本地 `subrepos/` 克隆目录是可选的，并且会被 Git 忽略
- `quick-install` 会在你的机器上下载本地镜像，后续更新更快
- 即使还没有 `subrepos/`，新的 clone 也可以直接按默认 registry 安装

## 你应该看到什么

调用 `project-skill-router` 后，一个有用的返回大致会像这样：

```markdown
## Skill Routing

Project type: Node.js CLI tool
Detected stack: language:javascript

Recommended skills:
- coding-standards: 通用代码质量和可维护性
- security-review: 输入处理、文件操作和安全风险检查
- verification-loop: 收尾前的检查和验证
- backend-patterns: CLI / 服务结构与后端实现模式

Opt-in only:
- deep-research
- fal-ai-media

Activation:
- 如果你希望下一步优先按这组 skills 工作，请回复确认。
```

如果你没有看到类似这样的输出，通常说明 router 并没有被显式触发。

## `quick-install` 会做什么

`quick-install` 会做这几件事：

1. 把推荐的上游 skill repo 下载到 `subrepos/`
2. 把受管理的 skills 安装到 `~/.codex/skills`
3. 把启动时的 skill routing 说明写入 `~/.codex/AGENTS.md`

安装完成后，Codex 可以借助内置的 `project-skill-router`：

- 判断项目语言和框架
- 推荐 always-on skills
- 推荐当前任务更相关的 task-specific skills
- 把 opt-in-only skills 保持为按需启用
- 在把推荐结果作为下一步优先使用的 skills 之前先请求你的确认

如果你想手动执行推荐，也可以：

```bash
npm run recommend -- --project /path/to/repo
```

## 日常命令

- 安装当前 registry 里登记的全部内容：`npm run install:all`
- 只安装 skills，不改启动说明：`npm run install:skills`
- 刷新上游 repo、重新安装 skills，并更新启动说明：`npm run update:skills`
- 只刷新 `~/.codex/AGENTS.md` 里的启动 routing 说明：`npm run install:startup`
- 下载推荐的上游 repo：`npm run download:recommended`
- 查看推荐的上游 repo 列表：`npm run list:recommended`
- 卸载本仓库管理的 skills，并移除启动说明：`npm run uninstall`

## 添加你自己的 Skill Repo

先看推荐 repo：

```bash
npm run list:recommended
```

添加一个本地 source：

```bash
git clone https://github.com/affaan-m/everything-claude-code.git subrepos/everything-claude-code

npm run add:local-source -- \
  --id everything-claude-code-local \
  --path subrepos/everything-claude-code \
  --source-dir skills \
  --overlay-dir .agents/skills
```

然后执行安装：

```bash
npm run install:all
```

如果不再需要某个 source，可以编辑 `registry/skill-sources.json`，把它删掉，或者改成 `"enabled": false`。

## 去重规则

默认使用“主仓库优先”的去重策略：

- 优先级更高的 source 保留
- 后续 source 中重复名称或重复功能的 skill 自动跳过
- source 优先级按 `registry/skill-sources.json` 中的顺序决定

默认的重复功能分组定义在 `registry/dedupe-rules.json`。

## 你通常会改的文件

- `registry/skill-sources.json`
- `registry/dedupe-rules.json`
- `subrepos/`

## 完整命令列表

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
