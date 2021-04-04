let cookieConsentAccepterCount = 0;
let cookieConsentIntervalTimeout;

function acceptCookieConsent() {
    cookieConsentIntervalTimeout = setInterval(cookieConsentInterval, 2000);
}

async function cookieConsentInterval() {
    let popupData = await getPopupData();
    if (!popupData.acceptedCookies) {
        return;
    }

    if (surfbar.cookieConsentSelectors === undefined) {
        return;
    }

    let randomTimeInSeconds = Math.floor(Math.random() * 7);
    setTimeout(function () {

        for (const [cookieConsentSelector, isClicked] of Object.entries(surfbar.cookieConsentSelectors)) {
            try {
                let item = document.querySelectorAll(cookieConsentSelector)[0];
                if (item === undefined || isClicked) {
                    continue;
                }

                surfbar.cookieConsentSelectors[cookieConsentSelector] = true;
                chrome.runtime.sendMessage({action: "updateSurfbar", surfbar: surfbar});

                console.debug('Clicking cookie consent selector: ' + cookieConsentSelector);
                item.click();
            } catch (e) {
            }
        }

        handleCustomCookieConsents();

        chrome.runtime.sendMessage({
            from: "cookie-consent-accepter",
            action: "sendMsgToIframe",
            surfbar: surfbar,
        });

        cookieConsentAccepterCount++;
        if (cookieConsentAccepterCount >= 4) {
            clearInterval(cookieConsentIntervalTimeout);
        }

    }, randomTimeInSeconds);
}

async function handleCustomCookieConsents() {
    let isClickedCmpBanner = surfbar.cookieConsentSelectors["cmp-banner"];
    let isClickedUserCentricsRoot = surfbar.cookieConsentSelectors["usercentrics-root"];

    if (isClickedCmpBanner || isClickedUserCentricsRoot) {
        return;
    }

    try {
        let cmpBanner = document.querySelectorAll('cmp-banner')[0].shadowRoot;
        let consent1 = cmpBanner.querySelectorAll('cmp-dialog')[0].shadowRoot.querySelectorAll('cmp-button')[0];
        if (consent1) {
            surfbar.cookieConsentSelectors["cmp-banner"] = true;
            chrome.runtime.sendMessage({action: "updateSurfbar", surfbar: surfbar});

            console.debug('Clicking cookie consent selector: cmp-banner');
            consent1.click();
        }
    } catch (e) {
    }

    try {
        let consent2 = document.querySelectorAll('#usercentrics-root')[0].shadowRoot.querySelectorAll('button')[2];
        if (consent2) {
            surfbar.cookieConsentSelectors["usercentrics-root"] = true;
            chrome.runtime.sendMessage({action: "updateSurfbar", surfbar: surfbar});

            console.debug('Clicking cookie consent selector: usercentrics-root');
            consent2.click();
        }
    } catch (e) {
    }

}
