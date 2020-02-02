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

        "http://testserver.ebesucher.de",
        "http://testserver.ebesucher.eu",
        "http://testserver.ebesucher",
        "http://en.testserver.ebesucher",
        "http://es.testserver.ebesucher",
        "http://fr.testserver.ebesucher",
        "http://ru.testserver.ebesucher",
        "https://testserver.ebesucher.de",
        "https://testserver.ebesucher.eu",
        "https://testserver.ebesucher",
        "https://en.testserver.ebesucher",
        "https://es.testserver.ebesucher",
        "https://fr.testserver.ebesucher",
        "https://ru.testserver.ebesucher",

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
    ];

    if (event.source !== window || !event.data || ($.inArray(event.origin, origins) === -1)) {
        return;
    }

    if (event.data.action === "startSurfbar") {
        chrome.runtime.sendMessage({action: "startSurfbar", url: event.data.url, displayTime: event.data.displayTime});
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
});
