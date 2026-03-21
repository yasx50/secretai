import { category } from "../models/categories.js";
import { Chat } from "../models/chats.js";
import { User } from "../models/user.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const SYSTEM_PROMPTS = {
  [category.GENERAL]: "You are a concise and helpful personal AI assistant.",
  [category.EDUCATION]: "You are an education tutor. Explain clearly with examples.",
  [category.MAIL_MESSAGES]: "You write polished emails and professional messages.",
  [category.DEFAULT]: "You are a helpful assistant.",
  [category.SINGLE_WORDS]: "Respond with concise single-word or very short answers where possible.",
  [category.SECRET]: "You are a privacy-focused assistant. Keep responses concise and discreet."
};

const callGroq = async (messages, activeCategory) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY in environment.");

  const payload = {
    model: DEFAULT_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPTS[activeCategory] || SYSTEM_PROMPTS[category.DEFAULT] },
      ...messages
    ],
    temperature: 0.4
  };

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || "No response generated.";
};

export const sendMessage = async (req, res) => {
  try {
    const { userid, category: activeCategory, message, secretPin } = req.body;
    if (!userid || !activeCategory || !message) {
      return res.status(400).json({ error: "userid, category and message are required." });
    }
    if (!Object.values(category).includes(activeCategory)) {
      return res.status(400).json({ error: "Invalid category provided." });
    }

    const user = await User.findById(userid);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (activeCategory === category.SECRET) {
      if (!secretPin) return res.status(401).json({ error: "Secret PIN required for secret chat." });
      if (!user.secretPin) {
        user.secretPin = secretPin;
        await user.save();
      } else {
        const isValidPin = await user.isSecretPinCorrect(secretPin);
        if (!isValidPin) return res.status(401).json({ error: "Invalid secret PIN." });
      }
    }

    let chat = await Chat.findOne({ userid, category: activeCategory });
    if (!chat) {
      chat = await Chat.create({ userid, category: activeCategory, messages: [] });
      user.chats.push(chat._id);
      await user.save();
    }

    chat.messages.push({ role: "user", content: message });
    const assistantReply = await callGroq(chat.messages.map((m) => ({ role: m.role, content: m.content })), activeCategory);
    chat.messages.push({ role: "assistant", content: assistantReply });
    await chat.save();

    return res.status(200).json({ reply: assistantReply, chatId: chat._id, messages: chat.messages });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to process chat message." });
  }
};

export const listChats = async (req, res) => {
  try {
    const { userid, includeSecret, secretPin } = req.query;
    if (!userid) return res.status(400).json({ error: "userid is required." });

    const user = await User.findById(userid);
    if (!user) return res.status(404).json({ error: "User not found." });

    const chats = await Chat.find({ userid }).sort({ updatedAt: -1 }).lean();
    const filtered = [];

    for (const chat of chats) {
      if (chat.category !== category.SECRET) {
        filtered.push(chat);
        continue;
      }
      if (includeSecret !== "true") continue;
      const isValidPin = secretPin ? await user.isSecretPinCorrect(secretPin) : false;
      if (isValidPin) filtered.push(chat);
    }

    return res.status(200).json({ chats: filtered });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to fetch chats." });
  }
};