import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/token", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime",
          voice: "alloy"
        })
      }
    );

    const data = await response.json();

    res.json({
      token: data.client_secret.value
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Token generation failed" });
  }
});

app.listen(3000, () => console.log("Server running"));

