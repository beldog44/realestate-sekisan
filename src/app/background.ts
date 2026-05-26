chrome.action.onClicked.addListener((tab) => {
  if (tab.windowId) {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "OPEN_SIDE_PANEL") {
    chrome.windows.getCurrent({}, (win) => {
      if (win.id) chrome.sidePanel.open({ windowId: win.id });
    });
    sendResponse({ ok: true });
  }
  return true;
});
