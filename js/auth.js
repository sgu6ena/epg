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





function logout() {
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
