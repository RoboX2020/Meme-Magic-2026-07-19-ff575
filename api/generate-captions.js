import OpenAI from "openai";

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { base64Data, mimeType, captionStyle, captionLength } = req.body;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OpenAI API Key is not configured." });
    }

    const openai = new OpenAI({ apiKey });

    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: "Image data is required" });
    }

    let cleanBase64 = base64Data.includes(",")
      ? base64Data.split(",")[1]
      : base64Data;
    cleanBase64 = cleanBase64.replace(/\s+/g, "");
    while (cleanBase64.length % 4 !== 0) {
      cleanBase64 += "=";
    }

    let prompt =
      "Analyze this image and suggest 5 funny, relevant meme captions.";
    if (captionStyle === "sarcastic") {
      prompt =
        "Analyze this image and suggest 5 extremely sarcastic, savage, and funny meme captions. You can use mild curse words in a humorous, non-hurtful way. Be edgy but hilarious.";
    } else if (captionStyle === "hinglish") {
      prompt =
        "Analyze this image and suggest 5 extremely funny and sarcastic meme captions in Hinglish (Hindi language written in English alphabet). You can use mild Hindi slang/curse words in a humorous, non-hurtful way.";
    }

    if (captionLength === "short") {
      prompt +=
        " Keep the captions EXTREMELY short, punchy, and savage (maximum 2 to 5 words).";
    } else {
      prompt += " The captions can be a normal sentence length.";
    }

    prompt +=
      " Please respond with a JSON object containing a 'captions' array of strings.";

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
  } catch (error) {
    console.error("Caption generation error:", error);
    let errorMessage = error.message || "Failed to generate captions.";

    if (errorMessage.includes("Incorrect API key")) {
      errorMessage = "Your OpenAI API Key is invalid.";
    }

    res.status(500).json({ error: errorMessage });
  }
}
