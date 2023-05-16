import { expect, test } from 'vitest';
import '../src/common';
import { oneOffMeeting } from './data';

test('convert one off meeting', () => {
    let expected = {
        id: oneOffMeeting.id,
        meet: oneOffMeeting.hangoutLink,
        dateTime: oneOffMeeting.start.dateTime,
        name: oneOffMeeting.summary,
        allDay: false,
        updatedDateTime: oneOffMeeting.updated,
    }

    expect(convertedMeeting(oneOffMeeting)).toBe(expected);
})