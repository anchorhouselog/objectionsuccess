export async function onRequestPost(context) {
  const { env } = context;

  console.log("Key exists:", !!env.OPENAI_API_KEY);

  const response = await fetch(
    "https://api.openai.com/v1/realtime/sessions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "alloy"
      }),
    }
  );

  const text = await response.text();
  console.log("OpenAI response:", text);

  return new Response(text, {
    headers: { "Content-Type": "application/json" },
  });
}
