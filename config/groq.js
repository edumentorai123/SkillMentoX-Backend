import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export async function chatWithGroq(messages = []) {
    try {
        const chatCompletion = await client.chat.completions.create({
            messages: messages,
            model: MODEL,
            temperature: 0.7,
            max_tokens: 1024,
        });

        return chatCompletion.choices[0]?.message?.content || "Sorry, I couldn’t generate a response.";
    } catch (error) {
        console.error("Groq API Error:", error);
        throw new Error(error.message || "Groq API error");
    }
}
