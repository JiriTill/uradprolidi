export default async function handler(req, res) {
  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Chybí vstupní text." });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Jsi pomocník, který překládá úřednickou řeč do jednoduché češtiny.",
          },
          {
            role: "user",
            content: `Přelož do lidské řeči:\n\n${input}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await openaiRes.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error("Chybná odpověď od OpenAI.");
    }

    res.status(200).json({ output: data.choices[0].message.content.trim() });
  } catch (err) {
    res.status(500).json({ error: "Chyba serveru: " + err.message });
  }
}
