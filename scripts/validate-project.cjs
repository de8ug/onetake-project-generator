const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const [file, ...flags] = process.argv.slice(2);
if (!file || flags.some(flag => !["--mobile", "--production"].includes(flag))) {
  console.error("Usage: validate-project.cjs <project.onetake.json> [--mobile] [--production]");
  process.exit(2);
}

const project = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
const production = flags.includes("--production");
assert.equal(project.type, "onetake-project");
assert(typeof project.title === "string" && project.title.trim());

if (project.mode === "talkinghead") {
  assert.equal(project.version, 4);
  const state = project.talkingHead;
  assert(state && state.script && state.directorPlan);
  assert(Number.isFinite(state.teleprompterOpacity) && state.teleprompterOpacity >= 0 && state.teleprompterOpacity <= 1);
  assert(Number.isFinite(state.scrollSpeed) && state.scrollSpeed >= 1 && state.scrollSpeed <= 200);
  const segments = state.directorPlan.segments;
  const assets = state.brollAssets || [];
  assert(Array.isArray(segments) && segments.length);
  assert(Array.isArray(assets));
  assert.equal(new Set(segments.map(s => s.id)).size, segments.length, "Duplicate segment IDs");
  assert.equal(new Set(assets.map(a => a.id)).size, assets.length, "Duplicate asset IDs");
  const assetIds = new Set(assets.map(a => a.id));
  const language = state.activeLanguage || "zh";
  const spoken = segments.map(s => {
    assert(s.script && typeof s.script[language] === "string" && s.script[language].trim());
    assert(Number.isFinite(s.estimatedSeconds?.[language]) && s.estimatedSeconds[language] > 0);
    assert(Array.isArray(s.cues));
    for (const cue of s.cues) {
      assert(assetIds.has(cue.assetId), `Missing asset ${cue.assetId} in ${s.id}`);
      assert(Number.isFinite(cue.atProgress) && cue.atProgress >= 0 && cue.atProgress <= 1);
      if (flags.includes("--mobile")) assert.equal(cue.atProgress, 0, "Mobile cues must start with their segment");
    }
    return s.script[language].trim();
  }).join("\n\n");
  assert.equal(spoken, state.script.chinese.content.trim(), "Segment scripts do not match full script");
  if (production) {
    assert.equal(state.teleprompterText.trim(), spoken, "Stale teleprompter text");
    assert(state.publication?.description?.trim(), "Missing publication description");
    assert.equal(new Set(state.publication.keywords).size, 4, "Expected four distinct keywords");
  }
  console.log(JSON.stringify({ mode: project.mode, version: project.version, segments: segments.length, assets: assets.length, mobile: flags.includes("--mobile") }));
} else if (project.mode === "whiteboard") {
  if (flags.includes("--mobile")) throw new Error("Mobile whiteboard import is not supported");
  assert.equal(project.version, 2);
  assert(Array.isArray(project.scenes) && project.scenes.length);
  assert.equal(new Set(project.scenes.map(s => s.id)).size, project.scenes.length, "Duplicate scene IDs");
  assert(project.scenes.some(s => s.id === project.currentSceneId), "Missing current scene");
  for (const scene of project.scenes) {
    assert(Array.isArray(scene.elements));
    assert(["camera-full", "board-pip", "split"].includes(scene.cameraPresentation));
    if (!production) continue;
    const background = scene.elements.find(e => e.id.endsWith("__background"));
    assert(background, `Missing page background in ${scene.id}`);
    assert.equal(new Set(scene.elements.map(e => e.id)).size, scene.elements.length, "Duplicate element IDs");
    for (const element of scene.elements) {
      assert(element.x >= background.x && element.y >= background.y && element.x + element.width <= background.x + background.width && element.y + element.height <= background.y + background.height, `Out-of-page element ${scene.id}/${element.id}`);
      if (scene.cameraPresentation === "split" && element !== background) assert(element.y + element.height <= background.y + background.height / 2, `Split content crosses midpoint: ${element.id}`);
      if (element.type === "image") assert(element.fileId && project.files?.[element.fileId], `Missing image file ${element.id}`);
    }
  }
  if (production) {
    assert.equal(project.script?.content, project.scenes.filter(s => s.id !== project.metadata.coverSceneId).map(s => s.narration).join("\n\n"), "Script does not match narration");
    const shows = project.directorPlan?.actions?.filter(a => a.type === "scene.show") || [];
    assert.equal(shows.length, project.scenes.length, "Missing director page action");
    let atMs = 0;
    project.scenes.forEach((scene, index) => {
      assert.equal(shows[index].atMs, atMs, "Director time mismatch");
      assert.equal(shows[index].target?.sceneId, scene.id, "Director target mismatch");
      atMs += scene.durationHintMs || 0;
    });
    assert.equal(project.directorPlan.durationMs, atMs, "Director duration mismatch");
  }
  console.log(JSON.stringify({ mode: project.mode, version: project.version, scenes: project.scenes.length }));
} else {
  throw new Error("Unsupported OneTake project mode");
}
