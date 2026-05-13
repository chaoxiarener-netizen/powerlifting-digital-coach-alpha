const APP_KEYS = ["appUsageMode", "singleDayPlan"];

function getStorage(key, fallback) {
  try {
    const value = wx.getStorageSync(key);
    if (value === "" || value === undefined || value === null) {
      return fallback;
    }
    return value;
  } catch (error) {
    console.warn("getStorage failed:", key, error);
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    wx.setStorageSync(key, value);
    return true;
  } catch (error) {
    console.warn("setStorage failed:", key, error);
    return false;
  }
}

function removeStorage(key) {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (error) {
    console.warn("removeStorage failed:", key, error);
    return false;
  }
}

function clearAppStorage() {
  APP_KEYS.forEach((key) => removeStorage(key));
}

function getSingleDayPlan() {
  const plan = getStorage("singleDayPlan", null);
  if (!plan || typeof plan !== "object") return null;
  return plan;
}

function saveSingleDayPlan(plan) {
  return setStorage("singleDayPlan", plan);
}

function getAppUsageMode() {
  return getStorage("appUsageMode", "");
}

function setAppUsageMode(mode) {
  return setStorage("appUsageMode", mode);
}

module.exports = {
  getStorage,
  setStorage,
  removeStorage,
  clearAppStorage,
  getSingleDayPlan,
  saveSingleDayPlan,
  getAppUsageMode,
  setAppUsageMode
};
