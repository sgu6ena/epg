
const divAlerts = document.getElementById('alerts');
const input_login = document.getElementById("code_login");
const input_pass = document.getElementById("code_pass");
//обработка энтеров
input_login.addEventListener("keyup", event => {
    if (event.code === 'Enter') {
        document.getElementById("code_pass").focus();
        document.getElementById("code_pass").value = '';
    }
});

input_pass.addEventListener("keyup", event => {
    if (event.code === 'Enter') {

        document.getElementById("btlogin").click();
    }
});

// возвращает куки с указанным name,
// или undefined, если ничего не найдено
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
//авторизация при загрузке страницы
window.onload = () => {
    auth();
};

function auth() {
    console.log(getCookie('SSID'));
    if (getCookie('SSID') != undefined) {
        account(getCookie('SSID'));
        console.log('3');
        //
    } else {
        if (getCookie('login') != undefined && getCookie('password') != undefined) {
            login(getCookie('login'), getCookie('password'));
            console.log('4');
        } else {
            authErr();
            console.log('5');
        };
    };
}

function account(SSID) {
    let AccountUrl = "https://iptv.kartina.tv/api/json/account?MW_SSID=" + SSID;
    fetch(AccountUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                authErr();
                console.log('1');
                return (false);
            } else {
                authOK();
                console.log('2');
                console.log(data);
                return (true);
            }
        });
}

function login(UserName, UserPassword) {
    let LoginUrl = "https://iptv.kartina.tv/api/json/login?login=" + UserName + "&pass=" + UserPassword + "&softid=dev-test-000";
    fetch(LoginUrl)
        .then(response => response.json())
        .then(data => {
            let SSID = data['sid']; //берем MW_SSID
            if (account(SSID) != false) {
                document.cookie = "login=" + UserName; //сохраняем в куки логин
                document.cookie = "password=" + UserPassword; //сохраняем в куки пасс
                document.cookie = ("SSID=" + SSID); //сохраняем ссид
            } else {
                authErr();
            };
        });
    // auth();
}

async function submit() {
    const UserName = document.getElementById("code_login").value,
        UserPassword = document.getElementById("code_pass").value;
    login(UserName, UserPassword);
}




async function logout() {
    const url = "https://iptv.kartina.tv/api/json/logout?MW_SSID=" + getCookie('SSID');
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.cookie = '';
            authErr();
        });
    window.location.href = './index.html';
}

function authOK() {
    divAlerts.insertAdjacentHTML('beforeend', `<div class="alert alert-success" role="alert">
    Авторизация успешна!
    </div>`);
    setTimeout(function() { divAlerts.innerHTML = ""; }, 2000);
    document.getElementById("code_login").hidden = true;
    document.getElementById("code_pass").hidden = true;
    document.getElementById('btlogin').hidden = true;
    document.getElementById('showepg').hidden = false;
    document.getElementById('settings').hidden = false;
    fetch(`https://iptv.kartina.tv/api/json/settings_set?var=stream_standard&val=hls_h264&MW_SSID=${getCookie('SSID')}`)
        .then(response => response.json())
        .then(data => {
            console.log('HLS ok');
        });
    showEPGv3(); // заполняем епг в3
}

function authErr() {
    divAlerts.insertAdjacentHTML('beforeend', `<div class="alert alert-danger" role="alert">
    Вам необходимо авторизироваться!
    </div>`);
    setTimeout(function() { divAlerts.innerHTML = ""; }, 3000);
    document.getElementById("code_login").hidden = false;
    document.getElementById("code_pass").hidden = false;
    document.getElementById('btlogin').hidden = false;
    document.getElementById('showepg').hidden = true;
    document.getElementById('settings').hidden = true;

}

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

            fetch(videoUrl + epg._links.play.path + `?MW_SSID=${getCookie('SSID')}`) // получение ссылки на по воспроизведение + плеер
                .then(response => response.json())
                .then(data => {
                    urls = data['url'];
                    divShowProgramm.insertAdjacentHTML('beforeend', `
                    <video class="player" id="livevideo" controls src="${urls}"></video>`);
                    let video = document.getElementById('livevideo');
                    let hls = new Hls();
                    hls.loadSource(video.src); // GC GET VIDEO SRC
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
