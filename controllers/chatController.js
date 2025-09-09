import { chatWithAI } from "../config/openai.js";

export const handleChat = async (req, res) => {
    try {
        const { message, messages = [] } = req.body;

        // Input validation
        if (!message?.trim() && (!Array.isArray(messages) || messages.length === 0)) {
            return res.status(400).json({ error: "Message or previous messages are required" });
        }

        // Build messages for AI
        const chatMessages = [
            { role: "system", content: "You are SkillMentorX assistant." },
            ...messages.map((m) => ({
                role: m.role || "user",
                content: m.content || "",
            })),
            { role: "user", content: message.trim() },
        ];

        // Call OpenAI
        const aiReply = await chatWithAI(chatMessages);

        // Ensure reply is a string
        const replyText =
            typeof aiReply === "string"
                ? aiReply
                : aiReply?.text || "No response from AI";

        // Return structured response
        return res.status(200).json({ reply: replyText });
    } catch (err) {
        // Log error in detail for debugging
        console.error("Chat API Error:", err);

        // Send user-friendly error response
        return res.status(500).json({
            error: "AI service failed. Please try again later.",
        });
    }
};
