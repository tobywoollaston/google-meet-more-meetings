import { expect, test } from 'vitest';
// import { convertedMeeting } from '../src/commonNew'
import { oneOffMeeting } from './data';

let common = require('../src/commonNew');
console.log(common);

test('convert one off meeting', () => {
    let expected = {
        id: oneOffMeeting.id,
        meet: oneOffMeeting.hangoutLink,
        dateTime: oneOffMeeting.start.dateTime,
        name: oneOffMeeting.summary,
        allDay: false,
        updatedDateTime: oneOffMeeting.updated,
    }

    expect(common.convertedMeeting(oneOffMeeting)).toBe(expected);
})