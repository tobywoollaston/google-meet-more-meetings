import { expect, describe, test, vi } from "vitest";
import { getEndOfDay, getDisplayTimeFor } from "../src/dateHelpers";

describe("calculate end of day date", () => {
    test("return end of day", () => {
        const date = new Date("2023-05-16T09:35:00+01:00");
        vi.setSystemTime(date);

        const result = getEndOfDay(date);

        expect(result.getDate()).toBe(date.getDate());
        expect(result.getHours()).toBe(23);
        expect(result.getMinutes()).toBe(59);
        expect(result.getSeconds()).toBe(59);
    });
});

describe("get display time for meeting", () => {
    test("all day meeting", () => {
        let expected = "All day";

        const result = getDisplayTimeFor({ dateTime: "", allDay: true });

        expect(result).toEqual(expected);
    });

    test("meeting start time", () => {
        let expected = "2:30PM";

        const result = getDisplayTimeFor({ dateTime: "2023-04-03T14:30:00", allDay: false });

        expect(result).toEqual(expected);
    });
});
