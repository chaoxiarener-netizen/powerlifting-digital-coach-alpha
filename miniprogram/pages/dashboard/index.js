const storage = require("../../utils/storage");
const dailyFlow = require("../../utils/daily_flow_engine");

const LIFT_LABELS = {
  squat: "深蹲",
  bench: "卧推",
  deadlift: "硬拉",
  accessory: "辅助",
  rest: "恢复"
};

function buildSummary(plan, events) {
  const training = plan.isTrainingDay === false || plan.lift === "rest"
    ? "恢复日 · 无主项训练"
    : `${LIFT_LABELS[plan.lift] || "训练"} · ${plan.dayType || "medium"} · ${plan.workoutStartTime || "--:--"}`;
  const warning = events.find((item) => item.type === "warning");
  const sleep = events.find((item) => item.type === "sleep");
  const selectedSupplements = Array.isArray(plan.selectedSupplements) ? plan.selectedSupplements : [];

  return {
    training,
    supplements: selectedSupplements.length ? `已设置 ${selectedSupplements.length} 项补剂` : "尚未设置补剂",
    sleep: sleep ? sleep.displayTime : (plan.plannedSleepTime || "--:--"),
    warning: warning ? warning.meta : "无高优先级风险"
  };
}

Page({
  data: {
    hasPlan: false,
    plan: null,
    summary: {},
    events: []
  },

  onShow() {
    this.loadDashboard();
  },

  loadDashboard() {
    const plan = storage.getSingleDayPlan();
    if (!plan) {
      this.setData({
        hasPlan: false,
        plan: null,
        summary: {},
        events: []
      });
      return;
    }

    const events = dailyFlow.buildDailyFlowEvents({ singleDayPlan: plan });
    this.setData({
      hasPlan: true,
      plan,
      summary: buildSummary(plan, events),
      events
    });
  },

  goCreate() {
    storage.setAppUsageMode("single_day");
    wx.navigateTo({
      url: "/pages/single-day/index"
    });
  },

  goHome() {
    wx.reLaunch({
      url: "/pages/index/index"
    });
  }
});
