// التبويبات داخل كل قسم
document.querySelectorAll(".tabs").forEach(function (bar) {
  bar.querySelectorAll(".tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const section = bar.closest("section");
      bar.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      section.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      section.querySelector("#" + btn.dataset.tab).classList.add("active");
    });
  });
});

// المساعد العام العائم
const openBtn = document.getElementById("openGeneral");
const genBox = document.getElementById("generalBox");
openBtn.addEventListener("click", () => genBox.hidden = !genBox.hidden);
document.getElementById("closeGeneral").addEventListener("click", () => genBox.hidden = true);

// المحادثات: كل مساعد يرسل role مختلف للدالة
function addMsg(container, text, who) {
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

document.querySelectorAll(".chat").forEach(function (chat) {
  const role = chat.dataset.role;
  const messages = chat.querySelector(".messages");
  const form = chat.querySelector(".chat-form");
  const input = form.querySelector("input");
  const button = form.querySelector("button");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    addMsg(messages, question, "user");
    input.value = "";
    button.disabled = true;
    const waiting = addMsg(messages, "جارٍ التفكير...", "bot");

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: role, message: question })
      });
      const data = await res.json();
      waiting.textContent = data.reply || "تعذّر الحصول على رد، حاول لاحقاً.";
    } catch (err) {
      waiting.textContent = "تعذّر الاتصال بالمساعد. تأكد من الإنترنت وحاول مرة أخرى.";
    } finally {
      button.disabled = false;
    }
  });
});

