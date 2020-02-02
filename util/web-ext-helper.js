

function log(str) {
    chrome.extension.getBackgroundPage().console.log(str);
}

function getStorageData(key) {
    return new Promise(function (resolve, reject) {
        chrome.storage.local.get(key, function (items) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                reject(chrome.runtime.lastError.message);
            } else {
                resolve(items[key]);
            }
        });
    });
}