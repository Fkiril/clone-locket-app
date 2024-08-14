const dateToString = (date) => {
    return date.toLocaleString("vi-VN").replace(/\//g, "-");
}

const stringToDate = (date) => {
    if (!date) return;
    const arr = date.split(" ").reverse();
    arr[0] = arr[0].split("-").reverse().map((item) => {
        if (item.length < 2) {
            item = "0" + item;
        }
        return item;
    }).join("-");
    return new Date(arr.join("T"));
}

const stringToTimestamp = (date) => {
    if (!date || date === "") return;
    
    return new Date(stringToDate(date)).getTime();
}

const timestampToString = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString("vi-VN").replace(/\//g, "-");
}

export { dateToString, stringToDate, stringToTimestamp, timestampToString }