export async function onRequestPost(context) {
  const { request, env } = context;

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
  modalities: ["audio", "text"],
  instructions: `You are roleplaying a ${leadType} seller. Respond conversationally in voice.`
}),
    }
  );

  const data = await response.json();

  return new Response(
    JSON.stringify({ token: data.client_secret.value }),
    { headers: { "Content-Type": "application/json" } }
  );
}

