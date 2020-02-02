function PopupData() {
    this.username = null;
    this.clickedClickAds = 0;
    this.surfbarTime = 0;

    let todayAtMidnight = new Date();
    todayAtMidnight.setHours(0, 0, 0, 0);
    this.createdAt = todayAtMidnight.getTime();
}