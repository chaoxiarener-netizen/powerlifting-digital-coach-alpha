# 微信小程序迁移方案

## 1. 当前 H5 架构总结

当前项目是本地静态 H5 Alpha v0.2，不依赖 npm、React、Vue 或后端服务。运行方式为直接打开 HTML，或在项目根目录启动：

```bash
python -m http.server 8000
```

核心页面包括：

- `index.html`：总控台首页，包含三种模式入口和“下一步作战提示”
- `单日计划_轻量模式.html`：轻量单日计划入口，写入 `singleDayPlan`
- `模块一_用户档案.html`：用户档案
- `模块二_碳水预算引擎.html`：营养预算
- `模块三_每周训练安排.html`：本周训练安排
- `补剂时序生成器.html`：补剂清单与作息偏好
- `模块四_单日仪表盘.html`：今日作战图
- `模块五_长期计划.html`：长期计划草稿

核心运行时脚本包括：

- `app_state.js`：统一读取和归一化本地状态
- `daily_flow_engine.js`：统一生成首页下一步事件和模块四时间流事件
- `macro_rule_engine.js`：宏量营养规则运行时
- `supplement_rule_engine.js`：补剂规则运行时
- `macro_algorithm_rules.json`：宏量规则数据
- `supplement_rules.json`：补剂规则数据

当前数据流主要依赖浏览器 `localStorage`，各页面通过稳定 key 协作，不依赖后端数据库。

## 2. 小程序目标页面设计

建议小程序页面拆分如下：

- `pages/index/index`：总控台
- `pages/single-day/index`：轻量单日计划
- `pages/profile/index`：用户档案
- `pages/training-week/index`：本周训练
- `pages/macro-budget/index`：营养预算
- `pages/supplement/index`：补剂清单
- `pages/dashboard/index`：今日作战图
- `pages/long-term/index`：长期计划草稿

第一版不建议一次性迁移全部页面。更稳妥的路径是先迁移总控台、轻量单日计划和今日作战图，把状态读取、事件生成和本地存储链路跑通。

## 3. 数据存储替换方案

H5 当前使用：

```js
localStorage.getItem(key)
localStorage.setItem(key, value)
```

小程序中应替换为：

```js
wx.getStorageSync(key)
wx.setStorageSync(key, value)
```

建议保持 key 名称兼容，避免打断已有数据合同：

- `userProfile`
- `powerliftingProfile`
- `singleDayPlan`
- `weeklyTrainingPlan`
- `module3_dayTypes`
- `carbBudgetPlan`
- `supplementGenerator`
- `longTermPlanDraft`
- `appUsageMode`

迁移时可以新增一个小程序版状态适配层，例如 `miniprogram/utils/app_state_adapter.js`，让页面只调用统一 API，不直接散落 `wx.getStorageSync`。

## 4. 可复用逻辑

可优先迁移或改造复用：

- `daily_flow_engine.js`
- `macro_rule_engine.js`
- `supplement_rule_engine.js`
- `macro_algorithm_rules.json`
- `supplement_rules.json`

需要适配的部分：

- `app_state.js`：当前依赖 `localStorage` 和浏览器环境，需要替换为 `wx` storage 适配层
- HTML DOM 操作：小程序没有浏览器 DOM，需要改成 WXML 数据绑定
- 页面事件绑定：从 `onclick` / DOM listener 改为 WXML `bindtap` 等事件
- CSS：需要改写为 WXSS，避免使用小程序不支持的选择器或浏览器特性
- 页面跳转：从 `<a href>` 或 `location.href` 改为 `wx.navigateTo` / `wx.switchTab`

## 5. 不建议直接迁移的内容

以下内容不建议进入小程序运行时：

- 原始 `docx` 知识库
- `RULE_TRACEABILITY.md` 等开发追踪文档
- `alpha-release/`
- `alpha-release.zip`
- Netlify 部署逻辑
- `build_alpha_release.py`
- 本地审查截图、临时脚本、缓存文件

这些内容可以继续留在仓库的开发侧，但不应作为小程序包体或运行时依赖。

## 6. web-view 方案风险

`web-view` 可以快速把现有 H5 包进小程序，但不适合作为正式主方案。

主要风险：

- 需要在微信公众平台配置业务域名
- 域名通常需要 HTTPS，并可能涉及备案要求
- Netlify 免费域名不适合作为正式小程序业务域名
- 体验不如原生小程序，页面加载、导航、分享和小程序原生能力接入都会受限
- 后续审核、域名稳定性和用户信任感都弱于原生实现

结论：`web-view` 可以作为临时演示方案，但正式产品建议走原生小程序迁移。

## 7. 原生小程序分阶段方案

### Phase 1：总控台 + 今日作战图

目标：

- 迁移首页总控台
- 迁移今日作战图基础展示
- 接入 `daily_flow_engine.js`
- 使用 `wx.getStorageSync` / `wx.setStorageSync` 跑通本地状态

### Phase 2：轻量单日计划

目标：

- 迁移 `singleDayPlan` 表单
- 支持训练、作息、补剂选择
- 保存后跳转今日作战图

### Phase 3：周计划和营养预算

目标：

- 迁移本周训练安排
- 迁移营养预算生成
- 接入 `macro_rule_engine.js` 和 `macro_algorithm_rules.json`

### Phase 4：补剂页和长期计划

目标：

- 迁移补剂清单与作息偏好
- 接入 `supplement_rule_engine.js` 和 `supplement_rules.json`
- 迁移长期计划草稿页

## 8. MVP 小程序第一版范围

第一版建议只做：

- 首页总控台
- 轻量单日计划
- 今日作战图
- 本地存储
- 规则引擎复用

第一版暂不做：

- 完整长期计划算法
- 复杂文档知识库
- 账号系统
- 云端同步
- 支付
- 社区功能

## 9. 当前骨架说明

本轮只创建最小小程序骨架，用于验证目录结构、页面注册和基础视觉方向。

当前骨架包含：

- `miniprogram/app.json`
- `miniprogram/app.js`
- `miniprogram/app.wxss`
- `miniprogram/pages/index/index.wxml`
- `miniprogram/pages/index/index.wxss`
- `miniprogram/pages/index/index.js`

骨架不包含正式业务迁移，不改 H5 版本，不改核心算法，不写入任何 AppSecret、token 或密钥。
