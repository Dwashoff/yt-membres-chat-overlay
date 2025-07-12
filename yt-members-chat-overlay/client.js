const urlParams = new URLSearchParams(window.location.search);
const liveId = urlParams.get("liveId");
const chatContainer = document.getElementById("chat");

if (!liveId) {
  chatContainer.innerText = "Erreur : aucun ID de live fourni.";
}

const apiKey = "YOUR_YOUTUBE_API_KEY"; // Remplacer par votre clé API YouTube
let nextPageToken = "";

async function fetchChat() {
  const url = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${window.chatId}&part=snippet,authorDetails&key=${apiKey}&pageToken=${nextPageToken}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    nextPageToken = data.nextPageToken;
    for (const msg of data.items) {
      if (msg.authorDetails.isChatSponsor) {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${msg.authorDetails.displayName} :</strong> ${msg.snippet.displayMessage}`;
        chatContainer.appendChild(p);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  } catch (err) {
    console.error("Erreur API chat", err);
  }
}

async function getLiveChatId() {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${liveId}&key=${apiKey}`);
  const data = await res.json();
  window.chatId = data.items[0].liveStreamingDetails.activeLiveChatId;
  setInterval(fetchChat, 3000);
}

getLiveChatId();
