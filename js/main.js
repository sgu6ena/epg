let divEpg = document.getElementById('epg');

let divChannelEpg = document.getElementById('channelEPG');

let divShowProgramm = document.getElementById('showProgramm');
// список каналов и передача в лайве
function showEPGv3() {
    let urlv3 = 'https://iptv.kartina.tv/api/json/v3/channels?MW_SSID=' + getCookie('SSID');
    divEpg.innerHTML = "";
    fetch(urlv3)
        .then(response => response.json())
        .then(data => {
            let epgv3 = data;
            let groups = epgv3.groups;
            let number = 0; //номер канала
            img_prorg = "https://kubsafety.ru/image/catalog/revolution/404error.jpg";
            for (let i = 0; i < groups.length; i++) {
                let chan = groups[i].channels;
                divEpg.insertAdjacentHTML('beforeend', `<hr class="hr-group"> <h3 class="groups-logo">${groups[i].title}</h3><hr class="hr-group">`);
                for (let j = 0; j < chan.length; j++) {
                    number++;

                    //номер канала
                    divEpg.insertAdjacentHTML('beforeend', `  
                    <button class="button-chanel" id="${chan[j].id}"  onclick="showEpg(${chan[j].id},0, '${chan[j].title}', '${chan[j].logo}')">                    
                            <img src="${chan[j].logo}" alt="logo" class="logo-chanel">
                                <span class="number-channel">${number}.</span> 
                                <span class="name-channel">${chan[j].title}</span>
                                <span class="id-channel">(${chan[j].id})</span>
                                <p class="live-tv">&nbsp;${timetonormal(chan[j].epg.start)}-${timetonormal(chan[j].epg.end)} ${chan[j].epg.title}
                                </p>
                                </button>
                    `);
                };
            };
        });
}

//программа передач на день
function showEpg(channelID, day, channelTitle, channelLogo) {
    let channelURL = `https://iptv.kartina.tv/api/json/v3/channel/${channelID}/epg?from=${dateInUnix(day)}&to=${dateInUnix(day+1)}&MW_SSID=${getCookie('SSID')}`;
    divChannelEpg.innerHTML = "";
    divChannelEpg.insertAdjacentHTML('beforeend', `
                <div class='channel-wrapper'>
                    <img src="${channelLogo}" alt="logo" class="logo-chanel-mono">
                    <span class="name-channel-mono">${channelTitle}</span>
                    <span class="id-channel">(${channelID})</span>
                </div>
                `);
    //<hr class="hr-group">
    fetch(channelURL)
        .then(response => response.json())
        .then(data => {
            let epg = data.epg;
            divChannelEpg.insertAdjacentHTML('beforeend', `
            <div class="change-date">
                <button class="button-date-prev button-date" onclick="showEpg(${channelID},${day-1},'${channelTitle}', '${channelLogo}')">&#9668;</button>
                ${timetonormaldate(dateInUnix(day)).split(',')[0]}
                <button class="button-date-prev button-date" onclick="showEpg(${channelID},${day+1},'${channelTitle}', '${channelLogo}')">&#9658;</button>
            </div> 
            `);
            if (day > 15 || day < -15) { //проверка 2 недели до/после текущей даты
                divChannelEpg.insertAdjacentHTML('beforeend', `<img src="https://kubsafety.ru/image/catalog/revolution/404error.jpg" alt="нет программ" style="text-align:center">`);
            } else {
                for (let i = 0; i < epg.length; i++) {
                    divChannelEpg.insertAdjacentHTML('beforeend', `
                <button class="button-chanel" id="${i}"  onclick="showDescription(${channelID},${epg[i].start})"> 
                <p class="live-tv">&nbsp;${timetonormal(epg[i].start)}-${timetonormal(epg[i].end)} ${epg[i].title}</p>
                </button>
                
                `);
                }
            };
        });
}

//выбранная передача: описание + плеер
function showDescription(channelID, time) {

    divShowProgramm.innerHTML = "";
    let programmURL = `https://iptv.kartina.tv/api/json/v3/channel/${channelID}/epg?from=${time}&to=${time}&MW_SSID=${getCookie('SSID')}`;
    let videoUrl = `https://iptv.kartina.tv/api/json`
    fetch(programmURL)
        .then(response => response.json())
        .then(data => {
            let epg = data.epg[0];
            console.log(epg);
            fetch(videoUrl + epg._links.play.path + `?MW_SSID=${getCookie('SSID')}`) // получение ссылки на по воспроизведение + плеер
                .then(response => response.json())
                .then(data => {
                    urls = data['url'];
                    console.log(urls);
                    divShowProgramm.insertAdjacentHTML('beforeend', `
                    <video class="player" id="livevideo" controls src="${urls}"></video>`);

                    let video = document.getElementById('livevideo');
                    let hls = new Hls({
                        xhrSetup: (xhr, url) => {
                            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                            //  xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
                            //   xhr.setRequestHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
                        }
                    });
                    hls.loadSource(video.src);
                    hls.attachMedia(video);
                    divShowProgramm.insertAdjacentHTML('beforeend', `                   
                    <p class="programm-name">${timetonormal(epg.start)}-${timetonormal(epg.end)} ${epg.title}</p>
                    <p>${epg.category?epg.category + '.':''} ${epg.genres?epg.genres + '.':''} ${epg.year?epg.year + '.':''}<p>
                    <span>${epg.description}</span>
                    `);
                    hls.on(Hls.Events.MANIFEST_PARSED, function() {
                        video.pause();
                    });
                });
            fetch(videoUrl + epg._links.archive.path + `?MW_SSID=${getCookie('SSID')}`)
                .then(response => response.json())
                .then(data => {
                    urls = data['url'];
                    console.log(urls);
                });


        })
}

function timetonormal(t) {
    let s = new Date(t * 1000).toLocaleTimeString("en-US", {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });
    return (s);
}

function timetonormaldate(t) {
    let s = new Date(t * 1000).toLocaleTimeString("ru-RU", {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'long'
    });
    return (s);
}

function dateInUnix(day) {
    let time = new Date();
    let timeInS = Date.now();
    //сегодня = время -   милисекуны            -   секунды * 1000мсек       -минуты * 60сек * 1000мсек     - часы * 60мин * 60сек * 1000мсек
    let returntime = (timeInS - time.getMilliseconds()) / 1000 - time.getSeconds() - time.getMinutes() * 60 - time.getHours() * 60 * 60 + day * 86400;
    return returntime;
}