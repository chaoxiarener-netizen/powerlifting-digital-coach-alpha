Page({
  data: {
    entries: [
      { mode: "single_day", title: "轻量单日计划" },
      { mode: "weekly", title: "周计划模式" },
      { mode: "dashboard", title: "今日作战图" }
    ]
  },

  handleEntryTap(event) {
    const { mode } = event.currentTarget.dataset;
    console.log("Miniprogram entry placeholder:", mode);
  }
});
