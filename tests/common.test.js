import { expect, describe, test, vi } from "vitest";
import { oneOffMeeting, notGoogleMeetMeeting } from "./data";
import { convertedMeeting, isMeetingInFuture, isGoogleMeet, shouldReplace } from "../src/common";

test("convert one off meeting", () => {
    let expected = {
        id: oneOffMeeting.id,
        meet: oneOffMeeting.hangoutLink,
        dateTime: oneOffMeeting.start.dateTime,
        name: oneOffMeeting.summary,
        allDay: false,
        updatedDateTime: oneOffMeeting.updated,
    };

    expect(convertedMeeting(oneOffMeeting)).toStrictEqual(expected);
});

describe("meeting is in future", () => {
    describe("for one off meeting with same date", () => {
        const meeting = {
            end: {
                dateTime: "2023-05-16T14:30:00+01:00",
            },
            start: {
                dateTime: "2023-05-16T13:00:00+01:00",
            },
        };

        test("should be true by hour", () => {
            const date = new Date("2023-05-16T09:00:00+01:00");
            vi.setSystemTime(date);

            const result = isMeetingInFuture(meeting);

            expect(result).toBeTruthy();
        });

        test("should be true by minute", () => {
            const date = new Date("2023-05-16T14:15:00+01:00");
            vi.setSystemTime(date);

            const result = isMeetingInFuture(meeting);

            expect(result).toBeTruthy();
        });

        test("should be false by hour", () => {
            const date = new Date("2023-05-16T15:00:00+01:00");
            vi.setSystemTime(date);

            const result = isMeetingInFuture(meeting);

            expect(result).toBeFalsy();
        });

        test("should be false by minute", () => {
            const date = new Date("2023-05-16T14:35:00+01:00");
            vi.setSystemTime(date);

            const result = isMeetingInFuture(meeting);

            expect(result).toBeFalsy();
        });
    });

    describe("for reoccuring meeting", () => {
        const meeting = {
            end: {
                dateTime: "2023-03-28T10:00:00+01:00",
            },
            start: {
                dateTime: "2023-03-28T09:45:00+01:00",
            },
            recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=FR,MO,TH,TU,WE"],
        };
        test("given time before meeting should be true", () => {
            const date = new Date("2023-05-16T09:35:00+01:00");
            vi.setSystemTime(date);

            const result = isMeetingInFuture(meeting);

            expect(result).toBeTruthy();
        });

        test("given time after meeting should be false", () => {
            const date = new Date("2023-05-16T11:35:00+01:00");
            vi.setSystemTime(date);

            const result = isMeetingInFuture(meeting);

            expect(result).toBeFalsy();
        });
    });

    describe("for all-day, multiple-day meeting", () => {
        const meeting = {
            end: {
                date: "2023-04-29",
            },
            start: {
                date: "2023-04-24",
            },
            recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO"],
        };

        test("given time during meeting should be true", () => {
            const date = new Date("2023-05-16T09:35:00+01:00");
            vi.setSystemTime(date);

            const result = isMeetingInFuture(meeting);

            expect(result).toBeTruthy();
        });
    });
});

describe("meeting contains google meet info", () => {
    test("given meeting with link return true", () => {
        const result = isGoogleMeet(oneOffMeeting);

        expect(result).toBeTruthy();
    });

    test("given meeting without link return false", () => {
        const result = isGoogleMeet(notGoogleMeetMeeting);

        expect(result).toBeFalsy();
    });
});

describe("should replace with newer meet info", () => {
    test("given new meeting with newer updated date return true", () => {
        const newMeeting = {
            updated: "2023-04-03T08:56:43.233Z",
        };
        const existingMeeting = {
            updatedDateTime: "2023-03-27T14:17:38.961Z",
        };

        const result = shouldReplace(newMeeting, [existingMeeting]);

        expect(result).toBeTruthy();
    });

    test("given new meeting with older updated date return false", () => {
        const newMeeting = {
            updated: "2023-03-27T14:17:38.961Z",
        };
        const existingMeeting = {
            updatedDateTime: "2023-04-03T08:56:43.233Z",
        };

        const result = shouldReplace(newMeeting, [existingMeeting]);

        expect(result).toBeFalsy();
    });
});

// test findSameMeetings?
