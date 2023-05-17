import { 
    getGoogleMeets,
    getAllDayMeetings,
    getSlotMeetings,
    getDisplayTimeFor
 } from '../common.js';

window.addEventListener("message", ({ data })=>{
    if (data.type === 'token') {
        addMeetings(data.token);
    }
});

const escapeHTMLPolicy = trustedTypes.createPolicy("myEscapePolicy", {
    createHTML: (string) => string.replace(/>/g, "<"),
});

const displayMeetings = (meetings, meetingsDiv) => {
    meetingsDiv.style.width = "100%";
    meetingsDiv.style.borderCollapse = "collapse";

    meetings.forEach(meet => {
        let meetingRow = document.createElement("tr");
        meetingRow.setAttribute("role", "button");
        meetingRow.style.height = "65px";
        meetingRow.style.borderStyle = "solid";
        meetingRow.style.borderWidth = "1px 0";
        meetingRow.style.borderColor = "rgba(32,33,36,.2)";
        meetingRow.addEventListener("click", () => (window.location.href = meet.meet));

        let dateColumn = document.createElement("td");
        dateColumn.innerHTML = escapeHTMLPolicy.createHTML(getDisplayTimeFor(meet));
        dateColumn.style.width = "112px";
        dateColumn.style.fontSize = "16px";

        let nameColumn = document.createElement("td");
        nameColumn.innerHTML = escapeHTMLPolicy.createHTML(meet.name);
        nameColumn.style.textAlign = "left";
        nameColumn.style.fontSize = "18px";

        meetingRow.appendChild(dateColumn);
        meetingRow.appendChild(nameColumn);
        meetingsDiv.appendChild(meetingRow);
    });
};

const addMeetings = async token => {
    const xpath = "//div[contains(text(), 'From your Google Calendar')]";
    const sibling = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    const meetingsBlock = sibling.previousSibling; //document.getElementsByClassName("VdLOD yUoCvf JxfZTd")[0];
    meetingsBlock.innerHTML = escapeHTMLPolicy.createHTML("");
    let meetingTable = document.createElement("table");
    meetingsBlock.appendChild(meetingTable);

    let meetings = await getGoogleMeets(token);
    let allDayEvents = getAllDayMeetings(meetings);
    let timedEvents = getSlotMeetings(meetings);

    displayMeetings(allDayEvents, meetingTable);
    displayMeetings(timedEvents, meetingTable);

    meetingTable.firstChild.style.borderTop = "none";
    meetingTable.lastChild.style.borderBottom = "none";

    var css = "table tr:hover { background-color: rgb(26,115,232); color: white !important; }";
    let style = document.createElement("style");
    style.appendChild(document.createTextNode(css));
    meetingTable.appendChild(style);
};
