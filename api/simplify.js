// api/simplify.js

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { input } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Přelož následující text z úřední řeči do srozumitelného jazyka pro běžného občana.",
        },
        {
          role: "user",
          content: input,
        },
      ],
      temperature: 0.7,
    });

    const output = completion.choices?.[0]?.message?.content;
    res.status(200).json({ output });
  } catch (error) {
    console.error("Chyba při volání OpenAI:", error);
    res.status(500).json({ error: "Neplatná odpověď od OpenAI." });
  }
}
