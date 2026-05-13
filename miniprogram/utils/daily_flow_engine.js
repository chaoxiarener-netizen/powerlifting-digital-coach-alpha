const PRIORITY_MAP = {
  warning: 100,
  training: 80,
  recovery: 50,
  supplement: 40,
  sleep: 30,
  wake: 20
};

const LIFT_LABELS = {
  squat: "深蹲",
  bench: "卧推",
  deadlift: "硬拉",
  accessory: "辅助",
  rest: "恢复"
};

const SUPPLEMENT_LABELS = {
  caffeine: "咖啡因",
  creatine: "一水肌酸",
  magnesium: "镁"
};

function parseTimeToMinutes(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const time = String(value || "").trim();
  if (!/^\d{1,2}:\d{2}$/.test(time)) return 0;
  const parts = time.split(":").map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

function formatMinutesToClock(minutes) {
  const normalized = ((Number(minutes) % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
}

function normalizeEventMinute(eventMin, wakeMin) {
  if (!Number.isFinite(eventMin)) return eventMin;
  return eventMin < wakeMin ? eventMin + 1440 : eventMin;
}

function normalizeSleepMinute(sleepMin, wakeMin, workoutStartMin) {
  if (!Number.isFinite(sleepMin)) return sleepMin;
  if (sleepMin <= wakeMin) return sleepMin + 1440;
  if (workoutStartMin != null && sleepMin <= workoutStartMin) return sleepMin + 1440;
  return sleepMin;
}

function formatOperationalTime(absoluteMinute) {
  const minute = Number(absoluteMinute);
  if (!Number.isFinite(minute)) return "--:--";
  const dayOffset = Math.floor(minute / 1440);
  const clock = formatMinutesToClock(minute);
  return dayOffset > 0 ? `次日 ${clock}` : clock;
}

function toNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function resolvePlan(input) {
  const plan = input && input.singleDayPlan ? input.singleDayPlan : input;
  if (!plan || typeof plan !== "object") return null;
  return plan;
}

function addEvent(events, type, absoluteMinute, title, meta, detail, tags, source, priority) {
  if (!Number.isFinite(absoluteMinute)) return;
  events.push({
    id: `mp_evt_${events.length + 1}`,
    absoluteMinute,
    displayTime: formatOperationalTime(absoluteMinute),
    type,
    title,
    meta: meta || "",
    detail: detail || "",
    tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
    priority: priority != null ? priority : (PRIORITY_MAP[type] || 10),
    source: source || "singleDayPlan"
  });
}

function buildSupplementEvents(events, selectedSupplements, resolved) {
  const selected = Array.isArray(selectedSupplements) ? selectedSupplements : [];

  selected.forEach((key) => {
    if (key === "caffeine") {
      if (resolved.sleepMin - resolved.workoutStartMin < 360) {
        addEvent(
          events,
          "warning",
          resolved.workoutStartMin,
          "咖啡因已阻断",
          "距离计划入睡时间过近",
          "晚间训练距离睡眠不足 6 小时，Phase 1 将咖啡因放入风险提醒，不进入正常补剂时间流。",
          ["晚间咖啡因"],
          "caffeine",
          PRIORITY_MAP.warning
        );
        return;
      }
      addEvent(
        events,
        "supplement",
        Math.max(resolved.wakeMin, resolved.workoutStartMin - 45),
        "咖啡因",
        "训练前准备",
        "简化补剂事件：训练前 30-60 分钟。",
        ["训练前"],
        "caffeine"
      );
      return;
    }

    if (key === "creatine") {
      addEvent(
        events,
        "supplement",
        resolved.wakeMin + 60,
        "一水肌酸",
        "每日基础补剂",
        "Phase 1 简化为起床后随餐补充。",
        ["基础"],
        "creatine"
      );
      return;
    }

    if (key === "magnesium") {
      addEvent(
        events,
        "supplement",
        Math.max(resolved.wakeMin, resolved.sleepMin - 60),
        "镁",
        "睡前恢复",
        "Phase 1 简化为睡前 60 分钟。",
        ["睡前"],
        "magnesium"
      );
      return;
    }

    addEvent(
      events,
      "supplement",
      resolved.wakeMin + 90,
      SUPPLEMENT_LABELS[key] || key,
      "补剂清单",
      "Phase 1 简化补剂事件。",
      ["补剂"],
      key
    );
  });
}

function buildDailyFlowEvents(context) {
  const plan = resolvePlan(context);
  if (!plan) return [];

  const wakeTime = plan.wakeUpTime || "07:00";
  const workoutStartTime = plan.workoutStartTime || "17:00";
  const duration = toNumber(plan.workoutDurationMinutes, 90);
  const sleepTime = plan.plannedSleepTime || "23:30";
  const wakeMin = parseTimeToMinutes(wakeTime);
  const workoutRawMin = parseTimeToMinutes(workoutStartTime);
  const workoutStartMin = normalizeEventMinute(workoutRawMin, wakeMin);
  const workoutEndMin = workoutStartMin + duration;
  const sleepMin = normalizeSleepMinute(parseTimeToMinutes(sleepTime), wakeMin, workoutRawMin);
  const isTrainingDay = plan.isTrainingDay !== false && plan.lift !== "rest" && plan.dayType !== "rest";
  const liftLabel = LIFT_LABELS[plan.lift] || "训练";
  const dayType = plan.dayType || (isTrainingDay ? "medium" : "rest");
  const rpe = plan.rpe ? `RPE ${plan.rpe}` : "RPE 未填";
  const events = [];

  const resolved = {
    wakeMin,
    workoutStartMin,
    workoutEndMin,
    sleepMin
  };

  addEvent(events, "wake", wakeMin, "起床", "开始今天的作战日", `起床时间：${wakeTime}`, [], "wakeUpTime");

  if (isTrainingDay) {
    addEvent(
      events,
      "training",
      workoutStartMin,
      "训练开始",
      `${liftLabel} · ${dayType} · ${rpe}`,
      `训练来源：轻量单日计划\n训练时长：${duration} 分钟`,
      [dayType, rpe],
      "singleDayPlan"
    );
    addEvent(
      events,
      "recovery",
      workoutEndMin,
      "训练结束 / 恢复",
      "补水、进食、整理训练记录",
      `训练结束时间：${formatOperationalTime(workoutEndMin)}`,
      ["恢复"],
      "singleDayPlan"
    );
  } else {
    addEvent(
      events,
      "recovery",
      wakeMin + 120,
      "恢复日",
      "无主项训练，优先恢复和活动度",
      "轻量单日计划设置为休息日。",
      ["休息"],
      "singleDayPlan"
    );
  }

  buildSupplementEvents(events, plan.selectedSupplements, resolved);

  addEvent(
    events,
    "recovery",
    Math.max(wakeMin, sleepMin - 60),
    "睡前恢复准备",
    "收尾补水、拉伸和睡前补剂",
    `计划入睡：${formatOperationalTime(sleepMin)}`,
    ["睡前"],
    "plannedSleepTime"
  );

  addEvent(
    events,
    "sleep",
    sleepMin,
    "计划入睡",
    "保证恢复质量",
    `计划入睡时间：${formatOperationalTime(sleepMin)}`,
    [],
    "plannedSleepTime"
  );

  return events
    .filter((event) => Number.isFinite(event.absoluteMinute))
    .sort((a, b) => {
      if (a.absoluteMinute !== b.absoluteMinute) return a.absoluteMinute - b.absoluteMinute;
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.id.localeCompare(b.id);
    });
}

function getCurrentLabelByEventType(type) {
  const map = {
    wake: "起床后",
    training: "训练窗口",
    recovery: "恢复管理",
    supplement: "补剂准备",
    sleep: "夜间恢复",
    warning: "风险提醒"
  };
  return map[type] || "今日安排";
}

function getNextActionFromEvents(events, now) {
  const list = Array.isArray(events) ? events.slice() : [];
  const current = now instanceof Date ? now : new Date(now || Date.now());
  const nowRawMin = current.getHours() * 60 + current.getMinutes();
  const nowTime = formatMinutesToClock(nowRawMin);

  if (!list.length) {
    return {
      hasData: false,
      nowTime,
      currentLabel: "等待作战数据",
      nextEvent: null,
      followingEvent: null,
      status: "missing_data",
      message: "还没有今日作战提示，请先创建轻量单日计划。"
    };
  }

  const wakeEvent = list.find((item) => item.type === "wake") || list[0];
  const wakeMin = ((wakeEvent.absoluteMinute % 1440) + 1440) % 1440;
  const nowOperational = nowRawMin < wakeMin ? nowRawMin + 1440 : nowRawMin;
  const actionable = list.filter((item) => item.type !== "warning");
  const nextIndex = actionable.findIndex((item) => item.absoluteMinute >= nowOperational);

  if (nextIndex === -1) {
    return {
      hasData: true,
      nowTime,
      currentLabel: "今日执行已完成",
      nextEvent: null,
      followingEvent: null,
      status: "done_for_day",
      message: "今天的关键事件已经结束，接下来以恢复和睡眠为主。"
    };
  }

  const nextEvent = actionable[nextIndex];
  const followingEvent = actionable[nextIndex + 1] || null;
  const previousEvent = nextIndex > 0 ? actionable[nextIndex - 1] : null;

  return {
    hasData: true,
    nowTime,
    currentLabel: previousEvent ? getCurrentLabelByEventType(previousEvent.type) : "当前作战时间",
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
    status: "ready"
  };
}

module.exports = {
  parseTimeToMinutes,
  formatMinutesToClock,
  normalizeEventMinute,
  normalizeSleepMinute,
  formatOperationalTime,
  buildDailyFlowEvents,
  getNextActionFromEvents
};
