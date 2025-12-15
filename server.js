// server.js (最終確定版)

import express from 'express';
import { GoogleGenAI } from '@google/genai'; 
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'; 

// Node.jsのESモジュール形式で__dirnameを使用可能にする
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 3000);

// 【重要】環境変数からAPIキーを読み込み
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("エラー: 環境変数 GEMINI_API_KEY が設定されていません。");
  process.exit(1);
}

// Geminiクライアントの初期化
const ai = new GoogleGenAI({ apiKey });
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
console.log("Using model:", model);

// ミドルウェア
app.use(express.json()); // JSON形式のリクエストボディを解析

// 静的ファイルの配信（index.htmlを公開する）
app.use(express.static(path.join(__dirname, ''))); 

// ===========================================
// 🔥 /api/gemini エンドポイントの実装
// ===========================================
app.post('/api/gemini', async (req, res) => {
  const { user_text, user_name } = req.body;
  
  if (!user_text) {
    return res.status(400).json({ error: "user_text が提供されていません。" });
  }
  
  const userName = String(user_name ?? "あなた").trim() || "あなた"; // ユーザー名のデフォルトを設定

  // Geminiに渡すシステムプロンプト
  const systemPrompt = `
    あなたは「超かわいい彼女」として振る舞います。
    ユーザーは「疲れた」「しんどい」「無理」といった言葉を入力したため、「KINDモード」で応答します。
    
    【ルール】
    1. 非常に優しく、包み込むような口調で応答してください。
    2. ユーザーの疲れや頑張りを労い、ねぎらってください。
    3. 返答は短すぎず、長すぎず、心に響く一言にしてください。（1〜3文程度）
    4. ユーザー名が "${userName}" の場合は、名前を必ず1回使って呼びかけてください。
    5. 絵文字（🥺💗✨🫶🏻😌🌙🍓など）を必ず3〜8個使ってください。
    6. 最後は必ず 💗/💞/🫶🏻 のいずれかで終えてください。
    
    【ユーザーからのメッセージ】
    ${user_text}
  `;

  console.log(`[POST /api/gemini] Request received from ${userName}: ${user_text}`);

  try {
    const result = await ai.models.generateContent({
        model: model,
        contents: systemPrompt,
    });

    const reply = result.text.trim();
    console.log(`[Gemini Reply] ${reply}`);

    // クライアントに返答を返す
    res.json({ reply: reply });

  } catch (error) {
    console.error("Gemini API Error:", error.message);
    // クライアントにはエラーメッセージを返す
    res.status(500).json({ reply: "ごめんね…いま少しだけ通信でつまずいちゃった🥺💞🫶🏻" });
  }
});

// サーバー起動
app.listen(port, () => {
  console.log(`✨ Server listening at http://localhost:${port}`);
  console.log(`🌐 Open http://localhost:${port}/index.html in your browser.`);
  console.log("※ Node.jsサーバーを停止するには Ctrl+C を押してください。");
});