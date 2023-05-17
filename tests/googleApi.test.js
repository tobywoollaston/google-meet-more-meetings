import { expect, describe, test, vi, beforeEach } from "vitest";
import { getCalendars, getMeetingsFor } from "../src/googleApi";

function createFetchResponse(data) {
    return { json: () => new Promise(resolve => resolve(data)) };
}

describe("get all calendars for a user", () => {
    global.fetch = vi.fn();
    beforeEach(() => {
        global.fetch.mockReset();
    });

    test("call calendars endpoint", async () => {
        const token = "TOKENNN";
        fetch.mockResolvedValue(createFetchResponse({ items: [] }));

        await getCalendars(token);

        expect(fetch).toHaveBeenCalledWith("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
    });

    test("return id and name of calendar", async () => {
        fetch.mockResolvedValue(createFetchResponse({ items: [{ id: "AnId", summary: "MyCalendar" }] }));

        let result = await getCalendars("TOKENNN");

        expect(result).toStrictEqual([{ id: "AnId", name: "MyCalendar" }]);
    });
});

describe("get all events until end of day for a calendar", () => {
    global.fetch = vi.fn();
    beforeEach(() => {
        global.fetch.mockReset();
    });

    test("call events endpoint", async () => {
        const token = "TOKENNN";
        fetch.mockResolvedValue(createFetchResponse({ items: [] }));

        await getMeetingsFor({ id: "CalendarId" }, token);

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("https://www.googleapis.com/calendar/v3/calendars/CalendarId/events?timeMax="),
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        );
    });

    test("return the events", async () => {
        const token = "TOKENNN";
        const items = [{ name: "myEvent" }];
        fetch.mockResolvedValue(createFetchResponse({ items }));
        const date = new Date("2023-05-16T09:35:00+01:00");
        vi.setSystemTime(date);

        const result = await getMeetingsFor({ id: "CalendarId" }, token);

        expect(result).toStrictEqual(items);
    });
});
