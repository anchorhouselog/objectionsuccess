export async function onRequestPost(context) {
  const { request, env } = context;

  console.log("API Key exists:", !!env.OPENAI_API_KEY);

  try {
    const { leadType } = await request.json();

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
          voice: "alloy",
          instructions: `You are roleplaying a ${leadType} seller.`,
        }),
      }
    );

    const text = await response.text();
    console.log("OpenAI response:", text);

    const data = JSON.parse(text);

    return new Response(
      JSON.stringify({ token: data.client_secret?.value }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.log("ERROR:", err);
    return new Response("Error creating token", { status: 500 });
  }
}