# DATA_CONTRACT

## 1. localStorage Keys

### userProfile / powerliftingProfile

主 key 为 `userProfile`。`powerliftingProfile` 作为兼容镜像 key 保留。

当前统一字段：

- `gender`
- `age`
- `height`
- `weight`
- `bodyFat`
- `squat1RM`
- `bench1RM`
- `deadlift1RM`
- `squat`
- `bench`
- `deadlift`
- `goal`
- `experience`
- `bloodMarkers`
- `micronutrientRisk`
- `micronutrientScreening`
- `redFlags`

说明：

- 模块一当前会同时写入 `userProfile` 和 `powerliftingProfile`
- 其他模块读取时优先 `userProfile`，回退到 `powerliftingProfile`
- `squat / bench / deadlift` 是旧字段，`squat1RM / bench1RM / deadlift1RM` 是标准别名

### carbBudgetPlan

模块二保存字段：

- `goal`
- `weeklyCalories`
- `weeklyCarbs`
- `weeklyProtein`
- `weeklyFat`
- `dailyPlan`
- `eaStatus`
- `redSRisk`
- `generatedAt`

当前同时保留的运行时字段：

- `bodyWeight`
- `rulesVersion`
- `ruleSource`
- `mappedGoalKey`
- `dayTypes`
- `macros`
- `carbTiming`
- `mealPlans`
- `tdee`
- `warnings`

### weeklyTrainingPlan

标准字段：

- `days[0..6]`
- `dayIndex`
- `lift`
- `sets`
- `reps`
- `weight`
- `percent1RM`
- `rpe`
- `inol`
- `type`

说明：

- `0 = 周一`，`6 = 周日`
- `days` 是长度 7 数组
- `byDayIndex` 是兼容旧模块读取保留的映射
- `percent` 为旧字段，`percent1RM` 为标准字段

### module3_dayTypes

这是模块三给模块二 / 模块四使用的轻量训练日类型映射。

标准：

- 数组长度 7
- `0 = 周一`
- `6 = 周日`
- `type` 可选值：`rest / light / medium / heavy`

兼容：

- 旧结构可能是对象映射 `{0:'rest', ...}`
- 模块二 / 模块四读取时必须兼容对象和数组两种结构

### supplementGenerator

补剂生成器保存字段：

- `selectedSupplements`
- `bodyWeightKg`
- `wakeUpTime`
- `workoutStartTime`
- `workoutDurationMinutes`
- `plannedSleepTime`
- `postRPE`
- `selectedGoal`
- `trainingType`

当前同时保留的旧字段：

- `bodyWeight`
- `wakeTime`
- `sleepTime`
- `workoutDuration`
- `customPercent`
- `percent1RM`
- `currentTarget`
- `workoutType`
- `squatMax`
- `benchMax`
- `deadliftMax`
- `weight`
- `sets`
- `reps`

## 2. Day Index Standard

全项目统一使用：

- `0 = 周一`
- `1 = 周二`
- `2 = 周三`
- `3 = 周四`
- `4 = 周五`
- `5 = 周六`
- `6 = 周日`

如果使用 `JS Date.getDay()`，必须通过转换函数：

```js
const mondayIndex = (date.getDay() + 6) % 7;
```

## 3. Goal Key Standard

统一目标 key：

- `bulk` = 增肌期
- `strength` = 力量期
- `cut` = 减脂期
- `recomp` = 体成分重组，暂时映射到 `strength / maintenance`
- `meet_prep` = 赛前准备，当前只提示高级模块未启用

## 4. Runtime Rule Files

- `supplement_rules.json` 是补剂规则源
- `supplement_rule_engine.js` 是补剂规则运行时
- `macro_algorithm_rules.json` 是宏量算法规则源
- `macro_rule_engine.js` 是宏量算法运行时桥接
- `docx` 只作为知识来源，不作为前端运行依赖

## 5. Compatibility Rules

- `userProfile` 是主 key，`powerliftingProfile` 是兼容 key
- `squat / bench / deadlift` 兼容到 `squat1RM / bench1RM / deadlift1RM`
- `percent` 兼容到 `percent1RM`
- `module3_dayTypes` 旧对象结构兼容到标准数组结构
- `bodyWeight / wakeTime / sleepTime / workoutDuration / currentTarget / workoutType` 兼容到 `bodyWeightKg / wakeUpTime / plannedSleepTime / workoutDurationMinutes / selectedGoal / trainingType`
- `meet`、`maintenance`、中文目标名都应转换到标准目标 key

## 6. Runtime API

### MacroRuleEngine

标准 API：

- `primeRules`
- `normalizeGoalKey`
- `buildMacroContext`
- `evaluateMacroPlan`

兼容别名：

- `getRulesSync`

### SupplementRuleEngine

标准 API：

- `primeRules`
- `buildSupplementContext`
- `evaluateRules`

`evaluateRules` 返回结构：

```js
{
  owned: [],
  optional: [],
  warnings: []
}
```
