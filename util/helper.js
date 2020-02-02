
function addLeadingZeros(value, maxLength) {
    return String('0'.repeat(maxLength) + value).slice(-maxLength);
}

function isClickAd(type) {
    return type && type === "clickAd";
}

function isSurfbarAd(type) {
    return type && type === "surfbarAd";
}