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

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: errText }),
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data.client_secret || !data.client_secret.value) {
      return new Response(
        JSON.stringify({ error: "No client_secret returned", data }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        token: data.client_secret.value
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Token generation failed" }),
      { status: 500 }
    );
  }
}
