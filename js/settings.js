window.onload = () => {
    settings();
};

const settings = () => {
    const ssid = getCookie('SSID');
    const urlSettigs = `https://iptv.kartina.tv/api/json/settings?var=all&MW_SSID=${ssid}`;
    fetch(urlSettigs)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        });
}