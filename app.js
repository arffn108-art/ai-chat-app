// ✅ Your Cloudflare Worker endpoint (IMPORTANT)
const VISION_API_URL = "https://ai-chat-vision.arffn108.workers.dev/analyze";

const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send");

const fileInput = document.getElementById("fileInput");
const pickImageBtn = document.getElementById("pickImageBtn");

let pendingImageFile = null;

// ------------------ UI Helpers ------------------
function addMessage(who, content, isHTML = false) {
  const wrap = document.createElement("div");
  wrap.className = "msg";

  const badge = document.createElement("div");
  badge.className = "badge " + (who === "You" ? "me" : "ai");
  badge.textContent = who;

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  if (isHTML) bubble.innerHTML = content;
  else bubble.textContent = content;

  wrap.appendChild(badge);
  wrap.appendChild(bubble);

  chatEl.appendChild(wrap);
  chatEl.scrollTop = chatEl.scrollHeight;

  return bubble;
}

function setPendingImage(file) {
  pendingImageFile = file;

  // show preview in chat
  const url = URL.createObjectURL(file);
  addMessage(
    "You",
    `<div><b>Image selected:</b> ${file.name}</div><img src="${url}" alt="uploaded image">`,
    true
  );
}

// ------------------ Send Message ------------------
async function sendMessage() {
  const text = inputEl.value.trim();

  if (!text && !pendingImageFile) {
    addMessage("AI", "Please type a message OR upload an image.");
    return;
  }

  // show your typed message in chat
  if (text) addMessage("You", text);

  inputEl.value = "";

  // show thinking
  const thinkingBubble = addMessage("AI", "Thinking...");

  try {
    const form = new FormData();
    form.append("text", text || "");

    if (pendingImageFile) {
      form.append("image", pendingImageFile);
    }

    // clear after sending so next message is fresh
    pendingImageFile = null;

    const res = await fetch(VISION_API_URL, {
      method: "POST",
      body: form
    });

    if (!res.ok) {
      const txt = await res.text();
      thinkingBubble.textContent = "Error from server: " + txt;
      return;
    }

    const data = await res.json();
    thinkingBubble.textContent = data.reply || "No reply received.";

  } catch (err) {
    thinkingBubble.textContent = "Error: " + err.message;
  }
}

// ------------------ Events ------------------
sendBtn.addEventListener("click", sendMessage);

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// 📷 button opens file picker
pickImageBtn.addEventListener("click", () => fileInput.click());

// when user selects image
fileInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    addMessage("AI", "Please select an image only (jpg/png/webp).");
    return;
  }

  setPendingImage(file);
  fileInput.value = ""; // reset
});

// drag & drop image into chat
chatEl.addEventListener("dragover", (e) => {
  e.preventDefault();
  chatEl.classList.add("dragover");
});

chatEl.addEventListener("dragleave", () => {
  chatEl.classList.remove("dragover");
});

chatEl.addEventListener("drop", (e) => {
  e.preventDefault();
  chatEl.classList.remove("dragover");

  const file = e.dataTransfer.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    addMessage("AI", "Drop only an image (jpg/png/webp).");
    return;
  }

  setPendingImage(file);
});

// ------------------ PWA: Service Worker ------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");
      console.log("Service worker registered");
    } catch (e) {
      console.log("SW registration failed", e);
    }
  });
}
