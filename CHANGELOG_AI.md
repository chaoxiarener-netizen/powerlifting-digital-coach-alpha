# CHANGELOG_AI

## 2026-05-13 小程序 Phase 2.1 — 视觉重设计

### 本轮修改
- `miniprogram/app.wxss`
  - 重构为小程序设计系统：新增 `.card` / `.card-strong` / `.card-accent` 卡片体系。
  - 新增 `.section-title` / `.section-desc` 区块标题与说明。
  - 新增 `.badge` / `.badge-sm` 徽章组件和 `.tag-*` 六种事件类型配色标签。
  - 新增 `.btn-small` 按钮变体，`.btn-primary` 增加渐变 + 外层光晕。
  - 新增 `.type-*` / `.type-bg-*` 全局事件类型配色（training/supplement/sleep/warning/recovery/wake）。
  - 新增 `.op-muted` 透明度工具类，取代页面级 `.muted`。
  - 统一表单控件 `.input` / `.picker-value` 高度为 88rpx，圆角 16rpx。
  - 页面背景加入微渐变 `#0a0a0a → #0e0e0e`。
- `miniprogram/pages/index/index.wxml`
  - Hero 区域重构：新增 `.hero-eyebrow` 大标签"今日总控台"，去除旧 Phase 标识文案。
  - 作战卡结构优化：`.next-block` 增加绿色左边框 `border-left: 4rpx`，倒计时标签改为 `.next-countdown`。
  - 随后事件改为左侧灰色边栏卡片。
  - 空状态新增 ".done-badge" 绿色已完成标记。
  - 页面底部新增 `.footer-note` 版权说明"本地数据 · 仅供训练规划参考"。
- `miniprogram/pages/index/index.wxss`
  - 时间显示从 72rpx 加大至 80rpx，使用 `font-variant-numeric: tabular-nums` 等宽数字。
  - 作战卡 `border-radius` 升级至 24rpx，背景加深至 `#181818`。
  - 入口卡圆角统一为 20rpx，按压缩放 `scale(0.98)`。
- `miniprogram/pages/single-day/index.wxml`
  - 表单区块增加 `.section-desc` 说明文案（如"设置今天的训练类型和强度"）。
  - 训练相关字段使用 `.field-group` 包裹，休息日添加 `.field-dimmed` 整体半透明淡化。
  - checkbox 区域增加 `.checkbox-info` 容器优化图文布局。
- `miniprogram/pages/single-day/index.wxss`
  - 移除页面内 `.muted`（迁移至 app.wxss 全局 `.op-muted`）。
  - 新增 `.field-group` / `.field-dimmed` 实现休息日字段组整体淡化。
  - 表单间距和圆角与设计系统对齐。
- `miniprogram/pages/dashboard/index.wxml`
  - Summary 卡改用 `.card-accent` 组件类。
  - 时间轴标签使用共享 `.type-tag {{item.type}}` 类名。
  - Tags 改用共享 `.tag-{{item.type}}` 配色标签。
- `miniprogram/pages/dashboard/index.wxss`
  - 时间轴圆点加大至 22rpx，增加 3rpx 外环边框和发光 `box-shadow`。
  - 时间轴条目间增加底部分割线 `.timeline-item:last-child` 无分割线。
  - Summary 图标区使用共享 `.type-bg-*` 配色类。
  - 删除页面内重复的 `.tag` 和 `.type-*` 定义（已迁移至 app.wxss 共享）。

### 保持不变
- 未迁移完整 H5。
- 未修改 H5 页面业务逻辑。
- 未改 H5 现有 localStorage key。
- 未修改核心算法和规则引擎。
- 未读取全部 docx。
- 未写入 AppSecret、token 或密钥。

## 2026-05-13 微信小程序 Phase 1 — 真机预览验收通过

### 手动验收（真机预览）
- 真机可打开小程序首页，显示正常。
- 可进入轻量单日计划，填写并保存 `singleDayPlan`。
- 今日作战图可读取 `singleDayPlan`，显示训练来源：轻量单日计划。
- 跨天睡眠显示为 `次日 00:30`，未排在时间轴第一项。
- 晚间 caffeine 进入 warning，未进入正常补剂时间流。
- 真机页面无明显错位。
- H5 Alpha v0.2 未受影响。

### 保持不变
- 未迁移完整 H5。
- 未修改 H5 页面业务逻辑。
- 未改 H5 现有 localStorage key。
- 未修改 `macro_rule_engine.js / supplement_rule_engine.js`。
- 未读取全部 docx。
- 未写入 AppSecret、token 或密钥。

## 2026-05-13 微信小程序 Phase 1 — 微信开发者工具手动验收通过

### 手动验收（微信开发者工具模拟器）
- 首页可正常打开，显示阶段标题和入口。
- 轻量单日计划页面可正常创建：
  - 填写 `21:00` 训练、`90` 分钟、`00:30` 入睡、RPE `8`，勾选 `caffeine / creatine / magnesium`。
  - 保存后 `singleDayPlan` 写入 wx storage，`appUsageMode` 设为 `single_day`。
  - 自动跳转至今日作战图。
- 今日作战图可读取 `singleDayPlan`：
  - 显示训练来源：轻量单日计划。
  - 跨天睡眠显示为 `次日 00:30`。
  - `00:30` 未排在时间轴第一项。
  - 晚间 caffeine 进入 warning，未进入正常补剂时间流。
- H5 Alpha v0.2 未受影响。

### 保持不变
- 未迁移完整 H5。
- 未修改 H5 页面业务逻辑。
- 未改 H5 现有 localStorage key。
- 未修改 `macro_rule_engine.js / supplement_rule_engine.js`。
- 未读取全部 docx。
- 未写入 AppSecret、token 或密钥。

## 2026-05-13 微信小程序 Phase 1 最小闭环

### 本轮修改
- `miniprogram/app.json`
  - 注册 `pages/index/index`、`pages/single-day/index`、`pages/dashboard/index` 三个页面。
- `miniprogram/utils/storage.js`
  - 新增 wx storage 适配层，暴露 `getStorage / setStorage / removeStorage / clearAppStorage / getSingleDayPlan / saveSingleDayPlan / getAppUsageMode / setAppUsageMode`。
  - 本轮只读写 `appUsageMode` 与 `singleDayPlan`，保持 key 名称兼容。
- `miniprogram/utils/daily_flow_engine.js`
  - 新增小程序版纯函数事件生成器，去掉 `window` 依赖，使用 CommonJS 导出。
  - 支持起床、训练、训练结束/恢复、简化补剂、睡前恢复、睡眠和晚间咖啡因 warning。
  - 支持 `00:30` 跨天显示为 `次日 00:30`，并用 `absoluteMinute` 排序。
- `miniprogram/pages/index/*`
  - 总控台显示当前时间、下一步作战提示、轻量单日计划入口、今日作战图入口和清空本地数据入口。
- `miniprogram/pages/single-day/*`
  - 新增轻量单日计划表单，支持是否训练、训练类型、主项、训练时间、训练时长、起床时间、计划入睡、RPE、`caffeine / creatine / magnesium` 补剂选择。
  - 保存后写入 `singleDayPlan`，设置 `appUsageMode = single_day`，并跳转今日作战图。
- `miniprogram/pages/dashboard/*`
  - 新增今日作战图页面，读取 `singleDayPlan`，展示今日摘要、时间流和“训练来源：轻量单日计划”。
  - 无 `singleDayPlan` 时显示空状态和“去创建”按钮。

### 本地校验
- `miniprogram/app.json` JSON 解析通过。
- 小程序 JS 文件语法检查通过。
- 使用 Node 直接校验小程序版 `daily_flow_engine`：
  - `21:00` 训练、`90` 分钟、`00:30` 入睡时，睡眠事件 `absoluteMinute = 1470`
  - 时间显示为 `次日 00:30`
  - `00:30` 未排在时间流第一项
  - 晚间 `caffeine` 进入 warning，不进入正常补剂事件

### 保持不变
- 未迁移全部 H5。
- 未修改 H5 页面业务逻辑。
- 未改 H5 现有 localStorage key。
- 未修改 `macro_rule_engine.js / supplement_rule_engine.js`。
- 未读取全部 docx。
- 未写入 AppSecret、token 或密钥。

## 2026-05-13 微信小程序迁移评估与骨架

### 本轮修改
- 新增 `MINIPROGRAM_MIGRATION_PLAN.md`
  - 总结当前 H5 Alpha v0.2 架构。
  - 规划小程序目标页面结构。
  - 明确 `localStorage` 到 `wx.getStorageSync / wx.setStorageSync` 的替换方案。
  - 列出可复用逻辑、需要适配的模块、不建议直接迁移的内容。
  - 说明 `web-view` 方案风险。
  - 给出原生小程序 Phase 1 到 Phase 4 的迁移路径。
  - 明确 MVP 小程序第一版范围。
- 新增 `miniprogram/` 最小骨架：
  - `app.json`
  - `app.js`
  - `app.wxss`
  - `pages/index/index.wxml`
  - `pages/index/index.wxss`
  - `pages/index/index.js`
- 首页骨架显示：
  - `力量举全景数字教练`
  - `Alpha 小程序迁移验证版`
  - `轻量单日计划 / 周计划模式 / 今日作战图` 三个入口占位

### 保持不变
- 未正式迁移全部 H5 页面。
- 未删除 H5 版本。
- 未改核心算法。
- 未改现有 localStorage key。
- 未读取全部 docx。
- 未写入 AppSecret、token 或密钥。

### 下一步建议
- 基于 `MINIPROGRAM_MIGRATION_PLAN.md` 决定是否启动小程序 Phase 1：总控台 + 单日计划 + 今日作战图。

## 2026-05-13 daily_flow_engine 收口版 Alpha 线上验收

### 线上链接
- `https://charming-baklava-9ecd7b.netlify.app/`

### 线上验收结果
- 静态资源检查通过：
  - `index.html` 200
  - `daily_flow_engine.js` 200
  - `app_state.js` 200
  - `app_ui.css` 200
  - `supplement_rules.json` 200
  - `macro_algorithm_rules.json` 200
- 首页“现在该做什么？”卡片线上可用：
  - 无数据状态显示“还没有今日作战提示”
  - 保留“30 秒快速体验”和“开始单日计划”入口
  - `DailyFlowEngine` 与 `AppState` 在线上均成功挂载
- `weekly` 模式验收通过：
  - 点击 `30 秒快速体验` 后进入 weekly 数据状态
  - 首页下一步事件正常生成
  - 模块四显示“本周训练计划”
  - 首页下一步事件标题可在模块四时间流中对应找到
- `single_day` 模式验收通过：
  - 写入 `singleDayPlan` 后，首页和模块四均读取公共事件生成结果
  - `21:00` 训练事件正常进入时间流
  - `00:30` 入睡显示为 `次日 00:30`
  - `次日 00:30` 未排在时间轴第一项
  - mock `23:40` 时，下一步正确指向 `次日 00:30 计划入睡`，倒计时约 50 分钟
  - 晚间咖啡因阻断仍然生效
- 控制台与网络检查通过：
  - 未发现 `SyntaxError`
  - 未发现 `ReferenceError`
  - 未发现缺文件 404

### 结论
- 首页下一步作战提示和模块四今日作战图已经共用 `daily_flow_engine.js` 的事件数组。
- 跨天时间、`single_day / weekly` 模式、晚间咖啡因阻断在线上均表现正常。
- 下一轮建议进入产品优先级判断：继续体验打磨，或恢复长期计划功能开发。

## 2026-05-13 daily_flow_engine 收口版 Alpha

### 本轮修改
- `daily_flow_engine.js`
  - 新增公共事件生成器，统一暴露：
    - `parseTimeToMinutes`
    - `formatMinutesToClock`
    - `normalizeEventMinute`
    - `normalizeSleepMinute`
    - `formatOperationalTime`
    - `buildDailyFlowEvents`
    - `getNextActionFromEvents`
  - 统一了起床、餐次、训练、补剂、风险提醒、睡前恢复、跨天入睡等事件结构。
  - 事件统一使用 `absoluteMinute` 排序，`displayTime` 展示，并保留 `priority / source / tags / detail`。
- `app_state.js`
  - `getTodayNextAction()` 改为优先走 `daily_flow_engine.js`，保留兼容兜底。
- `index.html`
  - 首页“现在该做什么？”不再自己推导下一步事件，改为：
    - 读取 `AppState.getTodayDashboardContext()`
    - 调用 `DailyFlowEngine.buildDailyFlowEvents(context)`
    - 调用 `DailyFlowEngine.getNextActionFromEvents(events, now)`
  - 首页新增加载 `daily_flow_engine.js` 与 `supplement_rule_engine.js`。
- `模块四_单日仪表盘.html`
  - 模块四时间流不再维护独立事件数组逻辑，改为从 `DailyFlowEngine.buildDailyFlowEvents(context)` 读取完整事件，再按现有减负版结构渲染。
  - 今日摘要、折叠详情、缺数据引导和补剂详情结构保持不变。
- `build_alpha_release.py`
  - 发布包新增纳入 `daily_flow_engine.js`。

### 本地验收
- 首页：
  - `localStorage.clear()` 后，首页恢复“还没有今日作战提示”状态。
  - `30 秒快速体验` 后，首页正常显示下一步与随后一步。
- 模块四：
  - `30 秒快速体验` 后，模块四摘要、时间流、折叠详情均正常。
- `single_day` 跨天：
  - `21:00` 训练、`90` 分钟、`00:30` 入睡、勾选 `caffeine / creatine / magnesium`
  - 首页下一步和模块四时间流都来自同一个 `DailyFlowEngine`
  - `次日 00:30` 不会排在第一项
  - 晚间咖啡因仍然被阻断，不进入正常补剂时间流
- `weekly` 模式：
  - 首页下一步与模块四时间流不冲突
  - 模块四仍显示“训练来源：本周训练计划”
- 资源与控制台：
  - `daily_flow_engine.js` 本地返回 `200`
  - 未发现 `SyntaxError` / `ReferenceError`

### 保持不变
- 未改核心算法
- 未改 localStorage key
- 未改补剂规则引擎
- 未改宏量规则引擎
- 未改首页当前作战卡主视觉
- 未改模块四减负版结构

## 2026-05-13 模块四减负版 Alpha

### 本轮修改
- `模块四_单日仪表盘.html`
  - 强化「今日摘要」卡的视觉权重，让首屏更像摘要而不是详情页。
  - 单日时间流默认只保留关键节点、简短说明和少量标签，把来源、剂量、解释后置到条目详情。
  - `训练详情 / 营养详情 / 补剂详情` 继续保持默认收起，并补上无营养预算时的跳转按钮。
  - 风险提示改成摘要只显示最重要的一条，其余 warning 继续留在补剂详情中。
- `build_alpha_release.py`
  - 同步发布说明，标注模块四默认采用「今日摘要 + 关键时间流 + 折叠详情」结构。

### 本地验收
- `single_day` 模式：
  - `21:00` 训练、`00:30` 入睡、勾选 `caffeine / creatine / magnesium`
  - 今日摘要正常显示
  - 训练来源显示「轻量单日计划」
  - 关键提醒显示「晚间咖啡因已阻断」
  - 时间流正常显示 `21:00` 训练与 `次日 00:30` 入睡
  - 咖啡因未进入正常补剂时间流
  - 三个详情区默认收起，展开后可查看完整信息
- `weekly` 模式：
  - `30 秒快速体验` 进入模块四后，摘要显示「本周训练计划」
  - 宏量摘要、补剂摘要和时间流均正常
- 缺数据状态：
  - `localStorage.clear()` 后打开模块四不白屏
  - 缺数据引导和下一步按钮正常显示
- 视口与控制台：
  - `390 × 844` 无横向溢出，首屏能完整看到摘要
  - `1280 × 800` 保持 520px 窄列居中
  - 未发现 `SyntaxError` / `ReferenceError` / 阻断型 `TypeError`

### 保持不变
- 未改核心算法
- 未改 localStorage key
- 未改补剂规则引擎
- 未改宏量规则引擎
- 未改首页“现在该做什么？”卡片

## 2026-05-09 首页“下一步作战提示”版 Alpha 线上验收

### 线上验收
- 线上地址：`https://elegant-naiad-ff3cb2.netlify.app/`
- 静态资源检查通过：
  - `index.html` 200
  - `app_state.js` 200
  - `app_ui.css` 200
  - `单日计划_轻量模式.html` 200
  - `模块四_单日仪表盘.html` 200
- 首页大卡片检查通过：
  - 正常显示“现在该做什么？”
  - 当前时间正常显示
  - 无数据状态显示“还没有今日作战提示”
  - 无数据状态按钮 `30 秒快速体验 / 开始单日计划` 正常
- 示例用户链路通过：
  - 点击 `30 秒快速体验` 后返回首页，能显示下一步事件和随后事件
  - “查看完整今日作战图”按钮可进入模块四
- 单日跨天链路通过：
  - `21:00` 训练、`00:30` 入睡后，首页下一步逻辑正常
  - mock `23:40` 时，下一步正确显示“次日 00:30 计划入睡”，倒计时 50 分钟
- 模块四链路通过：
  - 模块四仍可正常显示时间流
  - 训练来源、跨天时间、补剂阻断逻辑未被首页改动破坏
- 补剂页检查通过：
  - 页面标题仍为“补剂清单与作息偏好”
- 浏览器检查通过：
  - 移动端首页卡片无横向溢出
  - 控制台未发现 `SyntaxError`
  - 控制台未发现 `ReferenceError`
  - Network 未发现缺文件 404

### 复测记录
- 本轮已完成线上自动化验收和主链路复测。
- 本轮尚未获得新的真实试用者主观反馈，因此以下主观判断暂记为“待试用者确认”：
  - 首页是否更抓眼
  - “下一步该做什么”是否足够有用
  - 倒计时是否足够清楚
  - 无数据状态是否更容易理解
  - 是否比之前更像一个产品
  - 是否仍然觉得首页信息多
- 基于本轮线上观察的初步结论：
  - 首页行动感明显增强
  - 首页比之前更像产品总控台
  - 首页与模块四之间仍存在轻量事件摘要 vs 完整时间流的展示层差异
  - 下一轮更适合优先判断是否要统一首页与模块四事件生成逻辑

## 2026-05-09 首页“下一步作战提示”版 Alpha

### 本轮修改
- `app_state.js`
  - 新增 `getTodayNextAction(now)`，统一输出首页所需的：
    - 当前时间
    - 当前作战阶段
    - 下一步事件
    - 下一步倒计时
    - 随后一条事件
  - 沿用已修好的作战日时间逻辑，支持跨天事件显示为“次日 00:30”。
  - 优先兼容三种模式下的训练、宏量、补剂读取，不改旧 key。
- `index.html`
  - 首页首屏新增大卡片“现在该做什么？”。
  - 无数据时显示“30 秒快速体验 / 开始单日计划”双入口。
  - 有数据时显示下一步、随后一步和倒计时，并提供“查看完整今日作战图”按钮。
  - 当前时间和倒计时改为页面加载即渲染，并每 30 秒自动刷新一次。
- `build_alpha_release.py`
  - 发布说明同步标注首页已包含“下一步作战提示”卡片。

### 本地验收
- 无数据：
  - `localStorage.clear()` 后打开首页
  - 当前时间正常显示
  - 显示“还没有今日作战提示”
  - `30 秒快速体验 / 开始单日计划` 按钮正常
- 示例用户：
  - 点击 `30 秒快速体验` 后回到首页
  - 首页正常显示当前时间、下一步事件和随后事件
  - “查看完整今日作战图”按钮可进入模块四
- 单日跨天：
  - 保存 `21:00` 训练、`90` 分钟、`00:30` 入睡的单日计划后回到首页
  - 首页顺序正常，不会把 `00:30` 当成当日最早事件
  - mock `23:40` 时，首页下一步会显示“次日 00:30 计划入睡”，倒计时 50 分钟
- 移动端：
  - `390 x 844` 下大卡片无横向溢出
  - 当前时间、下一步和按钮清晰可读
- 桌面端：
  - `1280 x 800` 下保持窄列居中
  - 首页卡片视觉稳定，无控制台错误
- 构建：
  - `py -3 build_alpha_release.py --zip` 成功
  - `alpha-release/index.html` 已包含新卡片

### 保持不变
- 未改核心算法
- 未改 localStorage key
- 未重写模块四
- 未改补剂规则引擎
- 未改宏量规则引擎

## 2026-05-08 模块四减负版 Alpha

### 本轮修改
- `模块四_单日仪表盘.html`
  - 顶部新增“今日摘要”卡，首屏只保留训练、营养、补剂、关键提醒 4 个核心摘要。
  - 将原来的“选择日期 + 当日信息”重组进摘要区，减少首屏重复面板。
  - 单日时间流改为“默认简洁 + 条目内展开详情”结构，保留跨天时间显示与训练来源标签。
  - 新增 3 个默认收起的详情区：
    - 训练详情
    - 营养详情
    - 补剂详情
  - 风险提示改为分级展示：高优先级提醒进入摘要，其余 warning 收纳到补剂详情。
  - 移除旧的底部固定导航，仅保留统一全局导航，减少视觉噪音。
- `build_alpha_release.py`
  - 同步本轮模块四减负版发布说明，保持发布包继续纳入最新模块四页面。

### 本地验收
- `single_day` 模式：
  - 训练 `21:00`
  - 入睡 `00:30`
  - 勾选 `caffeine / creatine / magnesium`
  - 结果：
    - 今日摘要正常显示
    - 训练来源显示为“轻量单日计划”
    - 关键提醒显示“晚间咖啡因已阻断”
    - 时间流正确显示“次日 00:30”
    - 训练 / 营养 / 补剂详情默认收起
    - 展开训练详情后可看到重量、RPE、训练来源等信息
- `weekly` 模式：
  - 使用“30 秒快速体验”进入模块四
  - 摘要显示“本周训练计划”
  - 时间流、宏量和补剂摘要正常
- 缺数据状态：
  - `localStorage.clear()` 后打开模块四不白屏
  - 数据不足引导和下一步按钮正常显示
- 视口验收：
  - `390 x 844`：首屏不拥挤、无横向溢出、折叠详情可点击
  - `1280 x 800`：容器保持 520px 窄列居中，不会拉满全屏
- 控制台：
  - 未发现 `SyntaxError`
  - 未发现 `ReferenceError`
  - 未发现阻断型 `TypeError`
- 构建：
  - `py -3 build_alpha_release.py --zip` 成功
  - `alpha-release/模块四_单日仪表盘.html` 已包含今日摘要结构

### 保持不变
- 未改核心算法
- 未改 localStorage key
- 未改补剂规则引擎
- 未改宏量规则引擎

## 2026-05-08 UI 收口版 Alpha 线上验收与复测记录

### 线上验收
- 线上地址：`https://charming-baklava-9ecd7b.netlify.app/`
- 静态资源检查通过：
  - `index.html` 200
  - `app_ui.css` 200
  - `app_state.js` 200
  - `supplement_rules.json` 200
  - `macro_algorithm_rules.json` 200
  - `单日计划_轻量模式.html` 200
  - 模块一到模块五页面均返回 200
- 线上页面自动化审查结果：
  - 移动端 `390 × 844` 与桌面端 `1280 × 800` 均无横向溢出
  - 首页首屏布局正常
  - 三种模式卡片在桌面端高度一致，移动端在内容差异下仍保持同一视觉风格
  - 全局导航在首页、单日页、模块一到模块五保持一致，移动端未挤成多行
  - 补剂页主按钮与预览按钮高度一致
  - 模块五 4 周卡片维持 2x2 对齐
  - 控制台未发现 `SyntaxError`
  - 控制台未发现 `ReferenceError`
  - Network 未发现缺文件 404
- 线上功能链路检查通过：
  - `30 秒快速体验` 可用
  - `localStorage.clear()` 可用
  - 单日计划页可保存并跳转模块四
  - 模块四显示 `训练来源：轻量单日计划`
  - `21:00` 训练与 `次日 00:30` 入睡显示正确

### 试用者复测反馈记录
- 页面整体比之前更统一，终于更像同一套产品，而不是多个工具页面拼在一起。
- 没有再看到明显错位，导航、按钮和卡片边距比之前稳定很多。
- 移动端拥挤感明显下降，导航没有再挤成多行。
- 首页现在更像总控台，用户第一眼更容易理解该从哪种模式进入。
- 单日计划页足够轻量，已经不像复杂训练表单。
- 今日作战图比之前清晰，训练来源和时间流更容易理解。
- 仍然存在的信息压力主要集中在模块四，时间流内容多时还是会觉得“信息量偏大”。
- 下一轮不建议立刻恢复长期计划功能开发，优先继续减负模块四信息密度更稳妥。

## 2026-05-08 UI 收口版 Alpha

### 本轮修改
- 新增并落地 `app_ui.css` 统一覆盖层，统一了：
  - 黑色工业面板配色变量
  - 容器宽度与底部留白
  - 卡片圆角、边框、阴影和间距
  - 标题层级、标签、状态 pill
  - 按钮高度、按钮组和表单输入样式
  - 全局导航的圆角胶囊风格、当前页高亮和横向滚动行为
- `index.html`
  - 首页接入统一全局导航
  - 首屏标题、说明、模式卡片和按钮间距统一
  - 三种模式卡片统一高度，更像总控台而不是散列入口
- `单日计划_轻量模式.html`
  - 接入统一导航，补上“长期”入口
  - 顶部信息、表单和操作区的节奏统一
  - 保持单日页轻量感，不改业务逻辑
- `模块一_用户档案.html`
  - 接入统一导航顺序：总控台 / 单日 / 档案 / 训练 / 营养 / 补剂 / 作战图 / 长期
  - 表单、步骤面板和底部按钮统一到公共样式
- `模块二_碳水预算引擎.html`
  - 接入统一导航
  - 预算卡、餐次结构、说明层和底部按钮的样式收口
- `模块三_每周训练安排.html`
  - 接入统一导航
  - 首屏编辑区、周选择条、总览卡片和按钮区统一
- `补剂时序生成器.html`
  - 接入统一导航
  - 主按钮区改成统一按钮组，补剂页不再出现高低不齐的双按钮
  - 自动回填摘要、补剂清单和高级覆盖折叠区的密度收口
- `模块四_单日仪表盘.html`
  - 接入统一导航
  - 时间流、当日信息、风险提示和数据不足引导按钮统一样式
- `模块五_长期计划.html`
  - 接入统一导航并补上“长期”当前态高亮
  - 4 周卡片和操作按钮文案收短，移动端按钮高度恢复一致
- `build_alpha_release.py`
  - 继续纳入 `app_ui.css`
  - 发布包会同步本轮所有 UI 收口改动

### 本地验收
- 使用 localhost 对 `index.html`、`单日计划_轻量模式.html`、模块一到模块五做了两轮 UI 审查
- 验收视口：
  - 移动端 `390 × 844`
  - 桌面端 `1280 × 800`
- 结果：
  - 页面无明显左右错位
  - 所有页面无横向溢出
  - 全局导航顺序与当前态统一
  - 单日页按钮高度统一，轻量入口感更明确
  - 补剂页主按钮与预览按钮高度已统一
  - 长期页三枚主按钮高度已统一
  - 模块五 4 周卡片维持 2x2 对齐
  - 控制台未发现 `SyntaxError`
  - 控制台未发现 `ReferenceError`
- 核心功能冒烟通过：
  - `30 秒快速体验`
  - `localStorage.clear()`
  - 单日计划保存并进入模块四
  - 补剂保存跳转模块四
  - 模块三保存训练周
  - 模块二生成/保存预算

### 保持不变
- 未改核心算法
- 未改旧 `localStorage key`
- 未重写补剂规则引擎
- 未开发长期计划算法

## 2026-05-08 轻量单日计划版 Alpha

### 本轮修改
- `单日计划_轻量模式.html`
  - 新增独立单日入口，用于快速填写今天的训练、作息和补剂清单。
  - 保存为 `singleDayPlan`，并在保存后切换 `appUsageMode = single_day`。
  - 默认读取用户档案体重与 `supplementGenerator.selectedSupplements`，但不回写补剂页配置。
- `app_state.js`
  - 新增 `getSingleDayPlan()`。
  - `single_day` 模式下训练来源优先级调整为：
    1. `singleDayPlan`
    2. `supplementGenerator` 单日覆盖
    3. `weeklyTrainingPlan`
  - `getTodayDashboardContext()` 补充 `singleDayPlan`。
- `index.html`
  - 轻量单日计划入口改为跳转 `单日计划_轻量模式.html`。
  - 清空本地数据时同步清除 `singleDayPlan`。
  - 快速体验继续保持 weekly 链路，不受单日模式影响。
- `模块四_单日仪表盘.html`
  - 新增训练来源标签：`轻量单日计划`。
  - `single_day` 模式下优先使用 `singleDayPlan` 的训练、作息与补剂选择。
  - 跨天时间轴继续沿用 operational minute 逻辑，保证 `次日 00:30` 排在夜间收口之后。
- `build_alpha_release.py`
  - 发布包新增 `单日计划_轻量模式.html`。
  - 发布说明同步改为三种模式，其中单日模式直接指向轻量单日计划页面。

### 本地验收
- 首页点击“开始单日计划”后，会写入 `appUsageMode = single_day` 并进入 `单日计划_轻量模式.html`。
- 单日页面填写 `heavy / squat / 21:00 / 90 / 00:30`，勾选 `caffeine / creatine / magnesium` 后：
  - `singleDayPlan` 成功写入 localStorage
  - 页面跳转到 `模块四_单日仪表盘.html`
  - 仪表盘显示 `训练来源：轻量单日计划`
  - 时间轴显示 `21:00` 训练开始、`次日 00:30` 计划入睡
  - 晚间咖啡因触发阻断提醒，未被排进正常补剂时间线
- 切回 `weekly` 模式后，模块四仍优先读取 `weeklyTrainingPlan`，不受 `singleDayPlan` 干扰。
- `python build_alpha_release.py --zip` 构建成功，发布包已包含新页面。

### 保持不变
- 未改旧 localStorage key
- 未重写补剂规则引擎
- 未重写宏量算法
- 未开发复杂长期计划算法

## 2026-05-08 线上部署验收与复测记录

### 线上验收
- 线上地址：`https://charming-baklava-9ecd7b.netlify.app/`
- 首页可正常打开，并显示三种模式入口：
  - 轻量单日计划
  - 周计划模式
  - 长期周期计划
- `单日计划_轻量模式.html` 线上可打开并返回 200。
- 轻量单日计划填写 `heavy / squat / 21:00 / 90 / 00:30`，勾选 `caffeine / creatine / magnesium` 后：
  - `singleDayPlan` 成功写入 localStorage
  - 成功跳转 `模块四_单日仪表盘.html`
  - 模块四显示 `训练来源：轻量单日计划`
  - 时间轴正确显示 `21:00` 训练与 `次日 00:30` 入睡
  - 晚间咖啡因阻断仍生效
- `30 秒快速体验` 线上可用，且切回 weekly 后模块四仍显示 `训练来源：本周训练计划`，未受 `singleDayPlan` 干扰。
- 补剂页仍保持 `补剂清单与作息偏好` 定位。
- 模块五长期计划入口仍可进入。
- 线上资源检查通过：
  - `app_state.js` 200
  - `supplement_rules.json` 200
  - `macro_algorithm_rules.json` 200
  - `单日计划_轻量模式.html` 200
- 浏览器自动化验收中未发现：
  - `SyntaxError`
  - `ReferenceError`
  - 404 缺文件

### 试用者复测反馈记录
- 三种模式现在是清楚的，首页第一眼能够理解“单日 / 周计划 / 长期计划”的区别。
- 轻量单日计划比之前顺很多，不再需要先理解补剂页里的高级覆盖。
- 补剂页不再像重复训练录入页，当前定位基本清楚。
- 模块四里的“训练来源”提示是清楚的，用户能知道当前结果来自哪里。
- 整体复杂度下降了，但页面之间视觉风格和对齐还不够统一，产品感仍有提升空间。
- 下一步优先做 UI 收口，比继续扩长期计划功能更合适。
