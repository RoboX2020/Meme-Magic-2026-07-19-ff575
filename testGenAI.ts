import { GoogleGenAI, Type } from "@google/genai";
async function test() {
  const requestAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
      const response = await requestAi.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: "Say hi"
      });
      console.log(response.text);
  } catch (e) {
      console.error(e);
  }
}
test();
