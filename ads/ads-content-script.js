let surfbar = null;

let countdownIsRunning = document.visibilityState === "visible";

let jackpot = new Jackpot();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.from === "background" && request.action === "initAdsBox") {
        surfbar = request.surfbar;

        if (isClickAd(surfbar.type)) {
            surfbar.isSameHostName = isSameHostName(surfbar.currentPage, window.location.hostname);
            surfbar.isShownOnce = true;

            chrome.runtime.sendMessage({action: "updateSurfbar", surfbar: surfbar});
        }

        let surfbarNotExists = $("#" + surfbar.surfbarId).length === 0;
        if (surfbarNotExists) {
            handleCustomAction(surfbar);

            setTimeout(function () {
                insertAdsBox(surfbar);
                updateView(surfbar);

                if (isClickAd(surfbar.type)) {
                    if (surfbar.displayTime === 15) {
                        this.sendFinishMessage(surfbar);
                        return;
                    } else {
                        countdownIsRunning = true;
                    }
                }

                if (countdownIsRunning || isSurfbarAd(surfbar.type)) {
                    console.debug("Starting Countdown");
                    startCountdown();
                }
            }, 1000);
        }
    }

    if (request.from === "background" && request.action === "finishPage") {
        console.debug("Sending Message: finishPage");
        window.postMessage({from: "addon", action: "finishPage", surfbar: request.surfbar}, "*");
    }

    if (request.from === "background" && request.action === "countdownUpdateParentTab") {
        window.postMessage({from: "addon", action: "countdownUpdateParentTab", surfbar: request.surfbar}, "*");
    }

    if (request.from === "background" && request.action === "resetClickAd") {
        console.debug("Sending Message: resetClickAd");
        window.postMessage({from: "addon", action: "resetClickAd", surfbar: request.surfbar, data: request.data}, "*");
    }

    if (request.from === "background" && request.action === "checkUrlExists") {
        console.debug("Sending Message: checkUrlExists");
        sendResponse({urlExists: true});
    }

    if (request.from === "background" && request.action === "updateTaskPoints") {
        updateView(request.surfbar);
    }
});

function initClickListener(surfbar) {
    $("#ao-btn-report").click(function () {
        pauseCountdown();

        chrome.runtime.sendMessage({from: "ads-view", action: "reportUrl", surfbar: surfbar});
    });

    $("#ao-btn-pause").click(function () {
        if (countdownIsRunning) {
            pauseCountdown();
        } else {
            continueCountdown(surfbar);
        }
    });
}

function insertAdsBox(surfbar) {
    let interval = setInterval(timer, 1000);
    let tries = 0;

    function timer() {
        let div = $('<div/>', {
            id: surfbar.surfbarId,
            style: surfbar.frameCss,
            html: '<link href="' + chrome.extension.getURL("lib/css/font-awesome.min.css") + '" rel="stylesheet">' + surfbar.displayHtml
        });
        $("html").append(div);

        initClickListener(surfbar);
        acceptCookieConsent();

        let surfbarExists = $("#" + surfbar.surfbarId).length !== 0;
        if (tries > 10 || surfbarExists) {
            clearInterval(interval);
        }

        tries++;
    }

    if (isClickAd(surfbar.type)) {
        jackpot.insertIconTasks(surfbar);
    }
}

function countdown() {
    surfbar.timeLeft = getDiffInSeconds(surfbar);

    if (surfbar.timeLeft > 0 && countdownIsRunning) {
        setTimeout(countdown, 1000);
    }

    if (surfbar.timeLeft <= 0) {
        sendFinishMessage(surfbar);
        countdownIsRunning = false;
    }

    updateAd(surfbar);
}

function getDiffInSeconds(surfbar) {
    let diffInMilliSeconds = new Date() - new Date(surfbar.startDate);
    let diffInSeconds = Math.round(diffInMilliSeconds / 1000);

    return surfbar.displayTime - diffInSeconds;
}

function startCountdown() {
    countdownIsRunning = true;
    setTimeout(countdown, 1000);
}

function pauseCountdown() {
    countdownIsRunning = false;

    $("#ao-btn-pause").html("<i class='fa fa-play'></i>");

    chrome.runtime.sendMessage({from: "contentScript", action: "clear404Interval", surfbar: surfbar});
}

function continueCountdown(surfbar) {
    countdownIsRunning = true;
    chrome.runtime.sendMessage({from: "contentScript", action: "start404Interval", surfbar: surfbar});

    let newStartDate = new Date();
    newStartDate.setSeconds(newStartDate.getSeconds() - (surfbar.displayTime - surfbar.timeLeft));
    surfbar.startDate = newStartDate;
    updateAd(surfbar);

    $("#ao-btn-pause").html("<i class='fa fa-pause'></i>");

    setTimeout(countdown, 1000);
}

function updateAd(surfbar) {
    updateView(surfbar);

    chrome.runtime.sendMessage({from: "ads-view", action: "countdownUpdateParentTab", surfbar: surfbar});
}

function updateView(surfbar) {
    $("#ao-countdown").html(surfbar.timeLeft <= 0 ? 0 : surfbar.timeLeft);

    if (surfbar.earnedTaskPoints > 0) {
        let totalEarnedCredits = surfbar.params.earnableCreditsNumber + surfbar.earnedTaskPoints;

        $("#ao-points").text(totalEarnedCredits.toLocaleString('de-DE', {minimumFractionDigits: 2}) + " BTP");
    }
}

function sendFinishMessage(surfbar) {
    chrome.runtime.sendMessage({from: "ads-view", action: "countdownFinished", surfbar: surfbar});
}

function containsCurrentHostname(hostname) {
    let url = window.location.host.toLowerCase();

    return url.indexOf(hostname) > -1;
}

function isClickAd(type) {
    return type && type === "clickAd";
}

function isSurfbarAd(type) {
    return type && type === "surfbarAd";
}

function isSameHostName(realUrl, currentHostname) {
    let hostnameOfRealurl = this.extractHostname(realUrl);

    return hostnameOfRealurl === currentHostname;
}

function extractHostname(url) {
    let hostname;

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }

    hostname = hostname.split(':')[0];

    hostname = hostname.split('?')[0];

    return hostname;
}

async function handleCustomAction(surfbarLocal) {
    let popupData = await getPopupData();
    if (!popupData.acceptedCookies || surfbarLocal.hasExecutedCustomAction) {
        return;
    }

    let customAction = surfbarLocal.customAction;
    if (customAction === "followFirstLink") {
        let url = document.querySelector("a");
        console.debug(`Custom Action: ${customAction}; Following url: ${url}`);

        surfbarLocal.hasExecutedCustomAction = true;
        chrome.runtime.sendMessage({action: "updateSurfbar", surfbar: surfbarLocal}, function (response) {
            let lastError = chrome.runtime.lastError;

            url.click();
        });
    }

    if (customAction === "youtubeRedirectUrl") {
        let url = document.querySelector("#invalid-token-redirect-goto-site-button");
        console.debug(`Custom Action: ${customAction}; Following url: ${url}`);

        surfbarLocal.hasExecutedCustomAction = true;
        chrome.runtime.sendMessage({action: "updateSurfbar", surfbar: surfbarLocal}, function (response) {
            let lastError = chrome.runtime.lastError;

            url.click();
        });
    }

}

$(document).ready(function () {

    if (!containsCurrentHostname("ebesucher")) {

        chrome.runtime.sendMessage({action: "getFilteredClickAdsTabs"}, function (response) {
            $.each(response.filteredTabs, function (tabId, surfbar) {
                let tabIdExists = tabId !== undefined;
                let surfbarExists = surfbar !== undefined;
                let isTimeLeft = surfbar.timeLeft > 0;

                if (tabIdExists && surfbarExists && isTimeLeft) {
                    chrome.runtime.sendMessage({
                        from: "contentScript",
                        action: "recreateSurfbar",
                        surfbar: surfbar,
                    });
                }
            });
        });

        chrome.runtime.sendMessage({action: "getActiveSurfbar"}, function (response) {
            let surfbar = response.activeSurfbar;
            if (surfbar && surfbar.timeLeft > 0) {
                chrome.runtime.sendMessage({from: "contentScript", action: "recreateSurfbar", surfbar: surfbar});
            }
        });
    }

});
