let clickAdsSurfbarArray = [];

let activeSurfbar = null;

let surfbarExists = false;

let checkSiteRespondingCount = 0;
let checkSiteRespondingInSeconds = 120;
let timePassedInSeconds = 0;
let add404ListenerInterval = null;

add404Listener();


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    if (request.from === "contentScript" && request.action === "recreateSurfbar") {
        initAdBox(request.surfbar);

        console.debug("Recreated Surfbar");
    }

    if (request.from === "contentScript" && request.action === "clear404Interval") {
        clearInterval(add404ListenerInterval);
    }

    if (request.from === "contentScript" && request.action === "start404Interval") {
        this.add404Listener();
    }

    if (request.action === "updateSurfbar") {
        let surfbar = request.surfbar;

        if (isSurfbarAd(surfbar.type)) {
            activeSurfbar.cookieConsentSelectors = surfbar.cookieConsentSelectors
            activeSurfbar.hasExecutedCustomAction = surfbar.hasExecutedCustomAction
        }

        if (isClickAd(surfbar.type)) {
            let surfbarTabId = surfbar.tabId;
            let clickAdSurfbar = clickAdsSurfbarArray[surfbarTabId];
            if (clickAdSurfbar === undefined) {
                return;
            }
            clickAdSurfbar.isSameHostName = surfbar.isSameHostName;
            clickAdSurfbar.isTasksShown = surfbar.isTasksShown;
            clickAdSurfbar.currentPage = surfbar.currentPage;
            clickAdSurfbar.cookieConsentSelectors = surfbar.cookieConsentSelectors;
            clickAdSurfbar.hasExecutedCustomAction = surfbar.hasExecutedCustomAction

            clickAdsSurfbarArray[surfbarTabId] = clickAdSurfbar;
        }
    }

    if (request.from === "ads-view" && request.action === "countdownFinished") {
        let surfbar = request.surfbar;

        if (isClickAd(surfbar.type)) {
            clickAdsSurfbarArray.splice(surfbar.tabId, 1);

            if (surfbar.displayTime <= 15) {
                console.debug("Click Ad with Display Time <= 15 finished");
                chrome.tabs.sendMessage(surfbar.parentTabId, {
                    from: "background",
                    action: "finishPage",
                    surfbar: surfbar
                });
                incrementClickAdCount();
            } else {
                chrome.tabs.update(surfbar.tabId, {url: surfbar.forwardurl});
                chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tabInfo) {
                    if (tabInfo.status === "complete") {
                        chrome.tabs.onUpdated.removeListener(listener);
                        console.debug("Countdown Finished: Click Ad with Display Time > 15");
                        chrome.tabs.sendMessage(surfbar.parentTabId, {
                            from: "background",
                            action: "finishPage",
                            surfbar: surfbar
                        });
                    }
                });
            }
        } else if (isSurfbarAd(surfbar.type)) {
            let ajaxFeedback = $.ajax({
                type: "GET",
                url: surfbar.feedbackUrl
            });

            let ajaxReportClosingSurfbar = $.ajax({
                type: "POST",
                url: surfbar.params.reportClosingSurfbarUrl,
                data: {
                    "username": surfbar.params.userId,
                }
            });

            let forwardUrlNoParams = getUrlNoParams(surfbar.forwardurl);
            console.debug("Countdown Finished: Surfbar");
            $.when(ajaxFeedback, ajaxReportClosingSurfbar)
                .done(function (request1, request2) {
                    getStorageData("popupData").then(function (popupData) {
                        if (!popupData) {
                            popupData = new PopupData();
                        }

                        popupData.surfbarTime += surfbar.displayTime;
                        chrome.storage.local.set({"popupData": popupData});

                        if (surfbar.params.sites.length === 0) {
                            console.debug("Countdown Finished: Surfbar - no more sites left => redirect to finish page");

                            surfbarExists = false;

                            chrome.tabs.update(surfbar.tabId, {url: forwardUrlNoParams});
                        } else {
                            console.debug("Countdown Finished: Surfbar - more sites pending => process next site");

                            initSurfbarAd(surfbar);
                        }
                    });
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    chrome.tabs.update(surfbar.tabId, {url: forwardUrlNoParams});
                    surfbarExists = false;
                });
        }
    }

    if (request.from === "ads-view" && request.action === "countdownUpdateParentTab") {
        let surfbar = request.surfbar;

        if (isClickAd(surfbar.type)) {
            let clickAdsSurfbar = clickAdsSurfbarArray[surfbar.tabId];
            if (clickAdsSurfbar === undefined) {
                clickAdsSurfbar = surfbar;
            }

            clickAdsSurfbar.timeLeft = surfbar.timeLeft;
            clickAdsSurfbarArray[surfbar.tabId] = clickAdsSurfbar;

            chrome.tabs.sendMessage(surfbar.parentTabId, {
                from: "background",
                action: "countdownUpdateParentTab",
                surfbar: surfbar
            }, function () {
                let lastError = chrome.runtime.lastError;
            });
        } else if (isSurfbarAd(surfbar.type)) {
            activeSurfbar = surfbar;
        }
    }

    if (request.from === "ads-view" && request.action === "reportUrl") {
        let surfbar = request.surfbar;

        chrome.tabs.create({url: surfbar.complaintUrl});
    }

    if (request.from === "website" && request.action === "showAds") {
        let surfbar = new Surfbar(request.type);
        let params = request.params;

        surfbar.params = params;
        surfbar.frameCss = request.frameCss;
        surfbar.cookieConsentSelectors = initClickedCookieConsentSelectors(params.cookieConsentSelectors);

        if (isClickAd(surfbar.type)) {
            surfbar.forwardurl = params.forwardurl;
            surfbar.realurl = params.url;
            surfbar.displayTime = params.viewtime;
            surfbar.timeLeft = params.viewtime;
            surfbar.params.eigenverdienst = request.params.earnedcredit;
            surfbar.displayHtml = params.viewtime <= 15 ? request.html : addonSurfbar();
            surfbar.parentTabId = params.parentTabId;
            surfbar.startDate = new Date().toJSON();

            surfbar.tabId = params.currentTabId;
            surfbar.redirectTime = request.redirectTime;
            surfbar.complaintUrl = params.complaintUrl;
            surfbar.currentPage = params.realurl;
            surfbar.customAction = params.customAction;

            if (!$.isEmptyObject(params.tasks)) {
                surfbar.tasks = params.tasks.tasks;
                surfbar.confirmTasksForViewUrl = params.confirmTasksForViewUrl;
            }

            initClickAd(surfbar);

            chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
                if (tabId !== surfbar.tabId) {
                    return;
                }

                chrome.tabs.sendMessage(surfbar.parentTabId, {
                    from: "background",
                    action: "resetClickAd",
                    surfbar: clickAdsSurfbarArray[surfbar.tabId],
                    data: params
                });
                console.debug("User closed Click Ad Tab");

                clickAdsSurfbarArray.splice(surfbar.tabId, 1);
            });
        } else if (isSurfbarAd(surfbar.type)) {
            surfbar.params.sites = request.sites;

            surfbar.tabId = params.currentTabId;
            surfbar.parentTabId = params.currentTabId;

            this.initSurfbarAd(surfbar);
        }
    }

    if (request.from === "website" && request.action === "getCurrentTabId") {
        chrome.tabs.query({url: request.windowUrl}, function (tabs) {
            if (tabs.length === 0) {
                chrome.tabs.query({currentWindow: true, active: true}, function (tabsNoUrl) {
                    console.debug("Current Tab ID (no matching tabs): " + tabsNoUrl[0].id);
                    sendResponse({tabId: tabsNoUrl[0].id});
                });
            } else {
                console.debug("Current Tab ID (matching tab): " + tabs[0].id);
                sendResponse({tabId: tabs[0].id});
            }
        });
        return true;
    }

    if (request.from === "website" && request.action === "getPopupData") {
        getStorageData("popupData").then(function (popupData) {
            if (!popupData) {
                popupData = new PopupData();
            }

            sendResponse({popupData: popupData});
        });

        return true;
    }

    if (request.from === "website" && request.action === "getAdblockingAddons") {
        let adBlockAddons = request.adBlockAddons;
        let result = [];

        chrome.management.getAll(function (installedAddons) {
            for (let [_, installedAddon] of Object.entries(installedAddons)) {
                if (!installedAddon.enabled) {
                    continue;
                }

                for (let [_, adBlockAddon] of Object.entries(adBlockAddons)) {
                    let isAdBlockAddon = installedAddon.name.toLowerCase().search(adBlockAddon.toLowerCase()) >= 0;
                    if (isAdBlockAddon) {
                        let addonData = {
                            "id": installedAddon.id,
                            "name": installedAddon.name
                        };
                        result.push(addonData);
                    }
                }
            }

            sendResponse({adblockingAddons: result});
        });

        return true;
    }

    if (request.from === "website" && request.action === "deleteSurfbar") {
        resetSurfbar();
    }

    if (request.from === "website" && request.action === "updateClickAdCounter") {
        console.debug("Update Click Ad Counter");
        incrementClickAdCount();
    }

    if (request.from === "website" && request.action === "getClickAdByTabId") {
        sendResponse({surfbar: clickAdsSurfbarArray[request.tabId]});

        return true;
    }

    if (request.from === "jackpot" && request.action === "removeTask") {
        let surfbarTabId = request.surfbar.tabId;
        let clickAdSurfbar = clickAdsSurfbarArray[surfbarTabId];
        if (clickAdSurfbar === undefined) {
            return;
        }

        let tasks = clickAdSurfbar.tasks;
        let taskCode = parseFloat(request.taskCode);

        tasks.forEach(function (task, index) {
            if (task.code === taskCode) {
                tasks.splice(index, 1);
            }
        });
        clickAdSurfbar.tasks = tasks;
        clickAdSurfbar.earnedTaskPoints = request.surfbar.earnedTaskPoints;
        clickAdsSurfbarArray[surfbarTabId] = clickAdSurfbar;

        chrome.tabs.sendMessage(surfbarTabId, {
            from: "background",
            action: "updateTaskPoints",
            surfbar: clickAdSurfbar
        });
    }

    if (request.from === "jackpot" && request.action === "oneTaskClicked") {
        let surfbarTabId = request.surfbar.tabId;
        let clickAdSurfbar = clickAdsSurfbarArray[surfbarTabId];
        if (clickAdSurfbar === undefined) {
            return;
        }

        clickAdSurfbar.isOneTaskClicked = true;
        clickAdsSurfbarArray[surfbarTabId] = clickAdSurfbar;
    }

    if (request.from === "jackpot" && request.action === "updateIsTasksShown") {
        let surfbarTabId = request.surfbar.tabId;
        let clickAdSurfbar = clickAdsSurfbarArray[surfbarTabId];
        if (clickAdSurfbar === undefined) {
            return;
        }
        clickAdSurfbar.isTasksShown = true;
        clickAdsSurfbarArray[surfbarTabId] = clickAdSurfbar;
    }

    if (request.action === "getFilteredClickAdsTabs") {
        chrome.tabs.query({}, function (tabs) {
            let filteredTabs = {};

            $.each(tabs, function (index, tab) {
                let surfbar = clickAdsSurfbarArray[tab.id];
                if (surfbar !== undefined) {
                    filteredTabs[tab.id] = surfbar;
                }
            });

            sendResponse({filteredTabs: filteredTabs});
        });
        return true;
    }

    if (request.action === "getActiveSurfbar") {
        sendResponse({activeSurfbar: activeSurfbar});
    }

    if (request.action === "surfbarExists") {
        sendResponse({surfbarExists: surfbarExists});
    }

    if (request.from === "cookie-consent-accepter" && request.action === "sendMsgToIframe") {
        chrome.tabs.sendMessage(request.surfbar.tabId, {
            from: "background",
            action: "cookieConsentAccepter",
            surfbar: request.surfbar
        });
    }

});


function initAdBox(surfbar, callback) {
    if (!surfbar.isShownOnce || surfbar.displayTime > 15) {
        setTimeout(function () {
            chrome.tabs.sendMessage(surfbar.tabId, {
                from: "background",
                action: "initAdsBox",
                surfbar: surfbar
            }, callback);
        }, 100);
    }
}

function initClickAd(surfbar) {
    setTimeout(function () {
        let startDate = new Date();

        chrome.tabs.update(surfbar.tabId, {url: surfbar.realurl});

        chrome.tabs.onUpdated.addListener(function onUpdatedListener(tabId, changeInfo, tabInfo) {
            if (tabInfo.status === "complete") {
                chrome.tabs.onUpdated.removeListener(onUpdatedListener);

                surfbar.timeLeft -= calculateTimeDifference(startDate, new Date());

                initAdBox(surfbar, function () {
                    let lastError = chrome.runtime.lastError;
                    if (lastError) {
                        console.debug(lastError);
                    }

                    clickAdsSurfbarArray[surfbar.tabId] = surfbar;

                    console.debug("Initialized Ad Box");
                });
            }
        });
    }, surfbar.redirectTime);
}

function getToplevelDomain(domain) {
    domain = new URL(domain).hostname.split('.')
    return domain[domain.length - 1]
}

function formatByDomain(eigenverdienst, domain) {
    domain = getToplevelDomain(domain)

    if (domain != 'com') {
        eigenverdienst = eigenverdienst.toString().replace('.', ',')
    }

    return eigenverdienst
}

function addonSurfbar() {
    return `<div id="addon-surfbar"></div>`
}

function initSurfbarAd(surfbar) {
    console.debug("Initializing Surfbar Ad");
    timePassedInSeconds = 0;
    checkSiteRespondingCount = 0;
    surfbarExists = true;

    let sites = surfbar.params.sites;
    let site = sites.shift();

    surfbar.forwardurl = site.forwardurl;
    surfbar.realurl = site.url;
    surfbar.displayTime = site.viewtime;
    surfbar.timeLeft = site.viewtime;
    surfbar.displayHtml = addonSurfbar();
    surfbar.complaintUrl = site.complaintUrl;
    surfbar.feedbackUrl = site.feedbackUrl;
    surfbar.customAction = site.customAction;

    surfbar.startDate = new Date().toJSON();

    if (activeSurfbar !== null) {
        surfbar.parentTabId = activeSurfbar.parentTabId;
        surfbar.tabId = activeSurfbar.tabId;
    }

    let startDate = new Date();

    chrome.tabs.update(surfbar.tabId, {url: surfbar.realurl}, function () {
        let lastError = chrome.runtime.lastError;
        if (lastError) {
            console.debug(lastError);

            let forwardUrlNoParams = getUrlNoParams(surfbar.forwardurl);
            chrome.tabs.update(surfbar.tabId, {url: forwardUrlNoParams});
        }
    });
    chrome.tabs.onUpdated.addListener(function onUpdatedListener(tabId, changeInfo, tabInfo) {
        if (tabInfo.status === "complete") {
            chrome.tabs.onUpdated.removeListener(onUpdatedListener);

            surfbar.timeLeft -= calculateTimeDifference(startDate, new Date());

            setTimeout(function () {
                console.debug("Initializing Ad Box for Surfbar Ad...");

                initAdBox(surfbar, function () {
                    let lastError = chrome.runtime.lastError;
                    if (lastError) {
                        console.debug(lastError);
                    }

                    activeSurfbar = surfbar;

                    console.debug("Initialized Ad Box for Surfbar Ad successfully");
                });
            }, 2000);
        }
    });

    chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
        if (tabId !== surfbar.tabId) {
            return;
        }
        resetSurfbar();

        console.debug("User closed Surfbar Ad Tab");
    });
}

function calculateTimeDifference(startDate, endDate) {
    let diffSeconds = Math.abs(endDate - startDate);

    return Math.ceil(diffSeconds / 1000);
}

function incrementClickAdCount() {
    getStorageData("popupData").then(function (popupData) {
        if (!popupData) {
            popupData = new PopupData();
        }

        popupData.clickedClickAds++;
        chrome.storage.local.set({"popupData": popupData});
    });
}

function add404Listener() {
    add404ListenerInterval = setInterval(function () {
        if (activeSurfbar !== null) {
            checkSiteRespondingCount++;

            chrome.tabs.sendMessage(activeSurfbar.tabId, {
                from: "background",
                action: "checkUrlExists",
                surfbar: activeSurfbar
            }, function (result) {
                let lastError = chrome.runtime.lastError;
                if (lastError) {
                    console.debug(lastError);
                }

                timePassedInSeconds += checkSiteRespondingInSeconds;

                if (result === undefined) {
                    setTimeout(function () {
                        console.debug("Page does not respond => second try");

                        chrome.tabs.sendMessage(activeSurfbar.tabId, {
                            from: "background",
                            action: "checkUrlExists",
                            surfbar: activeSurfbar
                        }, function (result) {
                            let lastError = chrome.runtime.lastError;
                            if (lastError) {
                                console.debug(lastError);
                            }

                            if (result === undefined) {
                                console.debug("Page still does not respond => redirect");

                                chrome.tabs.update(activeSurfbar.tabId, {url: activeSurfbar.forwardurl});
                                resetSurfbar();
                            }
                        });
                    }, 5000);
                } else {
                    if (checkSiteRespondingCount > 1 && timePassedInSeconds > activeSurfbar.displayTime) {
                        console.debug("Surfbar seems to be stucked => redirect");

                        chrome.tabs.update(activeSurfbar.tabId, {url: activeSurfbar.forwardurl});
                        resetSurfbar();
                    }
                }
            });
        }
    }, checkSiteRespondingInSeconds * 1000);
}

function getUrlNoParams(forwardurl) {
    let url = new URL(forwardurl);

    return [url.protocol, "//", url.host, url.pathname].join("");
}

function resetSurfbar() {
    activeSurfbar = null;
    surfbarExists = false;
    timePassedInSeconds = 0;
    checkSiteRespondingCount = 0;
}

function initClickedCookieConsentSelectors(cookieConsentSelectors) {
    let result = {};
    for (let i = 0; i < cookieConsentSelectors.length; i++) {
        result[cookieConsentSelectors[i]] = false;
    }

    return result;
}
