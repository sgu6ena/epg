let divAlerts = document.getElementById('alerts');
let input_login = document.getElementById("code_login");
let input_pass = document.getElementById("code_pass");
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
}

function auth() {
    console.log(getCookie('SSID'));
    if (getCookie('SSID') != undefined) { //TODO проверка данных аккаунта
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
    let LoginUrl = "https://iptv.kartina.tv/api/json/login?login=" + UserName + "&pass=" + UserPassword;
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
    let UserName = document.getElementById("code_login").value,
        UserPassword = document.getElementById("code_pass").value;
    login(UserName, UserPassword);
}

function authOK() {
    divAlerts.insertAdjacentHTML('beforeend', `<div class="alert alert-success" role="alert">
    Авторизация успешна!
    </div>`);
    setTimeout(function() { divAlerts.innerHTML = "" }, 2000);
    document.getElementById("code_login").hidden = true;
    document.getElementById("code_pass").hidden = true;
    document.getElementById('btlogin').hidden = true;
    document.getElementById('showepg').hidden = false;
    showEPGv3(); // заполняем епг в3
}

function authErr() {
    divAlerts.insertAdjacentHTML('beforeend', `<div class="alert alert-danger" role="alert">
    Вам необходимо авторизироваться!
    </div>`);
    setTimeout(function() { divAlerts.innerHTML = "" }, 3000);
    document.getElementById("code_login").hidden = false;
    document.getElementById("code_pass").hidden = false;
    document.getElementById('btlogin').hidden = false;
    document.getElementById('showepg').hidden = true;

}



let divEpg = document.getElementById('epg');

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
                    number++; //номер канала
                    divEpg.insertAdjacentHTML('beforeend', `  
                    <button class="button-chanel" id="${chan[j].id}"  onclick="showEpg(${chan[j].id})">                    
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
        month: 'short'
    });
    return (s);
}

let divChannelEpg = document.getElementById('channelEPG');

function showEpg(channelID) {
    let channelURL = `https://iptv.kartina.tv/api/json/v3/channel/${channelID}/epg?MW_SSID=${getCookie('SSID')}`;
    divChannelEpg.innerHTML = "";
    fetch(channelURL)
        .then(response => response.json())
        .then(data => {
            let epg = data.epg;
            for (let i = 0; i < epg.length; i++) {
                divChannelEpg.insertAdjacentHTML('beforeend', `
                <button class="button-chanel" id="${i}"  onclick="showDescription(${i})"> 
                <p class="live-tv">&nbsp;${timetonormaldate(epg[i].start)}-${timetonormal(epg[i].end)} ${epg[i].title}</p>
                </button>
                <hr>
                `);
                //  console.log(epg[i].title);
            };
        });
}

function showDescription(i) {
    console.log(i);
}