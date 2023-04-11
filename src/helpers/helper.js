const convertTime12to24 = (time12h) => {
    const [time, modifier] = time12h?.split(' ');

    let [hours, minutes] = time.split(':');

    if (hours === '12') {
        hours = '00';
    }

    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }

    return `${hours}:${minutes}`;
}

exports.timeVarifier = (timestart, timeend) => {
    let startTime;
    let endTime;
    if (timestart) {
        startTime = convertTime12to24(timestart)
    }
    if (timeend) {
        endTime = convertTime12to24(timeend)
    }

    if (startTime && endTime) {
        if (startTime > endTime) {
            return false
        }
        return { startTime: startTime ? startTime : null, endTime: endTime ? endTime : null }
    }
    else {
        return { startTime: startTime ? startTime : null, endTime: endTime ? endTime : null }
    }
}

exports.formatTime = (timeString) => {
    if (timeString != "null" && timeString != "" && timeString != undefined) {
        const [hourString, minute] = timeString.split(":");
        const hour = +hourString % 24;
        return (hour % 12 || 12) + ":" + minute + " " + (hour < 12 ? "AM" : "PM");
    }
    else {
        return null
    }

}

exports.standardformatDate = (date) => {
    const [day, month, year] = date.split("-")
    return [year, month, day].join('-');
}

exports.localformatDate = (date) => {
    const [year, month, day] = date.split("-")
    return [day, month, year].join('-');
}

exports.getTodayDateLocalFormat = () => {
    const date = new Date()
    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()
    return [day, month + 1 <= 9 ? `0${month + 1}` : month + 1, year].join("-")
}

exports.getTodayDateStandardFormat = () => {
    const date = new Date()
    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()
    return [year, month + 1 <= 9 ? `0${month + 1}` : month + 1, day].join("-")
}

exports.leaveHandler = (type, startDate, endDate) => {
    const date1 = new Date(startDate);
    const date2 = new Date(endDate);
    const time = date2.getTime() - date1.getTime();
    const days = time / (1000 * 3600 * 24);
    if (!days && type == "half") {
        return 0.5
    }
    else if (!days) {
        return 1
    }
    else {
        return days
    }
}