import { GoogleGenAI } from "@google/genai";

console.log("API:", import.meta.env.VITE_GEMINI_API_KEY);

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export async function askGemini(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log("Response Gemini:", response);

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}