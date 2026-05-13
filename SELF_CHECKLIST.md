# SELF_CHECKLIST

## 基础加载

- 打开五个 HTML 页面
- 检查控制台无 `SyntaxError`
- 检查控制台无 `ReferenceError`

## 模块一

- 保存用户档案
- 确认 `userProfile / powerliftingProfile` 写入 `localStorage`

## 模块二

- 读取用户档案
- 选择 `bulk / strength / cut`
- 生成 `carbBudgetPlan`
- 检查 EA / RED-S 提示
- 检查底部导航

## 模块三

- 设置一周训练计划
- 保存 `weeklyTrainingPlan`
- 保存 `module3_dayTypes`
- 检查周一索引为 `0`

## 模块四

- 读取 `carbBudgetPlan`
- 读取 `weeklyTrainingPlan`
- 读取 `supplementGenerator`
- 检查单日训练、宏量、补剂都能显示
- 检查没有重复 `getDayContext`

## 补剂时序生成器

- 勾选补剂
- 生成时间轴
- 刷新后状态保留
- 晚间训练咖啡因阻断生效

## 规则文件

- `supplement_rules.json` 加载成功或 fallback 生效
- `macro_algorithm_rules.json` 加载成功或 fallback 生效
