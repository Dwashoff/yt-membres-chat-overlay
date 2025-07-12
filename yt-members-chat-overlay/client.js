const urlParams = new URLSearchParams(window.location.search);
const liveId = urlParams.get("id");  // Récupère le paramètre 'id' dans l'URL
const chatContainer = document.getElementById("chat");

// On attend que la variable YOUTUBE_API_KEY soit définie ailleurs (ex: via un script injecté)
const apiKey = window.YOUTUBE_API_KEY;

if (!liveId) {
  chatContainer.innerText = "Erreur : aucun ID de live fourni.";
} else if (!apiKey) {
  chatContainer.innerText = "Erreur : clé API YouTube non définie.";
} else {
  let nextPageToken = "";

  async function fetchChat() {
    const url = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${window.chatId}&part=snippet,authorDetails&key=${apiKey}&pageToken=${nextPageToken}`;
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data.items) {
        chatContainer.innerText = "Aucun message ou problème avec l'API.";
        return;
      }

      nextPageToken = data.nextPageToken || "";

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
      chatContainer.innerText = "Erreur lors de la récupération des messages.";
    }
  }

  async function getLiveChatId() {
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${liveId}&key=${apiKey}`);
      const data = await res.json();

      if (!data.items || !data.items[0]) {
        chatContainer.innerText = "Impossible de récupérer les détails du live.";
        return;
      }

      window.chatId = data.items[0].liveStreamingDetails.activeLiveChatId;
      fetchChat();
      setInterval(fetchChat, 3000);
    } catch (err) {
      console.error("Erreur API liveChatId", err);
      chatContainer.innerText = "Erreur lors de la récupération de l'ID du chat.";
    }
  }

  getLiveChatId();
}
