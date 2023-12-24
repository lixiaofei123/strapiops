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
        return "https://img.alicdn.com/imgextra/i2/O1CN01YgPBAp1zvunG71HdD_!!6000000006777-2-tps-140-140.png"
    }

    if (mimetype.startsWith("audio")) {
        return "https://img.alicdn.com/imgextra/i2/O1CN01Kpm3PQ1we6XnumP1M_!!6000000006332-2-tps-140-140.png"
    }

    if (mimetype.startsWith("application/vnd") || mimetype.startsWith("text")) {
        return "https://img.alicdn.com/imgextra/i2/O1CN017vpxdQ27S9zPCPqMD_!!6000000007795-2-tps-140-140.png"
    }

    return "https://img.alicdn.com/imgextra/i3/O1CN01AL5gT51gGiSu2jMbx_!!6000000004115-2-tps-140-140.png"
}


export {
    wellSize,
    deepCopy,
    beautify_iso_time,
    format_timestamp,
    get_today_string,
    getThumbnailUrl
}