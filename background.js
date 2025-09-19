chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "downloadVideo") {
        const videoId = request.videoId;
        const timestamp = new Date().toLocaleTimeString();

        chrome.storage.local.get(["downloadedIds"], (data) => {
            const downloadedIds = data.downloadedIds || [];

            const playerUrl = `https://www.tiktok.com/player/v1/${videoId}`;

            chrome.tabs.create({ url: playerUrl }, (tab) => {
                setTimeout(() => {
                    chrome.tabs.sendMessage(tab.id, { action: "getVideoSrc" }, (response) => {
                        if (chrome.runtime.lastError || !response?.videoSrc) {
                            chrome.storage.local.set({
                                lastLog: `[${timestamp}] ❌ Gagal ambil video src dari ID ${videoId}`
                            });
                            return;
                        }

                        const videoUrl = response.videoSrc;

                        chrome.downloads.download({
                            url: videoUrl,
                            filename: `tiktok_${videoId}.mp4`,
                            saveAs: false
                        }, () => {
                            if (chrome.runtime.lastError) {
                                chrome.storage.local.set({
                                    lastLog: `[${timestamp}] ❌ Download gagal untuk ${videoId}: ${chrome.runtime.lastError.message}`
                                });
                                return;
                            }

                            if (!downloadedIds.includes(videoId)) {
                                downloadedIds.push(videoId);
                            }

                            chrome.storage.local.set({
                                downloadedIds,
                                lastLog: `[${timestamp}] ✅ Video ${videoId} berhasil didownload.`
                            });
                        });

                        chrome.tabs.remove(tab.id);
                    });
                }, 3000);
            });
        });
    }
});
