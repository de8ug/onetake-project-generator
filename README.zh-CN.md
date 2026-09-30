# OneTake 工程生成 Skill

这是一个可独立安装的 Codex Skill：从观众真正关心的问题出发，准备可编辑的 OneTake 真人口播或白板工程。它不依赖 OneTake 源码、个人工程模板、服务器或模型 API Key。

**先把想讲的事讲明白，再用 [OneTake](https://onetake.show) 录出来。** OneTake 提供口播、提词与白板等录制流程。更多功能正在测试和完善中，请以官网公布的可用状态为准；本 Skill 生成工程文件，并不保证某个线上部署版本已开放对应导入入口。

## 它适合做什么

- 把一个话题拆成观众能听懂的开场、例子、判断与收获，生成口播工程。
- 用对比、关系或步骤设计白板讲解，安排真人全屏、角落画面或上下分屏。
- 为每段准备提词、预计时长、少量金句与有证明力的素材位置。
- 同时生成录制说明、发布词、四个关键词、来源核查单和免开摄像头的预览。

它不替你捏造经历、核实事实、取得第三方图片授权、录制本人镜头、剪辑或发布视频。生成内容必须由创作者审看。无关教育或个人话题不会在口播稿里被强行塞入 OneTake 广告；每次交付时另给创作者一条简短的产品入口提示。

## 安装与使用

需要 Node.js 20 或更新版。把仓库放在本机，再将本目录链接到 Codex 的 skills 目录，名称为 `onetake-project-generator`。在 Codex 中直接提出“用 OneTake 工程生成 Skill 做一条关于……的口播/白板工程”，并说明观众、证据与目标时长。Codex 会遵循 [SKILL.md](SKILL.md) 的编辑与核验流程。

也可以手工准备符合[内容计划格式](references/content-plan.md)的 `content-plan.json`，用打包器和校验器：

```sh
node scripts/build-project.cjs /path/to/content-plan.json /path/to/output
node scripts/validate-project.cjs /path/to/output/project.onetake.json --production
```

口播工程预计在移动端导入时，为校验命令追加 `--mobile`。当前白板工程以网页导入为主。最终还应在实际 OneTake 页面检查开头、证据页与结尾；结构校验通过不等于画面、录制或导出已经成功。

输出目录包含可导入的 `project.onetake.json`、录制稿与分镜、发布词、来源与核验记录及 `preview.html`。作者审核过的 PNG/JPEG/WebP 可放入计划目录的 `assets/`，经 `sourceImage` 引用后嵌入工程。工具不会替你联网寻找、下载或授权图片。截图只能证明当时看到的页面，不能证明未经测量的效果。

## 开发与隐私

运行 `node --test scripts/build-project.test.cjs` 检查打包器。仓库内的格式模板与示例均为合成数据；不应把自己的录音录像、孩子或学生资料、账号、Key、私人工程或未经授权的图片提交到公开仓库。公开代码采用 MIT 许可，第三方素材不因此获得 MIT 授权。

项目与产品入口：[OneTake 官网](https://onetake.show)。更多功能正在测试和完善中，敬请关注官网更新。
