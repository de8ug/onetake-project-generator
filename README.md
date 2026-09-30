# OneTake Project Generator

An independent, local Codex Skill for preparing editable OneTake talking-head and whiteboard projects. It does not need the OneTake source tree, an API key, a running server, or a personal project as a template.

The editorial workflow lives in [SKILL.md](SKILL.md). The included Node.js packager is deterministic: it turns an **already reviewed** `content-plan.json` into a project, recording guide, publication copy, source-review notes, and a no-camera rehearsal preview. It does not write the story, check facts, generate images, record video, or publish.

## Use

With Node.js 20 or later, from this directory:

```sh
node scripts/build-project.cjs /path/to/content-plan.json /path/to/output
node scripts/validate-project.cjs /path/to/output/project.onetake.json --production
```

Add `--mobile` to the validation command for a talking-head project intended for mobile import. Whiteboard import is web-only in the current contract. See [content-plan format](references/content-plan.md) for the authored input. Import the resulting `project.onetake.json` in OneTake and inspect the first, evidence, and closing scenes before recording. This standalone validator checks structure and internal consistency; the installed OneTake version is the authority for actual import and rendering.

For Codex, install the Skill by linking this directory under the local skills directory as `onetake-project-generator`, then invoke it for a topic-to-project request. The Skill creates a project; it does not automatically record, export, or publish.

## Development

```sh
node --test scripts/build-project.test.cjs
```

`contracts/` contains synthetic format templates, not user footage or private content. A reviewed image in a plan's `assets/` directory can be embedded through `sourceImage` on a talking-head segment or a dedicated whiteboard source page. The generated `来源与核验.md` is a review checklist, not a certification. Check claims, image rights, personal data, and compatibility before publication.

This repository has no bundled user recordings, accounts, keys, or model credentials. It is not connected to a GitHub remote by default.
