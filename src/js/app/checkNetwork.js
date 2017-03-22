const el = document.querySelector('.network-status');
const elIndicator = document.querySelector('.network-status-circle');
const elText = document.querySelector('.network-status-text');
let timer;
let indicatorClass;

function showOfflineBanner(e) {
    elIndicator.classList.remove(indicatorClass);
    // Clear previous timer
    clearTimeout(timer);

    let text = e.type == 'online' ? 'You are online' : 'You are offline';
    indicatorClass = e.type == 'online' ? 'green' : 'red';
    elIndicator.classList.add(indicatorClass);
    elText.innerHTML = text;
    el.classList.add('active');

    // Run new timer
    timer = setTimeout(function () {
        el.classList.remove('active');
    }, 5000);
}

function bindEvents() {
    window.addEventListener('offline', function (e) {
        showOfflineBanner(e);
    });
    window.addEventListener('online', function (e) {
        showOfflineBanner(e);
    });
}
bindEvents();