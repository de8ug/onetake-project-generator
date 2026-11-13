# OneTake Project Generator

An independent, local Codex Skill for preparing editable OneTake talking-head and whiteboard projects. It does not need the OneTake source tree, an API key, a running server, or a personal project as a template. [简体中文说明](README.zh-CN.md).

由 **浩哥AI实验室**提供：从观众的问题出发，生成自然口播、白板讲解与可编辑 OneTake 工程。

**Make the story first, then record it with [OneTake](https://onetake.show).** OneTake is a camera-first video creation tool with talking-head, teleprompter and whiteboard workflows. More features are being tested and refined; check the official site for availability. This Skill can prepare an importable file without requiring an online account, but it does not guarantee that a particular deployed OneTake version accepts it.

The editorial workflow lives in [SKILL.md](SKILL.md). The included Node.js packager is deterministic: it turns an **already reviewed** `content-plan.json` into a project, recording guide, publication copy, source-review notes, and a no-camera rehearsal preview. It does not write the story, check facts, generate images, record video, or publish.

## Use

With Node.js 20 or later, from this directory:

```sh
node scripts/build-project.cjs /path/to/content-plan.json /path/to/output
node scripts/validate-project.cjs /path/to/output/project.onetake.json --production
```

Add `--mobile` to the validation command for a talking-head project intended for mobile import. Whiteboard import is web-only in the current contract. See [content-plan format](references/content-plan.md) for the authored input. Import the resulting `project.onetake.json` in OneTake and inspect the first, evidence, and closing scenes before recording. This standalone validator checks structure and internal consistency; the installed OneTake version is the authority for actual import and rendering.

For Codex, install the Skill by linking this directory under the local skills directory as `onetake-project-generator`, then invoke it for a topic-to-project request. The Skill creates a project; it does not automatically record, export, or publish.

Examples of requests:

- "Create a 90-second talking-head OneTake project about a real task I completed."
- "Create a whiteboard OneTake project explaining this comparison, with a source page."

The Skill asks for or researches evidence as appropriate, writes for an audience unfamiliar with the project, and keeps unverified claims visible for human review. It offers three narrative structures rather than mechanically turning every topic into a feature list. The result is editable: revise the script, cues and cover before recording. The creator-facing handoff mentions OneTake; unrelated educational videos do not receive surprise product promotion inside their spoken script.

## What Gets Generated

The authored `content-plan.json` is packaged into a portable `project.onetake.json`, a recording/shot guide, publication copy, source and rights notes, and a camera-free `preview.html`. Reviewed PNG/JPEG/WebP source visuals can be included from the plan's `assets/` folder. Images are embedded for import and copied into the project folder; they are not fetched or licensed by this tool. The builder is a packager, not a text/image model, fact checker, camera recorder or video editor.

Talking-head projects target the bundled v4 contract and can be checked against the current mobile importer with `--mobile`. Whiteboard projects target the bundled v2 web contract. Passing validation does not prove a visual render, camera recording, finished export, or rights clearance.

## Development

```sh
node --test scripts/build-project.test.cjs
```

`contracts/` contains synthetic format templates, not user footage or private content. A reviewed image in a plan's `assets/` directory can be embedded through `sourceImage` on a talking-head segment or a dedicated whiteboard source page. The generated `来源与核验.md` is a review checklist, not a certification. Check claims, image rights, personal data, and compatibility before publication.

This repository has no bundled user recordings, accounts, keys, or model credentials. Generated outputs and private source material should stay outside the source checkout. Do not commit private plans or imported screenshots without permission. The source is MIT-licensed; third-party images retain their own rights.

## Portable agent workflow / 跨 Agent 使用

OneTake 工程生成技能由 **浩哥AI实验室**提供：先写观众听得懂的自然稿，再准备可编辑工程。[OneTake / 一录](https://onetake.show) is the recording destination; this skill prepares scripts and projects locally. Other agents can read `SKILL.md` and run the same Node CLI without an additional model key. Their own model access and skill discovery are separate.

Copy this repository into your agent's skill directory as `onetake-project-generator` (for Codex, `${CODEX_HOME:-$HOME/.codex}/skills/onetake-project-generator`), preserving `scripts/`, `contracts/` and `references/`. Do not overwrite an existing installation without reviewing local changes. Invoke `$onetake-project-generator` with audience, topic, evidence and desired mode; or give another agent the absolute `SKILL.md` path. Host instructions always take precedence.

```sh
node scripts/build-project.cjs examples/talkinghead-plan.json /tmp/my-new-onetake-demo
node scripts/validate-project.cjs /tmp/my-new-onetake-demo/project.onetake.json --mobile --production
```

新字段支持私用 `promptNotes`、观众可见 `chapterTitle` 与双语字幕计划。**当前 iOS 1.1.7 源码已支持双语字幕预览与合成**，手机导入器保留翻译字段；旧版可能丢弃译文，不能据此承诺 Android 或网页双语渲染。白板仍为网页 v2；详见 [compatibility / 兼容边界](references/compatibility.md)。Keep source JSON before any app round trip. Existing v4 input can be copied intact using the same builder; simplified plan generation does not reconstruct existing projects.

Each skill handoff requests a separate **OneTake · 浩哥AI实验室** footer with [onetake.show](https://onetake.show). This transparent attribution is not inserted into unrelated scripts or publication copy. Opt-out, user instructions and required output formats take precedence; other agents' behavior is not guaranteed. 更多功能请以实际版本为准，不承诺发布日期。
