import { useState, useEffect, useRef } from "react";

const AGENTS = {
  "social-chief": { icon: "📱", name: "Social Chief", role: "Orchestrator", color: "#7F77DD" },
  "chris-do": { icon: "🎯", name: "Chris Do", role: "Visual Direction", color: "#1D9E75" },
  "prompt-engineer": { icon: "🤖", name: "Prompt Engineer", role: "AI Image Prompts", color: "#D85A30" },
  "post-designer": { icon: "🖼️", name: "Post Designer", role: "Layout & Composition", color: "#378ADD" },
  "caption-writer": { icon: "✍️", name: "Caption Writer", role: "Captions & CTAs", color: "#D4537E" },
  "gary-vee": { icon: "🔥", name: "Gary Vee", role: "Content Strategy", color: "#BA7517" },
  "carousel-architect": { icon: "📑", name: "Carousel Architect", role: "Multi-slide Design", color: "#639922" },
  "mike-winkelmann": { icon: "🎨", name: "Beeple", role: "Bold Visuals", color: "#E24B4A" },
  "rafaela-costa": { icon: "🇧🇷", name: "Rafaela Costa", role: "Brazilian Market", color: "#1D9E75" },
};

const PLATFORMS = {
  instagram_feed: { label: "Instagram Feed", size: "1080×1080", ratio: "1:1" },
  instagram_portrait: { label: "Instagram Portrait", size: "1080×1350", ratio: "4:5" },
  instagram_stories: { label: "Instagram Stories", size: "1080×1920", ratio: "9:16" },
  instagram_carousel: { label: "Instagram Carousel", size: "1080×1080", ratio: "1:1" },
  linkedin_post: { label: "LinkedIn Post", size: "1200×627", ratio: "1.91:1" },
  youtube_thumbnail: { label: "YouTube Thumbnail", size: "1280×720", ratio: "16:9" },
};

const CONTENT_TYPES = [
  { id: "single_post", label: "Post único", icon: "🖼️", desc: "Feed post com imagem + legenda" },
  { id: "carousel", label: "Carrossel", icon: "📑", desc: "Multi-slide educativo ou storytelling" },
  { id: "stories", label: "Stories", icon: "📱", desc: "Sequência de stories com CTAs" },
  { id: "reel_cover", label: "Capa de Reel", icon: "🎬", desc: "Thumbnail para Reels/TikTok" },
  { id: "thumbnail", label: "Thumbnail", icon: "▶️", desc: "Capa para YouTube" },
];

function AgentBadge({ agentId, active, small }) {
  const a = AGENTS[agentId];
  if (!a) return null;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: small ? 4 : 6,
      padding: small ? "2px 8px" : "4px 12px",
      borderRadius: 20, fontSize: small ? 11 : 12,
      background: active ? a.color + "18" : "var(--color-background-secondary)",
      border: `1px solid ${active ? a.color + "40" : "var(--color-border-tertiary)"}`,
      color: active ? a.color : "var(--color-text-secondary)",
      transition: "all 0.3s ease",
      ...(active && { boxShadow: `0 0 12px ${a.color}20` }),
    }}>
      <span style={{ fontSize: small ? 12 : 14 }}>{a.icon}</span>
      {!small && <span style={{ fontWeight: 500 }}>{a.name}</span>}
      {!small && <span style={{ opacity: 0.7 }}>· {a.role}</span>}
    </div>
  );
}

function PipelineStep({ step, index, isActive, isDone }) {
  const a = AGENTS[step.agent];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
      borderRadius: 8, transition: "all 0.4s ease",
      background: isDone ? a.color + "10" : isActive ? a.color + "18" : "transparent",
      borderLeft: `3px solid ${isDone ? a.color : isActive ? a.color : "var(--color-border-tertiary)"}`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%", display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: 14,
        background: isDone ? a.color + "20" : "var(--color-background-secondary)",
        color: isDone ? a.color : "var(--color-text-secondary)",
        fontWeight: 600, transition: "all 0.3s",
      }}>
        {isDone ? "✓" : index + 1}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
          {a?.icon} {a?.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{step.action}</div>
      </div>
      {isActive && (
        <div style={{
          width: 8, height: 8, borderRadius: "50%", background: a.color,
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
      )}
    </div>
  );
}

function BrandConfig({ brand, setBrand }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>
          Nome da empresa
        </label>
        <input
          value={brand.name}
          onChange={e => setBrand({ ...brand, name: e.target.value })}
          placeholder="Ex: Mobius, Flex-Kids..."
          style={{ width: "100%", boxSizing: "border-box" }}
        />
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>
          Segmento / nicho
        </label>
        <input
          value={brand.segment}
          onChange={e => setBrand({ ...brand, segment: e.target.value })}
          placeholder="Ex: Car tuning, playground infantil, SaaS..."
          style={{ width: "100%", boxSizing: "border-box" }}
        />
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>
          Cores da marca (hex separados por vírgula)
        </label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={brand.colors}
            onChange={e => setBrand({ ...brand, colors: e.target.value })}
            placeholder="#2563EB, #F97316, #1F2937"
            style={{ flex: 1 }}
          />
          <div style={{ display: "flex", gap: 4 }}>
            {brand.colors.split(",").map((c, i) => {
              const hex = c.trim();
              if (!/^#[0-9a-fA-F]{3,6}$/.test(hex)) return null;
              return <div key={i} style={{ width: 20, height: 20, borderRadius: 4, background: hex, border: "1px solid var(--color-border-tertiary)" }} />;
            })}
          </div>
        </div>
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>
          Tom de voz
        </label>
        <select
          value={brand.tone}
          onChange={e => setBrand({ ...brand, tone: e.target.value })}
          style={{ width: "100%", boxSizing: "border-box" }}
        >
          <option value="professional">Profissional e confiável</option>
          <option value="bold">Ousado e energético</option>
          <option value="playful">Divertido e acessível</option>
          <option value="premium">Premium e sofisticado</option>
          <option value="warm">Acolhedor e humano</option>
          <option value="tech">Tecnológico e inovador</option>
        </select>
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>
          Público-alvo
        </label>
        <input
          value={brand.audience}
          onChange={e => setBrand({ ...brand, audience: e.target.value })}
          placeholder="Ex: Jovens 18-35, entusiastas de carros..."
          style={{ width: "100%", boxSizing: "border-box" }}
        />
      </div>
    </div>
  );
}

function ResultPanel({ result }) {
  if (!result) return null;
  const sections = [];
  const text = result;
  
  const promptMatch = text.match(/(?:PROMPT|Image Prompt|AI Prompt)[:\s]*([^]*?)(?=(?:NEGATIVE|CAPTION|COMPOSITION|DIMENSIONS|---|\n##)|$)/i);
  const negativeMatch = text.match(/(?:NEGATIVE|Negative Prompt)[:\s]*([^]*?)(?=(?:CAPTION|COMPOSITION|DIMENSIONS|---|\n##)|$)/i);
  const captionMatch = text.match(/(?:CAPTION|Legenda|Caption)[:\s]*([^]*?)(?=(?:HASHTAGS|CTA|---|\n##)|$)/i);
  const hashtagMatch = text.match(/(?:HASHTAGS|Hashtags)[:\s]*([^]*?)(?=(?:---|\n##)|$)/i);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {promptMatch && (
        <div style={{
          padding: 16, borderRadius: "var(--border-radius-lg)",
          background: "var(--color-background-secondary)",
          border: "1px solid var(--color-border-tertiary)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: AGENTS["prompt-engineer"].color, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <span>🤖</span> AI image prompt
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-text-primary)", whiteSpace: "pre-wrap" }}>
            {promptMatch[1].trim()}
          </div>
        </div>
      )}
      
      {negativeMatch && (
        <div style={{
          padding: 12, borderRadius: 8,
          background: "var(--color-background-danger)",
          border: "1px solid var(--color-border-danger)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-danger)", marginBottom: 4 }}>
            Negative prompt
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-danger)", opacity: 0.8 }}>
            {negativeMatch[1].trim()}
          </div>
        </div>
      )}

      {captionMatch && (
        <div style={{
          padding: 16, borderRadius: "var(--border-radius-lg)",
          background: "var(--color-background-secondary)",
          border: "1px solid var(--color-border-tertiary)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: AGENTS["caption-writer"].color, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <span>✍️</span> Caption
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-text-primary)", whiteSpace: "pre-wrap" }}>
            {captionMatch[1].trim()}
          </div>
        </div>
      )}

      {hashtagMatch && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {hashtagMatch[1].trim().split(/[\s,]+/).filter(h => h.startsWith("#")).map((h, i) => (
            <span key={i} style={{
              fontSize: 12, padding: "2px 8px", borderRadius: 12,
              background: "var(--color-background-info)",
              color: "var(--color-text-info)",
            }}>{h}</span>
          ))}
        </div>
      )}

      {!promptMatch && !captionMatch && (
        <div style={{
          padding: 16, borderRadius: "var(--border-radius-lg)",
          background: "var(--color-background-secondary)",
          fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap",
          color: "var(--color-text-primary)",
        }}>
          {text}
        </div>
      )}
    </div>
  );
}

export default function XquadsStudio() {
  const [step, setStep] = useState("config"); // config | create | generating | result
  const [brand, setBrand] = useState({
    name: "", segment: "", colors: "#2563EB, #F97316, #FFFFFF",
    tone: "professional", audience: "",
  });
  const [contentType, setContentType] = useState("single_post");
  const [platform, setPlatform] = useState("instagram_feed");
  const [brief, setBrief] = useState("");
  const [references, setReferences] = useState("");
  const [result, setResult] = useState(null);
  const [pipelineSteps, setPipelineSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(-1);
  const [fullResponse, setFullResponse] = useState("");
  const [error, setError] = useState(null);

  const PIPELINES = {
    single_post: [
      { agent: "social-chief", action: "Analyzing request & loading brand context" },
      { agent: "chris-do", action: "Defining visual direction & typography" },
      { agent: "prompt-engineer", action: "Engineering AI image prompt" },
      { agent: "post-designer", action: "Composing layout & brand elements" },
      { agent: "caption-writer", action: "Writing caption, CTA & hashtags" },
    ],
    carousel: [
      { agent: "social-chief", action: "Analyzing request & loading brand" },
      { agent: "carousel-architect", action: "Structuring slide flow & content" },
      { agent: "chris-do", action: "Defining visual system for slides" },
      { agent: "prompt-engineer", action: "Engineering cover image prompt" },
      { agent: "caption-writer", action: "Writing carousel caption" },
    ],
    stories: [
      { agent: "social-chief", action: "Analyzing request" },
      { agent: "post-designer", action: "Designing story frames & safe zones" },
      { agent: "prompt-engineer", action: "Engineering visual assets" },
      { agent: "caption-writer", action: "Writing CTAs per frame" },
    ],
    reel_cover: [
      { agent: "social-chief", action: "Analyzing request" },
      { agent: "mike-winkelmann", action: "Bold visual concept" },
      { agent: "prompt-engineer", action: "Engineering hero image prompt" },
      { agent: "post-designer", action: "Text overlay & branding" },
    ],
    thumbnail: [
      { agent: "social-chief", action: "Analyzing request" },
      { agent: "chris-do", action: "Concept: emotion + curiosity + clarity" },
      { agent: "prompt-engineer", action: "Engineering thumbnail image" },
      { agent: "post-designer", action: "Typography & composition" },
    ],
  };

  const buildSystemPrompt = () => {
    const p = PLATFORMS[platform];
    return `You are the Xquads Social Media Squad — a coordinated team of AI agents specialized in creating high-quality social media content.

## Your Active Agents (execute as a coordinated pipeline):
1. **Social Chief** — Orchestrates the pipeline, ensures brand consistency
2. **Chris Do** — Visual direction, typography, premium design thinking
3. **Prompt Engineer** — Translates creative direction into AI image prompts (Flux/DALL-E/Midjourney)
4. **Post Designer** — Composes final layouts with text overlay and brand elements
5. **Caption Writer** — Writes scroll-stopping captions with hooks, CTAs, and hashtags

## Brand Guidelines:
- Company: ${brand.name}
- Segment: ${brand.segment}
- Brand Colors: ${brand.colors}
- Tone: ${brand.tone}
- Target Audience: ${brand.audience}

## Platform Specs:
- Platform: ${p.label}
- Dimensions: ${p.size}
- Aspect Ratio: ${p.ratio}

## Content Type: ${contentType.replace(/_/g, " ")}

## Your Output MUST include these clearly labeled sections:

### IMAGE PROMPT
A detailed, production-ready AI image prompt with all 7 layers:
- Subject, Style, Mood, Lighting, Composition, Color (with brand hex codes), Technical specs
- Include text-safe zones for overlay
- Optimized for Flux (photorealism) or Midjourney (artistic)

### NEGATIVE PROMPT
Elements to exclude from the generation

### DIMENSIONS
${p.size} (${p.ratio})

### COMPOSITION SPEC
Layout description: where text goes, where logo goes, visual hierarchy

### CAPTION
- HOOK: First line (max 125 chars, must stop the scroll)
- BODY: Full caption text
- CTA: Clear call to action

### HASHTAGS
10-15 relevant hashtags

${references ? `\n## Reference Direction:\n${references}\nAnalyze these references and incorporate their visual qualities into the prompt.` : ""}

Execute the full pipeline now. Be specific, actionable, and brand-aligned. Every output should be copy-paste ready.`;
  };

  const generate = async () => {
    if (!brand.name || !brief) {
      setError("Preencha o nome da empresa e o briefing do conteúdo");
      return;
    }
    setError(null);
    setStep("generating");
    const pipeline = PIPELINES[contentType] || PIPELINES.single_post;
    setPipelineSteps(pipeline);
    setActiveStep(0);
    setFullResponse("");
    setResult(null);

    // Simulate pipeline progression
    const stepInterval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= pipeline.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: buildSystemPrompt(),
          messages: [{ role: "user", content: `Create content for: ${brief}` }],
        }),
      });

      const data = await response.json();
      clearInterval(stepInterval);
      setActiveStep(pipeline.length);

      if (data.content && data.content.length > 0) {
        const text = data.content.map(c => c.text || "").join("\n");
        setFullResponse(text);
        setResult(text);
        setStep("result");
      } else if (data.error) {
        setError(`API Error: ${data.error.message}`);
        setStep("create");
      }
    } catch (err) {
      clearInterval(stepInterval);
      setError(`Connection error: ${err.message}`);
      setStep("create");
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: "var(--font-sans)" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.4s ease-out; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32, paddingTop: 8 }}>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
          Xquads Studio
        </div>
        <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginTop: 4 }}>
          Social media design generation powered by AI agent squads
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {Object.keys(AGENTS).slice(0, 6).map(id => <AgentBadge key={id} agentId={id} small />)}
        </div>
      </div>

      {/* Step: Config */}
      {step === "config" && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{
            padding: 20, borderRadius: "var(--border-radius-lg)",
            border: "0.5px solid var(--color-border-tertiary)",
            background: "var(--color-background-primary)",
          }}>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 16, color: "var(--color-text-primary)" }}>
              Configure sua marca
            </div>
            <BrandConfig brand={brand} setBrand={setBrand} />
          </div>

          <button onClick={() => setStep("create")} style={{
            padding: "12px 24px", fontSize: 15, fontWeight: 500,
            background: "#7F77DD", color: "#fff", border: "none",
            borderRadius: "var(--border-radius-md)", cursor: "pointer",
            transition: "transform 0.1s", width: "100%",
          }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
            Continuar para criação
          </button>
        </div>
      )}

      {/* Step: Create */}
      {step === "create" && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Content Type Selector */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--color-text-secondary)" }}>
              Tipo de conteúdo
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
              {CONTENT_TYPES.map(ct => (
                <button key={ct.id} onClick={() => setContentType(ct.id)} style={{
                  padding: "12px 8px", borderRadius: "var(--border-radius-md)",
                  border: contentType === ct.id ? "2px solid #7F77DD" : "0.5px solid var(--color-border-tertiary)",
                  background: contentType === ct.id ? "#7F77DD10" : "var(--color-background-primary)",
                  cursor: "pointer", textAlign: "center", transition: "all 0.2s",
                }}>
                  <div style={{ fontSize: 20 }}>{ct.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, marginTop: 4, color: "var(--color-text-primary)" }}>{ct.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Platform Selector */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--color-text-secondary)" }}>
              Plataforma e formato
            </div>
            <select value={platform} onChange={e => setPlatform(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box" }}>
              {Object.entries(PLATFORMS).map(([k, v]) => (
                <option key={k} value={k}>{v.label} — {v.size} ({v.ratio})</option>
              ))}
            </select>
          </div>

          {/* Brief */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--color-text-secondary)" }}>
              Briefing do conteúdo
            </div>
            <textarea value={brief} onChange={e => setBrief(e.target.value)}
              placeholder="Descreva o que você quer criar... Ex: 'Post de lançamento de serviço de tuning de motor, mostrando um carro esportivo modificado com visual premium e agressivo'"
              rows={4}
              style={{ width: "100%", boxSizing: "border-box", fontFamily: "var(--font-sans)", resize: "vertical" }}
            />
          </div>

          {/* References */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--color-text-secondary)" }}>
              Referências visuais (opcional)
            </div>
            <textarea value={references} onChange={e => setReferences(e.target.value)}
              placeholder="Descreva referências visuais ou estilos que gosta... Ex: 'Estilo dark e premium, inspirado em posts da BMW M Power, com fundo escuro e iluminação neon azul'"
              rows={2}
              style={{ width: "100%", boxSizing: "border-box", fontFamily: "var(--font-sans)", resize: "vertical" }}
            />
          </div>

          {error && (
            <div style={{
              padding: 12, borderRadius: 8,
              background: "var(--color-background-danger)",
              color: "var(--color-text-danger)", fontSize: 13,
            }}>{error}</div>
          )}

          {/* Pipeline Preview */}
          <div style={{
            padding: 16, borderRadius: "var(--border-radius-lg)",
            background: "var(--color-background-secondary)",
          }}>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>
              Pipeline que será executado:
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {(PIPELINES[contentType] || []).map((s, i) => (
                <AgentBadge key={i} agentId={s.agent} small />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setStep("config")} style={{
              padding: "10px 20px", fontSize: 14, cursor: "pointer",
              background: "transparent", border: "0.5px solid var(--color-border-secondary)",
              borderRadius: "var(--border-radius-md)", color: "var(--color-text-secondary)",
            }}>
              Voltar
            </button>
            <button onClick={generate} style={{
              flex: 1, padding: "12px 24px", fontSize: 15, fontWeight: 500,
              background: "#7F77DD", color: "#fff", border: "none",
              borderRadius: "var(--border-radius-md)", cursor: "pointer",
            }}>
              Gerar conteúdo com Xquads
            </button>
          </div>
        </div>
      )}

      {/* Step: Generating */}
      {step === "generating" && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{
            padding: 20, borderRadius: "var(--border-radius-lg)",
            border: "0.5px solid var(--color-border-tertiary)",
            background: "var(--color-background-primary)",
          }}>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, color: "var(--color-text-primary)" }}>
              Squad pipeline em execução...
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {pipelineSteps.map((s, i) => (
                <PipelineStep key={i} step={s} index={i}
                  isActive={i === activeStep}
                  isDone={i < activeStep}
                />
              ))}
            </div>
          </div>

          <div style={{
            padding: 12, borderRadius: 8,
            background: "var(--color-background-secondary)",
            fontSize: 12, color: "var(--color-text-secondary)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#7F77DD",
              animation: "pulse 1s ease-in-out infinite",
            }} />
            Processando via Claude API... Os agentes estão colaborando no seu conteúdo.
          </div>
        </div>
      )}

      {/* Step: Result */}
      {step === "result" && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderRadius: "var(--border-radius-md)",
            background: "var(--color-background-success)",
            border: "1px solid var(--color-border-success)",
          }}>
            <span style={{ fontSize: 13, color: "var(--color-text-success)", fontWeight: 500 }}>
              Conteúdo gerado pelo Social Media Squad
            </span>
            <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
              {brand.name} · {PLATFORMS[platform].label}
            </span>
          </div>

          {/* Pipeline completed */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {pipelineSteps.map((s, i) => (
              <AgentBadge key={i} agentId={s.agent} active small />
            ))}
          </div>

          <ResultPanel result={result} />

          {/* Full raw response toggle */}
          <details style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            <summary style={{ cursor: "pointer", padding: "8px 0" }}>
              Ver resposta completa do squad
            </summary>
            <div style={{
              padding: 16, marginTop: 8, borderRadius: 8,
              background: "var(--color-background-secondary)",
              whiteSpace: "pre-wrap", fontSize: 12, lineHeight: 1.6,
              maxHeight: 400, overflow: "auto",
              color: "var(--color-text-primary)",
            }}>
              {fullResponse}
            </div>
          </details>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button onClick={() => { setStep("create"); setResult(null); }} style={{
              padding: "10px 20px", fontSize: 14, cursor: "pointer",
              background: "transparent", border: "0.5px solid var(--color-border-secondary)",
              borderRadius: "var(--border-radius-md)", color: "var(--color-text-secondary)",
            }}>
              Novo conteúdo
            </button>
            <button onClick={() => { navigator.clipboard.writeText(fullResponse); }} style={{
              flex: 1, padding: "12px 24px", fontSize: 14, fontWeight: 500,
              background: "#7F77DD", color: "#fff", border: "none",
              borderRadius: "var(--border-radius-md)", cursor: "pointer",
            }}>
              Copiar tudo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
