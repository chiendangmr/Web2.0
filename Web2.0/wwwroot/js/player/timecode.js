function convertStringToTime(str) {
    if (typeof str == "undefined")
        return 0;
    var t = [];
    if (str.indexOf(".") != -1) {
        t = str.split(new RegExp("[:.]"));
    } else {
        t = str.split(new RegExp("[:]"));
    }

    var hour = parseInt(t[0]);
    var minute = parseInt(t[1]);
    var second = parseInt(t[2]);
    var frame = parseInt(t[3]);
    return (((hour * 60 + minute) * 60) + second) + frame / 25;
}

function convertTimeToStringDot(time) {
    if (isNaN(time)) {
        return "00:00:00:00";
    }
    var frame = parseInt(time * 25 + 0.5) % 25;
    frame = (frame < 10) ? "0" + String(frame) : frame;
    var second = parseInt(time) % 60;
    second = (second < 10) ? "0" + String(second) : second;
    var minute = parseInt(time / 60) % 60;
    minute = (minute < 10) ? "0" + String(minute) : minute;
    var hour = parseInt(time / 3600);
    hour = (hour < 10) ? "0" + String(hour) : hour;
    return hour + ":" + minute + ":" + second + "." + frame;
}

function convertTimeToString(time) {
    if (isNaN(time)) {
        return "00:00:00:00";
    }
    var frame = parseInt(time * 25 + 0.5) % 25;
    frame = (frame < 10) ? "0" + String(frame) : frame;
    var second = parseInt(time) % 60;
    second = (second < 10) ? "0" + String(second) : second;
    var minute = parseInt(time / 60) % 60;
    minute = (minute < 10) ? "0" + String(minute) : minute;
    var hour = parseInt(time / 3600);
    hour = (hour < 10) ? "0" + String(hour) : hour;
    return hour + ":" + minute + ":" + second + ":" + frame;
}

function convertStringToMs(str) {
    var t = str.split(new RegExp("[:.]"));
    var hour = parseInt(t[0]);
    var minute = typeof t[1] != "undefined" ? parseInt(t[1]) : 0;
    var second = typeof t[2] != "undefined" ? parseInt(t[2]) : 0;
    var frame = typeof t[3] != "undefined" ? parseInt(t[3]) : 0;
    return (((hour * 60 + minute) * 60) + second) * 1000 + frame * 40;
}

function convertTimeToTimeString(ms, format) {
    if (typeof format == "undefined") {
        format = "HH:mm:ss";
    }
    var date = new Date("1970-01-01 00:00:00");
    if (isNaN(ms)) {
        return $.format.date(date, format);
    }
    date.setTime(date.getTime() + ms);
    return $.format.date(date, format);
}

