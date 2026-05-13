(function () {
  const FALLBACK_RULES = {
    version: 'fallback-v1',
    rule_set_name: 'Powerlifting Macro Runtime Fallback',
    energy_availability: {
      operational_defaults: {
        bulk_target_ea_floor: 45,
        strength_target_ea_floor: 45,
        cut_target_ea_floor_male: 25,
        cut_target_ea_floor_female: 30
      }
    },
    goal_profiles: {
      bulk: {
        energy_management: {
          recommended_daily_surplus_kcal: [200, 300]
        },
        macronutrient_distribution: {
          protein_range_g_per_kg_lbm: [1.9, 2.6],
          fat_range_g_per_kg_tbw: [1.0, 1.5],
          carb_range_g_per_kg_tbw: [4.0, 7.0]
        }
      },
      strength: {
        energy_management: {
          recommended_daily_surplus_kcal: [-100, 100]
        },
        macronutrient_distribution: {
          protein_range_g_per_kg_lbm: [2.0, 2.5],
          fat_range_g_per_kg_tbw: [1.0, 1.3],
          carb_range_g_per_kg_tbw: [3.0, 5.0]
        }
      },
      cut: {
        energy_management: {
          recommended_daily_deficit_kcal: [-500, -200],
          male_ea_floor: 25,
          female_ea_floor: 30
        },
        macronutrient_distribution: {
          protein_range_g_per_kg_lbm: [2.5, 4.2],
          fat_range_g_per_kg_tbw: [0.8, 1.0],
          carb_range_g_per_kg_tbw: [2.0, 4.0]
        }
      }
    },
    day_type_multipliers: {
      rest: { carb_multiplier: 0.70, protein_multiplier: 1.00, fat_multiplier: 1.05, carb_timing_enabled: false },
      light: { carb_multiplier: 0.85, protein_multiplier: 1.00, fat_multiplier: 1.00, carb_timing_enabled: true },
      medium: { carb_multiplier: 1.00, protein_multiplier: 1.00, fat_multiplier: 1.00, carb_timing_enabled: true },
      heavy: { carb_multiplier: 1.15, protein_multiplier: 1.00, fat_multiplier: 0.98, carb_timing_enabled: true }
    },
    macro_formulas: {
      fat: {
        male_testosterone_floor_g_per_kg_tbw: 0.8,
        general_floor_g_per_kg_tbw: 0.8
      },
      carbohydrate: {
        cut_hard_floor_g_per_kg_tbw: 2.0
      },
      training_day_carb_timing: {
        pre: {
          tbw_range_g_per_kg: [1.0, 1.5],
          protein_g_per_kg_tbw: 0.3
        },
        intra: {
          fast_carb_g_per_hour: [30, 60]
        },
        post: {
          carb_g_per_kg_tbw: [1.0, 1.2],
          protein_g_per_kg_tbw: [0.3, 0.4]
        }
      }
    },
    compatibility: {
      recomp_maps_to: 'strength',
      meet_prep_enabled: false,
      meet_prep_message: 'meet_prep is not enabled in the current H5 MVP runtime.'
    }
  };

  let cachedRules = null;
  let cachedSource = 'fallback';
  let attemptedRemoteLoad = false;

  function midpoint(range, fallback) {
    if (Array.isArray(range) && range.length >= 2) {
      return (Number(range[0]) + Number(range[1])) / 2;
    }
    return fallback;
  }

  function normalizeGoalKey(goal) {
    const raw = String(goal || '').trim().toLowerCase();
    const normalized = raw.replace(/\s+/g, '_').replace(/-/g, '_');
    const aliasMap = {
      bulk: 'bulk',
      gain: 'bulk',
      hypertrophy: 'bulk',
      mass: 'bulk',
      '\u589e\u808c': 'bulk',
      '\u589e\u808c\u671f': 'bulk',
      strength: 'strength',
      maintenance: 'strength',
      maintain: 'strength',
      power: 'strength',
      '\u529b\u91cf': 'strength',
      '\u529b\u91cf\u671f': 'strength',
      cut: 'cut',
      fat_loss: 'cut',
      diet: 'cut',
      '\u51cf\u8102': 'cut',
      '\u51cf\u8102\u671f': 'cut',
      recomp: 'recomp',
      recomposition: 'recomp',
      body_recomp: 'recomp',
      '\u4f53\u6210\u5206\u91cd\u7ec4': 'recomp',
      '\u91cd\u7ec4': 'recomp',
      meet: 'meet_prep',
      meet_prep: 'meet_prep',
      peaking: 'meet_prep',
      '\u8d5b\u524d': 'meet_prep',
      '\u8d5b\u524d\u51c6\u5907': 'meet_prep'
    };
    return aliasMap[normalized] || aliasMap[raw] || 'strength';
  }

  function normalizeRules(payload) {
    const data = payload && typeof payload === 'object' ? payload : FALLBACK_RULES;
    return {
      version: data.version || FALLBACK_RULES.version,
      data,
      source: cachedSource
    };
  }

  async function primeRules() {
    if (cachedRules && (attemptedRemoteLoad || cachedSource === 'json')) {
      return cachedRules;
    }

    let payload = cachedRules && cachedRules.data ? cachedRules.data : FALLBACK_RULES;
    attemptedRemoteLoad = true;
    cachedSource = cachedSource || 'fallback';

    if (typeof fetch === 'function') {
      try {
        const response = await fetch('macro_algorithm_rules.json');
        if (response.ok) {
          payload = await response.json();
          cachedSource = 'json';
        }
      } catch (error) {
        payload = FALLBACK_RULES;
        cachedSource = 'fallback';
      }
    }

    cachedRules = normalizeRules(payload);
    cachedRules.source = cachedSource;
    return cachedRules;
  }

  function getRulesSync() {
    if (!cachedRules) {
      cachedSource = 'fallback';
      cachedRules = normalizeRules(FALLBACK_RULES);
    }
    return cachedRules;
  }

  function buildMacroContext(input) {
    const goalKey = normalizeGoalKey(input.goal || input.goalKey);
    const mappedGoalKey = goalKey === 'recomp' || goalKey === 'meet_prep' ? 'strength' : goalKey;
    const weightKg = Number(input.weightKg ?? input.bodyWeight ?? input.bodyWeightKg) || 0;
    const bodyFatPercent = Number(input.bodyFatPercent ?? input.bodyFat);
    const leanBodyMassKg = Number.isFinite(bodyFatPercent)
      ? weightKg * (1 - (bodyFatPercent / 100))
      : weightKg * 0.85;
    const dayTypes = Array.isArray(input.dayTypes)
      ? input.dayTypes.slice(0, 7)
      : Array.from({ length: 7 }, (_, index) => (input.dayTypes && input.dayTypes[index]) || 'rest');

    return {
      goalKey,
      mappedGoalKey,
      weightKg,
      bodyFatPercent: Number.isFinite(bodyFatPercent) ? bodyFatPercent : null,
      leanBodyMassKg,
      gender: input.gender || 'male',
      tdee: Number(input.tdee) || 0,
      avgIntensity: Number(input.avgIntensity) || 1.5,
      dayTypes
    };
  }

  function evaluateMacroPlan(input) {
    const rules = (input && input.rules) || getRulesSync().data;
    const context = buildMacroContext(input && input.context ? input.context : input || {});
    const goalProfile = rules?.goal_profiles?.[context.mappedGoalKey] || FALLBACK_RULES.goal_profiles.strength;
    const defaults = rules?.energy_availability?.operational_defaults || FALLBACK_RULES.energy_availability.operational_defaults;
    const warnings = [];

    if (context.goalKey === 'meet_prep') {
      warnings.push((rules?.compatibility?.meet_prep_message) || FALLBACK_RULES.compatibility.meet_prep_message);
    }

    const proteinPerKgLbm = midpoint(goalProfile?.macronutrient_distribution?.protein_range_g_per_kg_lbm, 2.0);
    const fatPerKgTbw = midpoint(goalProfile?.macronutrient_distribution?.fat_range_g_per_kg_tbw, 1.0);
    const carbPerKgTbw = midpoint(goalProfile?.macronutrient_distribution?.carb_range_g_per_kg_tbw, 4.0);

    return {
      context,
      goalKey: context.goalKey,
      mappedGoalKey: context.mappedGoalKey,
      source: getRulesSync().source,
      warnings,
      disabled: context.goalKey === 'meet_prep',
      eaThresholds: {
        bulk: defaults.bulk_target_ea_floor,
        strength: defaults.strength_target_ea_floor,
        cutMale: defaults.cut_target_ea_floor_male,
        cutFemale: defaults.cut_target_ea_floor_female
      },
      baseDaily: {
        protein: Math.round(context.leanBodyMassKg * proteinPerKgLbm),
        fat: Math.round(context.weightKg * fatPerKgTbw),
        carb: Math.round(context.weightKg * carbPerKgTbw)
      },
      dayTypeMultipliers: rules?.day_type_multipliers || FALLBACK_RULES.day_type_multipliers
    };
  }

  window.MacroRuleEngine = {
    primeRules,
    getRulesSync,
    normalizeGoalKey,
    buildMacroContext,
    evaluateMacroPlan
  };
})();
