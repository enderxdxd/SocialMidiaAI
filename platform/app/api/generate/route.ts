import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/squad-context";
import type { Brand, ContentType, Platform } from "@/lib/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY não configurada. Adicione a chave no arquivo .env.local",
      },
      { status: 500 }
    );
  }

  let body: {
    brand: Brand;
    contentType: ContentType;
    platform: Platform;
    brief: string;
    references?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { brand, contentType, platform, brief, references } = body;

  if (!brand?.name || !brief) {
    return NextResponse.json(
      { error: "Nome da empresa e briefing são obrigatórios" },
      { status: 400 }
    );
  }

  const systemPrompt = buildSystemPrompt(brand, contentType, platform);

  const userMessage = references
    ? `Create content for: ${brief}\n\nVisual References / Style Direction:\n${references}`
    : `Create content for: ${brief}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("\n");

    return NextResponse.json({ result: text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Claude API error:", message);
    return NextResponse.json(
      { error: `Erro na API Claude: ${message}` },
      { status: 500 }
    );
  }
}
