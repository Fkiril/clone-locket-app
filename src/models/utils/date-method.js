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

export { dateToString, stringToDate }