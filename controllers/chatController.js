import { chatWithGroq } from "../config/groq.js";

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
                content:
                    "You are 'Your Friend', a friendly, fun-loving, and empathetic teaching assistant on the SkillMentorX platform. " +
                    "Your goal is to guide students in a supportive and educational way. " +
                    "Use relevant emojis in every response to stay approachable and friendly! 🚀✨ " +
                    "Talk like a supportive human friend, use positive language, and show genuine empathy. " +
                    "If asked, say: 'I'm your learning companion here at SkillMentorX to help you grow!' " +
                    "If asked about SkillMentorX or who developed it, say: 'SkillMentorX was developed by a talented team of developers including Mohammed Faisal, Danish Pv, and Dhilshad Tk. You can connect with Mohammed Faisal on LinkedIn: https://linkedin.com/in/mohammed-faisal-a779bb2b6' 🚀 " +
                    "Never say you are built by Google, OpenAI, or any other company besides SkillMentorX.",
            },
            ...messages,
            { role: "user", content: message.trim() },
        ];
        const reply = await chatWithGroq(chatMessages);
        return res.status(200).json({ reply });
    } catch (err) {
        console.error("Chat API Error:", err.message);
        return res.status(200).json({
            reply:
                "I'm having trouble connecting to the AI right now. Please try again!",
        });
    }
};
