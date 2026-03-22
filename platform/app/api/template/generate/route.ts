import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `Você é um designer de redes sociais para a Flex Fitness Center, academia brasileira.
Identidade visual: navy escuro (#020036), vermelho elétrico (#E30613), azul elétrico (#1F2BFF), branco.
Todo post tem o logo X da marca e faixas diagonais "FLEX" na parte inferior.

LAYOUTS DISPONÍVEIS — escolha o mais adequado para o pedido:

"feed-card-left"
  Formato 16:9. Foto ocupa lado direito (55%), card escuro arredondado no lado esquerdo.
  Logo X ACIMA do card (não dentro), badge acima do card. Grande X d'água transparente no fundo.
  Usar para: novos horários, novos professores, anúncios de aulas, mudanças de grade.

"story-split"
  Formato 9:16. Foto ocupa ~42% do topo, faixa FLEX diagonal divide ao meio, card escuro embaixo.
  Handle @flexfitnesscenter no canto superior direito da foto. Logo X no canto superior esquerdo.
  Pode ter múltiplas pílulas de localização (ex: três unidades).
  Usar para: eventos para múltiplas unidades, programas especiais, campanhas de inscrição.

"story-full-bleed"
  Formato 9:16. Foto preenche frame inteiro, overlay com gradiente escuro nas bordas/fundo.
  Faixa de cor de acento (vermelho ou azul) na borda esquerda. Texto sobre foto na metade inferior.
  Usar para: posts dramáticos, features de atletas, campanhas motivacionais, sazonais.

"story-photo-card"
  Formato 9:16. Foto ocupa topo (55%), card arredondado dark navy na base.
  Logo X no canto superior esquerdo da foto. Handle no canto superior direito.
  Usar para: anúncios de aulas individuais, promoção de professor específico.

"feed-bold-text"
  Formato 16:9. SEM foto. Fundo navy com elementos geométricos (círculos, X marks sutis).
  Faixa de cor no topo (acento). Logo X à esquerda. Título gigante ocupa a maior parte do frame.
  Usar para: promoções, descontos, resultados, frases motivacionais, comunicados de preço.

"schedule-grid"
  Formato 16:9. Grade de horários: professor / horário / modalidade em linha.
  Usar SOMENTE se o usuário fornecer dados de escala com vários horários.

Retorne APENAS um objeto JSON (sem markdown, sem explicação):
{
  "layout": "feed-card-left" | "story-split" | "story-full-bleed" | "story-photo-card" | "feed-bold-text" | "schedule-grid",
  "badge": string | null,
  "title": string,
  "titleSize": "hero" | "medium" | "small",
  "subtitle": string | null,
  "date": string | null,
  "days": string | null,
  "time": string | null,
  "professor": string | null,
  "locations": string[],
  "ctaText": string | null,
  "photoHint": string | null,
  "accentColor": "red" | "blue",
  "schedule": null | {
    "date": string,
    "unidade": string,
    "rows": [{ "professor": string, "time": string, "modalidade": string }]
  }
}

Regras:
- title: SEMPRE em CAPS. Máximo 3 palavras. Direto e forte.
  - hero (1 palavra): "BOXE", "RESULTADO", "AGORA"
  - medium (2 palavras): "AULA BOXE", "50% OFF", "NOVA TURMA"
  - small (3+ palavras): "NOVO HORÁRIO GLÚTEOS"
- badge: rótulo curto como "NOVA AULA", "PROMOÇÃO", "NOVO HORÁRIO", "CHEGOU!!" ou null
- locations: array de strings. Ex: ["UNIDADE BUENA VISTA"] ou ["FLEX MARISTA", "FLEX ALPHAVILLE", "FLEX BUENA VISTA"]
- ctaText: "PARTICIPE", "GARANTA JÁ", "INSCREVA-SE", "SAIBA MAIS" etc
- accentColor: "red" para energia/ação, "blue" para informativo/novo`;

export interface LayoutSpec {
  layout:
    | "feed-card-left"
    | "story-split"
    | "story-full-bleed"
    | "story-photo-card"
    | "feed-bold-text"
    | "schedule-grid";
  badge: string | null;
  title: string;
  titleSize: "hero" | "medium" | "small";
  subtitle: string | null;
  date: string | null;
  days: string | null;
  time: string | null;
  professor: string | null;
  locations: string[];
  ctaText: string | null;
  photoHint: string | null;
  accentColor: "red" | "blue";
  schedule: {
    date: string;
    unidade: string;
    rows: { professor: string; time: string; modalidade: string }[];
  } | null;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "prompt obrigatório" }, { status: 400 });
    }
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Modelo não retornou JSON válido");
    const spec: LayoutSpec = JSON.parse(match[0]);
    if (!spec.locations) spec.locations = [];
    return NextResponse.json(spec);
  } catch (err) {
    console.error("[template/generate]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
