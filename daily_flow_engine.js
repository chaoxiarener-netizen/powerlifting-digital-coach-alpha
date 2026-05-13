(function() {
  var PRIORITY_MAP = {
    warning: 100,
    training: 80,
    meal: 60,
    recovery: 50,
    supplement: 40,
    sleep: 30,
    wake: 20
  };

  var TYPE_LABELS = {
    rest: 'rest',
    light: 'light',
    medium: 'medium',
    heavy: 'heavy'
  };

  var LIFT_LABELS = {
    squat: '深蹲',
    bench: '卧推',
    deadlift: '硬拉',
    accessory: '辅助',
    rest: '恢复'
  };

  var SUPPLEMENT_META = {
    d3k2: { icon: '☀️', name: '维生素 D3+K2' },
    omega3: { icon: '🐟', name: 'Omega-3' },
    creatine: { icon: '💪', name: '一水肌酸' },
    protein: { icon: '🥛', name: '乳清蛋白/EAA' },
    caffeine: { icon: '⚡', name: '咖啡因' },
    betaAlanine: { icon: '🔁', name: 'β-丙氨酸' },
    citrulline: { icon: '🫀', name: 'L-瓜氨酸' },
    nitrate: { icon: '🥤', name: '甜菜根/硝酸盐' },
    magnesium: { icon: '🌙', name: '镁' },
    zinc: { icon: '🧪', name: '锌' },
    zincMagnesium: { icon: '🌙', name: 'ZMA' },
    collagen: { icon: '🦴', name: '胶原蛋白肽' },
    turmeric: { icon: '🟡', name: '姜黄素' },
    tartCherry: { icon: '🍒', name: '酸樱桃提取物' },
    melatonin: { icon: '😴', name: '褪黑素' },
    alphaGPC: { icon: '🧠', name: 'Alpha-GPC' },
    lTheanine: { icon: '🍵', name: 'L-茶氨酸' },
    sodiumBicarbonate: { icon: '🧂', name: '碳酸氢钠' },
    lionsMane: { icon: '🍄', name: '狮鬃菇提取物' },
    alphaLipoicAcid: { icon: '🧬', name: 'α-硫辛酸' },
    glutamine: { icon: '🧃', name: '谷氨酰胺' },
    hmb: { icon: '🛡️', name: 'HMB' },
    betaEcdysterone: { icon: '🧪', name: 'β-蜕皮甾酮' },
    chromium: { icon: '⚙️', name: '吡啶甲酸铬' },
    berberine: { icon: '🌿', name: '小檗碱' }
  };

  var RULE_SECTION_LABELS = {
    Baseline: '基础营养',
    'Pre-workout': '训练前准备',
    Recovery: '恢复期',
    'Night recovery': '夜间恢复',
    '风险提示': '风险提示'
  };

  function parseTimeToMinutes(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    var time = String(value || '').trim();
    if (!/^\d{1,2}:\d{2}$/.test(time)) return 0;
    var parts = time.split(':').map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  }

  function formatMinutesToClock(minutes) {
    var normalized = ((Number(minutes) % 1440) + 1440) % 1440;
    var hour = Math.floor(normalized / 60);
    var minute = normalized % 60;
    return String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
  }

  function normalizeEventMinute(eventMin, wakeMin) {
    if (!Number.isFinite(eventMin)) return eventMin;
    if (eventMin < wakeMin) return eventMin + 1440;
    return eventMin;
  }

  function normalizeSleepMinute(sleepMin, wakeMin, workoutStartMin) {
    if (!Number.isFinite(sleepMin)) return sleepMin;
    if (sleepMin <= wakeMin) return sleepMin + 1440;
    if (workoutStartMin != null && sleepMin <= workoutStartMin) return sleepMin + 1440;
    return sleepMin;
  }

  function formatOperationalTime(absoluteMinute) {
    var minute = Number(absoluteMinute);
    if (!Number.isFinite(minute)) return '--:--';
    var dayOffset = Math.floor(minute / 1440);
    var clock = formatMinutesToClock(minute);
    return dayOffset > 0 ? '次日 ' + clock : clock;
  }

  function getDayIndexFromDateString(dateString) {
    if (typeof dateString !== 'string' || !dateString.trim()) return null;
    var parsed = new Date(dateString + 'T12:00:00');
    if (Number.isNaN(parsed.getTime())) return null;
    return window.AppState ? window.AppState.getTodayDayIndex(parsed) : ((parsed.getDay() + 6) % 7);
  }

  function parseNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    var number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function getLiftLabel(lift) {
    return LIFT_LABELS[lift] || '训练';
  }

  function getTypeLabel(type) {
    return TYPE_LABELS[type] || type || '训练日';
  }

  function getCurrentLabelByEventType(type) {
    var map = {
      meal: '进食准备',
      training: '训练前准备',
      supplement: '补剂准备',
      sleep: '夜间恢复',
      wake: '起床后',
      warning: '风险提醒',
      recovery: '恢复管理'
    };
    return map[type] || '今日安排';
  }

  function normalizeOperationalMinute(time, wakeMin, options) {
    var settings = options || {};
    var minute = typeof time === 'number' ? time : parseTimeToMinutes(time);
    if (!Number.isFinite(minute)) return 0;
    if (settings.kind === 'sleep') {
      return normalizeSleepMinute(minute, wakeMin, settings.workoutStartMin);
    }
    if (settings.referenceMin != null && settings.allowNextDay && minute < settings.referenceMin) {
      return minute + 1440;
    }
    return normalizeEventMinute(minute, wakeMin);
  }

  function buildMealTags(carb, protein, fat) {
    var tags = [];
    if (carb > 0) tags.push(carb + 'g 碳水');
    if (protein > 0) tags.push(protein + 'g 蛋白');
    if (fat > 0) tags.push(fat + 'g 脂肪');
    return tags;
  }

  function buildMealMeta(mealName, fromSavedPlan) {
    if (mealName === '训练中') return '训练中的快速补给';
    if (mealName.indexOf('训练前') >= 0) return '训练前进食窗口';
    if (mealName.indexOf('训练后') >= 0) return '训练后恢复补给';
    if (mealName.indexOf('睡前') >= 0 || mealName.indexOf('夜间') >= 0) return '夜间恢复进食';
    return fromSavedPlan ? '已保存的餐次安排' : '默认餐次安排';
  }

  function buildSupplementMeta(item) {
    if (item.warning) return '已转入风险提醒';
    if (item.section && item.section.indexOf('睡前') >= 0) return '睡前恢复';
    if (item.section && item.section.indexOf('训练前') >= 0) return '训练前准备';
    if (item.section && item.section.indexOf('训练后') >= 0) return '训练后恢复';
    if (item.section && item.section.indexOf('早餐') >= 0) return '白天基础补给';
    return item.section || '已纳入补剂时间流';
  }

  function resolveSelectedSupplements(context, sameDaySingle) {
    if (Array.isArray(context.selectedSupplements) && context.selectedSupplements.length) {
      return context.selectedSupplements.slice();
    }
    if (context.mode === 'single_day' && sameDaySingle && context.singleDayPlan && context.singleDayPlan.exists && context.singleDayPlan.selectedSupplements.length) {
      return context.singleDayPlan.selectedSupplements.slice();
    }
    return context.supplementState && context.supplementState.exists
      ? context.supplementState.selectedSupplements.slice()
      : [];
  }

  function getMacros(context, type) {
    if (context.flowMacros) {
      return {
        carb: parseNumber(context.flowMacros.carb) || 0,
        protein: parseNumber(context.flowMacros.protein) || 0,
        fat: parseNumber(context.flowMacros.fat) || 0
      };
    }
    if (context.todayMacro && context.todayMacro.macros) {
      return {
        carb: parseNumber(context.todayMacro.macros.carb) || 0,
        protein: parseNumber(context.todayMacro.macros.protein) || 0,
        fat: parseNumber(context.todayMacro.macros.fat) || 0
      };
    }
    if (context.macroPlan && context.macroPlan.exists && context.macroPlan.raw && context.macroPlan.raw.macros && context.macroPlan.raw.macros.byType && context.macroPlan.raw.macros.byType[type]) {
      return {
        carb: parseNumber(context.macroPlan.raw.macros.byType[type].carb) || 0,
        protein: parseNumber(context.macroPlan.raw.macros.byType[type].protein) || 0,
        fat: parseNumber(context.macroPlan.raw.macros.byType[type].fat) || 0
      };
    }
    var weight = (context.profile && context.profile.weight) || 70;
    var protein = Math.round(weight * 2);
    var fat = Math.round(weight * 1);
    var baseCarb = 250;
    var fallback = {
      rest: { carb: Math.round(baseCarb * 0.6), protein: protein, fat: fat },
      light: { carb: Math.round(baseCarb * 0.75), protein: protein, fat: fat },
      medium: { carb: baseCarb, protein: protein, fat: fat },
      heavy: { carb: Math.round(baseCarb * 1.3), protein: protein, fat: fat }
    };
    return fallback[type] || fallback.rest;
  }

  function getFallbackMeals(type, resolved, macros) {
    if (type === 'rest') {
      return [
        { name: '早餐', minute: resolved.wakeMin + 30, carb: Math.round(macros.carb * 0.28), protein: Math.round(macros.protein * 0.28), fat: Math.round(macros.fat * 0.28) },
        { name: '午餐', minute: resolved.wakeMin + 300, carb: Math.round(macros.carb * 0.34), protein: Math.round(macros.protein * 0.32), fat: Math.round(macros.fat * 0.32) },
        { name: '晚餐', minute: resolved.wakeMin + 690, carb: Math.round(macros.carb * 0.24), protein: Math.round(macros.protein * 0.25), fat: Math.round(macros.fat * 0.25) },
        { name: '睡前加餐', minute: resolved.wakeMin + 900, carb: Math.round(macros.carb * 0.14), protein: Math.round(macros.protein * 0.15), fat: Math.round(macros.fat * 0.15) }
      ];
    }
    return [
      { name: '早餐', minute: resolved.wakeMin + 30, carb: Math.round(macros.carb * 0.20), protein: Math.round(macros.protein * 0.22), fat: Math.round(macros.fat * 0.24) },
      { name: '训练前餐', minute: resolved.workoutStartMin - 120, carb: Math.round(macros.carb * 0.28), protein: Math.round(macros.protein * 0.20), fat: Math.round(macros.fat * 0.12) },
      { name: '训练中', minute: resolved.workoutStartMin, carb: Math.round(macros.carb * 0.12), protein: 0, fat: 0 },
      { name: '训练后餐', minute: resolved.workoutEndMin + 30, carb: Math.round(macros.carb * 0.24), protein: Math.round(macros.protein * 0.33), fat: Math.round(macros.fat * 0.18) },
      { name: '晚餐/夜间恢复', minute: Math.max(resolved.workoutEndMin + 60, resolved.sleepMin - 180), carb: Math.round(macros.carb * 0.16), protein: Math.round(macros.protein * 0.25), fat: Math.round(macros.fat * 0.30) }
    ];
  }

  function resolveMealMinute(resolved, meal) {
    if (typeof meal.minute === 'number' && Number.isFinite(meal.minute)) return meal.minute;
    if (meal.time === '训练中') return resolved.workoutStartMin;
    if (/^\d{2}:\d{2}$/.test(meal.time || '')) {
      return normalizeOperationalMinute(meal.time, resolved.wakeMin, {
        kind: 'event',
        referenceMin: resolved.workoutStartRaw,
        allowNextDay: true
      });
    }
    return resolved.wakeMin + 30;
  }

  function localizeRuleSection(section) {
    return RULE_SECTION_LABELS[section] || section || '补剂';
  }

  function localizeSupplementName(item) {
    return (SUPPLEMENT_META[item.key] && SUPPLEMENT_META[item.key].name) || item.name || item.key;
  }

  function getSupplementIcon(key) {
    return (SUPPLEMENT_META[key] && SUPPLEMENT_META[key].icon) || '💊';
  }

  function buildResolvedContext(context) {
    var mode = context.mode || (window.AppState ? window.AppState.getUsageMode() : 'weekly');
    var todayTraining = context.todayTraining || {};
    var singleDayPlan = context.singleDayPlan || { exists: false };
    var supplementState = context.supplementState || { exists: false, selectedSupplements: [] };
    var sameDaySingle = singleDayPlan.exists && getDayIndexFromDateString(singleDayPlan.date) === context.dayIndex;
    var type = (todayTraining && todayTraining.type) || context.flowDayType || 'rest';
    var selectedSupplements = resolveSelectedSupplements(context, sameDaySingle);
    var preferWeeklyTraining = mode !== 'single_day' || !sameDaySingle;
    var wakeUpTime = (mode === 'single_day' && sameDaySingle && singleDayPlan.wakeUpTime)
      ? singleDayPlan.wakeUpTime
      : ((supplementState && supplementState.wakeUpTime) || '07:00');
    var workoutStartTime = '';
    if (!preferWeeklyTraining && singleDayPlan.workoutStartTime) {
      workoutStartTime = singleDayPlan.workoutStartTime;
    } else if (todayTraining && todayTraining.startTime) {
      workoutStartTime = todayTraining.startTime;
    } else if (supplementState && supplementState.workoutStartTime) {
      workoutStartTime = supplementState.workoutStartTime;
    } else {
      workoutStartTime = '18:00';
    }
    var workoutDurationMinutes = 90;
    if (!preferWeeklyTraining && singleDayPlan.workoutDurationMinutes) {
      workoutDurationMinutes = singleDayPlan.workoutDurationMinutes;
    } else if (todayTraining && todayTraining.duration) {
      workoutDurationMinutes = todayTraining.duration;
    } else if (supplementState && supplementState.workoutDurationMinutes) {
      workoutDurationMinutes = supplementState.workoutDurationMinutes;
    }
    var plannedSleepTime = (!preferWeeklyTraining && singleDayPlan.plannedSleepTime)
      ? singleDayPlan.plannedSleepTime
      : ((supplementState && supplementState.plannedSleepTime) || (todayTraining && todayTraining.plannedSleepTime) || '23:00');
    var wakeMin = parseTimeToMinutes(wakeUpTime || '07:00');
    var workoutStartRaw = parseTimeToMinutes(workoutStartTime || '18:00');
    var workoutStartMin = normalizeOperationalMinute(workoutStartTime || '18:00', wakeMin, { kind: 'event' });
    var workoutEndMin = workoutStartMin + (workoutDurationMinutes || 90);
    var sleepMin = normalizeOperationalMinute(plannedSleepTime || '23:00', wakeMin, { kind: 'sleep', workoutStartMin: workoutStartRaw });
    var percent1RM = todayTraining && todayTraining.percent1RM != null
      ? todayTraining.percent1RM
      : parseNumber((supplementState.raw || {}).percent1RM || (supplementState.raw || {}).customPercent);
    var postRPE = todayTraining && todayTraining.rpe != null
      ? todayTraining.rpe
      : parseNumber((supplementState.raw || {}).postRPE);
    var bodyWeightKg = (!preferWeeklyTraining && parseNumber(singleDayPlan.bodyWeightKg))
      || (context.profile && parseNumber(context.profile.weight))
      || parseNumber(supplementState.bodyWeightKg)
      || 70;

    return {
      mode: mode,
      type: type,
      profile: context.profile || {},
      todayTraining: todayTraining,
      todayMacro: context.todayMacro || null,
      macroPlan: context.macroPlan || { exists: false },
      supplementState: supplementState,
      singleDayPlan: singleDayPlan,
      dayIndex: context.dayIndex,
      sameDaySingle: sameDaySingle,
      selectedSupplements: selectedSupplements,
      wakeUpTime: wakeUpTime,
      workoutStartTime: workoutStartTime,
      workoutDurationMinutes: workoutDurationMinutes,
      plannedSleepTime: plannedSleepTime,
      wakeMin: wakeMin,
      workoutStartRaw: workoutStartRaw,
      workoutStartMin: workoutStartMin,
      workoutEndMin: workoutEndMin,
      sleepMin: sleepMin,
      percent1RM: percent1RM || 0,
      postRPE: postRPE || 0,
      timeGapHours: (sleepMin - workoutStartMin) / 60,
      bodyWeightKg: bodyWeightKg,
      isRestDay: todayTraining ? !!todayTraining.isRestDay : type === 'rest',
      macros: getMacros(context, type),
      mealPlansByType: context.mealPlansByType || (context.macroPlan && context.macroPlan.raw && context.macroPlan.raw.mealPlans && context.macroPlan.raw.mealPlans.byType) || {},
      flowCarbTiming: context.carbTiming || (context.macroPlan && context.macroPlan.raw && context.macroPlan.raw.carbTiming) || { pre: 0, intra: 0, post: 0 }
    };
  }

  function buildSupplementOutputs(resolved) {
    var engine = window.SupplementRuleEngine;
    if (!engine || typeof engine.evaluateRules !== 'function' || typeof engine.buildSupplementContext !== 'function') {
      return { owned: [], optional: [], warnings: [] };
    }
    var rules = engine.getRulesSync ? engine.getRulesSync() : { byKey: {} };
    var supplementContext = engine.buildSupplementContext({
      bodyWeightKg: resolved.bodyWeightKg,
      percent1RM: resolved.percent1RM,
      postRPE: resolved.postRPE,
      workoutStartTime: resolved.workoutStartTime,
      workoutDurationMinutes: resolved.workoutDurationMinutes,
      plannedSleepTime: resolved.plannedSleepTime,
      wakeUpTime: resolved.wakeUpTime,
      gender: resolved.profile.gender || 'male',
      cyclePhase: resolved.profile.cyclePhase || 'unknown',
      isRestDay: resolved.isRestDay,
      selectedSupplements: resolved.selectedSupplements,
      hasWorkoutTiming: !!resolved.workoutStartTime
    });
    var evaluation = engine.evaluateRules({
      rulesByKey: rules.byKey || {},
      selectedSupplements: resolved.selectedSupplements,
      context: supplementContext,
      includeOptional: true
    });

    function decorate(item) {
      return {
        key: item.key,
        icon: getSupplementIcon(item.key),
        name: localizeSupplementName(item),
        section: localizeRuleSection(item.section),
        note: item.note || '',
        amount: item.dose || '',
        warning: item.kind === 'warning',
        time: normalizeOperationalMinute(item.time, resolved.wakeMin, {
          kind: item.section === 'Night recovery' ? 'sleep' : 'event',
          workoutStartMin: resolved.workoutStartRaw,
          referenceMin: resolved.workoutStartRaw,
          allowNextDay: true
        })
      };
    }

    var warnings = (evaluation.warnings || []).map(decorate);
    var owned = (evaluation.owned || []).map(decorate).filter(function(item) {
      return !(item.key === 'caffeine' && resolved.timeGapHours < 6);
    });
    var hasCaffeineWarning = warnings.some(function(item) { return item.key === 'caffeine'; });
    var hasLateCaffeine = resolved.selectedSupplements.indexOf('caffeine') >= 0 && resolved.timeGapHours < 6;
    if (hasLateCaffeine && !hasCaffeineWarning) {
      warnings.push({
        key: 'caffeine',
        icon: getSupplementIcon('caffeine'),
        name: localizeSupplementName({ key: 'caffeine', name: '咖啡因' }),
        note: '距离计划入睡时间过近，当前不建议加入咖啡因。',
        amount: '',
        section: '风险提示',
        warning: true,
        time: resolved.workoutStartMin
      });
    }
    return {
      owned: owned,
      optional: (evaluation.optional || []).map(decorate),
      warnings: warnings
    };
  }

  function buildDailyFlowEvents(context) {
    if (!context) return [];
    if ((!context.singleDayPlan || !context.singleDayPlan.exists)
      && (!context.todayTraining || !context.todayTraining.exists)
      && (!context.supplementState || !context.supplementState.exists)
      && (!context.macroPlan || !context.macroPlan.exists)) {
      return [];
    }
    var resolved = buildResolvedContext(context);
    var supplementOutputs = buildSupplementOutputs(resolved);
    var events = [];
    var eventId = 0;

    function addEvent(type, absoluteMinute, title, meta, detail, tags, source, priority) {
      if (!Number.isFinite(absoluteMinute)) return;
      events.push({
        id: 'evt_' + (++eventId),
        absoluteMinute: absoluteMinute,
        displayTime: formatOperationalTime(absoluteMinute),
        type: type,
        title: title,
        meta: meta || '',
        detail: detail || '',
        tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
        priority: priority != null ? priority : (PRIORITY_MAP[type] || 10),
        source: source || 'derived'
      });
    }

    addEvent(
      'wake',
      resolved.wakeMin,
      '🌅 起床',
      '开始新的一天',
      '起床时间：' + resolved.wakeUpTime + '\n计划入睡：' + formatOperationalTime(resolved.sleepMin),
      [],
      'wakeUpTime'
    );

    var meals = [];
    if (resolved.todayMacro && Array.isArray(resolved.todayMacro.meals) && resolved.todayMacro.meals.length) {
      meals = resolved.todayMacro.meals.map(function(meal) {
        return {
          name: meal.name || '餐次',
          time: meal.time,
          carb: parseNumber(meal.carb) || 0,
          protein: parseNumber(meal.protein) || 0,
          fat: parseNumber(meal.fat) || 0,
          fromSavedPlan: true
        };
      });
    } else if (resolved.mealPlansByType && resolved.mealPlansByType[resolved.type] && resolved.mealPlansByType[resolved.type].length) {
      meals = resolved.mealPlansByType[resolved.type].map(function(meal) {
        return {
          name: meal.name || '餐次',
          time: meal.time,
          carb: parseNumber(meal.carb) || 0,
          protein: parseNumber(meal.protein) || 0,
          fat: parseNumber(meal.fat) || 0,
          fromSavedPlan: true
        };
      });
    } else {
      meals = getFallbackMeals(resolved.type, resolved, resolved.macros).map(function(meal) {
        return Object.assign({}, meal, { fromSavedPlan: false });
      });
    }

    meals.forEach(function(meal) {
      var mealMinute = resolveMealMinute(resolved, meal);
      var mealTags = buildMealTags(meal.carb, meal.protein, meal.fat);
      addEvent(
        'meal',
        mealMinute,
        meal.name,
        buildMealMeta(meal.name, !!meal.fromSavedPlan),
        '餐次时间：' + formatOperationalTime(mealMinute) + '\n营养构成：' + (mealTags.join(' · ') || '未提供'),
        mealTags,
        meal.fromSavedPlan ? 'macroPlan' : 'fallbackMeals'
      );
    });

    if (resolved.todayTraining && resolved.todayTraining.exists && !resolved.todayTraining.isRestDay) {
      addEvent(
        'training',
        resolved.workoutStartMin,
        '🏋️ 训练开始',
        getLiftLabel(resolved.todayTraining.lift) + ' · ' + resolved.type + ' · ' + (resolved.todayTraining.rpe != null ? ('RPE ' + resolved.todayTraining.rpe) : 'RPE --'),
        [
          (resolved.todayTraining.weight != null ? resolved.todayTraining.weight + 'kg' : '--') + ' × ' +
          (resolved.todayTraining.reps != null ? resolved.todayTraining.reps + '次' : '--') + ' × ' +
          (resolved.todayTraining.sets != null ? resolved.todayTraining.sets + '组' : '--'),
          (resolved.todayTraining.percent1RM != null ? resolved.todayTraining.percent1RM : '--') + '%1RM · ' +
          (resolved.todayTraining.rpe != null ? ('RPE ' + resolved.todayTraining.rpe) : 'RPE --') + ' · INOL ' +
          (resolved.todayTraining.inol != null ? resolved.todayTraining.inol : '--'),
          '训练来源：' + resolved.todayTraining.source
        ].join('\n'),
        [
          (resolved.todayTraining.percent1RM != null ? resolved.todayTraining.percent1RM : '--') + '%1RM',
          (resolved.todayTraining.duration || resolved.workoutDurationMinutes || 90) + ' 分钟'
        ],
        resolved.todayTraining.source || 'training'
      );
    } else if (resolved.type === 'rest' || (resolved.todayTraining && resolved.todayTraining.isRestDay)) {
      addEvent(
        'recovery',
        resolved.wakeMin + 120,
        '🧘 积极恢复',
        '休息日以轻活动、拉伸和营养管理为主。',
        '建议安排轻步行、拉伸或低强度恢复活动。\n训练来源：' + (resolved.todayTraining && resolved.todayTraining.source ? resolved.todayTraining.source : 'none'),
        ['休息日'],
        resolved.todayTraining && resolved.todayTraining.source ? resolved.todayTraining.source : 'rest'
      );
    } else if (resolved.mode === 'single_day') {
      addEvent(
        'warning',
        resolved.workoutStartMin,
        '⚠️ 单日训练数据不足',
        '当前为单日计划模式，但尚未填写训练强度。',
        '可回到轻量单日计划补充主项、组次、重量、RPE 等信息。',
        ['补充训练数据'],
        'single_day_missing',
        PRIORITY_MAP.warning
      );
    }

    supplementOutputs.owned.forEach(function(item) {
      addEvent(
        'supplement',
        item.time,
        item.icon + ' ' + item.name,
        buildSupplementMeta(item),
        (item.amount ? '剂量：' + item.amount : '剂量：按当前规则未单独展示') + '\n来源：' + item.section + '\n' + (item.note || '当前时点已纳入时间流。'),
        item.amount && item.amount !== '--' ? [item.amount] : [],
        item.key
      );
    });

    supplementOutputs.warnings.forEach(function(item) {
      addEvent(
        'warning',
        item.time,
        '⚠️ ' + item.name,
        item.note || '当前条件下已触发风险提醒。',
        (item.note || '当前条件下已触发风险提醒。') + '\n来源：' + item.section,
        [item.section],
        item.key,
        PRIORITY_MAP.warning
      );
    });

    addEvent(
      'recovery',
      resolved.sleepMin - 60,
      '🌙 睡前恢复准备',
      '检查蛋白、碳水、补水和夜间补剂是否收齐。',
      '建议在 ' + formatOperationalTime(resolved.sleepMin) + ' 前完成夜间恢复准备。',
      [resolved.type === 'rest' ? '休息日收口' : '训练日收口'],
      'sleep_prep'
    );

    addEvent(
      'sleep',
      resolved.sleepMin,
      '😴 计划入睡',
      '保证 7-9 小时睡眠以支持恢复。',
      '计划入睡时间：' + formatOperationalTime(resolved.sleepMin),
      [],
      'plannedSleepTime'
    );

    return events
      .filter(function(event) { return Number.isFinite(event.absoluteMinute); })
      .sort(function(a, b) {
        if (a.absoluteMinute !== b.absoluteMinute) return a.absoluteMinute - b.absoluteMinute;
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.id.localeCompare(b.id);
      });
  }

  function getNextActionFromEvents(events, now) {
    var list = Array.isArray(events) ? events.slice() : [];
    var current = now instanceof Date ? now : new Date(now || Date.now());
    var nowTime = formatMinutesToClock(current.getHours() * 60 + current.getMinutes());

    if (!list.length) {
      return {
        hasData: false,
        nowTime: nowTime,
        currentLabel: '等待作战数据',
        nextEvent: null,
        followingEvent: null,
        status: 'missing_data',
        message: '还没有足够数据生成下一步作战提示',
        nextAction: '先选择一种使用方式'
      };
    }

    var wakeEvent = list.find(function(item) { return item.type === 'wake'; }) || list[0];
    var wakeMin = ((wakeEvent.absoluteMinute % 1440) + 1440) % 1440;
    var nowMinute = current.getHours() * 60 + current.getMinutes();
    var nowOperational = nowMinute < wakeMin ? nowMinute + 1440 : nowMinute;
    var actionable = list.filter(function(item) { return item.type !== 'warning'; });

    if (!actionable.length) {
      return {
        hasData: false,
        nowTime: nowTime,
        currentLabel: '等待作战数据',
        nextEvent: null,
        followingEvent: null,
        status: 'missing_data',
        message: '还没有足够数据生成下一步作战提示',
        nextAction: '先选择一种使用方式'
      };
    }

    var nextIndex = actionable.findIndex(function(item) {
      return item.absoluteMinute >= nowOperational;
    });

    if (nextIndex === -1) {
      return {
        hasData: true,
        nowTime: nowTime,
        currentLabel: '今日执行已基本完成',
        nextEvent: null,
        followingEvent: null,
        status: 'done_for_day',
        message: '今天的关键事件已经结束，接下来以恢复和睡眠为主。'
      };
    }

    var nextEvent = actionable[nextIndex];
    var followingEvent = actionable[nextIndex + 1] || null;
    var previousEvent = nextIndex > 0 ? actionable[nextIndex - 1] : null;
    return {
      hasData: true,
      nowTime: nowTime,
      currentLabel: previousEvent ? getCurrentLabelByEventType(previousEvent.type) : '当前作战时间',
      nextEvent: {
        time: nextEvent.displayTime,
        title: nextEvent.title,
        meta: nextEvent.meta,
        type: nextEvent.type,
        minutesUntil: Math.max(0, nextEvent.absoluteMinute - nowOperational)
      },
      followingEvent: followingEvent ? {
        time: followingEvent.displayTime,
        title: followingEvent.title,
        meta: followingEvent.meta,
        type: followingEvent.type
      } : null,
      status: 'ready'
    };
  }

  window.DailyFlowEngine = {
    parseTimeToMinutes: parseTimeToMinutes,
    formatMinutesToClock: formatMinutesToClock,
    normalizeEventMinute: normalizeEventMinute,
    normalizeSleepMinute: normalizeSleepMinute,
    formatOperationalTime: formatOperationalTime,
    buildDailyFlowEvents: buildDailyFlowEvents,
    getNextActionFromEvents: getNextActionFromEvents
  };
})();
