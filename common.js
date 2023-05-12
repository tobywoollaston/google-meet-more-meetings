async function getToken() {
    const auth = await chrome.identity.getAuthToken({ interactive: true });
    return auth.token;
}

async function getCalendars(authToken) {
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

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

function getEndOfDay() {
    let endOfDay = new Date();
    // endOfDay = endOfDay.addDays(1);
    endOfDay.setHours(23);
    endOfDay.setMinutes(59);
    endOfDay.setSeconds(59);
    return endOfDay;
}

async function getMeetingsFor(calendar, authToken) {
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

async function getMeetingsWith(calendars, authToken) {
    let allMeetings = [];
    await Promise.all(
        calendars.map(async calendar => {
            let meetingsForCalendar = await getMeetingsFor(calendar, authToken);
            if (meetingsForCalendar) {
                allMeetings = allMeetings.concat(meetingsForCalendar);
            }
        })
    );

    return allMeetings;
}

function isGoogleMeet(meeting) {
    return meeting.hangoutLink ? true : false;
}

Date.prototype.dateEquals = function(date) {
    return this.getYear() == date.getYear() && this.getMonth() == date.getMonth() && this.getDate() == date.getDate();
};

function isMeetingInFuture(meeting) {
    let endDateTime = new Date(meeting.end.dateTime ?? meeting.end.date);
    let currentDateTime = new Date();

    let startDate = new Date(meeting.start.dateTime);

    if (endDateTime.getTime() > currentDateTime.getTime()) {
        return true;
    }

    if (meeting.recurrence && startDate.dateEquals(endDateTime) && endDateTime.getTime() < currentDateTime.getTime()) {
        return true;
    }

    return false;
}

function convertedMeeting(meeting) {
    return {
        id: meeting.id,
        meet: meeting.hangoutLink,
        dateTime: meeting.start.dateTime ?? meeting.start.date,
        name: meeting.summary,
        allDay: meeting.start.date ? true : false,
        updatedDateTime: meeting.updated,
    };
}

async function getGoogleMeets(token) {
    let authToken = token ?? (await getToken());

    let calendars = await getCalendars(authToken);
    let meetings = await getMeetingsWith(calendars, authToken);

    let filteredMeetings = [];
    meetings.forEach(meeting => {
        if (isGoogleMeet(meeting) && isMeetingInFuture(meeting)) {
            let converted = convertedMeeting(meeting);
            let sameMeetings = findSameMeetings(filteredMeetings, converted);

            if (sameMeetings.length == 0) {
                filteredMeetings.push(convertedMeeting(meeting));
            } else if (shouldReplace(meeting, sameMeetings)) {
                let index = filteredMeetings.findIndex(x => x == sameMeetings[0]);
                filteredMeetings[index] = converted;
            }
        }
    });

    return filteredMeetings;
}

function findSameMeetings(filteredMeetings, meeting) {
    return filteredMeetings.filter(x => x.meet == meeting.meet);
}

function shouldReplace(meeting, sameMeetings) {
    let existingMeeting = sameMeetings[0];
    let existingUpdatedDate = new Date(existingMeeting.updatedDateTime);
    let newMeetingUpdatedDate = new Date(meeting.updated);

    return newMeetingUpdatedDate > existingUpdatedDate;
}

function getAllDayMeetings(meetings) {
    return meetings.filter(x => x.allDay);
}

function getTime(date) {
    let newDateTime = "2000-01-01T" + dateFormat(date, "HH:MM:ss");
    return new Date(newDateTime);
}

function getSlotMeetings(meetings) {
    return meetings
        .filter(x => !x.allDay)
        .sort((a, b) => getTime(a.dateTime) - getTime(b.dateTime));
}

function getDisplayTimeFor(meeting) {
    let dateTime = new Date(meeting.dateTime);
    let time = meeting.allDay ? "All day" : dateFormat(dateTime, "h:MMTT");
    return time;
}
