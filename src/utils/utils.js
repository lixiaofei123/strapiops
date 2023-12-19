function wellSize(size){
    if(size <= 1024){ // byte
        return size + " Byte"
    }else if(size <= 1024 * 1024){
        return (size / 1024).toFixed(2) + " KB"
    }else if(size <= 1024 * 1024 * 1024){
        return (size / (1024 * 1024)).toFixed(2) + " MB"
    }else if(size <= 1024 * 1024 * 1024 * 1024){
        return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB"
    }else{
        return (size / (1024 * 1024 * 1024 * 1024)).toFixed(2) + " TB"
    }
}

function deepCopy(data){
    let str = JSON.stringify(data)
    return JSON.parse(str)
}

export {
    wellSize,
    deepCopy
}