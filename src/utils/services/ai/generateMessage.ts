import axios from "axios";

export default async function generateMessage(messages: {
    role: string;
    content: string;
}[]) {
  try {
    console.log("generate answer:")
    const response = await axios.post(
      "https://modelslab.com/api/v5/uncensored_chat",
      {
        key: process.env.MODELSLAB_KEY,
        model_id: "mistralai-Mistral-7B-Instruct-v0.3",
        messages: messages,
        max_tokens: 1000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          key: process.env.MODELSLAB_KEY,
        },
      }
    );

    console.log("answer:", response.data)

    return response.data
  } catch (err: any) {
    console.error("ModelsLab API error:", err.response?.data || err.message);
    return null
  }
}