chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // menerima pesan dari background.js - 006
    if (request.action === "getVideoSrc") {
        const video = document.querySelector("video");
        const src = video ? video.src : null;
        // mengembalikan sebuah fungsi berisi link asset nya - 007
        sendResponse({ videoSrc: src });
    }
    return true;
});
