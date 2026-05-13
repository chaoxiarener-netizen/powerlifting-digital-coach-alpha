const storage = require("../../utils/storage");
const dailyFlow = require("../../utils/daily_flow_engine");

function buildNextAction() {
  const plan = storage.getSingleDayPlan();
  const events = plan ? dailyFlow.buildDailyFlowEvents({ singleDayPlan: plan }) : [];
  return dailyFlow.getNextActionFromEvents(events, new Date());
}

Page({
  data: {
    nextAction: dailyFlow.getNextActionFromEvents([], new Date())
  },

  onShow() {
    this.refreshNextAction();
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer);
  },

  onLoad() {
    this.timer = setInterval(() => this.refreshNextAction(), 30000);
  },

  refreshNextAction() {
    this.setData({
      nextAction: buildNextAction()
    });
  },

  goSingleDay() {
    storage.setAppUsageMode("single_day");
    wx.navigateTo({
      url: "/pages/single-day/index"
    });
  },

  goDashboard() {
    wx.navigateTo({
      url: "/pages/dashboard/index"
    });
  },

  clearData() {
    storage.clearAppStorage();
    this.refreshNextAction();
    wx.showToast({
      title: "已清空",
      icon: "success"
    });
  }
});
