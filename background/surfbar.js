let Surfbar = function (type) {
    this.surfbarId = this.generateRandomId();

    this.type = type;

    this.parentTabId = null;

    this.tabId = null;

    this.realurl = null;

    this.forwardurl = null;

    this.displayTime = null;

    this.timeLeft = 0;

    this.displayHtml = "";

    this.params = null;

    this.redirectTime = 0;

    this.frameCss = "";

    this.complaintUrl = null;

    this.feedbackUrl = null;

    this.startDate = null;

    this.tasks = null;

    this.earnedTaskPoints = 0;

    this.isTasksShown = false;

    this.confirmTasksForViewUrl = null;

    this.isShownOnce = false;

    this.isOneTaskClicked = false;

    this.isSameHostName = false;

    this.cookieConsentSelectors = null;

    this.customAction = null;

    this.hasExecutedCustomAction = false;

    this.eigenverdienst = 0;
};

Surfbar.prototype = {

    generateRandomId: function () {
        return (Math.random() * 1e32).toString(36);
    },

};
