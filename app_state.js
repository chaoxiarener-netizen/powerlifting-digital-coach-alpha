(function() {
  var USAGE_MODE_KEY = 'appUsageMode';
  var SINGLE_DAY_PLAN_KEY = 'singleDayPlan';
  var TRAINING_OVERRIDE_KEYS = ['trainingType', 'workoutType', 'weight', 'sets', 'reps', 'percent1RM', 'customPercent', 'postRPE'];

  function safeJsonParse(raw, fallback) {
    if (typeof raw !== 'string' || !raw.trim()) return fallback;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function isObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function hasMeaningfulValue(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    if (isObject(value)) return Object.keys(value).length > 0;
    return true;
  }

  function getStoredObject(key) {
    return safeJsonParse(localStorage.getItem(key), {});
  }

  function parseNumber(value) {
    if (!hasMeaningfulValue(value)) return null;
    var number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function getDateString(date) {
    var current = date instanceof Date ? date : new Date(date || Date.now());
    if (Number.isNaN(current.getTime())) current = new Date();
    return current.getFullYear() + '-' + String(current.getMonth() + 1).padStart(2, '0') + '-' + String(current.getDate()).padStart(2, '0');
  }

  function normalizeGoal(goal) {
    if (!goal) return '';
    var raw = String(goal).trim().toLowerCase();
    var goalMap = {
      bulk: 'bulk',
      muscle: 'bulk',
      '增肌': 'bulk',
      strength: 'strength',
      '力量': 'strength',
      cut: 'cut',
      '减脂': 'cut',
      recomp: 'recomp',
      '重组': 'recomp',
      meet: 'meet_prep',
      meet_prep: 'meet_prep',
      '赛前': 'meet_prep'
    };
    return goalMap[raw] || raw;
  }

  function normalizeTrainingType(type) {
    if (!type) return '';
    var raw = String(type).trim().toLowerCase();
    var typeMap = {
      squat: 'squat',
      '深蹲': 'squat',
      bench: 'bench',
      '卧推': 'bench',
      deadlift: 'deadlift',
      '硬拉': 'deadlift',
      accessory: 'accessory',
      hypertrophy: 'accessory',
      '容量日': 'accessory',
      '容量日（综合）': 'accessory',
      rest: 'rest',
      '休息日': 'rest',
      '休息': 'rest'
    };
    return typeMap[raw] || raw;
  }

  function normalizeDayType(type) {
    var raw = String(type || '').trim().toLowerCase();
    if (raw === 'light' || raw === 'medium' || raw === 'heavy' || raw === 'rest') return raw;
    return raw ? raw : 'rest';
  }

  function normalizeDayTypes(raw) {
    if (Array.isArray(raw)) {
      var arr = raw.slice(0, 7);
      while (arr.length < 7) arr.push('rest');
      return arr.map(normalizeDayType);
    }
    if (isObject(raw)) {
      return Array.from({ length: 7 }, function(_, index) {
        return normalizeDayType(raw[index]);
      });
    }
    return Array.from({ length: 7 }, function() { return 'rest'; });
  }

  function isMeaningfulProfile(profile) {
    if (!isObject(profile)) return false;
    return [
      profile.gender,
      profile.age,
      profile.height,
      profile.weight,
      profile.bodyFat,
      profile.goal,
      profile.experience,
      profile.squat1RM,
      profile.bench1RM,
      profile.deadlift1RM,
      profile.squat,
      profile.bench,
      profile.deadlift
    ].some(hasMeaningfulValue);
  }

  function getUsageMode() {
    var raw = localStorage.getItem(USAGE_MODE_KEY);
    if (raw === 'single_day' || raw === 'weekly' || raw === 'long_term') return raw;
    return 'weekly';
  }

  function setUsageMode(mode) {
    if (mode === 'single_day' || mode === 'weekly' || mode === 'long_term') {
      localStorage.setItem(USAGE_MODE_KEY, mode);
    }
  }

  function getProfile() {
    var userProfile = getStoredObject('userProfile');
    var powerliftingProfile = getStoredObject('powerliftingProfile');
    var source = isMeaningfulProfile(userProfile) ? userProfile : powerliftingProfile;
    var exists = isMeaningfulProfile(source);

    return {
      exists: exists,
      gender: source.gender || '',
      age: parseNumber(source.age),
      height: parseNumber(source.height),
      weight: parseNumber(source.weight),
      bodyFat: parseNumber(source.bodyFat),
      squat1RM: parseNumber(source.squat1RM || source.squat),
      bench1RM: parseNumber(source.bench1RM || source.bench),
      deadlift1RM: parseNumber(source.deadlift1RM || source.deadlift),
      goal: normalizeGoal(source.goal || ''),
      experience: source.experience || '',
      micronutrientRisk: source.micronutrientRisk || source.micronutrientScreening?.riskLevel || '',
      redFlags: Array.isArray(source.redFlags) ? source.redFlags : [],
      raw: source
    };
  }

  function getWeeklyTrainingPlan() {
    var plan = safeJsonParse(localStorage.getItem('weeklyTrainingPlan'), null);
    if (!plan) {
      return { exists: false, days: [], byDayIndex: {}, raw: null };
    }

    var days = Array.isArray(plan.days) ? plan.days.slice(0, 7) : [];
    while (days.length < 7) days.push(null);

    var byDayIndex = isObject(plan.byDayIndex) ? Object.assign({}, plan.byDayIndex) : {};
    if (!Object.keys(byDayIndex).length && days.length) {
      days.forEach(function(day, index) {
        byDayIndex[index] = day;
      });
    }

    var hasAnyDay = days.some(function(day) { return !!day; }) || Object.keys(byDayIndex).some(function(key) { return !!byDayIndex[key]; });

    return {
      exists: hasAnyDay,
      days: days,
      byDayIndex: byDayIndex,
      raw: plan
    };
  }

  function getTodayDayIndex(date) {
    var current = date instanceof Date ? date : new Date(date || Date.now());
    return (current.getDay() + 6) % 7;
  }

  function getSupplementState() {
    var state = safeJsonParse(localStorage.getItem('supplementGenerator'), null);
    if (!state) {
      return {
        exists: false,
        selectedSupplements: [],
        bodyWeightKg: null,
        wakeUpTime: '',
        workoutStartTime: '',
        workoutDurationMinutes: null,
        plannedSleepTime: '',
        postRPE: null,
        manualOverrides: {},
        raw: null
      };
    }

    return {
      exists: true,
      selectedSupplements: Array.isArray(state.selectedSupplements) ? state.selectedSupplements : [],
      bodyWeightKg: parseNumber(state.bodyWeightKg || state.bodyWeight),
      wakeUpTime: state.wakeUpTime || state.wakeTime || '',
      workoutStartTime: state.workoutStartTime || '',
      workoutDurationMinutes: parseNumber(state.workoutDurationMinutes || state.workoutDuration),
      plannedSleepTime: state.plannedSleepTime || state.sleepTime || '',
      postRPE: parseNumber(state.postRPE),
      manualOverrides: isObject(state.manualOverrides) ? state.manualOverrides : {},
      raw: state
    };
  }

  function getSingleDayPlan() {
    var plan = safeJsonParse(localStorage.getItem(SINGLE_DAY_PLAN_KEY), null);
    if (!plan || !isObject(plan)) {
      return {
        exists: false,
        version: 'v1',
        createdAt: '',
        updatedAt: '',
        source: 'single_day',
        date: getDateString(),
        isTrainingDay: false,
        dayType: 'rest',
        lift: 'rest',
        wakeUpTime: '',
        workoutStartTime: '',
        workoutDurationMinutes: null,
        plannedSleepTime: '',
        bodyWeightKg: null,
        weight: null,
        sets: null,
        reps: null,
        percent1RM: null,
        rpe: null,
        selectedSupplements: [],
        notes: '',
        raw: null
      };
    }

    var isTrainingDay = typeof plan.isTrainingDay === 'boolean'
      ? plan.isTrainingDay
      : normalizeDayType(plan.dayType) !== 'rest';
    var dayType = isTrainingDay ? normalizeDayType(plan.dayType || 'medium') : 'rest';
    var lift = isTrainingDay ? normalizeTrainingType(plan.lift || 'accessory') : 'rest';

    return {
      exists: true,
      version: plan.version || 'v1',
      createdAt: plan.createdAt || '',
      updatedAt: plan.updatedAt || '',
      source: plan.source || 'single_day',
      date: plan.date || getDateString(),
      isTrainingDay: isTrainingDay,
      dayType: dayType,
      lift: lift,
      wakeUpTime: plan.wakeUpTime || '',
      workoutStartTime: plan.workoutStartTime || '',
      workoutDurationMinutes: parseNumber(plan.workoutDurationMinutes),
      plannedSleepTime: plan.plannedSleepTime || '',
      bodyWeightKg: parseNumber(plan.bodyWeightKg),
      weight: parseNumber(plan.weight),
      sets: parseNumber(plan.sets),
      reps: parseNumber(plan.reps),
      percent1RM: parseNumber(plan.percent1RM),
      rpe: parseNumber(plan.rpe),
      selectedSupplements: Array.isArray(plan.selectedSupplements) ? plan.selectedSupplements.filter(Boolean) : [],
      notes: plan.notes || '',
      raw: plan
    };
  }

  function parseTimeToMinutes(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    var time = String(value || '').trim();
    if (!/^\d{1,2}:\d{2}$/.test(time)) return 0;
    var parts = time.split(':').map(Number);
    var hour = parts[0] || 0;
    var minute = parts[1] || 0;
    return hour * 60 + minute;
  }

  function formatMinutesToClock(minutes) {
    var normalized = ((Number(minutes) % 1440) + 1440) % 1440;
    var hour = Math.floor(normalized / 60);
    var minute = normalized % 60;
    return String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
  }

  function normalizeSleepMinute(sleepMin, wakeMin, workoutStartMin) {
    if (!Number.isFinite(sleepMin)) return sleepMin;
    if (sleepMin <= wakeMin) return sleepMin + 1440;
    if (workoutStartMin != null && sleepMin <= workoutStartMin) return sleepMin + 1440;
    return sleepMin;
  }

  function normalizeEventMinute(eventMin, wakeMin) {
    if (!Number.isFinite(eventMin)) return eventMin;
    if (eventMin < wakeMin) return eventMin + 1440;
    return eventMin;
  }

  function toOperationalMinute(time, wakeMin, options) {
    var settings = options || {};
    var minute = typeof time === 'number' ? time : parseTimeToMinutes(time);
    if (!Number.isFinite(minute)) return 0;
    if (minute >= 1440 || minute <= -1440) return minute;
    if (settings.kind === 'sleep') {
      return normalizeSleepMinute(minute, wakeMin, settings.workoutStartMin);
    }
    if (settings.referenceMin != null && settings.allowNextDay && minute < settings.referenceMin) {
      return minute + 1440;
    }
    return normalizeEventMinute(minute, wakeMin);
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
    return getTodayDayIndex(parsed);
  }

  function getWeeklyTrainingForDay(dayIndex) {
    var plan = getWeeklyTrainingPlan();
    var dayTypes = normalizeDayTypes(safeJsonParse(localStorage.getItem('module3_dayTypes'), []));
    var raw = (plan.days && plan.days[dayIndex]) || (plan.byDayIndex && plan.byDayIndex[dayIndex]) || null;
    var type = normalizeDayType((raw && raw.type) || dayTypes[dayIndex] || 'rest');
    var lift = normalizeTrainingType(raw && raw.lift);
    var isRestDay = !raw || type === 'rest' || lift === 'rest';

    return {
      exists: !!raw || type !== 'rest',
      dayIndex: dayIndex,
      type: type,
      lift: isRestDay ? '' : (lift || ''),
      sets: raw && hasMeaningfulValue(raw.sets) ? parseNumber(raw.sets) : null,
      reps: raw && hasMeaningfulValue(raw.reps) ? parseNumber(raw.reps) : null,
      weight: raw && hasMeaningfulValue(raw.weight) ? parseNumber(raw.weight) : null,
      percent1RM: raw ? parseNumber(raw.percent1RM || raw.percent) : null,
      rpe: raw && hasMeaningfulValue(raw.rpe) ? parseNumber(raw.rpe) : null,
      inol: raw && hasMeaningfulValue(raw.inol) ? parseNumber(raw.inol) : null,
      startTime: raw && raw.startTime ? raw.startTime : '',
      duration: raw && hasMeaningfulValue(raw.duration) ? parseNumber(raw.duration) : null,
      plannedSleepTime: raw && raw.sleepTime ? raw.sleepTime : '',
      isRestDay: isRestDay,
      source: raw ? 'weeklyTrainingPlan' : (type !== 'rest' ? 'module3_dayTypes' : 'none'),
      raw: raw
    };
  }

  function hasManualTrainingOverride(raw, manualOverrides) {
    var flags = manualOverrides || {};
    return TRAINING_OVERRIDE_KEYS.some(function(key) {
      if (flags[key]) return true;
      return !Object.keys(flags).length && hasMeaningfulValue(raw && raw[key]);
    });
  }

  function getSingleDayTrainingOverride(dayIndex) {
    var supplementState = getSupplementState();
    var raw = supplementState.raw || {};
    var manualOverrides = supplementState.manualOverrides || {};
    var lift = normalizeTrainingType(raw.trainingType || raw.workoutType);
    var percent1RM = parseNumber(raw.percent1RM || raw.customPercent);
    var overrideExists = hasManualTrainingOverride(raw, manualOverrides);
    var isRestDay = lift === 'rest';

    if (!overrideExists && !isRestDay) {
      return {
        exists: false,
        dayIndex: dayIndex,
        type: 'rest',
        lift: '',
        sets: null,
        reps: null,
        weight: null,
        percent1RM: null,
        rpe: null,
        inol: null,
        startTime: raw.workoutStartTime || '',
        duration: parseNumber(raw.workoutDurationMinutes || raw.workoutDuration),
        plannedSleepTime: raw.plannedSleepTime || raw.sleepTime || '',
        isRestDay: false,
        source: 'none',
        raw: null
      };
    }

    var type = normalizeDayType(raw.dayType || (isRestDay ? 'rest' : 'medium'));
    return {
      exists: true,
      dayIndex: dayIndex,
      type: type,
      lift: isRestDay ? '' : lift,
      sets: parseNumber(raw.sets),
      reps: parseNumber(raw.reps),
      weight: parseNumber(raw.weight),
      percent1RM: percent1RM,
      rpe: parseNumber(raw.postRPE),
      inol: null,
      startTime: raw.workoutStartTime || '',
      duration: parseNumber(raw.workoutDurationMinutes || raw.workoutDuration),
      plannedSleepTime: raw.plannedSleepTime || raw.sleepTime || '',
      isRestDay: isRestDay,
      source: 'supplementGenerator',
      raw: raw
    };
  }

  function getSingleDayTraining(dayIndex, date) {
    var singleDayPlan = getSingleDayPlan();
    var resolvedDayIndex = typeof dayIndex === 'number' ? dayIndex : getTodayDayIndex(date);
    var planDayIndex = getDayIndexFromDateString(singleDayPlan.date);
    var sameDay = singleDayPlan.exists && planDayIndex === resolvedDayIndex;

    if (!singleDayPlan.exists || !sameDay) {
      return {
        exists: false,
        dayIndex: resolvedDayIndex,
        type: 'rest',
        lift: '',
        sets: null,
        reps: null,
        weight: null,
        percent1RM: null,
        rpe: null,
        inol: null,
        startTime: '',
        duration: null,
        plannedSleepTime: '',
        isRestDay: false,
        source: 'none',
        raw: null
      };
    }

    return {
      exists: true,
      dayIndex: resolvedDayIndex,
      type: singleDayPlan.dayType,
      lift: singleDayPlan.isTrainingDay ? singleDayPlan.lift : '',
      sets: singleDayPlan.sets,
      reps: singleDayPlan.reps,
      weight: singleDayPlan.weight,
      percent1RM: singleDayPlan.percent1RM,
      rpe: singleDayPlan.rpe,
      inol: null,
      startTime: singleDayPlan.workoutStartTime || '',
      duration: singleDayPlan.workoutDurationMinutes,
      plannedSleepTime: singleDayPlan.plannedSleepTime || '',
      isRestDay: !singleDayPlan.isTrainingDay || singleDayPlan.dayType === 'rest' || singleDayPlan.lift === 'rest',
      source: 'singleDayPlan',
      raw: singleDayPlan.raw
    };
  }

  function getTodayTraining(options) {
    var settings = isObject(options) ? options : {};
    if (typeof options === 'number') {
      settings.dayIndex = options;
    }
    var resolvedDayIndex = typeof settings.dayIndex === 'number' ? settings.dayIndex : getTodayDayIndex(settings.date);
    var mode = settings.mode || getUsageMode();
    var weeklyTraining = getWeeklyTrainingForDay(resolvedDayIndex);
    var singleDayPlanTraining = getSingleDayTraining(resolvedDayIndex, settings.date);
    var supplementOverrideTraining = getSingleDayTrainingOverride(resolvedDayIndex);

    if (mode === 'single_day') {
      if (singleDayPlanTraining.exists) return singleDayPlanTraining;
      if (supplementOverrideTraining.exists) return supplementOverrideTraining;
      if (weeklyTraining.exists) return weeklyTraining;
      return singleDayPlanTraining;
    }

    if (weeklyTraining.exists && weeklyTraining.source === 'weeklyTrainingPlan') {
      return weeklyTraining;
    }

    if (supplementOverrideTraining.exists) {
      return supplementOverrideTraining;
    }

    return weeklyTraining;
  }

  function getMacroPlan() {
    var plan = safeJsonParse(localStorage.getItem('carbBudgetPlan'), null);
    if (!plan) {
      return {
        exists: false,
        goal: '',
        dailyPlan: [],
        weeklyCalories: null,
        weeklyCarbs: null,
        weeklyProtein: null,
        weeklyFat: null,
        eaStatus: '',
        redSRisk: '',
        raw: null
      };
    }

    return {
      exists: true,
      goal: normalizeGoal(plan.goal || plan.mappedGoalKey || ''),
      dailyPlan: Array.isArray(plan.dailyPlan) ? plan.dailyPlan : [],
      weeklyCalories: parseNumber(plan.weeklyCalories),
      weeklyCarbs: parseNumber(plan.weeklyCarbs),
      weeklyProtein: parseNumber(plan.weeklyProtein),
      weeklyFat: parseNumber(plan.weeklyFat),
      eaStatus: plan.eaStatus || '',
      redSRisk: plan.redSRisk || '',
      raw: plan
    };
  }

  function getReadinessStatus(options) {
    var settings = isObject(options) ? options : {};
    var mode = settings.mode || getUsageMode();
    var profile = getProfile();
    var trainingPlan = getWeeklyTrainingPlan();
    var singleDayPlan = getSingleDayPlan();
    var todayTraining = getTodayTraining({ mode: mode, dayIndex: settings.dayIndex, date: settings.date });
    var macroPlan = getMacroPlan();
    var supplementState = getSupplementState();

    var status = {
      mode: mode,
      profile: profile.exists ? 'done' : 'missing',
      training: 'missing',
      macro: macroPlan.exists ? 'done' : 'missing',
      supplement: supplementState.exists ? 'done' : 'missing',
      dashboard: 'blocked',
      nextAction: '下一步：填写用户档案',
      nextActionHref: '模块一_用户档案.html'
    };

    if (mode === 'long_term') {
      status.training = trainingPlan.exists ? 'done' : 'missing';
      status.dashboard = trainingPlan.exists ? 'partial' : 'blocked';
      status.nextAction = '下一步：进入长期计划';
      status.nextActionHref = '模块五_长期计划.html';
      return status;
    }

    if (mode === 'single_day') {
      status.training = singleDayPlan.exists || todayTraining.exists ? 'done' : 'missing';
      status.supplement = singleDayPlan.exists || supplementState.exists ? 'done' : 'missing';
      status.macro = macroPlan.exists ? 'done' : 'missing';
      if (!singleDayPlan.exists && !todayTraining.exists) {
        status.dashboard = 'blocked';
        status.nextAction = '下一步：填写轻量单日计划';
        status.nextActionHref = '单日计划_轻量模式.html';
        return status;
      }
      status.dashboard = 'ready';
      status.nextAction = '下一步：查看今日作战图';
      status.nextActionHref = '模块四_单日仪表盘.html';
      return status;
    }

    status.training = trainingPlan.exists ? 'done' : 'missing';
    if (!profile.exists) {
      status.dashboard = 'blocked';
      return status;
    }
    if (!trainingPlan.exists) {
      status.dashboard = 'blocked';
      status.nextAction = '下一步：填写本周训练';
      status.nextActionHref = '模块三_每周训练安排.html';
      return status;
    }
    if (!macroPlan.exists) {
      status.dashboard = supplementState.exists ? 'partial' : 'blocked';
      status.nextAction = '下一步：生成宏量预算';
      status.nextActionHref = '模块二_碳水预算引擎.html';
      return status;
    }
    if (!supplementState.exists) {
      status.dashboard = 'partial';
      status.nextAction = '下一步：设置补剂清单';
      status.nextActionHref = '补剂时序生成器.html';
      return status;
    }
    status.dashboard = 'ready';
    status.nextAction = '下一步：查看今日作战图';
    status.nextActionHref = '模块四_单日仪表盘.html';
    return status;
  }

  function getTodayDashboardContext(options) {
    var settings = isObject(options) ? options : {};
    var dayIndex = typeof settings.dayIndex === 'number' ? settings.dayIndex : getTodayDayIndex(settings.date);
    var mode = settings.mode || getUsageMode();
    var profile = getProfile();
    var singleDayPlan = getSingleDayPlan();
    var todayTraining = getTodayTraining({ mode: mode, dayIndex: dayIndex, date: settings.date });
    var macroPlan = getMacroPlan();
    var supplementState = getSupplementState();
    var readiness = getReadinessStatus({ mode: mode, dayIndex: dayIndex, date: settings.date });
    var dayMacroPlan = null;

    if (macroPlan.exists && Array.isArray(macroPlan.dailyPlan)) {
      dayMacroPlan = macroPlan.dailyPlan.find(function(item) {
        return item && item.dayIndex === dayIndex;
      }) || null;
    }

    return {
      mode: mode,
      dayIndex: dayIndex,
      profile: profile,
      singleDayPlan: singleDayPlan,
      todayTraining: todayTraining,
      macroPlan: macroPlan,
      todayMacro: dayMacroPlan,
      supplementState: supplementState,
      readiness: readiness
    };
  }

  function getLiftLabel(lift) {
    var map = {
      squat: '深蹲训练',
      bench: '卧推训练',
      deadlift: '硬拉训练',
      accessory: '辅助训练',
      rest: '恢复'
    };
    return map[lift] || '训练';
  }

  function getTypeLabel(type) {
    var map = {
      rest: '恢复日',
      light: 'light',
      medium: 'medium',
      heavy: 'heavy'
    };
    return map[type] || type || '训练日';
  }

  function getSelectedSupplementsForMode(mode, singleDayPlan, supplementState, sameDaySingle) {
    if (mode === 'single_day' && sameDaySingle && singleDayPlan.exists && singleDayPlan.selectedSupplements.length) {
      return singleDayPlan.selectedSupplements.slice();
    }
    return supplementState.exists ? supplementState.selectedSupplements.slice() : [];
  }

  function getMacroByType(profile, macroPlan, dayMacro, type) {
    if (dayMacro && isObject(dayMacro.macros)) {
      return {
        carb: parseNumber(dayMacro.macros.carb) || 0,
        protein: parseNumber(dayMacro.macros.protein) || 0,
        fat: parseNumber(dayMacro.macros.fat) || 0
      };
    }
    if (macroPlan.exists && macroPlan.raw && macroPlan.raw.macros && macroPlan.raw.macros.byType && macroPlan.raw.macros.byType[type]) {
      return {
        carb: parseNumber(macroPlan.raw.macros.byType[type].carb) || 0,
        protein: parseNumber(macroPlan.raw.macros.byType[type].protein) || 0,
        fat: parseNumber(macroPlan.raw.macros.byType[type].fat) || 0
      };
    }
    var weight = profile.weight || 70;
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

  function getFallbackMeals(type, context, macros) {
    if (type === 'rest') {
      return [
        { name: '早餐', minute: context.wakeMin + 30, carb: Math.round(macros.carb * 0.28), protein: Math.round(macros.protein * 0.28), fat: Math.round(macros.fat * 0.28) },
        { name: '午餐', minute: context.wakeMin + 300, carb: Math.round(macros.carb * 0.34), protein: Math.round(macros.protein * 0.32), fat: Math.round(macros.fat * 0.32) },
        { name: '晚餐', minute: context.wakeMin + 690, carb: Math.round(macros.carb * 0.24), protein: Math.round(macros.protein * 0.25), fat: Math.round(macros.fat * 0.25) },
        { name: '睡前加餐', minute: context.wakeMin + 900, carb: Math.round(macros.carb * 0.14), protein: Math.round(macros.protein * 0.15), fat: Math.round(macros.fat * 0.15) }
      ];
    }
    return [
      { name: '早餐', minute: context.wakeMin + 30, carb: Math.round(macros.carb * 0.20), protein: Math.round(macros.protein * 0.22), fat: Math.round(macros.fat * 0.24) },
      { name: '训练前餐', minute: context.workoutStartMin - 120, carb: Math.round(macros.carb * 0.28), protein: Math.round(macros.protein * 0.20), fat: Math.round(macros.fat * 0.12) },
      { name: '训练中', minute: context.workoutStartMin, carb: Math.round(macros.carb * 0.12), protein: 0, fat: 0 },
      { name: '训练后餐', minute: context.workoutEndMin + 30, carb: Math.round(macros.carb * 0.24), protein: Math.round(macros.protein * 0.33), fat: Math.round(macros.fat * 0.18) },
      { name: '晚餐/夜间恢复', minute: Math.max(context.workoutEndMin + 60, context.sleepMin - 180), carb: Math.round(macros.carb * 0.16), protein: Math.round(macros.protein * 0.25), fat: Math.round(macros.fat * 0.30) }
    ];
  }

  function getMealMeta(meal) {
    var tags = [];
    if (meal.carb > 0) tags.push('碳水 ' + meal.carb + 'g');
    if (meal.protein > 0) tags.push('蛋白 ' + meal.protein + 'g');
    if (meal.fat > 0) tags.push('脂肪 ' + meal.fat + 'g');
    return tags.join(' · ');
  }

  function getSupplementEventBlueprints() {
    return {
      d3k2: { title: '维生素 D3+K2', type: 'supplement', schedule: 'wake_plus_60', meta: '基础营养支持' },
      omega3: { title: 'Omega-3', type: 'supplement', schedule: 'wake_plus_60', meta: '随正餐补充' },
      creatine: { title: '一水肌酸', type: 'supplement', schedule: 'post_workout_30', meta: '5g · 恢复支持' },
      protein: { title: '乳清蛋白/EAA', type: 'supplement', schedule: 'post_workout_30', meta: '训练后蛋白窗口' },
      caffeine: { title: '咖啡因', type: 'supplement', schedule: 'pre_workout_45', meta: '训练前激活' },
      magnesium: { title: '镁', type: 'supplement', schedule: 'sleep_minus_60', meta: '睡前恢复' },
      zinc: { title: '锌', type: 'supplement', schedule: 'sleep_minus_120', meta: '晚间恢复支持' },
      zincMagnesium: { title: 'ZMA', type: 'supplement', schedule: 'sleep_minus_60', meta: '夜间恢复支持' },
      collagen: { title: '胶原蛋白肽', type: 'supplement', schedule: 'pre_workout_60', meta: '结缔组织支持' },
      citrulline: { title: 'L-瓜氨酸', type: 'supplement', schedule: 'pre_workout_45', meta: '训练前表现支持' },
      nitrate: { title: '甜菜根/硝酸盐', type: 'supplement', schedule: 'pre_workout_150', meta: '需要较长提前量' },
      tartCherry: { title: '酸樱桃提取物', type: 'supplement', schedule: 'post_workout_120', meta: '高疲劳恢复可选' },
      melatonin: { title: '褪黑素', type: 'supplement', schedule: 'sleep_minus_30', meta: '仅睡眠支持需要时' }
    };
  }

  function resolveScheduleMinute(schedule, context) {
    if (schedule === 'wake_plus_60') return context.wakeMin + 60;
    if (schedule === 'wake_plus_90') return context.wakeMin + 90;
    if (schedule === 'pre_workout_150') return context.workoutStartMin - 150;
    if (schedule === 'pre_workout_60') return context.workoutStartMin - 60;
    if (schedule === 'pre_workout_45') return context.workoutStartMin - 45;
    if (schedule === 'post_workout_30') return context.workoutEndMin + 30;
    if (schedule === 'post_workout_120') return context.workoutEndMin + 120;
    if (schedule === 'sleep_minus_120') return context.sleepMin - 120;
    if (schedule === 'sleep_minus_60') return context.sleepMin - 60;
    if (schedule === 'sleep_minus_30') return context.sleepMin - 30;
    return context.wakeMin + 60;
  }

  function getCurrentLabelByEventType(type) {
    var map = {
      meal: '进餐准备',
      training: '训练前准备',
      supplement: '补剂准备',
      sleep: '夜间恢复',
      wake: '起床后',
      warning: '风险提醒',
      recovery: '恢复管理'
    };
    return map[type] || '今日安排';
  }

  function getEventIconType(type) {
    return type || 'meal';
  }

  function buildTodayActionEvents(date) {
    var now = date instanceof Date ? date : new Date(date || Date.now());
    var mode = getUsageMode();
    var dayIndex = getTodayDayIndex(now);
    var dashboard = getTodayDashboardContext({ mode: mode, dayIndex: dayIndex, date: now });
    var profile = dashboard.profile;
    var todayTraining = dashboard.todayTraining;
    var supplementState = dashboard.supplementState;
    var singleDayPlan = dashboard.singleDayPlan;
    var dayMacro = dashboard.todayMacro;
    var readiness = dashboard.readiness;
    var sameDaySingle = singleDayPlan.exists && getDayIndexFromDateString(singleDayPlan.date) === dayIndex;

    if (!singleDayPlan.exists && !todayTraining.exists && !supplementState.exists && !dashboard.macroPlan.exists) {
      return { status: 'missing_data', readiness: readiness, events: [], context: null, macros: null, mode: mode };
    }

    var type = (todayTraining && todayTraining.type) || 'rest';
    var selectedSupplements = getSelectedSupplementsForMode(mode, singleDayPlan, supplementState, sameDaySingle);
    var wakeUpTime = (mode === 'single_day' && sameDaySingle && singleDayPlan.wakeUpTime) ? singleDayPlan.wakeUpTime : (supplementState.wakeUpTime || '07:00');
    var workoutStartTime = '';
    if (mode === 'single_day' && sameDaySingle && singleDayPlan.workoutStartTime) {
      workoutStartTime = singleDayPlan.workoutStartTime;
    } else if (todayTraining && todayTraining.startTime) {
      workoutStartTime = todayTraining.startTime;
    } else if (supplementState.workoutStartTime) {
      workoutStartTime = supplementState.workoutStartTime;
    } else {
      workoutStartTime = '18:00';
    }
    var workoutDurationMinutes = 90;
    if (mode === 'single_day' && sameDaySingle && singleDayPlan.workoutDurationMinutes) {
      workoutDurationMinutes = singleDayPlan.workoutDurationMinutes;
    } else if (todayTraining && todayTraining.duration) {
      workoutDurationMinutes = todayTraining.duration;
    } else if (supplementState.workoutDurationMinutes) {
      workoutDurationMinutes = supplementState.workoutDurationMinutes;
    }
    var plannedSleepTime = (mode === 'single_day' && sameDaySingle && singleDayPlan.plannedSleepTime)
      ? singleDayPlan.plannedSleepTime
      : (supplementState.plannedSleepTime || todayTraining.plannedSleepTime || '23:00');

    var wakeMin = parseTimeToMinutes(wakeUpTime || '07:00');
    var workoutStartRaw = parseTimeToMinutes(workoutStartTime || '18:00');
    var workoutStartMin = toOperationalMinute(workoutStartTime || '18:00', wakeMin, { kind: 'event' });
    var workoutEndMin = workoutStartMin + (workoutDurationMinutes || 90);
    var sleepMin = toOperationalMinute(plannedSleepTime || '23:00', wakeMin, { kind: 'sleep', workoutStartMin: workoutStartRaw });
    var nowMin = parseTimeToMinutes(formatMinutesToClock(now.getHours() * 60 + now.getMinutes()));
    var nowOperational = nowMin < wakeMin ? nowMin + 1440 : nowMin;
    var timeGapHours = (sleepMin - workoutStartMin) / 60;
    var macros = getMacroByType(profile, dashboard.macroPlan, dayMacro, type);
    var context = {
      mode: mode,
      type: type,
      wakeMin: wakeMin,
      workoutStartMin: workoutStartMin,
      workoutEndMin: workoutEndMin,
      sleepMin: sleepMin,
      timeGapHours: timeGapHours,
      selectedSupplements: selectedSupplements,
      training: todayTraining
    };
    var events = [];

    events.push({ time: wakeMin, title: '起床', meta: '开始今日安排', type: 'wake' });

    var meals = [];
    if (dayMacro && Array.isArray(dayMacro.meals) && dayMacro.meals.length) {
      meals = dayMacro.meals.map(function(meal) {
        var minute = meal.time === '训练中'
          ? workoutStartMin
          : (/^\d{2}:\d{2}$/.test(meal.time || '')
            ? toOperationalMinute(meal.time, wakeMin, { kind: 'event', referenceMin: workoutStartRaw, allowNextDay: true })
            : wakeMin + 30);
        return {
          name: meal.name || '餐次',
          minute: minute,
          carb: parseNumber(meal.carb) || 0,
          protein: parseNumber(meal.protein) || 0,
          fat: parseNumber(meal.fat) || 0
        };
      });
    } else {
      meals = getFallbackMeals(type, context, macros);
    }

    meals.forEach(function(meal) {
      events.push({
        time: meal.minute,
        title: meal.name,
        meta: getMealMeta(meal) || '营养补给',
        type: 'meal'
      });
    });

    if (todayTraining && todayTraining.exists && !todayTraining.isRestDay) {
      events.push({
        time: workoutStartMin,
        title: getLiftLabel(todayTraining.lift),
        meta: getTypeLabel(type) + (todayTraining.rpe != null ? ' · RPE ' + todayTraining.rpe : ''),
        type: 'training'
      });
    } else if (type === 'rest' || (todayTraining && todayTraining.isRestDay)) {
      events.push({
        time: wakeMin + 120,
        title: '积极恢复',
        meta: '恢复日 · 轻活动和拉伸',
        type: 'recovery'
      });
    }

    var supplementMap = getSupplementEventBlueprints();
    selectedSupplements.forEach(function(key) {
      var item = supplementMap[key];
      if (!item) return;
      if (key === 'caffeine' && timeGapHours < 6) {
        events.push({
          time: workoutStartMin,
          title: '晚间咖啡因已阻断',
          meta: '距离计划入睡时间过近',
          type: 'warning'
        });
        return;
      }
      events.push({
        time: resolveScheduleMinute(item.schedule, context),
        title: item.title,
        meta: item.meta,
        type: item.type
      });
    });

    events.push({
      time: sleepMin,
      title: '计划入睡',
      meta: '保证恢复睡眠',
      type: 'sleep'
    });

    events = events
      .filter(function(event) { return Number.isFinite(event.time); })
      .sort(function(a, b) { return a.time - b.time; });

    return {
      status: events.length ? 'ready' : 'missing_data',
      readiness: readiness,
      events: events,
      context: context,
      macros: macros,
      mode: mode,
      nowOperational: nowOperational
    };
  }

  function getTodayNextAction(now) {
    var current = now instanceof Date ? now : new Date(now || Date.now());
    if (window.DailyFlowEngine && typeof window.DailyFlowEngine.buildDailyFlowEvents === 'function' && typeof window.DailyFlowEngine.getNextActionFromEvents === 'function') {
      var mode = getUsageMode();
      var dayIndex = getTodayDayIndex(current);
      var dashboard = getTodayDashboardContext({ mode: mode, dayIndex: dayIndex, date: current });
      var events = window.DailyFlowEngine.buildDailyFlowEvents(dashboard);
      var unified = window.DailyFlowEngine.getNextActionFromEvents(events, current);
      if (!unified.hasData) {
        unified.href = 'index.html';
      }
      return unified;
    }

    var base = buildTodayActionEvents(current);
    var nowTime = formatMinutesToClock(current.getHours() * 60 + current.getMinutes());

    if (base.status !== 'ready' || !base.events.length) {
      return {
        hasData: false,
        nowTime: nowTime,
        currentLabel: '等待作战数据',
        nextEvent: null,
        followingEvent: null,
        status: 'missing_data',
        message: '还没有足够数据生成下一步作战提示',
        nextAction: '先选择使用方式',
        href: 'index.html'
      };
    }

    var nextIndex = base.events.findIndex(function(event) {
      return event.time >= base.nowOperational;
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

    var nextEvent = base.events[nextIndex];
    var followingEvent = base.events[nextIndex + 1] || null;
    var previousEvent = nextIndex > 0 ? base.events[nextIndex - 1] : null;
    return {
      hasData: true,
      nowTime: nowTime,
      currentLabel: previousEvent ? getCurrentLabelByEventType(previousEvent.type) : '当前作战时间',
      nextEvent: {
        time: formatOperationalTime(nextEvent.time),
        title: nextEvent.title,
        meta: nextEvent.meta,
        type: getEventIconType(nextEvent.type),
        minutesUntil: Math.max(0, nextEvent.time - base.nowOperational)
      },
      followingEvent: followingEvent ? {
        time: formatOperationalTime(followingEvent.time),
        title: followingEvent.title,
        meta: followingEvent.meta,
        type: getEventIconType(followingEvent.type)
      } : null,
      status: 'ready'
    };
  }

  window.AppState = {
    safeJsonParse: safeJsonParse,
    getUsageMode: getUsageMode,
    setUsageMode: setUsageMode,
    getProfile: getProfile,
    getSingleDayPlan: getSingleDayPlan,
    getWeeklyTrainingPlan: getWeeklyTrainingPlan,
    getTodayDayIndex: getTodayDayIndex,
    getTodayTraining: getTodayTraining,
    getMacroPlan: getMacroPlan,
    getSupplementState: getSupplementState,
    getReadinessStatus: getReadinessStatus,
    getTodayDashboardContext: getTodayDashboardContext,
    getTodayNextAction: getTodayNextAction,
    parseTimeToMinutes: parseTimeToMinutes,
    formatMinutesToClock: formatMinutesToClock,
    toOperationalMinute: toOperationalMinute,
    formatOperationalTime: formatOperationalTime
  };
})();
