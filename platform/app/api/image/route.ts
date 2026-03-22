import { NextRequest, NextResponse } from "next/server";

const REPLICATE_API = "https://api.replicate.com/v1";

interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string | string[];
  error?: string;
  urls?: { get: string };
}

export async function POST(req: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      {
        error:
          "REPLICATE_API_TOKEN não configurada. Adicione no .env.local para habilitar geração de imagens.",
      },
      { status: 501 }
    );
  }

  let body: { prompt: string; negativePrompt?: string; aspectRatio?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { prompt, negativePrompt = "", aspectRatio = "1:1" } = body;

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const headers = {
    Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
    "Content-Type": "application/json",
    Prefer: "wait=30",
  };

  try {
    // Start prediction with Flux 1.1 Pro
    const startRes = await fetch(
      `${REPLICATE_API}/models/black-forest-labs/flux-1.1-pro/predictions`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          input: {
            prompt,
            negative_prompt: negativePrompt,
            aspect_ratio: aspectRatio,
            output_format: "png",
            output_quality: 90,
            safety_tolerance: 2,
          },
        }),
      }
    );

    if (!startRes.ok) {
      const errText = await startRes.text();
      return NextResponse.json(
        { error: `Replicate API error: ${startRes.status} — ${errText}` },
        { status: startRes.status }
      );
    }

    let prediction: ReplicatePrediction = await startRes.json();

    // Poll until done (max 60s = 30 attempts × 2s)
    let attempts = 0;
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed" &&
      prediction.status !== "canceled" &&
      attempts < 30
    ) {
      await new Promise((r) => setTimeout(r, 2000));

      const pollRes = await fetch(
        `${REPLICATE_API}/predictions/${prediction.id}`,
        { headers }
      );

      if (!pollRes.ok) break;
      prediction = await pollRes.json();
      attempts++;
    }

    if (prediction.status === "succeeded") {
      const output = prediction.output;
      const imageUrl = Array.isArray(output) ? output[0] : output;
      return NextResponse.json({ imageUrl });
    }

    return NextResponse.json(
      {
        error:
          prediction.error ||
          "Image generation failed or timed out. Try again.",
      },
      { status: 500 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Replicate error:", message);
    return NextResponse.json(
      { error: `Erro na geração de imagem: ${message}` },
      { status: 500 }
    );
  }
}
