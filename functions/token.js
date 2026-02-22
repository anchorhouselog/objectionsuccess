export async function onRequestPost(context) {
  const { request, env } = context;

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

    const data = await response.json();

    const ephemeral = data?.client_secret?.value;

    if (!ephemeral) {
      return new Response(
        JSON.stringify({ error: data }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ token: ephemeral }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
