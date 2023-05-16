'use strict';

const injectMain = () => {
    const script = document.createElement ('script');
    script.setAttribute("type", "module");
    script.setAttribute("src", chrome.runtime.getURL('src/page/main.js'));
    const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
    head.insertBefore(script, head.lastChild);
};

const isMeetHomePage = () => {
    const newMeetingText = "New meeting";
    let buttons = Array.from(document.getElementsByTagName("button"));
    let newMeetingButton = buttons.find(x => x.innerHTML?.includes(newMeetingText));

    if (newMeetingButton) {
        return true;
    } else {
        return false;
    }
};

if (isMeetHomePage()) {
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, token } = obj;
    
        if (type === "NEW") {
            if (isMeetHomePage()) {
                window.postMessage({ type: 'token', token: token.token }, 'https://meet.google.com/*')
            }
        }
    });
    injectMain();
}