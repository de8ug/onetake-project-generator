const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const build = path.join(__dirname, "build-project.cjs");
const validate = path.join(__dirname, "validate-project.cjs");
const common = {
  title: "合成测试", audience: "测试观众", corePoint: "合成内容，不是真实录制", coverTitle: "测试封面\n可编辑标题", coverSubtitle: "测试小字", productMention: "none",
  publication: { description: "不发布的合成测试", keywords: ["测试一", "测试二", "测试三", "测试四"] },
  sourceNotes: ["Synthetic test; no private material."], review: ["仅测试工程格式。"],
};
const pixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9XQhEAAAAASUVORK5CYII=", "base64");
const sourceImage = { file: "assets/source.png", credit: "Synthetic source", sourceUrl: "https://example.com/original", width: 1, height: 1 };
function run(plan, check, withImage = false) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "onetake-skill-test-"));
  try {
    const input = path.join(dir, "brief.json");
    fs.writeFileSync(input, JSON.stringify(plan));
    if (withImage) {
      fs.mkdirSync(path.join(dir, "assets"));
      fs.writeFileSync(path.join(dir, "assets", "source.png"), pixel);
    }
    const output = path.join(dir, "output");
    const result = spawnSync(process.execPath, [build, input, output], { encoding: "utf8" });
    check({ result, output });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
function importCheck(output, mobile) {
  const args = [validate, path.join(output, "project.onetake.json"), "--production"];
  if (mobile) args.push("--mobile");
  const result = spawnSync(process.execPath, args, { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(fs.readFileSync(path.join(output, "project.onetake.json"), "utf8"));
}
test("talking-head package passes standalone web/mobile checks and preserves quote-free opening", () => {
  run({ ...common, mode: "talkinghead", segments: [
    { id: "intro", role: "开场", text: "这是一个合成开场。", seconds: 10, shot: "真人占位。" },
    { id: "end", role: "结束", text: "重点是可编辑测试。", seconds: 10, shot: "真人占位。", quote: "重点是可编辑", emphasis: "可编辑" },
  ] }, ({ result, output }) => {
    assert.equal(result.status, 0, result.stderr);
    const p = importCheck(output, true);
    assert.equal(p.talkingHead.directorPlan.segments[0].cues.length, 0);
    assert.equal(p.talkingHead.directorPlan.segments[1].cues[0].atProgress, 0);
    assert.equal(p.talkingHead.watermarkText, "OneTake");
    assert.equal(p.talkingHead.directorPlan.segments[0].production.verification, "opinion");
    assert(p.talkingHead.teleprompterFontSize <= 32);
    for (const file of ["录制稿与分镜.md", "发布词.md", "来源与核验.md", "preview.html", "content-plan.json"]) assert(fs.existsSync(path.join(output, file)));
  });
});
test("whiteboard package passes standalone checks with editable cover, split comparison, manual director", () => {
  run({ ...common, mode: "whiteboard", pages: [
    { id: "intro", name: "真人开场", camera: "camera-full", text: "合成测试开场。", seconds: 10, shot: "真人占位。" },
    { id: "compare", name: "对比页", camera: "split", text: "看两个步骤的对比。", seconds: 15, shot: "上白板下人。", board: { kicker: "对比", headline: "前后对照", diagram: "compare", items: ["步骤一\n检查", "步骤二\n反馈"], footer: "假设场景" } },
  ] }, ({ result, output }) => {
    assert.equal(result.status, 0, result.stderr);
    const p = importCheck(output, false);
    assert.equal(p.currentSceneId, "intro");
    assert.equal(p.metadata.coverSceneId, "cover");
    assert.equal(p.directorPlan.autoStartOnRecording, false);
    assert(p.scenes[0].elements.some(e => e.type === "text"));
    assert(!p.scenes[0].elements.some(e => e.type === "image"));
  });
});
test("rejects highlight that is not part of quote", () => {
  run({ ...common, mode: "talkinghead", segments: [{ id: "intro", role: "开场", text: "测试。", seconds: 10, shot: "占位。", quote: "已有重点", emphasis: "不存在" }] }, ({ result, output }) => {
    assert.notEqual(result.status, 0);
    assert(!fs.existsSync(path.join(output, "project.onetake.json")));
  });
});
test("rejects duplicate segment identities", () => {
  const part = { id: "same", role: "开场", text: "测试。", seconds: 10, shot: "占位。" };
  run({ ...common, mode: "talkinghead", segments: [part, part] }, ({ result }) => assert.notEqual(result.status, 0));
});
test("talking-head source image is embedded and copied with a segment-start cue", () => {
  run({ ...common, mode: "talkinghead", segments: [
    { id: "intro", role: "开场", text: "这是合成来源图测试。", seconds: 10, shot: "真人占位。", sourceImage },
  ] }, ({ result, output }) => {
    assert.equal(result.status, 0, result.stderr);
    const p = importCheck(output, true);
    const asset = p.talkingHead.brollAssets[0];
    assert.equal(asset.type, "image");
    assert(asset.imageDataUrl.startsWith("data:image/png;base64,"));
    assert.equal(p.talkingHead.directorPlan.segments[0].cues[0].assetId, asset.id);
    assert(fs.existsSync(path.join(output, "assets", "source.png")));
  }, true);
});
test("whiteboard source page embeds a referenced image file", () => {
  run({ ...common, mode: "whiteboard", pages: [
    { id: "intro", name: "开场", camera: "camera-full", text: "合成开场。", seconds: 10, shot: "真人占位。" },
    { id: "source", name: "来源", camera: "board-pip", text: "这是合成来源图。", seconds: 10, shot: "来源页占位。", sourceImage },
  ] }, ({ result, output }) => {
    assert.equal(result.status, 0, result.stderr);
    const p = importCheck(output, false);
    const element = p.scenes[2].elements.find(e => e.type === "image");
    assert(element);
    assert(p.files[element.fileId].dataURL.startsWith("data:image/png;base64,"));
  }, true);
});
const { validateExtras, validatePublication } = require('./project-fields.cjs');
test('caption boundaries and bilingual emphasis are enforced', () => {
  const line = { text: 'a'.repeat(72), emphasis: 'a'.repeat(24), translation: 'b'.repeat(160), translationEmphasis: 'b'.repeat(48), dwell: 0.5 };
  for (const mode of ['off', 'key', 'full']) validateExtras({ promptNotes: 'p'.repeat(300), chapterTitle: 'c'.repeat(24), captions: { mode, lines: Array(30).fill(line) } });
  validateExtras({ captions: { mode: 'key', lines: [{ ...line, dwell: 2 }] } });
  for (const change of [{ text: 'a'.repeat(73) }, { emphasis: 'a'.repeat(25) }, { translation: 'b'.repeat(161) }, { translationEmphasis: 'b'.repeat(49) }, { emphasis: 'z' }, { translationEmphasis: 'z' }, { dwell: 0.49 }, { dwell: 2.01 }, { dwell: NaN }]) {
    assert.throws(() => validateExtras({ captions: { mode: 'key', lines: [{ ...line, ...change }] } }));
  }
  for (const bad of [{ promptNotes: 'p'.repeat(301) }, { chapterTitle: 'c'.repeat(25) }, { captions: { mode: 'auto', lines: [] } }, { captions: { mode: 'full', lines: Array(31).fill(line) } }]) assert.throws(() => validateExtras(bad));
  for (const keywords of [['a','b','c','d','a'], ['a','b','c',''], ['a','b','c',1]]) assert.throws(() => validatePublication({ description: 'test', keywords }));
});
test('bilingual captions, private notes and delayed cues survive packaging and v4 copying', () => {
  const example = JSON.parse(fs.readFileSync(path.join(__dirname, '../examples/talkinghead-plan.json'), 'utf8'));
  run(example, ({ result, output }) => {
    assert.equal(result.status, 0, result.stderr);
    const p = importCheck(output, true);
    const segment = p.talkingHead.directorPlan.segments[0];
    for (const key of ['promptNotes', 'chapterTitle', 'captions']) assert.deepEqual(segment[key], example.segments[0][key]);
    assert.equal(p.talkingHead.directorPlan.segments[1].cues[0].atProgress, 0.4);
    p.futureExtension = { preserve: true };
    p.talkingHead.customSetting = { preserve: true };
    const input = path.join(output, 'existing.json');
    fs.writeFileSync(input, JSON.stringify(p));
    const copy = path.join(output, 'copy');
    const result2 = spawnSync(process.execPath, [build, input, copy], { encoding: 'utf8' });
    assert.equal(result2.status, 0, result2.stderr);
    assert.deepEqual(fs.readFileSync(path.join(copy, 'project.onetake.json')), fs.readFileSync(input));
    const repeat = spawnSync(process.execPath, [build, input, copy], { encoding: 'utf8' });
    assert.notEqual(repeat.status, 0);
  });
});
test('invalid caption input cannot produce a deliverable', () => {
  run({ ...common, mode: 'talkinghead', segments: [{ id: 'intro', role: 'intro', text: 'Synthetic.', seconds: 10, shot: 'Placeholder', captions: { mode: 'key', lines: [{ text: 'x'.repeat(73) }] } }] }, ({ result, output }) => {
    assert.notEqual(result.status, 0);
    assert(!fs.existsSync(path.join(output, 'project.onetake.json')));
  });
});
test('English active-language v4 validates against English full text', () => {
  run({ ...common, mode: 'talkinghead', segments: [{ id: 'intro', role: 'intro', text: '合成示例。', seconds: 10, shot: 'Placeholder' }] }, ({ result, output }) => {
    assert.equal(result.status, 0, result.stderr);
    const p = importCheck(output, true);
    p.talkingHead.activeLanguage = 'en';
    p.talkingHead.directorPlan.segments[0].script.en = 'Synthetic example.';
    p.talkingHead.script.english.content = p.talkingHead.teleprompterText = 'Synthetic example.';
    fs.writeFileSync(path.join(output, 'project.onetake.json'), JSON.stringify(p));
    importCheck(output, true);
  });
});
test('English authored plan uses English narration and Chinese paired captions', () => {
  run({ ...common, mode: 'talkinghead', language: 'en', segments: [{ id: 'one', role: 'Example', text: 'Start with one small question.', seconds: 12, shot: 'Presenter only.', chapterTitle: 'One question', promptNotes: 'Start small / one example', captions: { mode: 'key', lines: [{ text: 'Start with one question', emphasis: 'one question', translation: '先讲一个问题', translationEmphasis: '一个问题' }] } }] }, ({ result, output }) => {
    assert.equal(result.status, 0, result.stderr);
    const p = importCheck(output, true);
    assert.equal(p.talkingHead.activeLanguage, 'en');
    assert.equal(p.talkingHead.script.english.content, 'Start with one small question.');
    assert.equal(p.talkingHead.directorPlan.segments[0].script.en, 'Start with one small question.');
    assert(fs.readFileSync(path.join(output, '录制稿与分镜.md'), 'utf8').includes('先讲一个问题'));
  });
});
