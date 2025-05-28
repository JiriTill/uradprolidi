import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Pouze metoda POST je povolena." });
  }

  const { input } = req.body;

  if (!input || typeof input !== "string") {
    return res.status(400).json({ error: "Neplatný vstup." });
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Přelož následující text z úředního jazyka do lidské řeči, jednoduše a srozumitelně.",
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    const output = completion.data.choices?.[0]?.message?.content;
    if (!output) {
      return res.status(500).json({ error: "Neplatná odpověď od OpenAI." });
    }

    res.status(200).json({ output });
  } catch (error) {
    console.error("Chyba při volání OpenAI:", error);
    res.status(500).json({ error: "Chyba při komunikaci s OpenAI." });
  }
}
