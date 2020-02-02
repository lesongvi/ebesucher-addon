function Jackpot() {
    this.filledAreas = [];
}

let TASK_TYPE_ICON = "ICON";
let SHOW_ICONS_AFTER_SECONDS = 7;

Jackpot.prototype.insertIconTasks = function (surfbar) {
    let jackpotContext = this;

    setTimeout(function () {
        if (!surfbar.tasksShown || surfbar.isOneTaskClicked) {
            jackpotContext.insertIconTaskNodes(surfbar);
            jackpotContext.randomizePositions(surfbar);
            jackpotContext.addTaskClickedListener(surfbar);
        }

        chrome.runtime.sendMessage({
            from: "jackpot",
            action: "updateTasksShown",
            surfbar: surfbar
        });
    }, 1000);
};

Jackpot.prototype.getSvg = function () {
    return '<svg class="svg-icon" viewBox="0 0 100 70" version="1.1" xmlns="http://www.w3.org/2000/svg" xml:space="preserve"' +
        ' enable-background="new 0 0 100 70" style="width: 100px !important; height: 70px !important; position: absolute; display: none; margin: 10px; z-index: 2147483647">' +
        '<style type="text/css">' +
        '.st0{fill:#FBB03B;}' +
        '.st1{fill:#F7931E;}' +
        '.st2{fill:#F15A24;}' +
        '.st3{fill:#FBC23B;}' +
        '</style>' +
        '<g class="jackpot-icon">' +
        '<path class="st0" d="M33.6,36.77c0.06,0.82-0.45,1.13-1.14,0.68l-3.22-2.1c-0.69-0.45-1.88-0.56-2.64-0.25l-3.55,1.46' +
        'c-0.76,0.31-1.21-0.08-1-0.88l1-3.71c0.21-0.8-0.05-1.96-0.58-2.59l-2.49-2.93c-0.53-0.63-0.3-1.18,0.53-1.22l3.84-0.2' +
        'c0.82-0.04,1.85-0.65,2.28-1.35l2.01-3.27c0.43-0.7,1.03-0.65,1.32,0.12l1.37,3.59c0.29,0.77,1.19,1.56,1.99,1.75l3.74,0.9' +
        'c0.8,0.19,0.93,0.78,0.29,1.3l-2.99,2.41c-0.64,0.52-1.11,1.62-1.05,2.44L33.6,36.77z"/>' +
        '</g>' +
        '<g class="jackpot-icon">' +
        '<path class="st1" d="M48.4,38.64c-0.35,0.75-0.95,0.76-1.33,0.02l-2.15-4.17c-0.38-0.73-1.36-1.42-2.18-1.52l-4.65-0.59' +
        'c-0.82-0.1-1.01-0.67-0.43-1.25l3.3-3.33c0.58-0.59,0.93-1.73,0.77-2.54l-0.88-4.61c-0.15-0.81,0.32-1.17,1.06-0.8l4.19,2.11' +
        'c0.74,0.37,1.93,0.35,2.65-0.05l4.11-2.26c0.72-0.4,1.21-0.06,1.09,0.76l-0.71,4.64c-0.12,0.82,0.26,1.95,0.87,2.51l3.42,3.22' +
        'c0.6,0.56,0.43,1.14-0.39,1.27l-4.63,0.76c-0.81,0.13-1.77,0.85-2.12,1.6L48.4,38.64z"/>' +
        '</g>' +
        '<g class="jackpot-icon">' +
        '<path class="st0" d="M1.93,29.27c-0.3,0.77,0.11,1.21,0.9,0.97l5.94-1.76c0.79-0.23,1.96,0,2.6,0.52l4.82,3.9' +
        'c0.64,0.52,1.18,0.27,1.21-0.56l0.16-6.19c0.02-0.82,0.61-1.87,1.3-2.32l5.19-3.38c0.69-0.45,0.62-1.04-0.16-1.32l-5.84-2.07' +
        'c-0.78-0.28-1.59-1.15-1.8-1.95l-1.61-5.98c-0.21-0.8-0.8-0.91-1.3-0.26l-3.77,4.91c-0.5,0.65-1.59,1.15-2.41,1.11l-6.19-0.32' +
        'c-0.82-0.04-1.12,0.48-0.65,1.16l3.51,5.11c0.47,0.68,0.61,1.87,0.31,2.64L1.93,29.27z"/>' +
        '</g>' +
        '<g class="jackpot-icon">' +
        '<path class="st2" d="M34.17,22.41c0.35,0.75,0.95,0.76,1.33,0.02l1.76-3.42c0.38-0.73,1.36-1.42,2.18-1.52l3.81-0.48' +
        'c0.82-0.1,1.01-0.67,0.43-1.26l-2.7-2.73c-0.58-0.59-0.93-1.73-0.78-2.54l0.72-3.78c0.15-0.81-0.32-1.17-1.06-0.8l-3.43,1.73' +
        'c-0.74,0.37-1.93,0.35-2.65-0.05l-3.37-1.85c-0.72-0.4-1.21-0.05-1.09,0.76l0.58,3.8c0.13,0.82-0.26,1.94-0.87,2.51l-2.8,2.63' +
        'c-0.6,0.57-0.43,1.14,0.39,1.27l3.79,0.62c0.81,0.13,1.77,0.85,2.12,1.6L34.17,22.41z"/>' +
        '</g>' +
        '<g class="jackpot-icon">' +
        '<path class="st2" d="M19.41,12.52c0.11,0.82,0.68,1,1.26,0.42l1.43-1.45c0.58-0.59,1.72-0.95,2.53-0.81l2.01,0.36' +
        'c0.81,0.14,1.17-0.34,0.79-1.07l-0.94-1.81c-0.38-0.73-0.37-1.93,0.01-2.66l0.96-1.8c0.39-0.73,0.04-1.21-0.78-1.08l-2.01,0.33' +
        'c-0.81,0.14-1.95-0.24-2.52-0.83l-1.42-1.47c-0.57-0.59-1.14-0.41-1.26,0.4l-0.3,2.02c-0.12,0.82-0.83,1.78-1.57,2.14L15.76,6.1' +
        'c-0.74,0.36-0.74,0.96-0.01,1.33l1.83,0.91c0.74,0.37,1.44,1.34,1.55,2.16L19.41,12.52z"/>' +
        '</g>' +
        '<g class="jackpot-icon">' +
        '<path class="st2" d="M47.32,17.73c0.11,0.82,0.68,1,1.26,0.42l1.43-1.45c0.58-0.59,1.72-0.95,2.53-0.81l2.01,0.36' +
        'c0.81,0.14,1.17-0.34,0.79-1.07l-0.94-1.81c-0.38-0.73-0.37-1.93,0.01-2.66l0.96-1.8c0.39-0.73,0.04-1.21-0.77-1.08l-2.01,0.33' +
        'c-0.81,0.14-1.95-0.24-2.52-0.83l-1.42-1.47c-0.57-0.59-1.14-0.41-1.26,0.4l-0.31,2.02c-0.12,0.82-0.83,1.78-1.57,2.14l-1.84,0.89' +
        'c-0.74,0.36-0.75,0.96-0.01,1.33l1.82,0.91c0.74,0.37,1.44,1.34,1.55,2.16L47.32,17.73z"/>' +
        '</g>' +
        '<g class="jackpot-icon">' +
        '<path class="st3" d="M7.2,39.14c0.08,0.61,0.51,0.75,0.94,0.31l1.07-1.08c0.43-0.44,1.28-0.71,1.88-0.6l1.5,0.27' +
        'c0.6,0.11,0.87-0.25,0.59-0.8l-0.7-1.35c-0.28-0.54-0.28-1.43,0.01-1.98l0.71-1.34c0.29-0.54,0.03-0.9-0.58-0.8l-1.5,0.25' +
        'c-0.61,0.1-1.45-0.18-1.88-0.62L8.19,30.3C7.77,29.86,7.34,30,7.25,30.6l-0.23,1.5c-0.09,0.61-0.62,1.32-1.17,1.59l-1.37,0.67' +
        'c-0.55,0.27-0.55,0.71-0.01,0.99l1.36,0.68c0.55,0.27,1.07,1,1.15,1.61L7.2,39.14z"/>' +
        '</g>' +
        '</svg>';
};

Jackpot.prototype.randomizePositions = function (surfbar) {
    this.filledAreas.splice(0, this.filledAreas.length);

    let self = this;

    setTimeout(function () {
        let svgIcons = $('.svg-icon');
        let jackpotSelector = $(svgIcons.first()).parent().attr("selector");
        let jackpotSelectorElements = getJackpotSelectorElements(jackpotSelector);
        if (jackpotSelectorElements !== undefined) {
            svgIcons.each(function (idx, svgIcon) {
                let random = Math.floor(Math.random() * jackpotSelectorElements.length);
                let randomElement = jackpotSelectorElements.splice(random, 1);
                if (randomElement.length === 0) {
                    return;
                }

                let rearrangedSvgIconArea = rearrangeSvgIcon(svgIcons[idx], randomElement);
                let isSvgRearranged = rearrangedSvgIconArea !== undefined;
                $(svgIcon).parent().attr("is-svg-rearranged", isSvgRearranged);
                if (isSvgRearranged) {
                    self.filledAreas.push(rearrangedSvgIconArea);
                }
            });
        }

        distributeIcons(self, surfbar);

        showSvgIcons(svgIcons);

    }, SHOW_ICONS_AFTER_SECONDS * 1000);

    return false;
};

Jackpot.prototype.calculateOverlap = function (area1) {
    let overlap = 0;
    for (let i = 0; i < this.filledAreas.length; i++) {

        let area2 = this.filledAreas[i];

        if (area1.x + area1.width < area2.x) {
            continue;
        }
        if (area2.x + area2.width < area1.x) {
            continue;
        }
        if (area1.y + area1.height < area2.y) {
            continue;
        }
        if (area2.y + area2.height < area1.y) {
            continue;
        }

        let x1 = Math.max(area1.x, area2.x);
        let y1 = Math.max(area1.y, area2.y);
        let x2 = Math.min(area1.x + area1.width, area2.x + area2.width);
        let y2 = Math.min(area1.y + area1.height, area2.y + area2.height);

        overlap += ((x1 - x2) * (y1 - y2));
    }

    return overlap;
};

Jackpot.prototype.insertIconTaskNodes = function (surfbar) {
    if (surfbar.tasks == null) {
        return;
    }

    let svg = this.getSvg();

    surfbar.tasks.forEach(function (task) {
        if (task.taskType === TASK_TYPE_ICON) {
            let div = $('<div/>', {
                siteid: surfbar.params.siteid,
                viewCode: surfbar.params.code,
                taskCode: task.code,
                taskPoints: task.earnedPoints,
                userId: task.userId,
                selector: surfbar.params.jackpotSelector,
                html: svg, 
                css: {
                    "z-index": 2147483647
                }
            });
            $("html").append(div);
        }
    });
};

Jackpot.prototype.addTaskClickedListener = function (surfbar) {
    $(document).on('click', '.jackpot-icon', function (e) {

        let svg = $(this).parent();
        let div = $(this).parent().parent();
        let taskCode = $(div).attr("taskCode");

        $(svg).hide();
        $(svg).attr("clicked", true);

        let element = document.elementFromPoint(e.pageX - window.pageXOffset, e.pageY - window.pageYOffset);
        if ($(element).is("video")) {
            if (element.playing) {
                element.pause();
            } else {
                element.play();
            }
        } else {
            element.click();
        }

        chrome.runtime.sendMessage({
            from: "jackpot",
            action: "oneTaskClicked",
            surfbar: surfbar,
        });

        $.ajax({
            type: "POST",
            url: surfbar.confirmTasksForViewUrl,
            data: {
                siteId: $(div).attr("siteid"),
                viewCode: $(div).attr("viewCode"),
                taskCode: taskCode,
                userId: $(div).attr("userId"),
                amount: $(div).attr("taskPoints"),
            },
            success: function () {
                $(svg).stop(true, true);
                $(svg).fadeOut(1, function () {
                    showConfirmedTaskPoints(svg);
                });

                surfbar.earnedTaskPoints += parseFloat($(div).attr("taskPoints"));
                console.debug("Earned Task Points: " + surfbar.earnedTaskPoints);

                chrome.runtime.sendMessage({
                    from: "jackpot",
                    action: "removeTask",
                    surfbar: surfbar,
                    taskCode: taskCode,
                });
            },
            error: function (xhr) {
                $(svg).stop(true, true);
                console.debug(xhr.responseText);
            }
        });
    });
};

function distributeIcons(context, surfbar) {
    let svgWidth = 100;
    let svgHeight = 70;
    let maxSearchIterations = 10;
    let min_x = 0;
    let min_y = 0;

    let max_x = window.innerWidth - (2 * svgWidth);
    let body = document.body;
    let html = document.documentElement;
    let max_y = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight) - (2 * svgHeight);

    if (max_y > 5000) {
        max_y = 2000;
    }


    let svgIcons = $('.svg-icon');
    let taskCount = surfbar.tasks ? surfbar.tasks.length : 0;
    let insertedTasks = 0;
    $(svgIcons).each(function (idx, svgIcon) {
        insertedTasks++;

        let isSvgRearranged = $(svgIcon).parent().attr("is-svg-rearranged");
        let isMaximumTasksReached = insertedTasks > taskCount;
        if (isSvgRearranged || isMaximumTasksReached) {
            return;
        }

        let rand_x = 0;
        let rand_y = 0;
        let smallestOverlap = 9007199254740992;
        let bestChoice;
        let area;

        for (let i = 0; i < maxSearchIterations; i++) {
            rand_x = Math.round(min_x + ((max_x - min_x) * (Math.random() % 1)));
            rand_y = Math.round(min_y + ((max_y - min_y) * (Math.random() % 1)));
            area = {
                x: rand_x,
                y: rand_y,
                width: $(this).width(),
                height: $(this).height()
            };

            let overlap = context.calculateOverlap(area);
            if (overlap < smallestOverlap) {
                smallestOverlap = overlap;
                bestChoice = area;
            }
            if (overlap === 0) {
                break;
            }
        }

        context.filledAreas.push(bestChoice);

        $(this).css({
            position: "absolute",
            "z-index": 2147483647,
            left: rand_x,
            top: rand_y,
            display: "none"
        });

        $(this).attr("pos-x", rand_x);
        $(this).attr("pos-y", rand_y);
    });
}

function showConfirmedTaskPoints(svgNode) {
    let divSvg = $(svgNode).parent();
    let taskPoints = $(divSvg).attr("taskPoints");

    let divConfirmed = $('<div/>', {
        html: taskPoints,
        css: {
            "position": $(svgNode).css("position"),
            "margin": $(svgNode).css("margin"),
            "z-index": "2147483647",
            "left": $(svgNode).css("left"),
            "top": $(svgNode).css("top"),
            "color": "#819db6",
            "background": "#fff",
            "border-radius": ".3em",
            "padding": ".1em .3em .1em .3em",
            "font-size": "2.5em",
            "border": "1px solid #819db6",
            "font-family": "Verdana"
        }
    });
    divSvg.append(divConfirmed);

    $(divConfirmed).fadeOut(5000);
}

function showSvgIcons(svgIcons) {
    svgIcons.each(function (idx, svgIcon) {
        blinkIcon(idx, $(svgIcon));
    });
}

function rearrangeSvgIcon(svgIcon, randomElement) {
    let offset = $(randomElement).offset();

    $(svgIcon).css({
        position: "absolute",
        "z-index": 2147483647,
        left: offset.left,
        top: offset.top,
        display: "none"
    });

    $(svgIcon).attr("pos-x", offset.left);
    $(svgIcon).attr("pos-y", offset.top);

    return {
        x: offset.left,
        y: offset.top,
        width: $(svgIcon).width(),
        height: $(svgIcon).height()
    };
}

function getJackpotSelectorElements(selector) {
    if (!selector) {
        return;
    }

    let elements;

    if (isValidURL(selector)) {
        elements = $("a[href^='" + selector + "']");
        if (elements.length !== 0) {
            return elements;
        }
    }

    try {
        elements = $("#" + selector);
        if (elements.length !== 0) {
            return elements;
        }

        elements = $("." + selector);
        if (elements.length !== 0) {
            return elements;
        }
    } catch (e) {

    }

}

function blinkIcon(secondsHidden, element) {
    blink(element, 0, secondsHidden);

    setTimeout(function () {
        let counter = 0;

        let interval = setInterval(function () {
            let isClicked = $(element).attr("clicked");
            let isSvgRearranged = $(element).parent().attr("is-svg-rearranged");

            if (isClicked) {
                return;
            }

            $(element).fadeOut(1, function () {
                if (isSvgRearranged) {
                    return;
                }

                let randomX = Math.floor(Math.random() * 51) - 25;
                let randomY = Math.floor(Math.random() * 51) - 25;

                let posX = parseInt($(element).attr("pos-x"));
                let posY = parseInt($(element).attr("pos-y"));

                $(element).css({
                    left: posX + randomX,
                    top: posY + randomY,
                });
            });

            $(element).delay(500).fadeIn(1);

            if (++counter === 3) {
                clearInterval(interval);
                hide(element, 3);
            }
        }, 3000);
    }, secondsHidden * 1000);

}

function blink(element, secondsShown, secondsHidden) {
    $(element)
        .delay(secondsShown * 1000).fadeOut(1)
        .delay(secondsHidden * 1000).fadeIn(1);
}

function hide(element, delayInSeconds) {
    element.delay(delayInSeconds * 1000).fadeOut(1, function () {
        let divSvgNode = $(element).parent()[0];
        $(divSvgNode).remove();
    });
}

function isValidURL(str) {
    let pattern = new RegExp('^(https?:\\/\\/)?' + 
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + 
        '((\\d{1,3}\\.){3}\\d{1,3}))' + 
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + 
        '(\\?[;&a-z\\d%_.~+=-]*)?' + 
        '(\\#[-a-z\\d_]*)?$', 'i'); 

    return !!pattern.test(str);
}

Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
    get: function () {
        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
    }
});
