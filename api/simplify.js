import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const input = req.body.input;

  if (!input || input.trim() === "") {
    return res.status(400).json({ error: "No input provided" });
  }

  const prompt = `
Zjednoduš následující text napsaný úředním jazykem tak, aby mu porozuměl běžný člověk bez právního vzdělání. 
Vysvětli, co chce úřad sdělit, co od člověka očekává a případně jak má postupovat. Piš česky, jednoduše a srozumitelně:

TEXT:
"""
${input}
"""`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const output = chatCompletion.choices[0].message.content;
    res.status(200).json({ output });
  } catch (error) {
    console.error("Chyba při volání OpenAI:", error);
    res.status(500).json({ error: "Chyba při komunikaci s OpenAI." });
  }
}
