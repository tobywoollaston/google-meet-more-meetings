import { getEndOfDay } from "./dateHelpers.js";

export async function getToken() {
    const auth = await chrome.identity.getAuthToken({ interactive: true });
    return auth.token;
}

export async function getCalendars(authToken) {
    let data = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
        headers: {
            Authorization: "Bearer " + authToken,
            Accept: "application/json",
        },
    });
    let response = await data.json();
    return response.items.map(x => {
        return { id: x.id, name: x.summary };
    });
}

export async function getMeetingsFor(calendar, authToken) {
    let currentDateTime = new Date().toISOString();
    let endOfDayDateTime = getEndOfDay().toISOString();

    let url = "https://www.googleapis.com/calendar/v3/calendars/" + encodeURI(calendar.id) + "/events";
    url += "?timeMax=" + endOfDayDateTime + "&timeMin=" + currentDateTime;

    let data = await fetch(url, {
        headers: {
            Authorization: "Bearer " + authToken,
            Accept: "application/json",
        },
    });
    let response = await data.json();
    return response.items;
}
