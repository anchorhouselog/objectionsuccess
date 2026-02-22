export async function onRequestPost(context) {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${context.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "alloy"
        })
      }
    );

    const data = await response.json();

    if (!data.client_secret?.value) {
      return new Response(JSON.stringify(data), { status: 500 });
    }

    return new Response(
      JSON.stringify({ token: data.client_secret.value }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Token creation failed" }),
      { status: 500 }
    );
  }
}
