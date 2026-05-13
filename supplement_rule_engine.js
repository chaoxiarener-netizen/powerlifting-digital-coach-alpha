(function () {
  const FALLBACK_RULES = {
    "supplements": [
      {
        "key": "d3k2",
        "name_cn": "Vitamin D3+K2",
        "name_en": "Vitamin D3+K2",
        "evidence_class": "A",
        "source_doc": "pkdb_3",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "with_fat_meal", "hydration_requirement_ml": null },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 3000, "absolute_ceiling_mg": null, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "IU" },
        "timing_rules": [{ "anchor": "wake", "offset_minutes": 0, "section_label": "Baseline", "conditions": {} }],
        "interaction_network": { "synergy": ["omega3"], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Take with the first meal containing fat.", "optional": "Baseline health support.", "warning": "" },
        "optional_when_unselected": false,
        "citations": ["pkdb_3"]
      },
      {
        "key": "omega3",
        "name_cn": "Omega-3",
        "name_en": "Omega-3",
        "evidence_class": "B",
        "source_doc": "pkdb_3",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "with_fat_meal", "hydration_requirement_ml": null },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 2000, "absolute_ceiling_mg": null, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mg" },
        "timing_rules": [{ "anchor": "wake", "offset_minutes": 30, "section_label": "Baseline", "conditions": {} }],
        "interaction_network": { "synergy": ["d3k2"], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Place with the first main meal.", "optional": "General recovery support.", "warning": "" },
        "optional_when_unselected": true,
        "citations": ["pkdb_3"]
      },
      {
        "key": "vitaminC",
        "name_cn": "Vitamin C",
        "name_en": "Vitamin C",
        "evidence_class": "B",
        "source_doc": "pkdb_3",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "meal_or_recovery", "hydration_requirement_ml": null },
        "dosing_model": { "base_metric": "TBW", "multiplier_per_kg": 3, "absolute_dose": null, "absolute_ceiling_mg": 1000, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mg" },
        "timing_rules": [
          { "anchor": "workout_end", "offset_minutes": 90, "section_label": "Recovery", "conditions": { "notRestDay": true } },
          { "anchor": "wake", "offset_minutes": 30, "section_label": "Baseline", "conditions": { "isRestDay": true } }
        ],
        "interaction_network": { "synergy": ["collagen"], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "adjust", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Better used away from the exact end of training.", "optional": "Useful on higher recovery demand days.", "warning": "Avoid placing large doses at the exact moment training ends." },
        "optional_when_unselected": false,
        "citations": ["pkdb_3"]
      },
      {
        "key": "caffeine",
        "name_cn": "Caffeine",
        "name_en": "Caffeine",
        "evidence_class": "A",
        "source_doc": "pkdb_1",
        "pharmacokinetics": { "t_max_minutes": 60, "half_life_hours": 4, "administration_state": "empty_or_fast_carb", "hydration_requirement_ml": 250 },
        "dosing_model": { "base_metric": "TBW", "multiplier_per_kg": 4, "absolute_dose": null, "absolute_ceiling_mg": 600, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mg" },
        "timing_rules": [{ "anchor": "workout_start", "offset_minutes": -45, "female_luteal_offset_delta_minutes": -15, "section_label": "Pre-workout", "conditions": { "notRestDay": true, "minPercent1RM": 85, "minSleepGapHours": 6, "requireWorkoutTiming": true } }],
        "interaction_network": { "synergy": ["lTheanine", "alphaGPC"], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": ["late_training"], "water_cut_safety": "adjust", "genetic_non_responder_trait": "CYP1A2 slow metabolizer may tolerate poorly", "forbidden_contexts": ["sleep_gap_lt_6h"] },
        "ui_notes": { "primary": "Use before high-intensity work only when sleep gap is wide enough.", "optional": "Useful on heavy days.", "warning": "Blocked when planned sleep is too close." },
        "optional_when_unselected": true,
        "citations": ["pkdb_1"]
      },
      {
        "key": "alphaGPC",
        "name_cn": "Alpha-GPC",
        "name_en": "Alpha-GPC",
        "evidence_class": null,
        "source_doc": "pkdb_1",
        "pharmacokinetics": { "t_max_minutes": 60, "half_life_hours": null, "administration_state": "light_meal_or_empty", "hydration_requirement_ml": 200 },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 300, "absolute_ceiling_mg": 600, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mg" },
        "timing_rules": [{ "anchor": "workout_start", "offset_minutes": -45, "section_label": "Pre-workout", "conditions": { "notRestDay": true, "minPercent1RM": 80, "requireWorkoutTiming": true } }],
        "interaction_network": { "synergy": ["caffeine"], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Often used in the same pre-workout window as caffeine.", "optional": "Optional for focus-heavy sessions.", "warning": "" },
        "optional_when_unselected": true,
        "citations": ["pkdb_1"]
      },
      {
        "key": "lTheanine",
        "name_cn": "L-Theanine",
        "name_en": "L-Theanine",
        "evidence_class": null,
        "source_doc": "pkdb_1",
        "pharmacokinetics": { "t_max_minutes": 45, "half_life_hours": null, "administration_state": "any", "hydration_requirement_ml": 150 },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 200, "absolute_ceiling_mg": 400, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mg" },
        "timing_rules": [{ "anchor": "workout_start", "offset_minutes": -45, "section_label": "Pre-workout", "conditions": { "notRestDay": true, "minPercent1RM": 85, "minRPE": 9, "requireWorkoutTiming": true } }],
        "interaction_network": { "synergy": ["caffeine"], "antagonism": [], "requires_bundle_with": ["caffeine"], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Best treated as a caffeine stack partner, not a standalone performance trigger.", "optional": "Optional when caffeine is already selected.", "warning": "If caffeine is not selected, keep this as a suggestion instead of a main node." },
        "optional_when_unselected": true,
        "citations": ["pkdb_1"]
      },
      {
        "key": "lionsMane",
        "name_cn": "Lion's Mane",
        "name_en": "Lion's Mane",
        "evidence_class": null,
        "source_doc": "pkdb_1",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "with_breakfast", "hydration_requirement_ml": null },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 500, "absolute_ceiling_mg": 1500, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mg" },
        "timing_rules": [{ "anchor": "wake", "offset_minutes": 15, "section_label": "Baseline", "conditions": {} }],
        "interaction_network": { "synergy": ["alphaGPC"], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Use earlier in the day rather than close to sleep.", "optional": "Optional cognitive support.", "warning": "" },
        "optional_when_unselected": true,
        "citations": ["pkdb_1"]
      },
      {
        "key": "sodiumBicarbonate",
        "name_cn": "Sodium Bicarbonate",
        "name_en": "Sodium Bicarbonate",
        "evidence_class": "A",
        "source_doc": "pkdb_2",
        "pharmacokinetics": { "t_max_minutes": 90, "half_life_hours": null, "administration_state": "with_water_and_food", "hydration_requirement_ml": 500 },
        "dosing_model": { "base_metric": "TBW", "multiplier_per_kg": 300, "absolute_dose": null, "absolute_ceiling_mg": null, "split_dosing_required": true, "split_dosing_protocol": "split_2_equal", "unit": "mg" },
        "timing_rules": [{ "anchor": "workout_start", "offset_minutes": -90, "split_offsets_minutes": [0, 30], "split_equally": true, "section_label": "Pre-workout", "conditions": { "notRestDay": true, "minPercent1RM": 90, "requireWorkoutTiming": true } }],
        "interaction_network": { "synergy": [], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": ["gi_distress_history"], "water_cut_safety": "avoid", "genetic_non_responder_trait": null, "forbidden_contexts": ["water_cut"] },
        "ui_notes": { "primary": "Split dosing is preferred to reduce GI load.", "optional": "Reserve for very hard anaerobic work.", "warning": "Avoid aggressive use during water-cut phases." },
        "optional_when_unselected": true,
        "citations": ["pkdb_2"]
      },
      {
        "key": "betaAlanine",
        "name_cn": "Beta-Alanine",
        "name_en": "Beta-Alanine",
        "evidence_class": "A",
        "source_doc": "pkdb_2",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "split_with_meals", "hydration_requirement_ml": null },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 3.2, "absolute_ceiling_mg": null, "split_dosing_required": true, "split_dosing_protocol": "divide_across_day", "unit": "g" },
        "timing_rules": [{ "anchor": "wake", "offset_minutes": 0, "section_label": "Baseline", "conditions": {} }],
        "interaction_network": { "synergy": [], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Use as a daily saturation supplement rather than a same-session booster.", "optional": "Optional long-term buffering support.", "warning": "Split to reduce paresthesia." },
        "optional_when_unselected": false,
        "citations": ["pkdb_2"]
      },
      {
        "key": "citrulline",
        "name_cn": "Citrulline",
        "name_en": "Citrulline",
        "evidence_class": "A",
        "source_doc": "pkdb_2",
        "pharmacokinetics": { "t_max_minutes": 60, "half_life_hours": 1.2, "administration_state": "empty_or_light_meal", "hydration_requirement_ml": 300 },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 8, "absolute_ceiling_mg": null, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "g" },
        "timing_rules": [{ "anchor": "workout_start", "offset_minutes": -45, "section_label": "Pre-workout", "conditions": { "notRestDay": true, "minPercent1RM": 75, "requireWorkoutTiming": true } }],
        "interaction_network": { "synergy": ["nitrate"], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "adjust", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Best placed close to training rather than many hours before.", "optional": "Useful once intensity enters moderate to heavy territory.", "warning": "" },
        "optional_when_unselected": true,
        "citations": ["pkdb_2"]
      },
      {
        "key": "nitrate",
        "name_cn": "Nitrate / Beetroot",
        "name_en": "Nitrate / Beetroot",
        "evidence_class": "A",
        "source_doc": "pkdb_2",
        "pharmacokinetics": { "t_max_minutes": 150, "half_life_hours": 5, "administration_state": "with_water", "hydration_requirement_ml": 300 },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 400, "absolute_ceiling_mg": null, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mg" },
        "timing_rules": [{ "anchor": "workout_start", "offset_minutes": -150, "section_label": "Pre-workout", "conditions": { "notRestDay": true, "minPercent1RM": 75, "requireWorkoutTiming": true } }],
        "interaction_network": { "synergy": ["citrulline"], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "adjust", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Needs a longer lead time than citrulline.", "optional": "Useful on medium and heavy work when timing is known.", "warning": "" },
        "optional_when_unselected": true,
        "citations": ["pkdb_2"]
      },
      {
        "key": "creatine",
        "name_cn": "Creatine Monohydrate",
        "name_en": "Creatine Monohydrate",
        "evidence_class": "A",
        "source_doc": "pkdb_3",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "any_meal", "hydration_requirement_ml": 300 },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 5, "absolute_ceiling_mg": null, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "g" },
        "timing_rules": [
          { "anchor": "workout_end", "offset_minutes": 0, "section_label": "Recovery", "conditions": { "notRestDay": true } },
          { "anchor": "wake", "offset_minutes": 30, "section_label": "Baseline", "conditions": { "isRestDay": true } }
        ],
        "interaction_network": { "synergy": ["protein"], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "adjust", "genetic_non_responder_trait": "possible_non_responder", "forbidden_contexts": [] },
        "ui_notes": { "primary": "Daily consistency matters more than exact minute timing.", "optional": "Baseline performance support.", "warning": "" },
        "optional_when_unselected": false,
        "citations": ["pkdb_3"]
      },
      {
        "key": "protein",
        "name_cn": "Whey / EAA",
        "name_en": "Whey / EAA",
        "evidence_class": "A",
        "source_doc": "pkdb_3",
        "pharmacokinetics": { "t_max_minutes": 45, "half_life_hours": null, "administration_state": "post_workout_or_meal_gap", "hydration_requirement_ml": 300 },
        "dosing_model": { "base_metric": "TBW", "multiplier_per_kg": 0.4, "absolute_dose": null, "absolute_ceiling_mg": null, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "g" },
        "timing_rules": [{ "anchor": "workout_end", "offset_minutes": 0, "section_label": "Recovery", "conditions": { "notRestDay": true } }],
        "interaction_network": { "synergy": ["creatine"], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": ["bcaa"] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "adjust", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Use to cover post-session protein needs, especially when meals lag.", "optional": "Optional if whole-food protein is delayed.", "warning": "If BCAA is also selected, stagger them instead of stacking at the same minute." },
        "optional_when_unselected": true,
        "citations": ["pkdb_3"]
      },
      {
        "key": "collagen",
        "name_cn": "Collagen",
        "name_en": "Collagen",
        "evidence_class": "B",
        "source_doc": "pkdb_3",
        "pharmacokinetics": { "t_max_minutes": 60, "half_life_hours": null, "administration_state": "with_vitamin_c", "hydration_requirement_ml": 250 },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 15, "absolute_ceiling_mg": null, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "g" },
        "timing_rules": [{ "anchor": "workout_start", "offset_minutes": -60, "section_label": "Pre-workout", "conditions": { "notRestDay": true, "minPercent1RM": 70, "requireWorkoutTiming": true } }],
        "interaction_network": { "synergy": ["vitaminC"], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "adjust", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "A better fit before training than after it.", "optional": "Useful when tendon and connective-tissue support matters.", "warning": "" },
        "optional_when_unselected": true,
        "citations": ["pkdb_3"]
      },
      {
        "key": "magnesium",
        "name_cn": "Magnesium",
        "name_en": "Magnesium",
        "evidence_class": "B",
        "source_doc": "pkdb_4",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "night_with_water", "hydration_requirement_ml": 200 },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 300, "absolute_ceiling_mg": 400, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mg" },
        "timing_rules": [{ "anchor": "sleep", "offset_minutes": -60, "section_label": "Night recovery", "conditions": {} }],
        "interaction_network": { "synergy": ["zincMagnesium"], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Best placed in the wind-down window.", "optional": "Useful if night-time recovery is a focus.", "warning": "" },
        "optional_when_unselected": false,
        "citations": ["pkdb_4"]
      },
      {
        "key": "zinc",
        "name_cn": "Zinc",
        "name_en": "Zinc",
        "evidence_class": "B",
        "source_doc": "pkdb_4",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "with_evening_meal", "hydration_requirement_ml": null },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 15, "absolute_ceiling_mg": 30, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mg" },
        "timing_rules": [{ "anchor": "sleep", "offset_minutes": -120, "section_label": "Night recovery", "conditions": {} }],
        "interaction_network": { "synergy": ["magnesium"], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Often fits better with dinner than right before lying down.", "optional": "Useful when evening recovery support is needed.", "warning": "" },
        "optional_when_unselected": false,
        "citations": ["pkdb_4"]
      },
      {
        "key": "zincMagnesium",
        "name_cn": "ZMA",
        "name_en": "ZMA",
        "evidence_class": "B",
        "source_doc": "pkdb_4",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "before_sleep", "hydration_requirement_ml": 200 },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": null, "absolute_ceiling_mg": null, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "30mg / 400mg" },
        "timing_rules": [{ "anchor": "sleep", "offset_minutes": -60, "section_label": "Night recovery", "conditions": {} }],
        "interaction_network": { "synergy": ["magnesium", "zinc"], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Use as a simple bundled night-recovery option.", "optional": "Optional if you prefer a combined product.", "warning": "" },
        "optional_when_unselected": false,
        "citations": ["pkdb_4"]
      },
      {
        "key": "ashwagandha",
        "name_cn": "Ashwagandha",
        "name_en": "Ashwagandha",
        "evidence_class": "B",
        "source_doc": "pkdb_4",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "evening_meal", "hydration_requirement_ml": null },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 300, "absolute_ceiling_mg": 600, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mg" },
        "timing_rules": [{ "anchor": "sleep", "offset_minutes": -90, "section_label": "Night recovery", "conditions": {} }],
        "interaction_network": { "synergy": ["magnesium"], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Leans more toward daily stress-recovery support than acute performance.", "optional": "Optional evening support.", "warning": "" },
        "optional_when_unselected": true,
        "citations": ["pkdb_4"]
      },
      {
        "key": "turmeric",
        "name_cn": "Curcumin",
        "name_en": "Curcumin",
        "evidence_class": "B",
        "source_doc": "pkdb_4",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "with_meal", "hydration_requirement_ml": null },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 500, "absolute_ceiling_mg": 1000, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mg" },
        "timing_rules": [{ "anchor": "workout_end", "offset_minutes": 90, "section_label": "Recovery", "conditions": { "notRestDay": true, "minRPE": 7.5 } }],
        "interaction_network": { "synergy": [], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "adjust", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Better in the recovery window than at the exact training endpoint.", "optional": "Optional on harder sessions.", "warning": "" },
        "optional_when_unselected": true,
        "citations": ["pkdb_4"]
      },
      {
        "key": "tartCherry",
        "name_cn": "Tart Cherry",
        "name_en": "Tart Cherry",
        "evidence_class": "B",
        "source_doc": "pkdb_4",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "with_recovery_meal", "hydration_requirement_ml": null },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 480, "absolute_ceiling_mg": null, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mg" },
        "timing_rules": [{ "anchor": "workout_end", "offset_minutes": 120, "section_label": "Recovery", "conditions": { "notRestDay": true, "minRPE": 8 } }],
        "interaction_network": { "synergy": [], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "adjust", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Reserve for higher fatigue scenarios and keep it away from the exact workout finish.", "optional": "Optional on the hardest sessions.", "warning": "" },
        "optional_when_unselected": true,
        "citations": ["pkdb_4"]
      },
      {
        "key": "alphaLipoicAcid",
        "name_cn": "Alpha-Lipoic Acid",
        "name_en": "Alpha-Lipoic Acid",
        "evidence_class": "B",
        "source_doc": "pkdb_6",
        "pharmacokinetics": { "t_max_minutes": 60, "half_life_hours": null, "administration_state": "with_meal", "hydration_requirement_ml": null },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 300, "absolute_ceiling_mg": 600, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mg" },
        "timing_rules": [{ "anchor": "wake", "offset_minutes": 45, "section_label": "Baseline", "conditions": {} }],
        "interaction_network": { "synergy": [], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Place with an earlier meal rather than late at night.", "optional": "Optional metabolic support.", "warning": "" },
        "optional_when_unselected": true,
        "citations": ["pkdb_6"]
      },
      {
        "key": "bcaa",
        "name_cn": "BCAA",
        "name_en": "BCAA",
        "evidence_class": "C",
        "source_doc": "pkdb_7",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "pre_or_intra", "hydration_requirement_ml": 300 },
        "dosing_model": { "base_metric": "TBW", "multiplier_per_kg": 0.1, "absolute_dose": null, "absolute_ceiling_mg": null, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "g" },
        "timing_rules": [{ "anchor": "workout_start", "offset_minutes": -10, "section_label": "Pre-workout", "conditions": { "notRestDay": true, "minPercent1RM": 75, "requireWorkoutTiming": true } }],
        "interaction_network": { "synergy": [], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": ["protein"] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "adjust", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Evidence is weaker when total protein is already adequate.", "optional": "Optional, especially when whole protein is delayed.", "warning": "If whey is already scheduled, stagger the timing instead of stacking them." },
        "optional_when_unselected": true,
        "citations": ["pkdb_7"]
      },
      {
        "key": "glutamine",
        "name_cn": "Glutamine",
        "name_en": "Glutamine",
        "evidence_class": "C",
        "source_doc": "pkdb_7",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "post_workout_or_evening", "hydration_requirement_ml": 250 },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 5, "absolute_ceiling_mg": null, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "g" },
        "timing_rules": [{ "anchor": "workout_end", "offset_minutes": 30, "section_label": "Recovery", "conditions": { "notRestDay": true, "minRPE": 7.5 } }],
        "interaction_network": { "synergy": [], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Can sit in the broader recovery window instead of immediately at workout end.", "optional": "Optional on higher fatigue days.", "warning": "" },
        "optional_when_unselected": true,
        "citations": ["pkdb_7"]
      },
      {
        "key": "melatonin",
        "name_cn": "Melatonin",
        "name_en": "Melatonin",
        "evidence_class": "B",
        "source_doc": "pkdb_6",
        "pharmacokinetics": { "t_max_minutes": 30, "half_life_hours": null, "administration_state": "pre_sleep", "hydration_requirement_ml": 100 },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 0.5, "absolute_ceiling_mg": 3, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mg" },
        "timing_rules": [{ "anchor": "sleep", "offset_minutes": -30, "section_label": "Night recovery", "conditions": {} }],
        "interaction_network": { "synergy": ["magnesium"], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Keep this as a true sleep-support tool, not a default every-night recommendation.", "optional": "Optional when sleep support is desired.", "warning": "" },
        "optional_when_unselected": false,
        "citations": ["pkdb_6"]
      },
      {
        "key": "hmb",
        "name_cn": "HMB",
        "name_en": "HMB",
        "evidence_class": "C",
        "source_doc": "pkdb_7",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "split_meals", "hydration_requirement_ml": null },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 3, "absolute_ceiling_mg": null, "split_dosing_required": true, "split_dosing_protocol": "divide_across_day", "unit": "g" },
        "timing_rules": [{ "anchor": "wake", "offset_minutes": 0, "section_label": "Baseline", "conditions": {} }],
        "interaction_network": { "synergy": [], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "More of a daily support entry than an acute timing supplement.", "optional": "Use conservative language because evidence is mixed.", "warning": "" },
        "optional_when_unselected": true,
        "citations": ["pkdb_7"]
      },
      {
        "key": "betaEcdysterone",
        "name_cn": "Beta-Ecdysterone",
        "name_en": "Beta-Ecdysterone",
        "evidence_class": "C",
        "source_doc": "pkdb_7",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "meal_based", "hydration_requirement_ml": null },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 500, "absolute_ceiling_mg": 1000, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mg" },
        "timing_rules": [{ "anchor": "wake", "offset_minutes": 15, "section_label": "Baseline", "conditions": {} }],
        "interaction_network": { "synergy": [], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Keep the recommendation conservative because evidence is still limited.", "optional": "Optional experimental entry.", "warning": "" },
        "optional_when_unselected": true,
        "citations": ["pkdb_7"]
      },
      {
        "key": "chromium",
        "name_cn": "Chromium",
        "name_en": "Chromium",
        "evidence_class": "C",
        "source_doc": "pkdb_7",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "with_carb_meal", "hydration_requirement_ml": null },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 200, "absolute_ceiling_mg": null, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mcg" },
        "timing_rules": [{ "anchor": "wake", "offset_minutes": 30, "section_label": "Baseline", "conditions": {} }],
        "interaction_network": { "synergy": [], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Treat this as a cautious optional metabolic support entry.", "optional": "Optional and conservative.", "warning": "" },
        "optional_when_unselected": true,
        "citations": ["pkdb_7"]
      },
      {
        "key": "berberine",
        "name_cn": "Berberine",
        "name_en": "Berberine",
        "evidence_class": "B",
        "source_doc": "pkdb_6",
        "pharmacokinetics": { "t_max_minutes": null, "half_life_hours": null, "administration_state": "with_meal", "hydration_requirement_ml": null },
        "dosing_model": { "base_metric": "Absolute", "multiplier_per_kg": null, "absolute_dose": 500, "absolute_ceiling_mg": 1000, "split_dosing_required": false, "split_dosing_protocol": null, "unit": "mg" },
        "timing_rules": [{ "anchor": "wake", "offset_minutes": 30, "section_label": "Baseline", "conditions": {} }],
        "interaction_network": { "synergy": [], "antagonism": [], "requires_bundle_with": [], "requires_separation_from": [] },
        "constraints": { "medical_red_flags": [], "water_cut_safety": "safe", "genetic_non_responder_trait": null, "forbidden_contexts": [] },
        "ui_notes": { "primary": "Place with a meal rather than in a pre-workout slot.", "optional": "Optional metabolic-support entry.", "warning": "" },
        "optional_when_unselected": true,
        "citations": ["pkdb_6"]
      }
    ]
  };

  let cachedRules = null;
  let cachedByKey = null;
  let attemptedRemoteLoad = false;

  function normalizeRules(raw) {
    const supplements = Array.isArray(raw && raw.supplements) ? raw.supplements : [];
    const byKey = {};
    supplements.forEach((rule) => {
      if (!rule || !rule.key) return;
      byKey[rule.key] = rule;
    });
    return { supplements, byKey };
  }

  function parseTime(value, fallback) {
    if (!value || typeof value !== 'string' || !value.includes(':')) return fallback;
    const parts = value.split(':').map((part) => parseInt(part, 10));
    if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return fallback;
    return (parts[0] * 60) + parts[1];
  }

  function formatTime(totalMinutes) {
    if (typeof totalMinutes !== 'number' || Number.isNaN(totalMinutes)) return '--:--';
    const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
    const hours = String(Math.floor(normalized / 60)).padStart(2, '0');
    const minutes = String(normalized % 60).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function roundDose(value) {
    if (!Number.isFinite(value)) return null;
    if (value >= 100) return Math.round(value);
    if (value >= 10) return Math.round(value * 10) / 10;
    return Math.round(value * 100) / 100;
  }

  function calculateDose(rule, context, splitCount) {
    const model = rule.dosing_model || {};
    const unit = model.unit || '';
    let rawDose = null;
    let calc = 'Absolute dose';
    if (model.base_metric === 'TBW' && Number.isFinite(model.multiplier_per_kg)) {
      rawDose = (Number(context.bodyWeightKg) || 0) * model.multiplier_per_kg;
      calc = `${model.multiplier_per_kg}/${unit} x ${Number(context.bodyWeightKg) || 0}kg`;
    } else if (model.base_metric === 'LBM' && Number.isFinite(model.multiplier_per_kg)) {
      rawDose = (Number(context.leanBodyMassKg) || Number(context.bodyWeightKg) || 0) * model.multiplier_per_kg;
      calc = `${model.multiplier_per_kg}/${unit} x LBM`;
    } else if (model.absolute_dose !== null && model.absolute_dose !== undefined) {
      rawDose = model.absolute_dose;
    }

    if (rawDose === null) {
      return { doseText: unit || '--', calc };
    }

    if (model.absolute_ceiling_mg && unit === 'mg') {
      rawDose = Math.min(rawDose, model.absolute_ceiling_mg);
    }
    if (splitCount && splitCount > 1) {
      rawDose = rawDose / splitCount;
      calc += ` split into ${splitCount} servings`;
    }

    const rounded = roundDose(rawDose);
    return { doseText: `${rounded}${unit}`, calc };
  }

  function getAnchorMinutes(anchor, context) {
    const map = {
      wake: context.wakeMin,
      workout_start: context.workoutStartMin,
      workout_end: context.workoutEndMin,
      sleep: context.sleepMin
    };
    return Number.isFinite(map[anchor]) ? map[anchor] : null;
  }

  function matchesConditions(conditions, context) {
    const next = conditions || {};
    if (next.notRestDay && context.isRestDay) return false;
    if (next.isRestDay && !context.isRestDay) return false;
    if (Number.isFinite(next.minPercent1RM) && (context.percent1RM || 0) < next.minPercent1RM) return false;
    if (Number.isFinite(next.maxPercent1RM) && (context.percent1RM || 0) > next.maxPercent1RM) return false;
    if (Number.isFinite(next.minRPE) && (context.postRPE || 0) < next.minRPE) return false;
    if (Number.isFinite(next.maxRPE) && (context.postRPE || 0) > next.maxRPE) return false;
    if (Number.isFinite(next.minSleepGapHours) && (context.timeGapHours || 0) < next.minSleepGapHours) return false;
    if (next.requireWorkoutTiming && !context.hasWorkoutTiming) return false;
    if (Array.isArray(next.cyclePhaseIncludes) && next.cyclePhaseIncludes.length) {
      if (!next.cyclePhaseIncludes.includes(context.cyclePhase)) return false;
    }
    return true;
  }

  function matchesConditionsRelaxed(conditions, context) {
    const next = Object.assign({}, conditions || {});
    delete next.minSleepGapHours;
    delete next.requireWorkoutTiming;
    return matchesConditions(next, context);
  }

  function createItem(rule, context, timingRule, totalMinutes, kind, noteOverride, splitCount) {
    const dose = calculateDose(rule, context, splitCount);
    return {
      key: rule.key,
      time: totalMinutes,
      label: Number.isFinite(totalMinutes) ? formatTime(totalMinutes) : (timingRule.section_label || '--'),
      name: rule.name_cn || rule.name_en || rule.key,
      dose: dose.doseText,
      note: noteOverride || timingRule.note || rule.ui_notes?.primary || '',
      calc: dose.calc,
      kind,
      section: timingRule.section_label || 'Supplement'
    };
  }

  function createHint(rule, context, kind, noteOverride) {
    const timingRule = (rule.timing_rules && rule.timing_rules[0]) || { section_label: 'Suggestion' };
    return {
      key: rule.key,
      time: null,
      label: timingRule.section_label || 'Suggestion',
      name: rule.name_cn || rule.name_en || rule.key,
      dose: calculateDose(rule, context).doseText,
      note: noteOverride || (kind === 'warning' ? (rule.ui_notes?.warning || rule.ui_notes?.primary || '') : (rule.ui_notes?.optional || rule.ui_notes?.primary || '')),
      calc: calculateDose(rule, context).calc,
      kind,
      section: timingRule.section_label || 'Suggestion'
    };
  }

  async function primeRules() {
    if (cachedRules && cachedByKey && attemptedRemoteLoad) {
      return { rules: cachedRules, byKey: cachedByKey };
    }

    let payload = FALLBACK_RULES;
    attemptedRemoteLoad = true;
    if (typeof fetch === 'function') {
      try {
        const response = await fetch('supplement_rules.json');
        if (response.ok) {
          payload = await response.json();
        }
      } catch (error) {
        payload = FALLBACK_RULES;
      }
    }

    const normalized = normalizeRules(payload);
    cachedRules = normalized.supplements;
    cachedByKey = normalized.byKey;
    return { rules: cachedRules, byKey: cachedByKey };
  }

  function getRulesSync() {
    if (!cachedRules || !cachedByKey) {
      const normalized = normalizeRules(FALLBACK_RULES);
      cachedRules = normalized.supplements;
      cachedByKey = normalized.byKey;
    }
    return { rules: cachedRules, byKey: cachedByKey };
  }

  function buildSupplementContext(input) {
    const bodyWeightKg = Number(input.bodyWeightKg) || 0;
    const bodyFatPercent = Number(input.bodyFatPercent);
    const leanBodyMassKg = Number.isFinite(bodyFatPercent)
      ? bodyWeightKg * (1 - (bodyFatPercent / 100))
      : bodyWeightKg;
    const wakeMin = parseTime(input.wakeUpTime || '07:00', 7 * 60);
    const hasWorkoutTiming = !!(input.hasWorkoutTiming || input.workoutStartTime);
    const workoutStartMin = hasWorkoutTiming ? parseTime(input.workoutStartTime || '18:00', 18 * 60) : null;
    const workoutDurationMinutes = Number(input.workoutDurationMinutes) || 90;
    const workoutEndMin = Number.isFinite(workoutStartMin) ? workoutStartMin + workoutDurationMinutes : null;
    const sleepMin = parseTime(input.plannedSleepTime || '23:00', 23 * 60);
    const timeGapHours = Number.isFinite(workoutStartMin)
      ? (((sleepMin - workoutStartMin) + 1440) % 1440) / 60
      : null;

    return {
      bodyWeightKg,
      bodyFatPercent: Number.isFinite(bodyFatPercent) ? bodyFatPercent : null,
      leanBodyMassKg,
      percent1RM: Number(input.percent1RM) || 0,
      postRPE: Number(input.postRPE) || 0,
      workoutStartTime: input.workoutStartTime || '',
      workoutDurationMinutes,
      plannedSleepTime: input.plannedSleepTime || '23:00',
      wakeUpTime: input.wakeUpTime || '07:00',
      gender: input.gender || 'male',
      cyclePhase: input.cyclePhase || 'unknown',
      isRestDay: !!input.isRestDay,
      selectedSupplements: Array.isArray(input.selectedSupplements) ? input.selectedSupplements.slice() : [],
      hasWorkoutTiming,
      wakeMin,
      workoutStartMin,
      workoutEndMin,
      sleepMin,
      timeGapHours
    };
  }

  function evaluateRule(rule, context, isSelected) {
    const results = { owned: [], optional: [], warnings: [] };
    const timingRules = Array.isArray(rule.timing_rules) ? rule.timing_rules : [];
    const matchingRules = timingRules.filter((timingRule) => matchesConditions(timingRule.conditions, context));
    const relaxedRules = timingRules.filter((timingRule) => matchesConditionsRelaxed(timingRule.conditions, context));

    if (!matchingRules.length) {
      if (isSelected) {
        const forbiddenContexts = Array.isArray(rule.constraints?.forbidden_contexts) ? rule.constraints.forbidden_contexts : [];
        if (forbiddenContexts.includes('sleep_gap_lt_6h') && relaxedRules.length && Number.isFinite(context.timeGapHours) && context.timeGapHours < 6) {
          results.warnings.push(createHint(rule, context, 'warning', rule.ui_notes?.warning || 'Blocked by sleep proximity.'));
          return results;
        }
        const needsTiming = relaxedRules.some((timingRule) => timingRule.conditions?.requireWorkoutTiming);
        if (needsTiming && !context.hasWorkoutTiming) {
          results.optional.push(createHint(rule, context, 'optional', 'Workout timing is missing, so this stays as a timing suggestion.'));
        }
      }
      return results;
    }

    const forbiddenContexts = Array.isArray(rule.constraints?.forbidden_contexts) ? rule.constraints.forbidden_contexts : [];
    if (forbiddenContexts.includes('sleep_gap_lt_6h') && Number.isFinite(context.timeGapHours) && context.timeGapHours < 6) {
      const blockedByIntensity = matchingRules.some((timingRule) => {
        const minPct = timingRule.conditions?.minPercent1RM;
        return !Number.isFinite(minPct) || context.percent1RM >= minPct;
      });
      if (blockedByIntensity) {
        results.warnings.push(createHint(rule, context, 'warning', rule.ui_notes?.warning || 'Blocked by sleep proximity.'));
      }
      return results;
    }

    const requiredBundle = Array.isArray(rule.interaction_network?.requires_bundle_with)
      ? rule.interaction_network.requires_bundle_with.filter((key) => !context.selectedSupplements.includes(key))
      : [];
    if (isSelected && requiredBundle.length) {
      results.warnings.push(createHint(rule, context, 'warning', `${rule.ui_notes?.warning || 'Bundle requirement not met.'} Missing: ${requiredBundle.join(', ')}`));
      return results;
    }

    if (!isSelected) {
      if (rule.optional_when_unselected) {
        results.optional.push(createHint(rule, context, 'optional'));
      }
      return results;
    }

    matchingRules.forEach((timingRule) => {
      const anchorMinutes = getAnchorMinutes(timingRule.anchor, context);
      if (!Number.isFinite(anchorMinutes)) {
        results.optional.push(createHint(rule, context, 'optional', 'Timing data is missing, so this stays as a suggestion.'));
        return;
      }

      const splitOffsets = Array.isArray(timingRule.split_offsets_minutes) && timingRule.split_offsets_minutes.length
        ? timingRule.split_offsets_minutes
        : [0];
      const splitCount = splitOffsets.length;

      splitOffsets.forEach((extraOffset, index) => {
        let totalMinutes = anchorMinutes + (Number(timingRule.offset_minutes) || 0) + (Number(extraOffset) || 0);
        if (timingRule.female_luteal_offset_delta_minutes && context.gender === 'female' && context.cyclePhase === 'luteal') {
          totalMinutes += Number(timingRule.female_luteal_offset_delta_minutes) || 0;
        }

        let item = createItem(
          rule,
          context,
          timingRule,
          totalMinutes,
          'supplement',
          splitCount > 1 ? `${rule.ui_notes?.primary || ''} Split part ${index + 1}/${splitCount}.`.trim() : undefined,
          splitCount > 1 ? splitCount : null
        );

        const separationTargets = Array.isArray(rule.interaction_network?.requires_separation_from)
          ? rule.interaction_network.requires_separation_from.filter((key) => context.selectedSupplements.includes(key))
          : [];
        if (separationTargets.length) {
          item.time += 30;
          item.label = formatTime(item.time);
          item.note = `${item.note} Stagger away from ${separationTargets.join(', ')}.`;
        }

        results.owned.push(item);
      });
    });

    return results;
  }

  function evaluateRules(options) {
    const rulesByKey = options.rulesByKey || getRulesSync().byKey;
    const selectedSupplements = Array.isArray(options.selectedSupplements) ? options.selectedSupplements : [];
    const context = buildSupplementContext(Object.assign({}, options.context, { selectedSupplements }));
    const owned = [];
    const optional = [];
    const warnings = [];

    Object.keys(rulesByKey).forEach((key) => {
      const outcome = evaluateRule(rulesByKey[key], context, selectedSupplements.includes(key));
      owned.push.apply(owned, outcome.owned);
      optional.push.apply(optional, outcome.optional);
      warnings.push.apply(warnings, outcome.warnings);
    });

    owned.sort((a, b) => (a.time || 0) - (b.time || 0));
    optional.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    warnings.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return {
      context,
      owned,
      optional: options.includeOptional ? optional : [],
      warnings
    };
  }

  window.SupplementRuleEngine = {
    primeRules,
    getRulesSync,
    buildSupplementContext,
    evaluateRules,
    parseTime,
    formatTime
  };
})();
