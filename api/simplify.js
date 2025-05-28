import { OpenAI } from "openai";

const openai = new OpenAI();

export async function POST(request) {
  const { content } = await request.json();

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: "Vstupní text je prázdný nebo neplatný." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const prompt = `Zjednoduš a srozumitelně shrň následující oficiální dokument. Výstup rozděl do těchto přehledných částí:

1. Odesílatel: Kdo dopis poslal (instituce a jméno, pokud je uvedeno).
2. Vyřizuje: Kdo záležitost konkrétně řeší – úředník, který je uveden jako kontaktní osoba pro řešení věci. Pozor, ne vždy je totožný s podepsanou osobou. V případě rozdílu napiš obě jména, ale zvýrazni, že „vyřizuje“ znamená, na koho se má adresát obracet.
3. Číslo jednací (č.j.): Uveď, pokud je obsaženo. Připiš poznámku: „Tímto číslem lze dopis identifikovat.“
4. Spisová značka (sp. zn.): Uveď, pokud je v dopise.
5. Adresát: Komu je dopis určen (jméno nebo název instituce).

6. Shrnutí obsahu dopisu jednoduchou češtinou:
   - O co se jedná?
   - Co se po mně chce?
   - Do kdy to mám udělat? (Pokud je uvedeno.)
   - Jak to mám udělat?

Vysvětli výstižně, krátce, bez úřednických frází. Napiš to tak, aby tomu rozuměl běžný člověk.

Poznámka ke zkratkám:
- Č.j. = číslo jednací (slouží k identifikaci dokumentu)
- Sp. zn. = spisová značka (slouží k určení spisu)
- „Vyřizuje“ označuje osobu, na kterou se má adresát obracet.

Nyní následuje obsah dopisu:

"""
${content}
"""`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview", // Případně změnit na gpt-3.5-turbo-0125
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const result = response.choices?.[0]?.message?.content;

    if (!result) {
      throw new Error("Model nevrátil žádnou odpověď.");
    }

    return new Response(JSON.stringify({ result }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("OpenAI error:", error);

    // Fallback při chybě: použij jednoduchý prompt
    try {
      const fallbackResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: [
          {
            role: "user",
            content: fallbackPrompt,
          },
        ],
        temperature: 0.7,
      });

      const fallbackResult = fallbackResponse.choices?.[0]?.message?.content || "Nepodařilo se zpracovat.";

      return new Response(JSON.stringify({ result: fallbackResult }), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError);
      return new Response(
        JSON.stringify({ error: "Chyba při zpracování odpovědi OpenAI." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
}

