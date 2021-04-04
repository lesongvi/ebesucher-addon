window.addEventListener("message", (event) => {
    let origins = [
        "http://www.ebesucher.de",
        "http://www.ebesucher.ru",
        "http://www.ebesucher.com",
        "http://www.ebesucher.es",
        "http://www.ebesucher.fr",
        "https://www.ebesucher.de",
        "https://www.ebesucher.ru",
        "https://www.ebesucher.com",
        "https://www.ebesucher.es",
        "https://www.ebesucher.fr",

        "http://ebesucher.dev.proxy",
        "http://en.ebesucher.dev.proxy",
        "http://es.ebesucher.dev.proxy",
        "http://fr.ebesucher.dev.proxy",
        "http://ru.ebesucher.dev.proxy",
        "https://ebesucher.dev.proxy",
        "https://en.ebesucher.dev.proxy",
        "https://es.ebesucher.dev.proxy",
        "https://fr.ebesucher.dev.proxy",
        "https://ru.ebesucher.dev.proxy",

        "http://qa.ebesucher.de",
        "http://en.qa.ebesucher.de",
        "http://es.qa.ebesucher.de",
        "http://fr.qa.ebesucher.de",
        "http://ru.qa.ebesucher.de",
        "https://qa.ebesucher.de",
        "https://en.qa.ebesucher.de",
        "https://es.qa.ebesucher.de",
        "https://fr.qa.ebesucher.de",
        "https://ru.qa.ebesucher.de",

        "http://dev.ebesucher.de",
        "http://en.dev.ebesucher.de",
        "http://es.dev.ebesucher.de",
        "http://fr.dev.ebesucher.de",
        "http://ru.dev.ebesucher.de",
        "https://dev.ebesucher.de",
        "https://en.dev.ebesucher.de",
        "https://es.dev.ebesucher.de",
        "https://fr.dev.ebesucher.de",
        "https://ru.dev.ebesucher.de",

        "http://int.ebesucher.de",
        "http://en.int.ebesucher.de",
        "http://es.int.ebesucher.de",
        "http://fr.int.ebesucher.de",
        "http://ru.int.ebesucher.de",
        "https://int.ebesucher.de",
        "https://en.int.ebesucher.de",
        "https://es.int.ebesucher.de",
        "https://fr.int.ebesucher.de",
        "https://ru.int.ebesucher.de",

        "http://dev.npk.ebesucher.de",
        "http://en.dev.npk.ebesucher.de",
        "http://es.dev.npk.ebesucher.de",
        "http://ru.dev.npk.ebesucher.de",
        "https://dev.npk.ebesucher.de",
        "https://en.dev.npk.ebesucher.de",
        "https://es.dev.npk.ebesucher.de",
        "https://ru.dev.npk.ebesucher.de",

        "http://int.npk.ebesucher.de",
        "http://en.int.npk.ebesucher.de",
        "http://es.int.npk.ebesucher.de",
        "http://ru.int.npk.ebesucher.de",
        "https://int.npk.ebesucher.de",
        "https://en.int.npk.ebesucher.de",
        "https://es.int.npk.ebesucher.de",
        "https://ru.int.npk.ebesucher.de",

        "http://qa.npk.ebesucher.de",
        "http://en.qa.npk.ebesucher.de",
        "http://es.qa.npk.ebesucher.de",
        "http://ru.qa.npk.ebesucher.de",
        "https://qa.npk.ebesucher.de",
        "https://en.qa.npk.ebesucher.de",
        "https://es.qa.npk.ebesucher.de",
        "https://ru.qa.npk.ebesucher.de",
    ];

    if (event.source !== window || !event.data || ($.inArray(event.origin, origins) === -1)) {
        return;
    }

    if (event.data.action === "isAddonInstalled") {
        window.postMessage({action: "isAddonInstalledAnswer", isInstalled: true}, event.origin);
    }

    if (event.data.action === "showAds") {

        if (isClickAd(event.data.type)) {
            chrome.runtime.sendMessage({
                from: "website",
                action: "showAds",
                type: event.data.type,
                params: event.data.params,
                html: event.data.html,
                frameCss: event.data.frameCss,
                redirectTime: event.data.redirectTime
            });
        }

        if (isSurfbarAd(event.data.type)) {
            chrome.runtime.sendMessage({action: "surfbarExists"}, function (response) {
                if (response.surfbarExists) {
                    chrome.runtime.sendMessage({from: "website", action: "deleteSurfbar"});

                    window.postMessage({
                        from: "addon",
                        action: "surfbarExistsAlready",
                        surfbarExists: true
                    }, event.origin);
                } else {
                    let sites = [];
                    $.each(event.data.params.sites, function (index, value) {
                        sites[index] = {
                            complaintUrl: value.complaintUrl,
                            feedbackUrl: value.feedbackUrl,
                            forwardurl: value.forwardurl,
                            customAction: value.customAction,
                            html: value.html,
                            name: value.name,
                            url: value.url,
                            viewtime: value.viewtime
                        };
                    });

                    chrome.runtime.sendMessage({
                        from: "website",
                        action: "showAds",
                        type: event.data.type,
                        params: event.data.params,
                        sites: sites,
                        html: event.data.html,
                        frameCss: event.data.frameCss,
                        redirectTime: event.data.redirectTime
                    });
                }
            });
        }
    }

    if (event.data.action === "getCurrentTabId") {
        chrome.runtime.sendMessage({
            from: "website",
            action: "getCurrentTabId",
            windowUrl: event.source.location.href
        }, function (response) {
            window.postMessage({
                from: "addon",
                action: "getCurrentTabIdAnswer",
                tabId: response.tabId
            }, event.origin);
        });
    }

    if (event.data.action === "updateClickAdCounter") {
        chrome.runtime.sendMessage({from: "website", action: "updateClickAdCounter"});
    }

    if (event.data.action === "getClickAdByTabId") {
        chrome.runtime.sendMessage({
            from: "website",
            action: "getClickAdByTabId",
            tabId: event.data.tabId
        }, function (response) {
            window.postMessage({
                from: "addon",
                action: "getClickAdByTabIdAnswer",
                surfbar: response.surfbar
            }, event.origin);
        });
    }

    if (event.data.action === "getPopupData") {
        chrome.runtime.sendMessage({
            from: "website",
            action: "getPopupData",
            windowUrl: event.source.location.href
        }, function (response) {
            window.postMessage({
                from: "addon",
                action: "getPopupDataAnswer",
                popupData: response.popupData
            }, event.origin);
        });
    }

    if (event.data.action === "getAdblockingAddons") {
        chrome.runtime.sendMessage({
            from: "website",
            action: "getAdblockingAddons",
            adBlockAddons: event.data.adBlockAddons,
            windowUrl: event.source.location.href
        }, function (response) {
            window.postMessage({
                from: "addon",
                action: "getAdblockingAddonsAnswer",
                adblockingAddons: response.adblockingAddons
            }, event.origin);
        });
    }

});
