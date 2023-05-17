import { getToken, getCalendars, getMeetingsFor } from "./googleApi.js";
import { getTime } from "./dateHelpers.js";

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

export function isGoogleMeet(meeting) {
    return meeting.hangoutLink ? true : false;
}

export function isMeetingInFuture(meeting) {
    let startDateTime = new Date(meeting.start.dateTime ?? meeting.start.date);
    let endDateTime = new Date(meeting.end?.dateTime ?? meeting.end.date);
    let currentDateTime = new Date();

    if (currentDateTime.timeGreater(endDateTime)) {
        return true;
    }

    if (
        meeting.end.date &&
        meeting.recurrence &&
        startDateTime.getTime() < currentDateTime.getTime() &&
        endDateTime.getTime() < currentDateTime.getTime()
    ) {
        return true;
    }

    return false;
}

export function convertedMeeting(meeting) {
    return {
        id: meeting.id,
        meet: meeting.hangoutLink,
        dateTime: meeting.start.dateTime ?? meeting.start.date,
        name: meeting.summary,
        allDay: meeting.start.date ? true : false,
        updatedDateTime: meeting.updated,
    };
}

export async function getGoogleMeets(token) {
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

export function shouldReplace(meeting, sameMeetings) {
    let existingMeeting = sameMeetings[0];
    let existingUpdatedDate = new Date(existingMeeting.updatedDateTime);
    let newMeetingUpdatedDate = new Date(meeting.updated);

    return newMeetingUpdatedDate > existingUpdatedDate;
}

export function getAllDayMeetings(meetings) {
    return meetings.filter(x => x.allDay);
}

export function getSlotMeetings(meetings) {
    return meetings.filter(x => !x.allDay).sort((a, b) => getTime(a.dateTime) - getTime(b.dateTime));
}
