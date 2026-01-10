const WEBHOOK_URL = "https://silent-flower.arffn108.workers.dev/";



    const chat = document.getElementById("chat");
    const input = document.getElementById("input");
    const sendBtn = document.getElementById("send");

    function addMsg(label, text) {
      const div = document.createElement("div");
      div.className = "msg";
      div.innerHTML = `<span class="${label === "You" ? "me" : "ai"}">${label}:</span> ${text}`;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
    }

    async function send() {
      const message = input.value.trim();
      if (!message) return;

      addMsg("You", message);
      input.value = "";
      addMsg("AI", "Typing...");

      try {
        const res = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message })
        });

        const data = await res.json();
        chat.lastChild.remove(); // remove "Typing..."
        addMsg("AI", data.reply || "No reply received.");
      } catch (err) {
        chat.lastChild.remove();
        addMsg("AI", "Error: Could not reach the server.");
      }
    }

    sendBtn.onclick = send;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") send();
    });