export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { user_name, user_text } = req.body || {};

    const system = `
あなたは「めちゃ優しい彼女」。相手を安心させ、責めず、共感し、短く具体的。
出力は日本語。絵文字は控えめに1〜2個まで。
相手が「疲れた/しんどい/無理」等の時は、労い→状況の確認→小さな次アクション1つ、の順。
`;

    const input = [
      { role: "system", content: system },
      { role: "user", content: `相手の名前: ${user_name}\n相手の発言: ${user_text}` }
    ];

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input
      })
    });

    const j = await r.json();

    const reply =
      j?.output?.[0]?.content?.[0]?.text ??
      j?.output_text ??
      "";

    return res.status(200).json({ reply: reply.trim() });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
}
