document.addEventListener('DOMContentLoaded', () => {
    const statusText = document.getElementById('statusText');
    const logText = document.getElementById('logText');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadStatus = document.getElementById('downloadStatus');
    const resetBtn = document.getElementById('resetBtn');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        const match = url.match(/^https:\/\/www\.tiktok\.com\/@[^/]+\/video\/(\d+)/);

        if (!match) {
            statusText.textContent = "❌ Bukan halaman video TikTok";
            downloadBtn.disabled = true;
            return;
        }

        const videoId = match[1];
        statusText.textContent = `🎥 Video ID: ${videoId}`;

        // Mengecek apakah video ini sudah pernah diunduh sebelumnya
        chrome.storage.local.get(["downloadedIds", "lastLog"], (data) => {
            const downloadedIds = data.downloadedIds || [];
            if (downloadedIds.includes(videoId)) {
                downloadStatus.textContent = "✅ Video ini sudah pernah diunduh.";
            } else {
                downloadStatus.textContent = "⬜ Video ini belum pernah diunduh.";
            }
            logText.textContent = data.lastLog ?? "Belum ada aktivitas.";
        });

        // Alur download video ==> user mengklik tombol download - 001
        // tombol ini akan selalu aktig
        downloadBtn.addEventListener("click", () => {
            // mengirim pesan berupa id video ke background.js - 002
            chrome.runtime.sendMessage({ action: "downloadVideo", videoId });
        });

        // Tombol reset history
        resetBtn.addEventListener("click", () => {
            chrome.storage.local.set({ downloadedIds: [] }, () => {
                downloadStatus.textContent = "⬜ Riwayat direset. Video ini dianggap belum diunduh.";
                logText.textContent = "🗑️ Riwayat unduhan berhasil direset.";
            });
        });
    });
});
