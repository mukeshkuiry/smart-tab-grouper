// Button handlers
document.getElementById("groupNow").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "GROUP_ALL_TABS" });
});

document.getElementById("groupUngrouped").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "GROUP_UNGROUPED_TABS" });
});

document.getElementById("ungroupAll").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "UNGROUP_ALL_TABS" });
});

// Settings handlers
function setupToggleHandlers() {
  const toggleAutoGroup = document.getElementById("toggleAutoGroup");
  const toggleSmartColoring = document.getElementById("toggleSmartColoring");
  const toggleCollapsed = document.getElementById("toggleCollapsed");

  toggleAutoGroup.addEventListener("click", () => {
    toggleAutoGroup.classList.toggle("active");
    saveSetting("autoGroup", toggleAutoGroup.classList.contains("active"));
  });

  toggleSmartColoring.addEventListener("click", () => {
    toggleSmartColoring.classList.toggle("active");
    saveSetting(
      "smartColoring",
      toggleSmartColoring.classList.contains("active"),
    );
  });

  toggleCollapsed.addEventListener("click", () => {
    toggleCollapsed.classList.toggle("active");
    saveSetting(
      "collapsedByDefault",
      toggleCollapsed.classList.contains("active"),
    );
  });
}

async function saveSetting(key, value) {
  const settings = await loadSettings();
  settings[key] = value;
  chrome.runtime.sendMessage({ type: "SAVE_SETTINGS", settings });
}

async function loadSettings() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (settings) => {
      resolve(settings);
    });
  });
}

// Initialize
async function init() {
  const settings = await loadSettings();

  // Set toggle states
  if (settings.autoGroup) {
    document.getElementById("toggleAutoGroup").classList.add("active");
  }
  if (settings.smartColoring) {
    document.getElementById("toggleSmartColoring").classList.add("active");
  }
  if (settings.collapsedByDefault) {
    document.getElementById("toggleCollapsed").classList.add("active");
  }

  setupToggleHandlers();
}

init();
