$(document).ready(function () {
    let usernameNode = $("#username");
    usernameNode.attr("placeholder", chrome.i18n.getMessage("username"));
    usernameNode.focus();

    restoreOptions();
    initializeButtonListener();
});

function initializeButtonListener() {

    $("#link-info").click(function () {
        openUrl(chrome.i18n.getMessage("urlInfo"));
    });

    $("#btn-open-surfbar").click(function () {
        openSurfbar();
    });

    $("#btn-open-clickad").click(function () {
        openRandomClickAd();
    });

    $("#btn-open-login").click(function () {
        openUrl(chrome.i18n.getMessage("urlLogin"));
    });

    $("#btn-open-manage-campaigns").click(function () {
        openUrl(chrome.i18n.getMessage("urlManageCampaigns"));
    });

    console.debug("Initialized Button Listener");
}

async function openSurfbar() {
    let usernameNode = $("#username");
    let username = usernameNode.val();

    if (username) {
        removeError(usernameNode);

        let popupData = await getPopupData();
        popupData.username = username;
        chrome.storage.local.set({"popupData": popupData});

        chrome.runtime.sendMessage({action: "getActiveSurfbar"}, function (response) {
            let surfbar = response.activeSurfbar;
            if (surfbar) {
                chrome.tabs.update(surfbar.tabId, {active: true});
            } else {
                let url = chrome.i18n.getMessage("urlEbesucher");
                let surfbarUrl = url + "/surfbar/" + username;
                openUrl(surfbarUrl);
            }
        });
    } else {
        addError(usernameNode, chrome.i18n.getMessage("errorUserIsEmpty"));
    }
}

function openRandomClickAd() {
    let usernameNode = $("#username");
    let username = usernameNode.val();

    if (username) {
        $.ajax({
            type: "POST",
            url: chrome.i18n.getMessage("urlEbesucher") + "/api_internal/website.json/getUserInterests",
            data: {"username": username},
            success: function (data) {
                getStorageData("popupData")
                    .then(function (popupData) {
                        if (!popupData) {
                            popupData = new PopupData();
                        }
                        popupData.username = username;
                        chrome.storage.local.set({"popupData": popupData});
                    })
                    .then(function () {
                        let url = chrome.i18n.getMessage("urlEbesucher") + "/c/" + data + "?surfForUser=" + username;
                        openUrl(url);
                    });
            },
            error: function (xhr) {
                addError(usernameNode, chrome.i18n.getMessage("errorUserNotExist"));
            }
        });
    } else {
        addError(usernameNode, chrome.i18n.getMessage("errorUserIsEmpty"));
    }
}



function openUrl(url) {
    chrome.tabs.create({url: url});
    window.close();
}

function restoreOptions() {
    chrome.storage.local.get("popupData", function (result) {
        let popupData = result.popupData;
        if (!popupData) {
            popupData = new PopupData();
        }

        let createdAt = new Date(popupData.createdAt);
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        if (createdAt < yesterday) {
            popupData.clickedClickAds = 0;
            popupData.surfbarTime = 0;

            let todayAtMidnight = new Date();
            todayAtMidnight.setHours(0, 0, 0, 0);
            popupData.createdAt = todayAtMidnight.getTime();
            chrome.storage.local.set({"popupData": popupData});
        }

        $("#username").val(popupData.username);
        $("#statistic-clickads").text(popupData.clickedClickAds);
        $("#statistic-surfbar").text(formatTime(popupData.surfbarTime));

        $(".row.statistics").each(function (key, node) {
            $(node).prop('title', chrome.i18n.getMessage('today'));
        });

        console.debug("Restored Options");
    });
}

async function getPopupData() {
    let popupData = await getStorageData("popupData");
    if (!popupData) {
        popupData = new PopupData();
    }

    return popupData;
}

function addError(errorField, message) {
    errorField.addClass("has-error");

    let errorMessageNode = errorField.parent().find("div").first();
    errorMessageNode.html(message);
}

function removeError(errorField) {
    errorField.removeClass("has-error");

    let errorMessageNode = errorField.parent().find("div").first();
    errorMessageNode.html("");
}

function formatTime(timeInSeconds) {
    let minute = Math.floor(timeInSeconds / 60);
    let seconds = timeInSeconds % 60;

    let formattedMinute = minute < 10 ? addLeadingZeros(minute, 2) : minute;

    return formattedMinute + ":" + addLeadingZeros(seconds, 2);
}

