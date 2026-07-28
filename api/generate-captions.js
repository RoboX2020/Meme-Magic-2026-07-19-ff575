import OpenAI from "openai";

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { base64Data, mimeType, captionStyle, captionLength, supportivePrompt, advertisementDetails } = req.body;

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

    // --- Build system message (sets the vibe/role) ---
    let systemPrompt = "You are a meme caption generator. You analyze images and write meme captions.";
    if (captionStyle === "sarcastic") {
      systemPrompt = "You are a savage, sarcastic meme caption generator. You write extremely sarcastic, edgy, and hilarious meme captions. You can use mild curse words in a humorous, non-hurtful way.";
    } else if (captionStyle === "hinglish") {
      systemPrompt = "You are a Hinglish meme caption generator. You write extremely funny and sarcastic meme captions in Hinglish (Hindi language written in English alphabet). You can use mild Hindi slang/curse words in a humorous, non-hurtful way.";
    } else if (captionStyle === "quotes") {
      systemPrompt = "You are a motivational quotes writer. You write deep, poetic, philosophical, or empowering quotes that fit the mood of images — like something you'd see on an Instagram story. Make them original.";
    } else if (captionStyle === "advertisement") {
      // Build one unified advertisement prompt with structured brand details baked in
      const brandParts = [];
      if (advertisementDetails?.brandName) brandParts.push(`Brand/Product: "${advertisementDetails.brandName}"`);
      if (advertisementDetails?.offer) brandParts.push(`Offer: "${advertisementDetails.offer}"`);
      if (advertisementDetails?.speciality) brandParts.push(`Key Feature: "${advertisementDetails.speciality}"`);

      if (brandParts.length > 0) {
        systemPrompt = `You are a creative advertising copywriter who makes viral meme-style ads.

THE ADVERTISEMENT IS FOR:
${brandParts.join("\n")}

ABSOLUTE RULES:
1. Every single caption MUST explicitly mention "${advertisementDetails?.brandName || advertisementDetails?.offer || advertisementDetails?.speciality}" by name.
2. Every caption must reference the offer or speciality if provided.
3. Blend humor with a compelling call-to-action.
4. Make captions witty, viral, and attention-grabbing.
5. Do NOT write generic captions. Every caption must be a specific ad for this brand.`;
      } else {
        systemPrompt = "You are a creative advertising copywriter who makes viral meme-style ads. You blend humor with compelling calls to action. Your captions are witty, memorable, and make people stop scrolling.";
      }
    }

    // Supportive prompt for non-advertisement vibes
    if (supportivePrompt && captionStyle !== "advertisement") {
      systemPrompt += `\n\nCRITICAL DIRECTIVE: The user wants the captions to be about "${supportivePrompt}". You MUST make ALL 5 captions directly related to "${supportivePrompt}". This is NOT optional.`;
    }

    // --- Build user message (the task + length) ---
    let taskPrompt = "Analyze this image and suggest 5 meme captions.";
    if (captionLength === "short") {
      taskPrompt += " Keep them EXTREMELY short and punchy (2 to 5 words max).";
    } else {
      taskPrompt += " Normal sentence length is fine.";
    }
    taskPrompt += " Respond with a JSON object containing a 'captions' array of exactly 5 strings.";

    // --- Build messages array with system + user separation ---
    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: taskPrompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${cleanBase64}`,
            },
          },
        ],
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages,
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
