import { HfInference } from "@huggingface/inference";

// Free-tier friendly model
const MODEL_NAME = "google/flan-t5-small";

// Put your HF API keys in .env
const HF_API_KEYS = [
  process.env.HF_API_KEY1,
  process.env.HF_API_KEY2,
  process.env.HF_API_KEY3,
].filter(Boolean);

if (HF_API_KEYS.length === 0) {
  throw new Error("No HuggingFace API keys provided in .env");
}

let currentKeyIndex = 0;

// Helper to create HfInference instance
const createHF = (key) => new HfInference(key);
let hf = createHF(HF_API_KEYS[currentKeyIndex]);

/**
 * Chat function: converts messages to text input and calls HF model
 * Handles multiple keys, retries, and rate limit switching
 */
export async function chatWithHF(messages) {
  const maxRetries = HF_API_KEYS.length;
  let attempt = 0;

  // Convert messages array to single string for FLAN-T5
  const userInput =
    messages
      .map((msg) => `${msg.role === "user" ? "User: " : "Assistant: "}${msg.content}`)
      .join("\n") + "\nAssistant:";

  while (attempt < maxRetries) {
    try {
      const response = await hf.textGeneration({
        model: MODEL_NAME,
        inputs: userInput,
        max_new_tokens: 150,
        temperature: 0.7,
      });

      // Return the generated text
      return response?.generated_text?.trim() || "No reply from AI";
    } catch (err) {
      console.error(`HuggingFace Chat Error (key ${currentKeyIndex}):`, err.message);

      // Rotate to next key
      attempt++;
      currentKeyIndex = (currentKeyIndex + 1) % HF_API_KEYS.length;
      hf = createHF(HF_API_KEYS[currentKeyIndex]);

      // If last attempt, throw a clear error
      if (attempt === maxRetries) {
        return "All AI tokens exhausted or invalid. Please try again later.";
      }
    }
  }
}
