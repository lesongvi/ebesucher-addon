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

    this.tasksShown = false;

    this.confirmTasksForViewUrl = null;

    this.isShownOnce = false;

    this.isOneTaskClicked = false;
};

Surfbar.prototype = {

    generateRandomId: function () {
        return (Math.random() * 1e32).toString(36);
    },

};
