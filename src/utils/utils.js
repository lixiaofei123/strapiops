var moment = require('moment');

function wellSize(size) {
    if (size <= 1024) { // byte
        return size + " Byte"
    } else if (size <= 1024 * 1024) {
        return (size / 1024).toFixed(2) + " KB"
    } else if (size <= 1024 * 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(2) + " MB"
    } else if (size <= 1024 * 1024 * 1024 * 1024) {
        return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB"
    } else {
        return (size / (1024 * 1024 * 1024 * 1024)).toFixed(2) + " TB"
    }
}



function beautify_iso_time(isotime) {
    let time1 = Date.parse(isotime) / 1000
    let time2 = new Date().getTime() / 1000

    let duration = time2 - time1

    if (duration < 10) {
        return "刚刚"
    }
    if (duration < 120) {
        return parseInt(duration) + "秒前"
    }

    // 分钟
    if (duration < 3600) {
        return parseInt(duration / 60) + "分" + parseInt(duration % 60) + "秒前"
    }

    // 小时
    if (duration < 86400) {
        return parseInt(duration / 3600) + "小时" + parseInt(duration % 3600 / 60) + "分钟前"
    }

    return format_timestamp(time1)
}

function format_timestamp(timestamp) {
    return moment.unix(timestamp).format("YYYY年MM月DD日 HH时mm分")
}

function get_today_string() {
    return moment().format('YYYYMMDD');
}

function deepCopy(data) {
    let str = JSON.stringify(data)
    return JSON.parse(str)
}

function getThumbnailUrl(file) {

    let mimetype = file.mime || file.type
    if (mimetype.startsWith("image")) {
        if (file.formats) {
            let formats = file.formats
            return formats["thumbnail"] ? formats["thumbnail"].url : (
                formats["small"] ? formats["small"].url : (
                    formats["medium"] ? formats["medium"].url : (
                        formats["large"] ? formats["large"].url : file.url
                    )
                )
            )
        }
    }

    if (mimetype.startsWith("video")) {
        return require("../assets/image/file/video.png")
    }

    if (mimetype.startsWith("audio")) {
        return require("../assets/image/file/audio.png")
    }

    if (mimetype.startsWith("application/vnd") || mimetype.startsWith("text")) {
        return require("../assets/image/file/document.png")
    }

    return require("../assets/image/file/file.png")
}


export {
    wellSize,
    deepCopy,
    beautify_iso_time,
    format_timestamp,
    get_today_string,
    getThumbnailUrl
}