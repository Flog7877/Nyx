function timestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const months = now.getMonth() < 9 ? `0${now.getMonth() + 1}` : now.getMonth() + 1;
    const minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
    const hours = now.getHours() < 10 ? `0${now.getHours()}` : now.getHours();
    return `${now.getDate()}.${months}.${year}., ${hours}:${minutes} Uhr`;
}

module.exports = timestamp;