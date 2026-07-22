import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";

// Overwrite process.env with values from .dev.env.json if it exists
try {
  const devEnvPath = path.join(process.cwd(), "..", ".dev.env.json");
  if (fs.existsSync(devEnvPath)) {
    const devEnv = JSON.parse(fs.readFileSync(devEnvPath, "utf-8"));
    if (devEnv.OPENAI_API_KEY) {
      process.env.OPENAI_API_KEY = devEnv.OPENAI_API_KEY;
    }
  }
} catch (e) {
  console.error("Could not read .dev.env.json", e);
}

// Fallback to .env in same directory if still placeholder
try {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "MY_OPENAI_API_KEY") {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const match = envContent.match(/^OPENAI_API_KEY=(.*)$/m);
      if (match) {
        process.env.OPENAI_API_KEY = match[1].trim();
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
      const { base64Data, mimeType, captionStyle, captionLength, supportivePrompt } = req.body;

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey === "MY_OPENAI_API_KEY") {
        return res.status(500).json({ error: `Invalid OpenAI API Key. Please configure a valid key.` });
      }

      const openai = new OpenAI({ apiKey });

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
      } else if (captionStyle === "quotes") {
        prompt = "Analyze this image and suggest 5 deep, motivational, or inspirational quotes that fit the mood and vibe of this image. They should feel poetic, philosophical, or empowering — like something you'd see on an Instagram story or motivational post. Make them original.";
      } else if (captionStyle === "advertisement") {
        prompt = "You are a creative advertising copywriter. Analyze this image and create 5 catchy, attention-grabbing advertisement captions that would work as meme-style ads. The captions should be witty, memorable, and make people stop scrolling. Think viral marketing — blend humor with a compelling call to action.";
        if (supportivePrompt) {
          prompt += `\n\n**MANDATORY REQUIREMENT — YOU MUST FOLLOW THIS:**\nThe brand/product/offer details are: "${supportivePrompt}"\nYou MUST incorporate these exact details into EVERY single caption. Mention the brand name explicitly, reference the offer/product directly, and tie it naturally to the image. Do NOT generate generic captions — every caption MUST be about this specific brand/offer.`;
        }
      }

      // Append supportive prompt for non-advertisement styles
      if (supportivePrompt && captionStyle !== "advertisement") {
        prompt += `\n\n**MANDATORY REQUIREMENT — YOU MUST FOLLOW THIS:**\nThe user specifically wants the captions to be about: "${supportivePrompt}"\nYou MUST make ALL 5 captions directly related to this topic/direction. This is NOT optional. Every caption must clearly reference or revolve around "${supportivePrompt}" while staying relevant to the image. Do NOT ignore this direction.`;
      }
      
      if (captionLength === "short") {
        prompt += " Keep the captions EXTREMELY short, punchy, and savage (maximum 2 to 5 words).";
      } else {
        prompt += " The captions can be a normal sentence length.";
      }
      
      prompt += " Please respond with a JSON object containing a 'captions' array of strings.";

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${cleanBase64}`,
                },
              },
            ],
          },
        ],
      });

      const responseText = response.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error("No response returned from AI.");
      }

      const parsedData = JSON.parse(responseText);
      const parsedCaptions = parsedData.captions || [];

      res.json({ captions: parsedCaptions });
    } catch (error: any) {
      console.error("Caption generation error:", error);
      let errorMessage = error.message || "Failed to generate captions.";
      
      try {
        const parsedNode = JSON.parse(error.message);
        if (parsedNode.error?.message?.includes("Incorrect API key")) {
          errorMessage = "Your OpenAI API Key is invalid.";
        } else if (parsedNode.error?.message) {
          errorMessage = parsedNode.error.message;
        }
      } catch (e) {
        if (errorMessage.includes("Incorrect API key")) {
          errorMessage = "Your OpenAI API Key is invalid.";
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
