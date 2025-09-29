chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // menangkap pesan dari popup.js - 003
    if (request.action === "downloadVideo") {
        const videoId = request.videoId;
        const timestamp = new Date().toLocaleTimeString();

        // mengambil data yang tersimpan di storage lokal
        chrome.storage.local.get(["downloadedIds"], (data) => {
            const downloadedIds = data.downloadedIds || []; // array id video yang sudah diunduh

            const playerUrl = `https://www.tiktok.com/player/v1/${videoId}`; // link embed video tiktok

            // membuka tab baru berisi embed video tiktok - 004
            chrome.tabs.create({ url: playerUrl }, (tab) => {
                // menunggu 3 detik sampai berhasil tampilan dimuat
                setTimeout(() => {
                    // Mengirim pesan ke script.js dan menerima src video - 005
                    chrome.tabs.sendMessage(tab.id, { action: "getVideoSrc" }, (response) => {

                        // mengecek apakan data yang dikembalikan berhasil ditemukan
                        if (chrome.runtime.lastError || !response?.videoSrc) {
                            chrome.storage.local.set({
                                lastLog: `[${timestamp}] ❌ Gagal ambil video src dari ID ${videoId}`
                            });
                            return;
                        }

                        // menyimpan link video
                        const videoUrl = response.videoSrc;

                        // memulai download file video nya - 008
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

                            // menyimpan id video yang sudah diunduh
                            if (!downloadedIds.includes(videoId)) {
                                downloadedIds.push(videoId);
                            }

                            // kemudian menyimpan data ke storage lokal
                            chrome.storage.local.set({
                                downloadedIds,
                                lastLog: `[${timestamp}] ✅ Video ${videoId} berhasil didownload.`
                            });
                        });

                        chrome.tabs.remove(tab.id); // menutup tab yang sudah tidak dipakai lagi
                    });
                }, 3000);
            });
        });
    }
});
