chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // onUpdated should fire when the selected tab is changed or a link is clicked
    chrome.tabs.query(
        {
            active: true,
            currentWindow: true,
        },
        async function(tabs) {
            var tab = tabs[0];
            if (tab.url && tab.url.includes("meet.google.com")) {
                chrome.tabs.sendMessage(tabId, {
                    type: "NEW",
                    token: await chrome.identity.getAuthToken({ interactive: true }),
                });
            }
        }
    );
});
