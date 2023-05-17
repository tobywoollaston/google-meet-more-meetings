import { expect, describe, test, vi, beforeEach } from 'vitest';
import { oneOffMeeting, notGoogleMeetMeeting } from './data';
import { 
    convertedMeeting, 
    isMeetingInFuture, 
    isGoogleMeet,
    shouldReplace,
    getDisplayTimeFor,
    getCalendars,
    getMeetingsFor,
    getEndOfDay
} from '../src/common';

test('convert one off meeting', () => {
    let expected = {
        id: oneOffMeeting.id,
        meet: oneOffMeeting.hangoutLink,
        dateTime: oneOffMeeting.start.dateTime,
        name: oneOffMeeting.summary,
        allDay: false,
        updatedDateTime: oneOffMeeting.updated,
    }

    expect(convertedMeeting(oneOffMeeting)).toStrictEqual(expected);
});

describe('meeting is in future', () => {
    describe('for one off meeting with same date', () => {
        const meeting = {
            end: {
                dateTime: "2023-05-16T14:30:00+01:00"
            },
            start: {
                dateTime: "2023-05-16T13:00:00+01:00"
            }
        };
    
        test('should be true by hour', () => {
            const date = new Date("2023-05-16T09:00:00+01:00");
            vi.setSystemTime(date);
    
            const result = isMeetingInFuture(meeting);
    
            expect(result).toBeTruthy();
        });
    
        test('should be true by minute', () => {
            const date = new Date("2023-05-16T14:15:00+01:00");
            vi.setSystemTime(date);
    
            const result = isMeetingInFuture(meeting);
    
            expect(result).toBeTruthy();
        });

        test('should be false by hour', () => {
            const date = new Date("2023-05-16T15:00:00+01:00");
            vi.setSystemTime(date);
    
            const result = isMeetingInFuture(meeting);
    
            expect(result).toBeFalsy();
        });

        test('should be false by minute', () => {
            const date = new Date("2023-05-16T14:35:00+01:00");
            vi.setSystemTime(date);
    
            const result = isMeetingInFuture(meeting);
    
            expect(result).toBeFalsy();
        });
    });

    describe('for reoccuring meeting', () => {
        const meeting = {
            end: {
                dateTime: "2023-03-28T10:00:00+01:00"
            },
            start: {
                dateTime: "2023-03-28T09:45:00+01:00"
            },
            recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=FR,MO,TH,TU,WE"]
        };
        test('given time before meeting should be true', () => {
            const date = new Date("2023-05-16T09:35:00+01:00");
            vi.setSystemTime(date);
    
            const result = isMeetingInFuture(meeting);
    
            expect(result).toBeTruthy();
        });

        test('given time after meeting should be false', () => {
            const date = new Date("2023-05-16T11:35:00+01:00");
            vi.setSystemTime(date);
    
            const result = isMeetingInFuture(meeting);
    
            expect(result).toBeFalsy();
        });
    });

    describe('for all-day, multiple-day meeting', () => {
        const meeting = {
            end: {
                date: "2023-04-29"
            },
            start: {
                date: "2023-04-24"
            },
            recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO"]
        };

        test('given time during meeting should be true', () => {
            const date = new Date("2023-05-16T09:35:00+01:00");
            vi.setSystemTime(date);
    
            const result = isMeetingInFuture(meeting);
    
            expect(result).toBeTruthy();
        });
    });
});

describe('meeting contains google meet info', () => {
    test('given meeting with link return true', () => {
        const result = isGoogleMeet(oneOffMeeting);

        expect(result).toBeTruthy()
    });

    test('given meeting without link return false', () => {
        const result = isGoogleMeet(notGoogleMeetMeeting);

        expect(result).toBeFalsy()
    });
});

describe('should replace with newer meet info', () => {
    test('given new meeting with newer updated date return true', () => {
        const newMeeting = {
            updated: "2023-04-03T08:56:43.233Z"
        }
        const existingMeeting = {
            updatedDateTime:  "2023-03-27T14:17:38.961Z"
        }

        const result = shouldReplace(newMeeting, [existingMeeting])

        expect(result).toBeTruthy();
    });

    test('given new meeting with older updated date return false', () => {
        const newMeeting = {
            updated: "2023-03-27T14:17:38.961Z"
        }
        const existingMeeting = {
            updatedDateTime:  "2023-04-03T08:56:43.233Z"
        }

        const result = shouldReplace(newMeeting, [existingMeeting])

        expect(result).toBeFalsy();
    });
});

describe('get display time for meeting', () => {
    test('all day meeting', () => {
        let expected = "All day";

        const result = getDisplayTimeFor({ dateTime: "", allDay: true });

        expect(result).toEqual(expected);
    });

    test('meeting start time', () => {
        let expected = "2:30PM";

        const result = getDisplayTimeFor({ dateTime: "2023-04-03T14:30:00", allDay: false });

        expect(result).toEqual(expected);
    });
});

function createFetchResponse(data) {
    return { json: () => new Promise((resolve) => resolve(data)) }
}

describe('get all calendars for a user', () => {
    global.fetch = vi.fn();
    beforeEach(() => {
        global.fetch.mockReset()
    });

    test('call calendars endpoint', async () => {
        const token = "TOKENNN";
        fetch.mockResolvedValue(createFetchResponse({ items: [] }));        

        await getCalendars(token);
      
        expect(fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/calendar/v3/users/me/calendarList",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        );
    });

    test('return id and name of calendar', async () => {
        fetch.mockResolvedValue(createFetchResponse({ items: [{ id: "AnId", summary: "MyCalendar" }] }));

        let result = await getCalendars("TOKENNN");

        expect(result).toStrictEqual([{ id: "AnId", name: "MyCalendar" }]);
    });
});

describe('get all events until end of day for a calendar', () => {
    global.fetch = vi.fn();
    beforeEach(() => {
        global.fetch.mockReset()
    });

    test('call events endpoint', async () => {
        const token = "TOKENNN";
        fetch.mockResolvedValue(createFetchResponse({ items: [] }));
        const date = new Date("2023-05-16T09:35:00+00:00");
        vi.setSystemTime(date);

        await getMeetingsFor({id:"CalendarId"}, token);
      
        expect(fetch).toHaveBeenCalledWith(
            "https://www.googleapis.com/calendar/v3/calendars/CalendarId/events?timeMax=2023-05-16T22:59:59.000Z&timeMin=2023-05-16T09:35:00.000Z",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        );
    });

    test('return the events', async () => {
        const token = "TOKENNN";
        const items = [{ name: 'myEvent' }];
        fetch.mockResolvedValue(createFetchResponse({ items }));
        const date = new Date("2023-05-16T09:35:00+01:00");
        vi.setSystemTime(date);

        const result = await getMeetingsFor({id:"CalendarId"}, token);
        
        expect(result).toStrictEqual(items);
    });
});

describe('calculate end of day date', () => {
    test('return end of day', () => {
        const date = new Date("2023-05-16T09:35:00+01:00");
        vi.setSystemTime(date);

        const result = getEndOfDay(date);

        expect(result.getDate()).toBe(date.getDate());
        expect(result.getHours()).toBe(23);
        expect(result.getMinutes()).toBe(59);
        expect(result.getSeconds()).toBe(59);
    });
});

// test findSameMeetings?