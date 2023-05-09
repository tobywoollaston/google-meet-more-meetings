import { dateFormat } from './dateFormat.js';

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

let auth;
let calendars;
let events = [];

async function removeAccount() {
    await getAuthToken();
    await chrome.identity.removeCachedAuthToken({token: auth.token});
    await fetch("https://accounts.google.com/o/oauth2/revoke?token=" + auth.token);
    auth = undefined;
}

async function refreshEvents() {
    await getAuthToken();
    await refreshCalendars();

    events = [];

    let currentDate = new Date()
    let timeMin = currentDate.toISOString();
    let endOfDay = (new Date());//.addDays(1);
    endOfDay.setHours(23);
    endOfDay.setMinutes(59);
    endOfDay.setSeconds(59);
    let timeMax = endOfDay.toISOString()

    await Promise.all(calendars.map(async calendar => {
        let url = 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURI(calendar.id) + '/events';
        url += '?timeMax=' + timeMax + '&timeMin=' + timeMin

        let data = await fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + auth.token,
                'Accept': 'application/json'
            }
        });
        let response = await data.json();
        if (response.items) {
            response.items.forEach(event => {
                if (event.hangoutLink) {                                   
                    if ((new Date(event.end.dateTime ?? event.end.date)).getTime() > (new Date()).getTime()) {
                        console.log(event);
                        events.push({
                            id: event.id,
                            meet: event.hangoutLink,
                            dateTime: event.start.dateTime ?? event.start.date,
                            name: event.summary,
                            allDay: event.start.date ? true : false
                        });
                    }
                }
            })
        }
    }));

    console.log(events);
}

async function refreshCalendars() {
    let data = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
            'Authorization': 'Bearer ' + auth.token,
            'Accept': 'application/json'
        }
    })
    let response = await data.json();
    calendars = response.items.map(x => {
        return { id: x.id, name: x.summary }
    });
    console.log(calendars);
}

async function getAuthToken() {
    console.log('loading auth');
    const token = await chrome.identity.getAuthToken({ 'interactive': true });
    console.log(token);
    auth = token;
}

function addEvents(events) {
    const meetingsDiv = document.getElementById("meetings");

    events.forEach(event => {
        let button = document.createElement('div')

        let dateTime = new Date(event.dateTime);
        let time = event.allDay ? "All day" : dateFormat(dateTime, "h:MMTT");
    
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

    await refreshEvents();

    const meetingsDiv = document.getElementById("meetings");
    if (events.length > 0) {
        meetingsDiv.innerText = "";
    }

    let allDayEvents = events.filter(x => x.allDay);
    let timedEvents = events.filter(x => !x.allDay)
    timedEvents.sort((a, b) => {
        return new Date(a.dateTime) - new Date(b.dateTime);
    });
    addEvents(allDayEvents);
    console.log(timedEvents);
    addEvents(timedEvents);
}

main();