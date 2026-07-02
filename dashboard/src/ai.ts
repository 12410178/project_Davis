export async function askGemini(question: string) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: question,
                },
              ],
            },
          ],
        }),
      }
    );
  
    const data = await response.json();
  
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Tidak ada jawaban."
    );
  }