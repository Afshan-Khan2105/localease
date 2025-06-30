// File: pages/api/ai-description.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Data = { description?: string; error?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt } = req.body as { prompt?: string };
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing prompt" });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  console.log("→ GEMINI_API_KEY loaded?", Boolean(API_KEY));
  if (!API_KEY) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  try {
    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt.trim() }]
        }
      ],
      generationConfig: { maxOutputTokens: 200 }
    };

    const apiRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY
      },
      body: JSON.stringify(body)
    });

    const text = await apiRes.text();
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      // If Gemini returned HTML (e.g. an IAM/billing error), forward a snippet
      return res.status(502).json({ error: `Non-JSON from Gemini: ${text.slice(0,200)}` });
    }

    if (!apiRes.ok) {
      const msg = json.error?.message || JSON.stringify(json);
      return res.status(apiRes.status).json({ error: msg });
    }

    // ---- NEW: content is an object with `parts` ----
    let description = "";
    const candidate = json.candidates?.[0];
    if (candidate) {
      const content = candidate.content;
      if (typeof content === "string") {
        // just in case
        description = content.trim();
      } else if (content?.parts && Array.isArray(content.parts)) {
        // join all text parts
        
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description = content.parts.map((p: any) => p.text || "").join("").trim();
      }
    }

    return res.status(200).json({ description });
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("✘ Unexpected handler error:", err);
    return res.status(500).json({ error: err.message });
  }
}
