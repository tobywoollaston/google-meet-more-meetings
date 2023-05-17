import { dateFormat } from "./dateFormat.js";

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

export function getEndOfDay() {
    let endOfDay = new Date();
    // endOfDay = endOfDay.addDays(1);
    endOfDay.setHours(23);
    endOfDay.setMinutes(59);
    endOfDay.setSeconds(59);
    return endOfDay;
}

Date.prototype.dateEquals = function (date) {
    return this.getYear() == date.getYear() && this.getMonth() == date.getMonth() && this.getDate() == date.getDate();
};

Date.prototype.timeGreater = function (date) {
    if (this.getUTCHours() == date.getUTCHours()) {
        return this.getUTCMinutes() <= date.getUTCMinutes();
    }
    return this.getUTCHours() <= date.getUTCHours();
};

export function getTime(date) {
    let newDateTime = "2000-01-01T" + dateFormat(date, "HH:MM:ss");
    return new Date(newDateTime);
}

export function getDisplayTimeFor(meeting) {
    let dateTime = new Date(meeting.dateTime);
    let time = meeting.allDay ? "All day" : dateFormat(dateTime, "h:MMTT");
    return time;
}
