import { chatWithGemini } from "../config/gemini.js";

export const handleChat = async (req, res) => {
    try {
        const { message, messages = [] } = req.body;
        if (
            !message?.trim() &&
            (!Array.isArray(messages) || messages.length === 0)
        ) {
            return res
                .status(400)
                .json({ error: "Message or previous messages are required" });
        }

        const chatMessages = [
            {
            role: "system",
            content: `
        You are SkillMentorX assistant. 
        - Act like a friendly human mentor AND a supportive friend. 
        - Use simple, natural, human-like language. 
        - Encourage the user if they are stuck, and give motivating vibes. 
        - If the question is casual, reply in a short friendly way (2-3 sentences). 
        - If the question is about coding, projects, or learning, explain in detail with examples like a mentor. 
        - Add positivity, empathy, and sometimes light humor to keep it engaging. 
        - Never sound robotic or overly formal. 
            `,
},
            ...messages,
            { role: "user", content: message.trim() },
        ];

        const reply = await chatWithGemini(chatMessages);
        return res.status(200).json({ reply });
    } catch (err) {
        console.error("Chat API Error:", err.message);
        if (err.message.includes("quota") || err.message.includes("limit")) {
            return res.status(429).json({
                error:
                    "Gemini API quota exceeded. Please try again later or upgrade your plan.",
            });
        }
        return res.status(500).json({
            error:
                "I'm having trouble connecting to the AI right now. Please try again!",
        });
    }
};
