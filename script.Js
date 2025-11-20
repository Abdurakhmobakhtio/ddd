// =====================
// Helper.AI — SUPER UPGRADED script.js
// =====================

// =====================
// YOUR OPENAI API KEY
// =====================
const OPENAI_API_KEY = "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";

// =====================
// DOM Elements
// =====================
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const langSelect = document.getElementById("langSelect");
const themeToggle = document.getElementById("themeToggle");
const title = document.getElementById("title");
const typingIndicator = document.getElementById("typing");
const colorThemePicker = document.getElementById("colorTheme");

// =====================
// Translations
// =====================
const translations = {
  ru: {
    hello: "👋 Привет! Я Helper.AI. Чем могу помочь?",
    placeholder: "Введите сообщение...",
    title: "Helper.AI 🤖",
    seasonsAnswer: "В году 4 сезона: весна, лето, осень и зима.",
    unknown: "🤔 Я пока не знаю, как ответить, но я учусь!",
    joke: "😂 Анекдот: — Пап, а что такое виртуальная реальность? — Сынок, представь себе, что ты отличник..."
  },
  uz: {
    hello: "👋 Salom! Men Helper.AI. Qanday yordam beray?",
    placeholder: "Xabar yozing...",
    title: "Helper.AI 🤖",
    seasonsAnswer: "Yilda 4 fasl bor: bahor, yoz, kuz va qish.",
    unknown: "🤔 Hali javobni bilmayman, lekin o‘rganayapman!",
    joke: "😂 Hazil: O‘qituvchi: – Nega darsga kech qolding? O‘quvchi: – Chunki erta kelishni kech o‘ylab qoldim!"
  },
  en: {
    hello: "👋 Hello! I'm Helper.AI. How can I help you?",
    placeholder: "Type your message...",
    title: "Helper.AI 🤖",
    seasonsAnswer: "There are 4 seasons in a year: spring, summer, autumn (fall) and winter.",
    unknown: "🤔 I don't know the answer yet, but I'm learning!",
    joke: "😂 Joke: Why did the computer go to the doctor? Because it had a virus!"
  }
};

let currentLang = "ru";

// =====================
// LocalStorage Chat History
// =====================
const STORAGE_KEY = "helper_ai_chat_history";

function saveMessageToHistory(text, sender) {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  history.push({ text, sender, time: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  history.forEach(item => addMessage(item.text, item.sender, false));
}

// =====================
// Add message to chat
// =====================
function addMessage(text, sender = "bot", save = true) {
  const msg = document.createElement("div");
  msg.className = `msg ${sender} fade-in`;
  msg.textContent = text;

  let startX = 0;
  msg.addEventListener("touchstart", e => startX = e.touches[0].clientX);
  msg.addEventListener("touchmove", e => {
    const diff = e.touches[0].clientX - startX;
    if (diff > 80) { msg.style.opacity = 0; setTimeout(() => msg.remove(), 300); }
  });

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (save) saveMessageToHistory(text, sender);
}

// =====================
// First bot message OR load history
// =====================
if (localStorage.getItem(STORAGE_KEY)) {
  loadHistory();
} else {
  addMessage(translations[currentLang].hello);
}

// =====================
// Send message
// =====================
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", e => { if (e.key === "Enter") sendMessage(); });

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  typingIndicator.style.display = "block";
  setTimeout(() => botAnswer(text), 400);
}

// =====================
// Text-to-Speech
// =====================
function speak(text) {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = currentLang === "ru" ? "ru-RU" : currentLang === "uz" ? "uz-UZ" : "en-US";
  window.speechSynthesis.speak(utter);
}

// =====================
// ChatGPT API Support (always ON)
// =====================
async function askOpenAI(text) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: text }],
      max_tokens: 150
    })
  });

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || null;
}

// =====================
// BOT Answer Logic
// =====================
async function botAnswer(text) {
  const lower = text.toLowerCase();

  if (lower.includes("hello") || lower.includes("привет") || lower.includes("salom")) {
    typingIndicator.style.display = "none";
    addMessage(translations[currentLang].hello);
    speak(translations[currentLang].hello);
    return;
  }

  if (lower.includes("name") || lower.includes("имя") || lower.includes("ism")) {
    const ans = currentLang === "ru" ? "😊 Меня зовут Helper.AI!" : currentLang === "uz" ? "😊 Mening ismim Helper.AI!" : "😊 My name is Helper.AI!";
    typingIndicator.style.display = "none";
    addMessage(ans);
    speak(ans);
    return;
  }

  if (/сколько\s+сезон/i.test(lower) || /nechta\s+fasl/i.test(lower) || /how\s+many\s+seasons/i.test(lower)) {
    typingIndicator.style.display = "none";
    addMessage(translations[currentLang].seasonsAnswer);
    speak(translations[currentLang].seasonsAnswer);
    return;
  }

  if (lower.includes("date") || lower.includes("дата") || lower.includes("sana")) {
    typingIndicator.style.display = "none";
    const ans = new Date().toLocaleDateString();
    addMessage(ans);
    speak(ans);
    return;
  }

  if (lower.includes("time") || lower.includes("время") || lower.includes("soat")) {
    typingIndicator.style.display = "none";
    const ans = new Date().toLocaleTimeString();
    addMessage(ans);
    speak(ans);
    return;
  }

  if (lower.includes("joke") || lower.includes("анекдот") || lower.includes("hazil")) {
    typingIndicator.style.display = "none";
    const ans = translations[currentLang].joke;
    addMessage(ans);
    speak(ans);
    return;
  }

  // ✅ Always use OpenAI API
  const answer = await askOpenAI(text);
  typingIndicator.style.display = "none";
  if (answer) {
    addMessage(answer);
    speak(answer);
    return;
  }

  // Default fallback
  addMessage(translations[currentLang].unknown);
  speak(translations[currentLang].unknown);
}

// =====================
// Language Switch
// =====================
langSelect.addEventListener("change", () => {
  currentLang = langSelect.value;
  title.textContent = translations[currentLang].title;
  userInput.placeholder = translations[currentLang].placeholder;
  chatBox.innerHTML = "";
  loadHistory();
});

// =====================
// Light / Dark Theme
// =====================
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "🌙" : "🌞";
});

// =====================
// Color Themes (Blue, Pink, Green)
// =====================
if (colorThemePicker) {
  colorThemePicker.addEventListener("change", () => {
    document.body.classList.remove("theme-blue", "theme-pink", "theme-green");
    document.body.classList.add(`theme-${colorThemePicker.value}`);
  });
}
