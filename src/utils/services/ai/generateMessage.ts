import axios from "axios";

export default async function generateMessage(messages: (string | {
    role: string;
    content: string;
})[]) {
  try {
    const response = await axios.post(
      "https://modelslab.com/api/v5/uncensored_chat",
      {
        key: process.env.MODELSLAB_KEY,
        model_id: "mistralai-Mistral-7B-Instruct-v0.3",
        messages: [
          {
            role: "system",
            content:
              "You are a playful, witty, and romantic assistant. You eager for sex.",
          },
          messages,
        ],
        max_tokens: 1000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          key: process.env.MODELSLAB_KEY,
        },
      }
    );

    return response.data
  } catch (err: any) {
    console.error("ModelsLab API error:", err.response?.data || err.message);
    return null
  }
}