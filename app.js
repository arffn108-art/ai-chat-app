const WEBHOOK_URL = "https://silent-flower.arffn108.workers.dev/"; // your worker URL

const chat = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const imageInput = document.getElementById("image");

function addMsg(label, html) {
  const row = document.createElement("div");
  row.className = "msg";

  const badge = document.createElement("div");
  badge.className = "badge " + (label === "You" ? "me" : "ai");
  badge.textContent = label;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = html;

  row.appendChild(badge);
  row.appendChild(bubble);
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // data:image/...;base64,xxxx
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function send() {
  const message = input.value.trim();
  const file = imageInput?.files?.[0];

  if (!message && !file) return;

  // show user message
  if (message) addMsg("You", message);

  // show user image preview
  if (file) {
    const previewUrl = URL.createObjectURL(file);
    addMsg("You", `<img class="chatImage" src="${previewUrl}" alt="uploaded image" />`);
  }

  input.value = "";
  addMsg("AI", "Typing...");

  try {
    let imageBase64 = null;
    if (file) imageBase64 = await fileToBase64(file);

    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        image: imageBase64,
        developerName: "Fahad Ateeq"
      })
    });

    const data = await res.json();

    // remove Typing...
    chat.lastChild.remove();

    addMsg("AI", (data.reply || "No reply received.").replace(/\n/g, "<br>"));
  } catch (err) {
    chat.lastChild.remove();
    addMsg("AI", "Error: Could not reach the server.");
  }

  // clear image after sending
  if (imageInput) imageInput.value = "";
}

sendBtn.onclick = send;

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});
