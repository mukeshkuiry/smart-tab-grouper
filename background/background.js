const COLORS = ["blue", "green", "yellow", "red", "purple", "cyan", "orange"];

let colorIndex = 0;
const groupCache = new Map();

const DEFAULT_SETTINGS = {
  autoGroup: true,
  smartColoring: true,
  collapsedByDefault: false,
};

async function getSettings() {
  const data = await chrome.storage.sync.get("settings");
  return { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
}

async function saveSettings(settings) {
  await chrome.storage.sync.set({ settings });
}

function nextColor() {
  const c = COLORS[colorIndex % COLORS.length];
  colorIndex += 1;
  return c;
}

function getHostname(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch (err) {
    return null;
  }
}

async function getOrCreateGroup(hostname, tabIds) {
  const tab = await chrome.tabs.get(tabIds[0]);
  const windowId = tab.windowId;

  let perWindow = groupCache.get(hostname);
  if (!perWindow) {
    perWindow = new Map();
    groupCache.set(hostname, perWindow);
  }

  if (perWindow.has(windowId)) {
    const cachedGroupId = perWindow.get(windowId);
    try {
      const groupInfo = await chrome.tabGroups.get(cachedGroupId);
      if (groupInfo && groupInfo.windowId === windowId) {
        await chrome.tabs.group({ groupId: cachedGroupId, tabIds });
        return cachedGroupId;
      }
    } catch (err) {
      // fall through
    }
  }

  const newGroupId = await chrome.tabs.group({ tabIds });
  const settings = await getSettings();
  await chrome.tabGroups.update(newGroupId, {
    title: hostname,
    color: settings.smartColoring ? nextColor() : undefined,
    collapsed: settings.collapsedByDefault,
  });

  perWindow.set(windowId, newGroupId);
  return newGroupId;
}

async function rebuildGroupCache() {
  try {
    const groups = await chrome.tabGroups.query({});
    groupCache.clear();
    for (const g of groups) {
      const title = g.title?.toLowerCase();
      if (!title) continue;
      let perWindow = groupCache.get(title);
      if (!perWindow) {
        perWindow = new Map();
        groupCache.set(title, perWindow);
      }
      perWindow.set(g.windowId, g.id);
    }
  } catch (e) {}
}

rebuildGroupCache();

async function groupAllTabs() {
  const tabs = await chrome.tabs.query({});
  const buckets = {};

  for (const tab of tabs) {
    if (!tab.url || !tab.url.startsWith("http")) continue;
    const hostname = getHostname(tab.url);
    if (!hostname) continue;
    if (!buckets[hostname]) buckets[hostname] = [];
    buckets[hostname].push(tab.id);
  }

  for (const [hostname, tabIds] of Object.entries(buckets)) {
    await getOrCreateGroup(hostname, tabIds);
  }
}

async function ungroupAllTabs() {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.groupId && tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
      await chrome.tabs.ungroup(tab.id);
    }
  }

  groupCache.clear();
  colorIndex = 0;
}

async function groupUngroupedTabs() {
  const tabs = await chrome.tabs.query({});
  const buckets = {};

  for (const tab of tabs) {
    if (tab.groupId && tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE)
      continue;
    if (!tab.url || !tab.url.startsWith("http")) continue;
    const hostname = getHostname(tab.url);
    if (!hostname) continue;
    if (!buckets[hostname]) buckets[hostname] = [];
    buckets[hostname].push(tab.id);
  }

  for (const [hostname, tabIds] of Object.entries(buckets)) {
    await getOrCreateGroup(hostname, tabIds);
  }
}

chrome.tabs.onCreated.addListener(async (tab) => {
  const settings = await getSettings();
  if (!settings.autoGroup) return;
  if (tab.url && tab.url.startsWith("http")) {
    const hostname = getHostname(tab.url);
    if (hostname) await getOrCreateGroup(hostname, [tab.id]);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  const settings = await getSettings();
  if (!settings.autoGroup) return;
  if (changeInfo.url && changeInfo.url.startsWith("http")) {
    const hostname = getHostname(changeInfo.url);
    if (hostname) await getOrCreateGroup(hostname, [tabId]);
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      if (msg.type === "GROUP_ALL_TABS") await groupAllTabs();
      else if (msg.type === "UNGROUP_ALL_TABS") await ungroupAllTabs();
      else if (msg.type === "GROUP_UNGROUPED_TABS") await groupUngroupedTabs();
      else if (msg.type === "GET_SETTINGS") sendResponse(await getSettings());
      else if (msg.type === "SAVE_SETTINGS") {
        await saveSettings(msg.settings);
        sendResponse({ success: true });
      }
    } catch (err) {
      try {
        sendResponse({ error: err?.message || String(err) });
      } catch (e) {}
    }
  })();

  return true;
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "group-all-tabs") await groupAllTabs();
  else if (command === "ungroup-all-tabs") await ungroupAllTabs();
  else if (command === "group-ungrouped-tabs") await groupUngroupedTabs();
});
