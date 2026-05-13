# AGENTS

## 项目目标

本项目是“力量举全景数字教练”本地 H5 MVP，用于承载用户档案、碳水预算、每周训练安排、单日仪表盘、补剂时序等能力。目标是以最小工程复杂度完成可直接运行、可持续收口、可逐步迭代的浏览器端工具集。

## 当前运行方式

- 当前项目不是 npm 项目。
- 当前项目不是 React、Vue 或其他构建型前端工程。
- 运行方式为直接在本地浏览器打开 HTML 文件。
- 修改时优先保持“单文件页面 + 本地脚本 + 本地 JSON 规则”的现状稳定。

## 核心页面列表

- `模块一_用户档案.html`
- `模块二_碳水预算引擎.html`
- `模块三_每周训练安排.html`
- `模块四_单日仪表盘.html`
- `补剂时序生成器.html`

## 核心规则文件列表

- `supplement_rule_engine.js`
- `supplement_rules.json`
- `macro_algorithm_rules.json`

## localStorage 数据流

以下 key 视为稳定接口，不要随意改名：

- `userProfile`
- `powerliftingProfile`
- `carbBudgetPlan`
- `weeklyTrainingPlan`
- `module3_dayTypes`
- `supplementGenerator`

数据流协作规则：

- 模块一相关变更要优先兼容 `userProfile`、`powerliftingProfile`
- 模块二相关变更要优先兼容 `carbBudgetPlan`
- 模块三相关变更要优先兼容 `weeklyTrainingPlan`、`module3_dayTypes`
- 补剂页相关变更要优先兼容 `supplementGenerator`
- 模块四作为汇总页时，默认允许读取 `carbBudgetPlan`、`weeklyTrainingPlan`、`supplementGenerator`
- 除非任务明确要求，否则不重命名、不迁移、不批量清空这些 key

## 禁止事项

- 不要读取全部 `docx`
- 不要修改 HTML / JS / JSON 业务文件，除非当前任务明确要求
- 不要重写项目
- 不要引入 npm、React、Vue 或构建工具
- 不要把 JSON 规则硬编码回 HTML
- 不要为了“整理结构”而批量改名、拆页、合并页
- 不要把知识库来源文件当成前端运行时依赖
- 不要启用赛前极限脱水协议

知识库来源文件仅作为知识来源，不是前端运行依赖：

- `pkdb_1.docx` 到 `pkdb_7.docx`
- `macro_algorithm_database_source.docx`
- `力量举营养宏量算法数据库_修复版.docx`

## 每轮完成标准

- 本轮目标在 `TASK.md` 中有明确记录
- 只读取完成任务所需的最小文件集合
- 未经明确需求，不改业务功能和主视觉
- 若有代码改动，需保证直接打开 HTML 的运行方式仍成立
- 若有规则接入改动，需优先验证脚本引用、JSON 路径、localStorage 读取链路
- 本轮结束后更新 `CHANGELOG_AI.md`
