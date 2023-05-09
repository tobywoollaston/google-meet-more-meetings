import { 
    getGoogleMeets, 
    getToken,
    getAllDayMeetings,
    getSlotMeetings,
    getDisplayTimeFor
} from './common.js';

async function removeAccount() {
    let token = await getToken();
    await chrome.identity.removeCachedAuthToken({ token });
    await fetch("https://accounts.google.com/o/oauth2/revoke?token=" + token);
}

function addEvents(events) {
    const meetingsDiv = document.getElementById("meetings");

    events.forEach(event => {
        let button = document.createElement('div')
        let time = getDisplayTimeFor(event);
    
        button.innerHTML = "<table><tr><td style=\"width:20%;\">" + time + "</td><td> " + event.name + "</td></tr></table>"

        button.addEventListener('click', () => {
            chrome.tabs.update({ url: event.meet });
        })

        meetingsDiv.appendChild(button);
    });
}

async function main() {
    const btnRemoveAcount = document.getElementById("logout")
    btnRemoveAcount.addEventListener('click', removeAccount);

    let meetings = await getGoogleMeets();

    const meetingsDiv = document.getElementById("meetings");
    if (meetings.length > 0) {
        meetingsDiv.innerText = "";
    }

    let allDayEvents = getAllDayMeetings(meetings);
    let timedEvents = getSlotMeetings(meetings);

    addEvents(allDayEvents);
    addEvents(timedEvents);
}

main();