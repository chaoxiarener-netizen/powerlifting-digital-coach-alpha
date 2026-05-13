const storage = require("../../utils/storage");

const dayTypeOptions = [
  { value: "rest", label: "恢复 / rest" },
  { value: "light", label: "轻训 / light" },
  { value: "medium", label: "中等 / medium" },
  { value: "heavy", label: "重训 / heavy" }
];

const liftOptions = [
  { value: "rest", label: "休息 / rest" },
  { value: "squat", label: "深蹲 / squat" },
  { value: "bench", label: "卧推 / bench" },
  { value: "deadlift", label: "硬拉 / deadlift" },
  { value: "accessory", label: "辅助 / accessory" }
];

const supplementBaseOptions = [
  { value: "caffeine", label: "咖啡因", desc: "晚间训练会触发阻断提醒" },
  { value: "creatine", label: "一水肌酸", desc: "每日基础补剂" },
  { value: "magnesium", label: "镁", desc: "睡前恢复" }
];

function todayString() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function findIndex(options, value, fallback) {
  const index = options.findIndex((item) => item.value === value);
  return index >= 0 ? index : fallback;
}

function buildDefaultForm() {
  const existing = storage.getSingleDayPlan();
  return {
    isTrainingDay: existing ? existing.isTrainingDay !== false : true,
    dayType: existing ? existing.dayType || "medium" : "medium",
    lift: existing ? existing.lift || "squat" : "squat",
    workoutStartTime: existing ? existing.workoutStartTime || "21:00" : "21:00",
    workoutDurationMinutes: existing ? String(existing.workoutDurationMinutes || 90) : "90",
    wakeUpTime: existing ? existing.wakeUpTime || "07:00" : "07:00",
    plannedSleepTime: existing ? existing.plannedSleepTime || "00:30" : "00:30",
    rpe: existing && existing.rpe != null ? String(existing.rpe) : "8",
    selectedSupplements: existing && Array.isArray(existing.selectedSupplements)
      ? existing.selectedSupplements
      : ["creatine", "magnesium"]
  };
}

Page({
  data: {
    form: buildDefaultForm(),
    dayTypeOptions,
    liftOptions,
    supplementOptions: [],
    dayTypeIndex: 2,
    liftIndex: 1
  },

  onLoad() {
    this.syncDerivedState();
  },

  syncDerivedState() {
    const { form } = this.data;
    this.setData({
      dayTypeIndex: findIndex(dayTypeOptions, form.dayType, 2),
      liftIndex: findIndex(liftOptions, form.lift, 1),
      supplementOptions: supplementBaseOptions.map((item) => ({
        ...item,
        checked: form.selectedSupplements.indexOf(item.value) >= 0
      }))
    });
  },

  handleTrainingToggle(event) {
    const isTrainingDay = event.detail.value;
    const nextForm = {
      ...this.data.form,
      isTrainingDay,
      dayType: isTrainingDay ? "medium" : "rest",
      lift: isTrainingDay ? "squat" : "rest"
    };
    this.setData({ form: nextForm }, () => this.syncDerivedState());
  },

  handleDayTypeChange(event) {
    const index = Number(event.detail.value);
    const option = dayTypeOptions[index] || dayTypeOptions[0];
    const isRest = option.value === "rest";
    this.setData({
      form: {
        ...this.data.form,
        isTrainingDay: !isRest,
        dayType: option.value,
        lift: isRest ? "rest" : (this.data.form.lift === "rest" ? "squat" : this.data.form.lift)
      }
    }, () => this.syncDerivedState());
  },

  handleLiftChange(event) {
    const index = Number(event.detail.value);
    const option = liftOptions[index] || liftOptions[0];
    const isRest = option.value === "rest";
    this.setData({
      form: {
        ...this.data.form,
        isTrainingDay: !isRest,
        dayType: isRest ? "rest" : (this.data.form.dayType === "rest" ? "medium" : this.data.form.dayType),
        lift: option.value
      }
    }, () => this.syncDerivedState());
  },

  handleTimeChange(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      form: {
        ...this.data.form,
        [field]: event.detail.value
      }
    });
  },

  handleInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      form: {
        ...this.data.form,
        [field]: event.detail.value
      }
    });
  },

  handleSupplementChange(event) {
    this.setData({
      form: {
        ...this.data.form,
        selectedSupplements: event.detail.value
      }
    }, () => this.syncDerivedState());
  },

  savePlan() {
    const existing = storage.getSingleDayPlan();
    const now = new Date().toISOString();
    const { form } = this.data;
    const duration = Number(form.workoutDurationMinutes) || 90;
    const rpe = form.rpe === "" ? null : Number(form.rpe);
    const plan = {
      version: "v1",
      source: "single_day",
      date: todayString(),
      isTrainingDay: !!form.isTrainingDay,
      dayType: form.isTrainingDay ? form.dayType : "rest",
      lift: form.isTrainingDay ? form.lift : "rest",
      workoutStartTime: form.workoutStartTime,
      workoutDurationMinutes: duration,
      wakeUpTime: form.wakeUpTime,
      plannedSleepTime: form.plannedSleepTime,
      rpe: Number.isFinite(rpe) ? rpe : null,
      selectedSupplements: form.selectedSupplements,
      notes: "",
      createdAt: existing && existing.createdAt ? existing.createdAt : now,
      updatedAt: now
    };

    storage.saveSingleDayPlan(plan);
    storage.setAppUsageMode("single_day");
    wx.navigateTo({
      url: "/pages/dashboard/index"
    });
  },

  goHome() {
    wx.reLaunch({
      url: "/pages/index/index"
    });
  }
});
