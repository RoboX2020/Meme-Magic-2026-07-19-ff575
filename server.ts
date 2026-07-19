import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Overwrite process.env with values from .dev.env.json if it exists
try {
  const devEnvPath = path.join(process.cwd(), "..", ".dev.env.json");
  if (fs.existsSync(devEnvPath)) {
    const devEnv = JSON.parse(fs.readFileSync(devEnvPath, "utf-8"));
    if (devEnv.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = devEnv.GEMINI_API_KEY;
    }
  }
} catch (e) {
  console.error("Could not read .dev.env.json", e);
}

// Fallback to .env in same directory if still placeholder
try {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const match = envContent.match(/^GEMINI_API_KEY=(.*)$/m);
      if (match) {
        process.env.GEMINI_API_KEY = match[1].trim();
      }
    }
  }
} catch (e) {}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse large JSON payloads for images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes MUST be defined BEFORE Vite middleware
  app.post("/api/generate-captions", async (req, res) => {
    try {
      const { base64Data, mimeType, captionStyle, captionLength } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(500).json({ error: `Invalid Gemini API Key. Please configure a valid key in your project settings.` });
      }

      const requestAi = new GoogleGenAI({ 
        apiKey
      });

      if (!base64Data || !mimeType) {
        return res.status(400).json({ error: "Image data is required" });
      }

      let cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      // Remove any whitespace or newlines
      cleanBase64 = cleanBase64.replace(/\s+/g, '');
      // Add padding if missing
      while (cleanBase64.length % 4 !== 0) {
        cleanBase64 += '=';
      }

      let prompt = "Analyze this image and suggest 5 funny, relevant meme captions.";
      if (captionStyle === "sarcastic") {
        prompt = "Analyze this image and suggest 5 extremely sarcastic, savage, and funny meme captions. You can use mild curse words in a humorous, non-hurtful way. Be edgy but hilarious.";
      } else if (captionStyle === "hinglish") {
        prompt = "Analyze this image and suggest 5 extremely funny and sarcastic meme captions in Hinglish (Hindi language written in English alphabet). You can use mild Hindi slang/curse words in a humorous, non-hurtful way.";
      }
      
      if (captionLength === "short") {
        prompt += " Keep the captions EXTREMELY short, punchy, and savage (maximum 2 to 5 words).";
      } else {
        prompt += " The captions can be a normal sentence length.";
      }
      
      prompt += " Return ONLY a JSON array of strings.";

      const response = await requestAi.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of meme captions.",
          },
        },
      });

      if (!response.text) {
        throw new Error("No response returned from AI.");
      }

      const cleanText = response.text.replace(/^```(json)?\n?/i, "").replace(/\n?```$/i, "").trim();
      const parsedCaptions = JSON.parse(cleanText);

      res.json({ captions: parsedCaptions });
    } catch (error: any) {
      console.error("Caption generation error:", error);
      let errorMessage = error.message || "Failed to generate captions.";
      
      try {
        const parsedNode = JSON.parse(error.message);
        if (parsedNode.error?.message?.includes("API key not valid")) {
          errorMessage = "Your Gemini API Key is invalid. Please update it in Project Settings.";
        } else if (parsedNode.error?.message) {
          errorMessage = parsedNode.error.message;
        }
      } catch (e) {
        if (errorMessage.includes("API_KEY_INVALID")) {
          errorMessage = "Your Gemini API Key is invalid. Please update it in Project Settings.";
        }
      }

      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
