// config/openai.js
import fetch from "node-fetch";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in .env file");
}

export async function chatWithAI(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("No messages provided to chatWithAI");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // You can change to gpt-4o or gpt-5-mini if available
        messages,
        temperature: 0.2,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API returned error:", errorText);
      throw new Error("OpenAI API Error. Check server logs.");
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    return reply || "No reply from AI";
  } catch (error) {
    console.error("chatWithAI error:", error);
    throw new Error("Failed to fetch AI response");
  }
}
