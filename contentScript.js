(() => {

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, token } = obj;

        // if (type === "NEW") {
        //     if (isMeetHomePage()) {
        //         console.log('home page');
        //         addMeetings(token);
        //     } else {
        //         console.log('not home page');
        //     }
        // }
    });

    const isMeetHomePage = () => {
        const newMeetingText = "New meeting"
        let buttons = Array.from(document.getElementsByTagName("button"))
        let button = buttons.find(x => x.innerHTML?.includes(newMeetingText));

        if (button) {
            return true
        } else {
            return false
        }
    };

    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }

    async function refreshEvents(auth) {
        let calendars = await refreshCalendars(auth);
    
        let events = [];
    
        let currentDate = new Date()
        currentDate.setHours(0);
        currentDate.setMinutes(0);
        currentDate.setSeconds(0);
        currentDate.setMilliseconds(0);
        let timeMin = currentDate.toISOString();
        let timeMax = currentDate.addDays(1).toISOString()
    
        await Promise.all(calendars.map(async calendar => {
            let url = 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURI(calendar.id) + '/events';
            url += '?timeMax=' + timeMax + '&timeMin=' + timeMin
    
            let data = await fetch(url, {
                headers: {
                    'Authorization': 'Bearer ' + auth.token,
                    'Accept': 'application/json'
                }
            });
            let response = await data.json();
            if (response.items) {
                response.items.forEach(event => {
                    if (event.hangoutLink) {
                        events.push({
                            id: event.id,
                            meet: event.hangoutLink,
                            dateTime: event.start.dateTime,
                            name: event.summary
                        })
                    }
                })
            }
        }));
    
        return events;
    }
    
    async function refreshCalendars(auth) {
        let data = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
            headers: {
                'Authorization': 'Bearer ' + auth.token,
                'Accept': 'application/json'
            }
        })
        let response = await data.json();
        let calendars = response.items.map(x => {
            return { id: x.id, name: x.summary }
        });
        return calendars;
    }

    const addMeetings = async (auth) => {
        let meetings = await refreshEvents(auth);
        console.log(meetings);



        // const meetingsBlock = document.getElementsByClassName("VdLOD yUoCvf JxfZTd");
        // let random = document.createTextNode("hello there");
        // meetingsBlock[0].appendChild(random);
    };

    // <div class=" FIvd3e"><div class="ox9SMb jginQb" tabindex="0" role="button" jsaction="oRCNsf" jsname="oRCNsf"><span class="u8klde" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" focusable="false" class="Hdh4hc cIGbvc yvPNTe NMm5M"><path d="M21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15H3V6h18v13z"></path><path d="M9 8h2v2H9zM5 8h2v2H5zm3 8h8v1H8zm5-8h2v2h-2zm-4 4h2v2H9zm-4 0h2v2H5zm8 0h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"></path></svg></span><div class="cmvVG">Use a meeting code</div></div><div class="sIR20d bnbi0e"></div><div jsname="TxiLcd" aria-live="polite" aria-hidden="true"><div aria-label="Agenda updated. 1 entry.23:00 to 23:00. Testing Chrome. This meeting has started. "></div></div><div jsname="HKq5re" class="XdaCre eLNT1d"><div class="tw5Xaf" jscontroller="Opj7Pd" jsaction="JIbuQc:Y6YVTe(OCpkoe),F2vEr(ttdpI);"><div style="display: none;" jscontroller="u8imKc" jsaction="rcuQ6b:TFp36" data-impression="6901"></div><div class="uTbUHc"><span data-is-tooltip-wrapper="true"><button class="VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ MJkwyf" jscontroller="soHxf" jsaction="click:cOuCgd; mousedown:UX7yZ; mouseup:lbsD7e; mouseenter:tfO1Yc; mouseleave:JywGue; touchstart:p6p2H; touchmove:FwuNnf; touchend:yfqBxc; touchcancel:JMtRjd; focus:AHmuwe; blur:O22p3e; contextmenu:mg9Pef;mlnRJb:fLiPzd;" jsname="ttdpI" data-disable-idom="true" disabled="" aria-label="Previous" data-tooltip-enabled="true" data-tooltip-id="tt-i12"><div jsname="s3Eaab" class="VfPpkd-Bz112c-Jh9lGc"></div><div class="VfPpkd-Bz112c-J1Ukfc-LhBDec"></div><svg width="24" height="24" viewBox="0 0 24 24" focusable="false" class="Hdh4hc cIGbvc NMm5M hhikbc"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"></path></svg></button><div class="EY8ABd-OWXEXe-TAWMXe" id="tt-i12" role="tooltip" aria-hidden="true">Previous</div></span><div jsname="jQhVs"><div class="wPfO6c KKjvXb"><img class="Y8gQSd BUooTd" src="https://www.gstatic.com/meet/user_edu_get_a_link_light_90698cd7b4ca04d3005c962a3756c42d.svg" alt="Get a link that you can share" role="img" data-atf="true" data-iml="788.4000000059605"><div aria-live="polite" jsname="ij8cu"><div class="ynq40e jF89Sb">Get a link that you can share</div><div class="r1qF6c mEy26b">Click <strong>New meeting</strong> to get a link that you can send to people that you want to meet with</div></div></div><div class="wPfO6c"><img class="Y8gQSd BUooTd" src="https://www.gstatic.com/meet/user_edu_brady_bunch_light_81fa864771e5c1dd6c75abe020c61345.svg" alt="See everyone together" role="img" data-atf="false" data-iml="787.7999999970198"><div aria-live="polite" jsname="ij8cu"><div class="ynq40e jF89Sb">See everyone together</div><div class="r1qF6c mEy26b">To see more people at the same time, go to Change layout in the More options menu</div></div></div><div class="wPfO6c"><img class="Y8gQSd BUooTd" src="https://www.gstatic.com/meet/user_edu_safety_light_e04a2bbb449524ef7e49ea36d5f25b65.svg" alt="Your meeting is safe" role="img" data-atf="false" data-iml="788.9000000059605"><div aria-live="polite" jsname="ij8cu"><div class="ynq40e jF89Sb">Your meeting is safe</div><div class="r1qF6c mEy26b">No one outside your organisation can join a meeting unless invited or admitted by the host</div></div></div></div><span data-is-tooltip-wrapper="true"><button class="VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ MJkwyf" jscontroller="soHxf" jsaction="click:cOuCgd; mousedown:UX7yZ; mouseup:lbsD7e; mouseenter:tfO1Yc; mouseleave:JywGue; touchstart:p6p2H; touchmove:FwuNnf; touchend:yfqBxc; touchcancel:JMtRjd; focus:AHmuwe; blur:O22p3e; contextmenu:mg9Pef;mlnRJb:fLiPzd;" jsname="OCpkoe" data-disable-idom="true" aria-label="Next" data-tooltip-enabled="true" data-tooltip-id="tt-i13"><div jsname="s3Eaab" class="VfPpkd-Bz112c-Jh9lGc"></div><div class="VfPpkd-Bz112c-J1Ukfc-LhBDec"></div><svg width="24" height="24" viewBox="0 0 24 24" focusable="false" class="Hdh4hc cIGbvc NMm5M hhikbc"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"></path></svg></button><div class="EY8ABd-OWXEXe-TAWMXe" id="tt-i13" role="tooltip" aria-hidden="true">Next</div></span></div><div class="HD1Erc" jsname="KzLCLc"><div class="IVHFwe KKjvXb" ssk="1#0"></div><div class="IVHFwe" ssk="1#1"></div><div class="IVHFwe" ssk="1#2"></div></div></div></div><div jsname="dZzsbb" class="d5kC8b"><div jsname="dZzsbb" class="d5kC8b"><div jsname="S0Vhi"><div class="mtr0Je" jsdata="" jscontroller="uNZYUb" jsaction="rcuQ6b:npT2md" jsname="KS83le" ssk="26:09cnjee49lkpbbq676lqa2nv95"><div class="wKIIs" tabindex="0" jsaction="click:rQbaef" jsname="ICybl" role="button" aria-label="00:00 to 00:00. Testing Chrome. This is an all-day meeting.. " data-aria-label-static="00:00 to 00:00. Testing Chrome. This is an all-day meeting.. " data-begin-time="1683327600000" data-end-time="1683586800000" data-event-id="09cnjee49lkpbbq676lqa2nv95" data-call-id="kuv-dbjq-sww" data-is-now="true" data-is-all-day="true" data-default-focus="true"><div class="ARzhvc"><div class="ArJ2Te">All day</div></div><div class="taFJS"><div class="mobgod">Testing Chrome</div></div><div class="SjBtYb"></div></div></div></div></div></div></div>
})();

