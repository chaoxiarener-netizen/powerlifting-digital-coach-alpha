# RULE_TRACEABILITY

> 宏量营养规则 + 补剂规则的全量追溯：每个规则的来源文档、启用状态、消费者页面。

---

## 1. 规则管线总览

```
docx 源文件 → JSON 规则文件 → Rule Engine (JS 运行时桥接) → 消费页面
```

两条独立管线：

| 管线 | 源文件 | JSON | Engine | 消费页面 |
|------|--------|------|--------|---------|
| 宏量营养 | `力量举营养宏量算法数据库_修复版.docx` + `macro_algorithm_database_source.docx` | `macro_algorithm_rules.json` | `macro_rule_engine.js` | 模块二、模块四 |
| 补剂时序 | `pkdb_1.docx` ~ `pkdb_7.docx` | `supplement_rules.json` | `supplement_rule_engine.js` | 补剂页、模块四 |

**加载策略**：每个 Engine 在初始化时通过 `fetch(JSON 路径)` 尝试加载规则文件。成功 → 使用 JSON 规则；失败或 `file://` 场景 → 使用 Engine 内嵌的 `FALLBACK_RULES` 保底。

---

## 2. 宏量营养规则追溯

来源文档版本标记：`macro_algorithm_rules.json` **version v1**。

### 2.1 能量可用性 (Energy Availability)

| 规则 | 来源字段 | 启用状态 | 说明 |
|------|---------|---------|------|
| EA 计算公式 | `energy_availability.formula` | ✅ 已启用 | EA = (EI - EEE) / FFM, kcal/kg LBM/day |
| 临床风险阈值 (男 < 25) | `energy_availability.thresholds.clinical_danger.male_lt` | ✅ 已启用 | 明显相对能量缺乏风险 |
| 临床风险阈值 (女 < 30) | `energy_availability.thresholds.clinical_danger.female_lt` | ✅ 已启用 | 同上 |
| 亚临床警戒带 (男 25-30) | `energy_availability.thresholds.subclinical_caution.male_range` | ✅ 已启用 | 减脂期警戒带 |
| 亚临床警戒带 (女 30-45) | `energy_availability.thresholds.subclinical_caution.female_range` | ✅ 已启用 | 减脂期警戒带 |
| 最佳适应区间 (男 40-45) | `energy_availability.thresholds.optimal_adaptation.male_range` | ✅ 已启用 | 非减脂阶段操作基线 |
| 最佳适应区间 (女 ≥ 45) | `energy_availability.thresholds.optimal_adaptation.female_gte` | ✅ 已启用 | 同上 |
| Bulk EA 底线 45 | `energy_availability.operational_defaults.bulk_target_ea_floor` | ✅ 已启用 | 在 `evaluateMacroPlan` 返回 |
| Strength EA 底线 45 | `energy_availability.operational_defaults.strength_target_ea_floor` | ✅ 已启用 | 同上 |
| Cut EA 底线 (男 25) | `energy_availability.operational_defaults.cut_target_ea_floor_male` | ✅ 已启用 | 同上 |
| Cut EA 底线 (女 30) | `energy_availability.operational_defaults.cut_target_ea_floor_female` | ✅ 已启用 | 同上 |

**消费页**：模块二 (EA 状态计算 + RED-S 风险评估)、模块四 (RED-S 警告展示)。

### 2.2 目标阶段配置 (Goal Profiles)

| 目标 key | 标签 | 启用状态 | 映射说明 |
|---------|------|---------|---------|
| `bulk` | 增肌期 | ✅ 已启用 | 盈余 200-300 kcal, 蛋白 1.9-2.6 g/kg LBM, 碳水 4.0-7.0 g/kg TBW |
| `strength` | 力量期 | ✅ 已启用 | 等热量 ±100 kcal, 蛋白 2.0-2.5 g/kg LBM, 碳水 3.0-5.0 g/kg TBW |
| `cut` | 减脂期 | ✅ 已启用 | 缺口 -500 ~ -200 kcal, 蛋白 2.5-4.2 g/kg LBM, 碳水 2.0-4.0 g/kg TBW |
| `recomp` | 体成分重组 | 🔸 映射到 strength | `normalizeGoalKey` 映射 `recomp` → `strength` |
| `meet_prep` | 赛前准备 | ❌ 已禁用 | `evaluateMacroPlan` 返回 `disabled: true` + 提示信息 |

每个目标包含：
- `energy_management` — 盈余/缺口量、RED-S EA 阈值
- `macronutrient_distribution` — 蛋白/脂肪/碳水区间
- `day_type_overrides` — rest 日碳水压低、heavy 日碳水倍率
- `gender_specific_tweaks` — 女性黄体期调整、男性睾酮支持脂肪底线

**消费页**：模块二 (核心驱动)、模块四 (展示目标阶段)。

### 2.3 日类型乘数 (Day Type Multipliers)

| 日类型 | 能量乘数 | 碳水乘数 | 蛋白乘数 | 脂肪乘数 | 碳水时序 | 启用状态 |
|-------|---------|---------|---------|---------|---------|---------|
| `rest` | 0.92 | 0.70 | 1.00 | 1.05 | ❌ 关闭 | ✅ |
| `light` | 0.97 | 0.85 | 1.00 | 1.00 | ✅ 启用 | ✅ |
| `medium` | 1.00 | 1.00 | 1.00 | 1.00 | ✅ 启用 | ✅ |
| `heavy` | 1.05 | 1.15 | 1.00 | 0.98 | ✅ 启用 | ✅ |

**消费页**：模块二 (`macros.byType` 生成)、模块四 (展示)。

### 2.4 宏量营养公式 (Macro Formulas)

| 营养素 | 基础指标 | 策略 | 特殊规则 | 启用状态 |
|--------|---------|------|---------|---------|
| 能量 (Energy) | LBM | `surplus_deficit_kcal_per_lbm` | bodyFat 缺失时默认 15% | ✅ |
| 蛋白质 (Protein) | LBM | `range_by_goal_profile` | Cut 触发上沿 (缺口 ≥ 500 kcal / 高频 / 黄体期) | ✅ |
| 脂肪 (Fat) | TBW | `range_by_goal_profile` | 男性睾酮底线 0.8 g/kg TBW | ✅ |
| 碳水 (Carb) | TBW | `range_by_goal_profile` | Cut 硬底线 2.0 g/kg TBW | ✅ |

#### 训练日碳水时序

| 窗口 | 时间 | 规则 | 启用状态 |
|------|------|------|---------|
| Pre | -2h ~ -3h | 1.0-1.5 g/kg TBW + 0.3 g/kg 蛋白 | ✅ |
| Intra | RPE > 9 或训练 > 60min | 30-60g/h 快碳, 葡萄糖:果糖 = 2:1 | ✅ |
| Post | +30min ~ +2h | 1.0-1.2 g/kg 碳水 + 0.3-0.4 g/kg 蛋白, 碳蛋比 3:1 | ✅ |

**消费页**：模块二 (`carbTiming` 生成)、模块四 (时间轴展示)。

### 2.5 餐次分配模板 (Meal Distribution Templates)

| 日类型 | 餐次数 | 特殊餐次 | 启用状态 |
|-------|--------|---------|---------|
| rest | 6 餐 | 无训练前后餐 | ✅ |
| light | 7 餐 | pre_training + intra + post_training | ✅ |
| medium | 7 餐 | pre_training + intra + post_training | ✅ |
| heavy | 7 餐 | pre_training (碳水 25%) + intra (碳水 10%) + post_training (蛋白 30%) | ✅ |

**消费页**：模块二 (`mealPlans.byType` 生成)、模块四 (时间轴展示)。

### 2.6 约束与警告 (Constraints)

| 规则 | 严重度 | 触发条件 | 启用状态 |
|------|-------|---------|---------|
| 低能量可用性 | warning | EA 低于性别底线 | ✅ |
| 大缺口 | warning | 每日缺口 < -500 kcal 或低于下限 | ✅ |
| 低碳水 | warning | 力量期 < 3 g/kg 或减脂期 < 2 g/kg | ✅ |
| 低蛋白 | warning | 蛋白 < 1.6 g/kg TBW 或低于目标区间下限 | ✅ |

**消费页**：模块二 (RED-S 警告区)、模块四 (风险提示)。

### 2.7 引用文献 (Citations)

8 篇引用文献，涵盖 RED-S、能量盈余与肥大、蛋白质补充、碳水与力量表现、女性运动员营养、低纤维减重等。

---

## 3. 补剂规则追溯

来源：`pkdb_1.docx` ~ `pkdb_7.docx`，共 **30 种补剂**。

### 3.1 按来源文档分组

#### pkdb_1 (训练前认知/兴奋类)

| 补剂 key | 证据等级 | 启用状态 | 关键条件 | 特殊约束 |
|---------|---------|---------|---------|---------|
| `caffeine` | A | ✅ | notRestDay, minPercent1RM ≥ 85, minSleepGap ≥ 6h | 晚间训练警告, CYP1A2 慢代谢者 |
| `alphaGPC` | null | ✅ | notRestDay, minPercent1RM ≥ 80 | 无 |
| `lTheanine` | null | ✅ | notRestDay, minPercent1RM ≥ 85, minRPE ≥ 9, requireBundle caffeine | 须与咖啡因同用 |
| `lionsMane` | null | ✅ | 无条件 baseline | 无 |

#### pkdb_2 (耐力和泵感)

| 补剂 key | 证据等级 | 启用状态 | 关键条件 | 特殊约束 |
|---------|---------|---------|---------|---------|
| `sodiumBicarbonate` | A | ✅ | notRestDay, minPercent1RM ≥ 90, split dosing | GI 不适史, water_cut 禁用 |
| `betaAlanine` | A | ✅ | 无条件 baseline, split dosing | 分次以减少刺痛感 |
| `citrulline` | A | ✅ | notRestDay, minPercent1RM ≥ 75 | 无 |
| `nitrate` | A | ✅ | notRestDay, minPercent1RM ≥ 75, 提前 150min | 无 |

#### pkdb_3 (基础/恢复类)

| 补剂 key | 证据等级 | 启用状态 | 关键条件 | 特殊约束 |
|---------|---------|---------|---------|---------|
| `d3k2` | A | ✅ | 随含脂早餐 baseline | 与 omega3 协同 |
| `omega3` | B | ✅ | 随首餐 baseline | 与 d3k2 协同 |
| `vitaminC` | B | ✅ | 训练日 workout_end +90min, 休息日 wake +30min | water_cut 需调整 |
| `creatine` | A | ✅ | 训练日 workout_end, 休息日 wake | 可能有 non-responder |
| `protein` | A | ✅ | 训练日 workout_end (0.4 g/kg TBW) | 须与 BCAA 错开 |
| `collagen` | B | ✅ | notRestDay, minPercent1RM ≥ 70, 提前 60min | 与维生素 C 协同 |

#### pkdb_4 (夜间恢复/适应原类)

| 补剂 key | 证据等级 | 启用状态 | 关键条件 | 特殊约束 |
|---------|---------|---------|---------|---------|
| `magnesium` | B | ✅ | sleep -60min | 无 |
| `zinc` | B | ✅ | sleep -120min (随晚餐) | 无 |
| `zincMagnesium` (ZMA) | B | ✅ | sleep -60min | 镁锌协同 |
| `ashwagandha` | B | ✅ | sleep -90min | 无 |
| `turmeric` (Curcumin) | B | ✅ | notRestDay, minRPE ≥ 7.5, workout_end +90min | water_cut 需调整 |
| `tartCherry` | B | ✅ | notRestDay, minRPE ≥ 8, workout_end +120min | water_cut 需调整 |

#### pkdb_6 (代谢支持类)

| 补剂 key | 证据等级 | 启用状态 | 关键条件 | 特殊约束 |
|---------|---------|---------|---------|---------|
| `alphaLipoicAcid` | B | ✅ | wake +45min (随餐) | 无 |
| `melatonin` | B | ✅ | sleep -30min | 非默认推荐 |
| `berberine` | B | ✅ | wake +30min (随餐) | 无 |

#### pkdb_7 (弱证据/争议类)

| 补剂 key | 证据等级 | 启用状态 | 关键条件 | 特殊约束 |
|---------|---------|---------|---------|---------|
| `bcaa` | C | ✅ | notRestDay, minPercent1RM ≥ 75 | 须与蛋白错开，总蛋白充足时证据弱 |
| `glutamine` | C | ✅ | notRestDay, minRPE ≥ 7.5, workout_end +30min | 无 |
| `hmb` | C | ✅ | 无条件 baseline, split dosing | 证据混合 |
| `betaEcdysterone` | C | ✅ | wake +15min baseline | 证据有限 |
| `chromium` | C | ✅ | wake +30min (随碳水餐) | 谨慎可选 |

### 3.2 补剂交互网络

- **协同对**：d3k2↔omega3, caffeine↔lTheanine, caffeine↔alphaGPC, citrulline↔nitrate, creatine↔protein, collagen↔vitaminC, magnesium↔zincMagnesium
- **分离要求**：protein 须与 bcaa 错开 30min
- **捆绑要求**：lTheanine 须与 caffeine 同选
- **无拮抗对**：当前规则库未记录拮抗关系

### 3.3 水分削减安全等级

| 等级 | 补剂数 | 补剂列表 |
|------|-------|---------|
| `safe` | 15 | d3k2, omega3, alphaGPC, lTheanine, lionsMane, betaAlanine, magnesium, zinc, zincMagnesium, ashwagandha, alphaLipoicAcid, melatonin, hmb, betaEcdysterone, chromium, berberine |
| `adjust` | 8 | vitaminC, caffeine, citrulline, nitrate, creatine, protein, collagen, turmeric, tartCherry, bcaa |
| `avoid` | 1 | sodiumBicarbonate |

**消费页**：补剂页 (补剂时序生成器)、模块四 (时间轴渲染)。

---

## 4. 当前已启用能力 (V1 Active)

### 4.1 宏量管线已启用

- [x] 三大目标 (bulk / strength / cut) 的完整宏量计算
- [x] EA 计算与 RED-S 风险判断
- [x] 四种日类型 (rest / light / medium / heavy) 的乘数调整
- [x] 训练日碳水时序 (pre / intra / post)
- [x] 四种日类型的餐次分配模板
- [x] 四项约束警告 (低 EA、大缺口、低碳水、低蛋白)
- [x] recomp → strength 映射降级

### 4.2 补剂管线已启用

- [x] 30 种补剂的全量时序规则求值
- [x] 五种时间锚点 (wake / workout_start / workout_end / sleep)
- [x] 条件匹配 (percent1RM / RPE / 休息日 / 睡眠间隔 / 训练时间)
- [x] 剂量计算 (TBW / LBM / Absolute + ceiling 限制)
- [x] 分次给药 (split dosing)
- [x] 交互检查 (协同/捆绑/分离)
- [x] 约束检查 (医疗红旗/水分削减/基因低反应/禁用上下文)
- [x] 晚间训练咖啡因阻断

### 4.3 消费者页面

| 页面 | 消费的规则 |
|------|-----------|
| 模块一_用户档案.html | 无（仅产生输入数据） |
| 模块二_碳水预算引擎.html | goal_profiles, day_type_multipliers, macro_formulas, meal_distribution_templates, constraints, energy_availability |
| 模块三_每周训练安排.html | 无（仅产生训练数据） |
| 补剂时序生成器.html | supplement_rules.json (全量) |
| 模块四_单日仪表盘.html | 训练计划 + 宏量结果 + 补剂结果 (融合展示) |

---

## 5. 保留但未启用能力 (Reserved / Disabled)

| 能力 | 来源 | 状态 | 原因 |
|------|------|------|------|
| `recomp` (体成分重组) | macro_algorithm_rules.json | 🔸 映射到 strength | V1 未实现独立算法，通过 `normalizeGoalKey` 降级 |
| `meet_prep` (赛前准备) | macro_algorithm_rules.json | ❌ disabled | 返回 `disabled: true` + 提示"高级模块未启用" |
| `peaking` (冲击/减量期) | `constraints.manual_only_future_modes.peaking` | 📋 保留字段 | 研究结论已保留，V1 不自动进入计算 |
| `weight_cut` (赛前减重) | `constraints.manual_only_future_modes.weight_cut` | 📋 保留字段 | 高风险操作，V1 仅保留字段 |
| `female_cycle` (女性周期) | `constraints.manual_only_future_modes.female_cycle` | 📋 保留字段 | 待输入入口就绪后再接入 |
| 女性黄体期调整 | goal_profiles 中 gender_specific_tweaks | 📋 保留说明 | 字段已定义，但 V1 无周期输入入口 |
| 基因低反应标记 | supplement_rules.json 中 genetic_non_responder_trait | 📋 保留字段 | 信息性字段，不阻断建议生成 |

---

## 6. 安全边界

### 6.1 规则引擎不做什么

- **不诊断**：`ui_notes.positioning` 明确声明"不替代医疗诊断"
- **不启用高风险协议**：`weight_cut` (赛前极限脱水) 在 V1 完全禁用
- **不自动处理赛前准备**：`meet_prep` 返回 `disabled: true`
- **不硬编码 JSON 到 HTML**：通过 `fetch` 加载 + fallback 保底，不将规则内容写入 HTML
- **不依赖 docx**：docx 文件只作为知识来源，JSON 是运行时的唯一规则源

### 6.2 运行时保护

- **file:// 保底**：fetch 失败时自动降级到 FALLBACK_RULES
- **天花板限制**：所有 TBW/LBM 计算剂量受 `absolute_ceiling_mg` 限制
- **睡眠间隔保护**：咖啡因在睡眠间隔 < 6h 时自动阻断
- **分次给药**：sodiumBicarbonate 和 betaAlanine 强制分次，减少副作用
- **捆绑检查**：lTheanine 单独选择时会提示需要咖啡因
- **分离检查**：protein 和 bcaa 同时选择时自动错开 30min

### 6.3 数据契约边界

- `localStorage` 7 个 key 不变更
- dayIndex 标准 0=周一 不变更
- 旧字段兼容读取不移除

---

## 7. 下一步建议

### 短期 (V1 收口)

| 建议 | 原因 | 涉及文件 |
|------|------|---------|
| 无 — V1 规则追溯已完成 | 当前规则管线完整且可追溯 | 本文件即为产出 |

### 中期 (V1.x 增强)

| 建议 | 原因 | 涉及文件 |
|------|------|---------|
| 接入 `recomp` 独立算法 | 当前映射到 strength 不够精确 | macro_algorithm_rules.json, macro_rule_engine.js |
| 实现基础周期模板 | 为长期计划模块准备训练量/强度周期化 | macro_algorithm_rules.json 已预留字段 |
| 女性周期输入入口 | 解锁 `female_cycle` 调整逻辑 | 模块一, macro_rule_engine.js |

### 长期 (V2+)

| 建议 | 原因 | 涉及文件 |
|------|------|---------|
| `meet_prep` 高级模块 | 完整的赛前减量/充碳/减水流程 | macro_algorithm_rules.json |
| `peaking` 冲击周期 | 从保留字段升级为启用规则 | macro_algorithm_rules.json |
| `weight_cut` 赛前减重 | 高风险功能，需要医学/合规审查 | macro_algorithm_rules.json |
| 补剂拮抗网络补全 | 当前 synergy 已覆盖但 antagonism 为空 | supplement_rules.json |
