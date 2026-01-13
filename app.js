const WEBHOOK_URL = "https://silent-flower.arffn108.workers.dev/";

const chat = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

// Change your developer name here anytime
const DEVELOPER_NAME = "Fahad";

function addMsg(who, text) {
  const row = document.createElement("div");
  row.className = "msg";

  const badge = document.createElement("div");
  badge.className = "badge " + (who === "You" ? "me" : "ai");
  badge.textContent = who;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  row.appendChild(badge);
  row.appendChild(bubble);
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

function isDevQuestion(message) {
  const m = message.toLowerCase();
  return (
    m.includes("developer") ||
    m.includes("dev") ||
    m.includes("who made") ||
    m.includes("who created") ||
    m.includes("who built") ||
    m.includes("your creator") ||
    m.includes("your developer") ||
    m.includes("kis ne banaya") ||
    m.includes("banaya kis ne")
  );
}

async function send() {
  const message = input.value.trim();
  if (!message) return;

  addMsg("You", message);
  input.value = "";

  // ✅ Local answer for developer questions
  if (isDevQuestion(message)) {
    addMsg("AI", `This app was developed by ${DEVELOPER_NAME}.`);
    return;
  }

  // Typing indicator
  addMsg("AI", "Typing...");

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    // remove typing...
    chat.lastChild?.remove();

    addMsg("AI", data.reply || "No reply received.");
  } catch (err) {
    chat.lastChild?.remove();
    addMsg("AI", "Error: Could not reach the server.");
  }
}

sendBtn.onclick = send;

// Enter = send, Shift+Enter = new line (simple behavior)
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});
