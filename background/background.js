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
  } catch {
    return null;
  }
}

async function updateGroupTitle(groupId, hostname) {
  const tabs = await chrome.tabs.query({ groupId });

  await chrome.tabGroups.update(groupId, {
    title: `${hostname} (${tabs.length})`,
  });
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

        await updateGroupTitle(cachedGroupId, hostname);

        return cachedGroupId;
      }
    } catch {}
  }

  const newGroupId = await chrome.tabs.group({ tabIds });

  const settings = await getSettings();

  await chrome.tabGroups.update(newGroupId, {
    color: settings.smartColoring ? nextColor() : undefined,
    collapsed: settings.collapsedByDefault,
  });

  await updateGroupTitle(newGroupId, hostname);

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

      const hostname = title.split(" (")[0];

      let perWindow = groupCache.get(hostname);
      if (!perWindow) {
        perWindow = new Map();
        groupCache.set(hostname, perWindow);
      }

      perWindow.set(g.windowId, g.id);
    }
  } catch {}
}

rebuildGroupCache();

async function groupAllTabs() {
  const tabs = await chrome.tabs.query({});
  const buckets = {};

  for (const tab of tabs) {
    if (!tab.url?.startsWith("http")) continue;

    const hostname = getHostname(tab.url);
    if (!hostname) continue;

    (buckets[hostname] ||= []).push(tab.id);
  }

  for (const [hostname, ids] of Object.entries(buckets)) {
    await getOrCreateGroup(hostname, ids);
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

    if (!tab.url?.startsWith("http")) continue;

    const hostname = getHostname(tab.url);
    if (!hostname) continue;

    (buckets[hostname] ||= []).push(tab.id);
  }

  for (const [hostname, ids] of Object.entries(buckets)) {
    await getOrCreateGroup(hostname, ids);
  }
}

chrome.tabs.onCreated.addListener(async (tab) => {
  const settings = await getSettings();
  if (!settings.autoGroup) return;

  if (tab.url?.startsWith("http")) {
    const hostname = getHostname(tab.url);
    if (hostname) await getOrCreateGroup(hostname, [tab.id]);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  const settings = await getSettings();
  if (!settings.autoGroup) return;

  if (changeInfo.url?.startsWith("http")) {
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
      sendResponse({ error: err?.message || String(err) });
    }
  })();

  return true;
});
