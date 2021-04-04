chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.from === "background" && request.action === "cookieConsentAccepter") {
        acceptCookieConsentIframe(request.surfbar);
    }
});

function acceptCookieConsentIframe(surfbar) {
    for (const [cookieConsentSelector, isClicked] of Object.entries(surfbar.cookieConsentSelectors)) {
        try {
            let item = document.querySelectorAll(cookieConsentSelector)[0];
            if (item === undefined || isClicked) {
                continue;
            }

            surfbar.cookieConsentSelectors[cookieConsentSelector] = true;
            chrome.runtime.sendMessage({action: "updateSurfbar", surfbar: surfbar});

            console.error('Clicking cookie consent selector in iFrame: ' + cookieConsentSelector);
            item.click();
        } catch (e) {
        }
    }
}
