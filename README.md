# 力量举全景数字教练

当前版本：`Alpha v0.2`

这是一个本地运行的静态 H5 Alpha 工具集，用于承载力量举训练与营养规划的核心流程，包括用户档案、单日计划、周训练安排、营养预算、补剂设置和单日作战图。

## 运行方式

项目不依赖 npm、React 或其他构建型前端框架，直接用本地静态 HTML 运行。

推荐在项目根目录执行：

```bash
python -m http.server 8000
```

然后在浏览器打开：

```text
http://127.0.0.1:8000/
```

## 三种使用方式

- `轻量单日计划`：只规划今天，快速生成今日作战图
- `周计划模式`：适合每周固定训练安排，生成一周营养预算和每日作战图
- `长期周期计划`：实验功能，用于规划 4 周 block 草稿

## 数据存储

项目当前通过浏览器 `localStorage` 保存运行数据，不依赖后端数据库。

已使用的稳定 key 包括：

- `userProfile`
- `powerliftingProfile`
- `carbBudgetPlan`
- `weeklyTrainingPlan`
- `module3_dayTypes`
- `supplementGenerator`
- `singleDayPlan`
- `appUsageMode`

## 构建发布包

用于生成试用发布包的命令：

```bash
python build_alpha_release.py --zip
```

构建后会生成：

- `alpha-release/`
- `alpha-release.zip`

## 项目结构

核心页面：

- `index.html`
- `单日计划_轻量模式.html`
- `模块一_用户档案.html`
- `模块二_碳水预算引擎.html`
- `模块三_每周训练安排.html`
- `补剂时序生成器.html`
- `模块四_单日仪表盘.html`
- `模块五_长期计划.html`

核心脚本与规则：

- `app_state.js`
- `daily_flow_engine.js`
- `app_ui.css`
- `macro_rule_engine.js`
- `macro_algorithm_rules.json`
- `supplement_rule_engine.js`
- `supplement_rules.json`

项目说明文档：

- `AGENTS.md`
- `DATA_CONTRACT.md`
- `RULE_TRACEABILITY.md`
- `PROJECT_STATE.md`
- `CHANGELOG_AI.md`
- `TASK.md`

## 免责声明

本项目仅用于训练营养规划参考，不构成医学诊断、治疗建议或个体化医疗意见。涉及 RED-S、补剂、微量元素和训练负荷的内容，不能替代医生、营养师或运动医学专家的判断。
