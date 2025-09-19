chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getVideoSrc") {
        const video = document.querySelector("video");
        const src = video ? video.src : null;
        sendResponse({ videoSrc: src });
    }
    return true;
});
