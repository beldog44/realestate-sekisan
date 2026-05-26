import { detectSiteAndParse } from "@/parsers";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "PARSE_PAGE") {
    try {
      const result = detectSiteAndParse(document, window.location.href);
      sendResponse({ ok: true, result });
    } catch (err) {
      sendResponse({ ok: false, error: String(err) });
    }
  }
  return true;
});
