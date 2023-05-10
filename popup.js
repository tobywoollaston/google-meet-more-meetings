async function removeAccount() {
    let token = await getToken();
    await chrome.identity.removeCachedAuthToken({ token });
    await fetch("https://accounts.google.com/o/oauth2/revoke?token=" + token);
}

const displayMeetings = (meetings, meetingsDiv) => {
        meetingsDiv.style.width = "100%";
        meetingsDiv.style.borderCollapse = "collapse";

        meetings.forEach(meet => {
            let meetingRow = document.createElement('tr');
            meetingRow.style.height = "40px";
            meetingRow.style.borderStyle = "solid";
            meetingRow.style.borderWidth = "1px 0";
            meetingRow.style.borderColor = "rgba(32,33,36,.2)";
            meetingRow.addEventListener('click', () => {
                chrome.tabs.update({ url: meet.meet });
            });

            let dateColumn = document.createElement('td');
            dateColumn.innerHTML = getDisplayTimeFor(meet);
            dateColumn.style.width = "112px";
            dateColumn.style.color = "rgba(32,33,36,.67)";
            dateColumn.style.fontSize = "13px";
            dateColumn.style.textAlign = "center";

            let nameColumn = document.createElement('td');
            nameColumn.innerHTML = meet.name;
            nameColumn.style.textAlign = "left";
            nameColumn.style.fontSize = "15px";
            
            meetingRow.appendChild(dateColumn);
            meetingRow.appendChild(nameColumn);
            meetingsDiv.appendChild(meetingRow);
        });
    }

async function main() {
    const btnRemoveAcount = document.getElementById("logout")
    btnRemoveAcount.addEventListener('click', removeAccount);

    let meetings = await getGoogleMeets();

    const meetingsBlock = document.getElementById("meetings")
    meetingsBlock.innerHTML = "";
    let meetingTable = document.createElement('table');
    meetingsBlock.appendChild(meetingTable);

    let allDayEvents = getAllDayMeetings(meetings);
    let timedEvents = getSlotMeetings(meetings);

    displayMeetings(allDayEvents, meetingTable);
    displayMeetings(timedEvents, meetingTable);

    meetingTable.firstChild.style.borderTop = "none";
    meetingTable.lastChild.style.borderBottom = "none";

    var css = 'table tr:hover { background-color: rgb(26,115,232); color: white !important; }';
    let style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    meetingTable.appendChild(style);
}

main();