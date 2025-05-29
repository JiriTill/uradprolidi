// api/translate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ result: 'Pouze metoda POST je podporována.' });
  }

  const { type, content } = req.body;

  if (!type || !content) {
    return res.status(400).json({ result: 'Chybí vstupní data.' });
  }

  try {
    let messages = [];

    if (type === 'image') {
      messages = [
        {
          role: 'system',
          content:
            'Jsi překladač dokumentů pro veřejnost. Uživateli přelož úřední dokument na obrázku (fotce) do jednoduché češtiny. Výstup rozděl strukturovaně do bodů podle toho, co je důležité. Nejde o OCR, ale rovnou o výklad a shrnutí obrázku s textem.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: content,
              },
            },
          ],
        },
      ];
    } else {
      messages = [
        {
          role: 'system',
          content:
            'Jsi překladač dokumentů pro veřejnost. Přelož úřední jazyk do jednoduché češtiny. Strukturovaně rozděl výstup na části: O co se jedná, Co se po mně chce, Do kdy to mám udělat, Jak to mám udělat. Používej srozumitelný jazyk pro běžné lidi.',
        },
        {
          role: 'user',
          content,
        },
      ];
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();

    if (data?.choices?.[0]?.message?.content) {
      res.status(200).json({ result: data.choices[0].message.content });
    } else {
      console.error('API odpověď neobsahuje výstup:', data);
      res.status(500).json({ result: '⚠️ Chyba ve zpracování odpovědi od OpenAI.' });
    }
  } catch (error) {
    console.error('Chyba při komunikaci s OpenAI:', error);
    res.status(500).json({ result: '⚠️ Došlo k chybě při komunikaci s OpenAI.' });
  }
}
