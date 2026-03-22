"use client";

import { useState, useCallback, useId } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  LayoutList,
  Tag,
  Palette,
  MessageSquare,
  Users,
  ImageIcon,
  Layers,
  Smartphone,
  Video,
  Youtube,
  CalendarDays,
  ChevronRight,
  ArrowLeft,
  Copy,
  Check,
  Wand2,
  AlertCircle,
  RefreshCw,
  Hash,
  FileText,
  LayoutTemplate,
  Cpu,
  Pen,
  TrendingUp,
  Paintbrush,
  Network,
  Sparkles,
  Loader2,
  Download,
  Eye,
  AlignLeft,
} from "lucide-react";
import { PIPELINES, PLATFORMS_INFO } from "@/lib/squad-context";
import type {
  Brand,
  ContentType,
  Platform,
  Step,
  ContentResult,
  PipelineStep,
} from "@/lib/types";

// ── Agent config ───────────────────────────────────────────────────────────

const AGENT_CONFIG: Record<
  string,
  { name: string; color: string; Icon: React.FC<{ size?: number; strokeWidth?: number }> }
> = {
  "social-chief": { name: "Social Chief", color: "#7F77DD", Icon: Network },
  "gary-vee": { name: "Gary Vee", color: "#BA7517", Icon: TrendingUp },
  "chris-do": { name: "Chris Do", color: "#1D9E75", Icon: Pen },
  "ste-davies": { name: "Ste Davies", color: "#3B82F6", Icon: Sparkles },
  "mike-winkelmann": { name: "Beeple", color: "#E24B4A", Icon: Paintbrush },
  "tubik-studio": { name: "Tubik Studio", color: "#A855F7", Icon: LayoutTemplate },
  "rafaela-costa": { name: "Rafaela Costa", color: "#1D9E75", Icon: Sparkles },
  "post-designer": { name: "Post Designer", color: "#378ADD", Icon: ImageIcon },
  "carousel-architect": { name: "Carousel Architect", color: "#639922", Icon: Layers },
  "caption-writer": { name: "Caption Writer", color: "#D4537E", Icon: Pen },
  "prompt-engineer": { name: "Prompt Engineer", color: "#D85A30", Icon: Cpu },
};

// ── Content type config ────────────────────────────────────────────────────

const CONTENT_TYPES: {
  id: ContentType;
  label: string;
  desc: string;
  Icon: React.FC<{ size?: number }>;
}[] = [
  { id: "single_post", label: "Post único", desc: "Feed post com imagem + legenda", Icon: ImageIcon },
  { id: "carousel", label: "Carrossel", desc: "Multi-slide educativo ou storytelling", Icon: Layers },
  { id: "stories", label: "Stories", desc: "Sequência de stories com CTAs", Icon: Smartphone },
  { id: "reel_cover", label: "Capa de Reel", desc: "Thumbnail para Reels/TikTok", Icon: Video },
  { id: "thumbnail", label: "Thumbnail", desc: "Capa para YouTube", Icon: Youtube },
  { id: "content_calendar", label: "Calendário", desc: "Calendário de conteúdo + estratégia", Icon: CalendarDays },
];

const TONE_OPTIONS = [
  { value: "professional", label: "Profissional e confiável" },
  { value: "bold", label: "Ousado e energético" },
  { value: "playful", label: "Divertido e acessível" },
  { value: "premium", label: "Premium e sofisticado" },
  { value: "warm", label: "Acolhedor e humano" },
  { value: "tech", label: "Tecnológico e inovador" },
];

// ── Result parser ─────────────────────────────────────────────────────────

function parseResult(text: string): ContentResult {
  const getSection = (patterns: RegExp[]): string => {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]?.trim()) return match[1].trim();
    }
    return "";
  };

  const imagePrompt = getSection([
    /###\s*(?:COVER\s+)?IMAGE\s+PROMPT\s*\n([\s\S]*?)(?=\n###|$)/i,
  ]);
  const negativePrompt = getSection([
    /###\s*NEGATIVE\s+PROMPT\s*\n([\s\S]*?)(?=\n###|$)/i,
  ]);
  const compositionSpec = getSection([
    /###\s*COMPOSITION\s+SPEC\s*\n([\s\S]*?)(?=\n###|$)/i,
  ]);
  const captionSection = getSection([
    /###\s*CAPTION\s*\n([\s\S]*?)(?=\n###|$)/i,
  ]);
  const hashtagsSection = getSection([
    /###\s*HASHTAGS\s*\n([\s\S]*?)(?=\n###|$)/i,
  ]);
  const qualityScore = getSection([
    /###\s*QUALITY\s+SCORE\s*\n([\s\S]*?)(?=\n###|$)/i,
  ]);
  const carouselStructure = getSection([
    /###\s*CAROUSEL\s+STRUCTURE\s*\n([\s\S]*?)(?=\n###|$)/i,
  ]);
  const visualSystem = getSection([
    /###\s*VISUAL\s+SYSTEM\s*\n([\s\S]*?)(?=\n###|$)/i,
  ]);

  const hookMatch = captionSection.match(/\*\*HOOK:\*\*\s*([^\n]+)/i);
  const bodyMatch = captionSection.match(
    /\*\*BODY:\*\*\s*([\s\S]*?)(?=\*\*CTA:|$)/i
  );
  const ctaMatch = captionSection.match(/\*\*CTA:\*\*\s*([^\n]+)/i);

  const hashtags =
    hashtagsSection.match(/#[\w\u00C0-\u017E\u00AA-\u00FF\u0080-\u00FF]+/gi) ||
    [];

  return {
    imagePrompt,
    negativePrompt,
    compositionSpec,
    caption: captionSection,
    hook: hookMatch?.[1]?.trim() || "",
    body: bodyMatch?.[1]?.trim() || "",
    cta: ctaMatch?.[1]?.trim() || "",
    hashtags,
    carouselStructure,
    visualSystem,
    qualityScore,
    raw: text,
  };
}

// ── Sub-components ─────────────────────────────────────────────────────────

function AgentBadge({
  agentId,
  active,
  small,
}: {
  agentId: string;
  active?: boolean;
  small?: boolean;
}) {
  const cfg = AGENT_CONFIG[agentId];
  if (!cfg) return null;
  const { name, color, Icon } = cfg;

  return (
    <span
      className="badge"
      style={{
        background: active ? color + "18" : "var(--surface)",
        borderColor: active ? color + "40" : "var(--border)",
        color: active ? color : "var(--text-secondary)",
        boxShadow: active ? `0 0 10px ${color}20` : undefined,
        fontSize: small ? 11 : 12,
        padding: small ? "2px 8px" : "3px 10px",
      }}
    >
      <Icon size={small ? 11 : 13} strokeWidth={2} />
      {!small && name}
    </span>
  );
}

function PipelineStepRow({
  step,
  index,
  isActive,
  isDone,
}: {
  step: PipelineStep;
  index: number;
  isActive: boolean;
  isDone: boolean;
}) {
  const cfg = AGENT_CONFIG[step.agentId];
  const color = cfg?.color ?? "#7F77DD";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        borderRadius: "var(--radius-md)",
        background: isDone
          ? color + "0E"
          : isActive
          ? color + "18"
          : "transparent",
        borderLeft: `3px solid ${isDone || isActive ? color : "var(--border)"}`,
        transition: "all var(--dur-normal) var(--easing)",
      }}
    >
      {/* Step number / done indicator */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 600,
          flexShrink: 0,
          background: isDone
            ? color + "25"
            : isActive
            ? color + "20"
            : "var(--surface)",
          color: isDone || isActive ? color : "var(--text-muted)",
          transition: "all var(--dur-normal) var(--easing)",
        }}
      >
        {isDone ? (
          <Check size={14} strokeWidth={2.5} />
        ) : (
          <span style={{ fontSize: 12 }}>{index + 1}</span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: isDone || isActive ? "var(--text-primary)" : "var(--text-secondary)",
          }}
        >
          {cfg?.name ?? step.agentId}
        </div>
        <div
          style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}
          className="truncate"
        >
          {step.phase}
        </div>
      </div>

      {/* Active pulse */}
      {isActive && (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
            animation: "pulse-dot 1.4s ease-in-out infinite",
          }}
        />
      )}
    </div>
  );
}

function CopyButton({
  text,
  label = "Copiar",
  variant = "ghost",
}: {
  text: string;
  label?: string;
  variant?: "ghost" | "secondary";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — ignore
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`btn btn-sm btn-${variant}`}
      aria-label={copied ? "Copiado!" : label}
    >
      {copied ? (
        <>
          <Check size={12} strokeWidth={2.5} />
          Copiado!
        </>
      ) : (
        <>
          <Copy size={12} />
          {label}
        </>
      )}
    </button>
  );
}

function ResultSection({
  title,
  content,
  icon,
  accentColor,
  preformatted,
}: {
  title: string;
  content: string;
  icon: React.ReactNode;
  accentColor?: string;
  preformatted?: boolean;
}) {
  if (!content) return null;
  return (
    <div className="card animate-in" style={{ gap: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: accentColor ?? "var(--text-secondary)",
          }}
        >
          {icon}
          {title}
        </div>
        <CopyButton text={content} />
      </div>
      <div
        className={preformatted ? "pre-wrap" : undefined}
        style={{
          fontSize: 13,
          lineHeight: 1.7,
          color: "var(--text-primary)",
        }}
      >
        {content}
      </div>
    </div>
  );
}

// ── Step indicator ─────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "brand", label: "Marca" },
    { id: "create", label: "Criar" },
    { id: "result", label: "Resultado" },
  ];
  const currentIndex = ["brand", "create", "generating", "result"].indexOf(current);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        marginBottom: 28,
      }}
      role="navigation"
      aria-label="Progresso"
    >
      {steps.map((s, i) => {
        const stepIndex = ["brand", "create", "result"].indexOf(s.id);
        const normalizedCurrent = current === "generating" ? 2 : currentIndex;
        const isDone = stepIndex < normalizedCurrent;
        const isActive = stepIndex === normalizedCurrent;

        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
              }}
              aria-current={isActive ? "step" : undefined}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  background: isDone
                    ? "var(--accent)"
                    : isActive
                    ? "var(--accent-subtle)"
                    : "var(--surface)",
                  border: `2px solid ${
                    isDone || isActive ? "var(--accent)" : "var(--border-strong)"
                  }`,
                  color: isDone
                    ? "#fff"
                    : isActive
                    ? "var(--accent)"
                    : "var(--text-muted)",
                  transition: "all var(--dur-normal) var(--easing)",
                  boxShadow: isActive ? "0 0 12px var(--accent-glow)" : undefined,
                }}
              >
                {isDone ? <Check size={13} strokeWidth={2.5} /> : i + 1}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive
                    ? "var(--text-primary)"
                    : isDone
                    ? "var(--accent)"
                    : "var(--text-muted)",
                }}
              >
                {s.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                style={{
                  width: 48,
                  height: 2,
                  background:
                    stepIndex < normalizedCurrent - 1
                      ? "var(--accent)"
                      : isDone
                      ? "var(--accent)"
                      : "var(--border-strong)",
                  margin: "0 6px",
                  marginBottom: 16,
                  transition: "background var(--dur-normal) var(--easing)",
                  borderRadius: 1,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Brand step ─────────────────────────────────────────────────────────────

function BrandStep({
  brand,
  setBrand,
  onNext,
}: {
  brand: Brand;
  setBrand: (b: Brand) => void;
  onNext: () => void;
}) {
  const nameId = useId();
  const segmentId = useId();
  const colorsId = useId();
  const toneId = useId();
  const audienceId = useId();

  const colorPreviews = brand.colors
    .split(",")
    .map((c) => c.trim())
    .filter((c) => /^#[0-9a-fA-F]{3,6}$/.test(c));

  const canContinue = brand.name.trim().length > 0;

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card-elevated">
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 18,
            color: "var(--text-primary)",
          }}
        >
          Configure sua marca
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Company name */}
          <div>
            <label htmlFor={nameId} className="label label-required">
              <Building2 size={11} style={{ display: "inline", marginRight: 4 }} />
              Nome da empresa
            </label>
            <input
              id={nameId}
              value={brand.name}
              onChange={(e) => setBrand({ ...brand, name: e.target.value })}
              placeholder="Ex: Mobius, Flex-Kids, Synkra…"
              autoComplete="organization"
            />
          </div>

          {/* Segment */}
          <div>
            <label htmlFor={segmentId} className="label">
              <Tag size={11} style={{ display: "inline", marginRight: 4 }} />
              Segmento / nicho
            </label>
            <input
              id={segmentId}
              value={brand.segment}
              onChange={(e) => setBrand({ ...brand, segment: e.target.value })}
              placeholder="Ex: Car tuning, playground infantil, SaaS B2B…"
            />
          </div>

          {/* Brand colors */}
          <div>
            <label htmlFor={colorsId} className="label">
              <Palette size={11} style={{ display: "inline", marginRight: 4 }} />
              Cores da marca (hex separados por vírgula)
            </label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                id={colorsId}
                value={brand.colors}
                onChange={(e) => setBrand({ ...brand, colors: e.target.value })}
                placeholder="#2563EB, #F97316, #FFFFFF"
                style={{ flex: 1 }}
              />
              {colorPreviews.length > 0 && (
                <div
                  style={{ display: "flex", gap: 4, flexShrink: 0 }}
                  aria-label="Prévia das cores"
                >
                  {colorPreviews.slice(0, 5).map((hex, i) => (
                    <div
                      key={i}
                      title={hex}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "var(--radius-xs)",
                        background: hex,
                        border: "1px solid var(--border-strong)",
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label htmlFor={toneId} className="label">
              <MessageSquare size={11} style={{ display: "inline", marginRight: 4 }} />
              Tom de voz
            </label>
            <select
              id={toneId}
              value={brand.tone}
              onChange={(e) => setBrand({ ...brand, tone: e.target.value })}
            >
              {TONE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Audience */}
          <div>
            <label htmlFor={audienceId} className="label">
              <Users size={11} style={{ display: "inline", marginRight: 4 }} />
              Público-alvo
            </label>
            <input
              id={audienceId}
              value={brand.audience}
              onChange={(e) => setBrand({ ...brand, audience: e.target.value })}
              placeholder="Ex: Jovens 18-35, entusiastas de carros, decisores B2B…"
            />
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary btn-lg"
        onClick={onNext}
        disabled={!canContinue}
        style={{ width: "100%" }}
      >
        Continuar para criação
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ── Create step ────────────────────────────────────────────────────────────

function CreateStep({
  contentType,
  setContentType,
  platform,
  setPlatform,
  brief,
  setBrief,
  references,
  setReferences,
  error,
  onBack,
  onGenerate,
  isLoading,
}: {
  contentType: ContentType;
  setContentType: (t: ContentType) => void;
  platform: Platform;
  setPlatform: (p: Platform) => void;
  brief: string;
  setBrief: (v: string) => void;
  references: string;
  setReferences: (v: string) => void;
  error: string | null;
  onBack: () => void;
  onGenerate: () => void;
  isLoading: boolean;
}) {
  const platformId = useId();
  const briefId = useId();
  const refId = useId();

  const pipeline = PIPELINES[contentType] || [];

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Content type selector */}
      <div>
        <p className="section-label">Tipo de conteúdo</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 8,
          }}
          role="radiogroup"
          aria-label="Tipo de conteúdo"
        >
          {CONTENT_TYPES.map((ct) => {
            const isSelected = contentType === ct.id;
            return (
              <button
                key={ct.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => setContentType(ct.id)}
                style={{
                  padding: "12px 8px",
                  borderRadius: "var(--radius-md)",
                  border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                  background: isSelected ? "var(--accent-subtle)" : "var(--surface)",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all var(--dur-fast) var(--easing)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ct.Icon
                  size={20}
                  // @ts-expect-error — optional prop
                  strokeWidth={1.8}
                  style={{
                    color: isSelected ? "var(--accent)" : "var(--text-secondary)",
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                    lineHeight: 1.2,
                  }}
                >
                  {ct.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Platform selector */}
      <div>
        <label htmlFor={platformId} className="section-label" style={{ display: "block" }}>
          Plataforma e formato
        </label>
        <select
          id={platformId}
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform)}
        >
          {(Object.entries(PLATFORMS_INFO) as [Platform, typeof PLATFORMS_INFO[Platform]][]).map(
            ([k, v]) => (
              <option key={k} value={k}>
                {v.label} — {v.size} ({v.ratio})
              </option>
            )
          )}
        </select>
      </div>

      {/* Brief */}
      <div>
        <label htmlFor={briefId} className="section-label" style={{ display: "block" }}>
          Briefing do conteúdo <span style={{ color: "var(--error)" }}>*</span>
        </label>
        <textarea
          id={briefId}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder={`Descreva o que você quer criar…\n\nEx: "Post de lançamento do serviço de remapeamento de ECU, mostrando um carro esportivo com visual premium e agressivo"`}
          rows={4}
        />
      </div>

      {/* References */}
      <div>
        <label htmlFor={refId} className="section-label" style={{ display: "block" }}>
          Referências visuais{" "}
          <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(opcional)</span>
        </label>
        <textarea
          id={refId}
          value={references}
          onChange={(e) => setReferences(e.target.value)}
          placeholder={`Descreva referências visuais ou estilos…\n\nEx: "Dark e premium, inspirado em BMW M Power, fundo escuro com iluminação neon azul"`}
          rows={2}
          style={{ minHeight: 60 }}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          style={{
            padding: "12px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--error-bg)",
            border: "1px solid var(--error-border)",
            color: "var(--error)",
            fontSize: 13,
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <AlertCircle size={15} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Pipeline preview */}
      <div
        style={{
          padding: "14px 16px",
          borderRadius: "var(--radius-md)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <p className="section-label" style={{ marginBottom: 8 }}>
          Pipeline que será executado
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {pipeline.map((s) => (
            <AgentBadge key={s.agentId} agentId={s.agentId} small />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-ghost" onClick={onBack} aria-label="Voltar para configuração de marca">
          <ArrowLeft size={15} />
          Voltar
        </button>
        <button
          className="btn btn-primary btn-lg"
          onClick={onGenerate}
          disabled={isLoading || !brief.trim()}
          style={{ flex: 1 }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              Gerando…
            </>
          ) : (
            <>
              <Wand2 size={16} />
              Gerar conteúdo com Xquads
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Generating step ────────────────────────────────────────────────────────

function GeneratingStep({
  steps,
  activeStep,
}: {
  steps: PipelineStep[];
  activeStep: number;
}) {
  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card-elevated">
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 15,
            fontWeight: 700,
            marginBottom: 14,
            color: "var(--text-primary)",
          }}
        >
          Squad pipeline em execução…
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {steps.map((s, i) => (
            <PipelineStepRow
              key={s.agentId + i}
              step={s}
              index={i}
              isActive={i === activeStep}
              isDone={i < activeStep}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          padding: "12px 14px",
          borderRadius: "var(--radius-md)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 12,
          color: "var(--text-secondary)",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--accent)",
            flexShrink: 0,
            animation: "pulse-dot 1.2s ease-in-out infinite",
          }}
        />
        Processando via Claude API… Os agentes estão colaborando no seu conteúdo.
      </div>
    </div>
  );
}

// ── Result step ────────────────────────────────────────────────────────────

function ResultStep({
  result,
  rawText,
  brand,
  platform,
  pipelineSteps,
  onNewContent,
  onBack,
}: {
  result: ContentResult;
  rawText: string;
  brand: Brand;
  platform: Platform;
  pipelineSteps: PipelineStep[];
  onNewContent: () => void;
  onBack: () => void;
}) {
  const [imageState, setImageState] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string>("");
  const [showRaw, setShowRaw] = useState(false);

  const platformInfo = PLATFORMS_INFO[platform];

  const handleGenerateImage = async () => {
    if (!result.imagePrompt) return;
    setImageState("generating");
    setImageError("");

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: result.imagePrompt,
          negativePrompt: result.negativePrompt,
          aspectRatio: platformInfo.aspectRatio,
        }),
      });
      const data = await res.json();

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        setImageState("done");
      } else {
        setImageError(data.error || "Falha ao gerar imagem");
        setImageState("error");
      }
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Erro de conexão");
      setImageState("error");
    }
  };

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Success banner */}
      <div
        role="status"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 16px",
          borderRadius: "var(--radius-md)",
          background: "var(--success-bg)",
          border: "1px solid var(--success-border)",
        }}
      >
        <span
          style={{ fontSize: 13, fontWeight: 600, color: "var(--success)", display: "flex", alignItems: "center", gap: 6 }}
        >
          <Check size={14} strokeWidth={2.5} />
          Conteúdo gerado pelo Social Media Squad
        </span>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {brand.name} · {platformInfo.label}
        </span>
      </div>

      {/* Completed pipeline badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {pipelineSteps.map((s) => (
          <AgentBadge key={s.agentId} agentId={s.agentId} active small />
        ))}
      </div>

      {/* Image prompt */}
      {result.imagePrompt && (
        <ResultSection
          title="AI Image Prompt"
          content={result.imagePrompt}
          icon={<Cpu size={13} />}
          accentColor={AGENT_CONFIG["prompt-engineer"]?.color}
          preformatted
        />
      )}

      {/* Negative prompt */}
      {result.negativePrompt && (
        <div className="card animate-in">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--error)" }}>
              Negative Prompt
            </span>
            <CopyButton text={result.negativePrompt} />
          </div>
          <p
            className="pre-wrap"
            style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}
          >
            {result.negativePrompt}
          </p>
        </div>
      )}

      {/* Composition spec */}
      {result.compositionSpec && (
        <ResultSection
          title="Composition Spec"
          content={result.compositionSpec}
          icon={<LayoutTemplate size={13} />}
          preformatted
        />
      )}

      {/* Carousel structure */}
      {result.carouselStructure && (
        <ResultSection
          title="Carousel Structure"
          content={result.carouselStructure}
          icon={<Layers size={13} />}
          preformatted
        />
      )}

      {/* Visual system */}
      {result.visualSystem && (
        <ResultSection
          title="Visual System"
          content={result.visualSystem}
          icon={<Palette size={13} />}
          preformatted
        />
      )}

      {/* Caption */}
      {result.caption && (
        <div className="card animate-in">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: AGENT_CONFIG["caption-writer"]?.color,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <AlignLeft size={13} />
              Caption
            </span>
            <CopyButton
              text={`${result.hook}\n\n${result.body}\n\n${result.cta}\n\n${result.hashtags.join(" ")}`}
            />
          </div>

          {result.hook && (
            <div style={{ marginBottom: 10 }}>
              <span className="section-label">Hook</span>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  lineHeight: 1.4,
                }}
              >
                {result.hook}
              </p>
            </div>
          )}

          {result.body && (
            <div style={{ marginBottom: 10 }}>
              <span className="section-label">Corpo</span>
              <p className="pre-wrap" style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.7 }}>
                {result.body}
              </p>
            </div>
          )}

          {result.cta && (
            <div>
              <span className="section-label">CTA</span>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--accent)" }}>
                {result.cta}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hashtags */}
      {result.hashtags.length > 0 && (
        <div className="card animate-in">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--info)",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Hash size={13} />
              Hashtags ({result.hashtags.length})
            </span>
            <CopyButton text={result.hashtags.join(" ")} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {result.hashtags.map((h, i) => (
              <span
                key={i}
                style={{
                  fontSize: 12,
                  padding: "3px 10px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--info-bg)",
                  color: "var(--info)",
                  border: "1px solid rgba(96,165,250,0.15)",
                }}
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quality score */}
      {result.qualityScore && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            fontSize: 12,
            color: "var(--text-secondary)",
          }}
        >
          <Sparkles size={12} style={{ display: "inline", marginRight: 5 }} />
          {result.qualityScore}
        </div>
      )}

      {/* Image generation */}
      {result.imagePrompt && (
        <div className="card-elevated" style={{ gap: 12 }}>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            Gerar imagem com Flux
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
            Usa o Replicate API (REPLICATE_API_TOKEN necessário) para gerar a imagem em {platformInfo.size}.
          </p>

          {imageState === "idle" && (
            <button
              className="btn btn-secondary"
              onClick={handleGenerateImage}
              style={{ width: "100%" }}
            >
              <Wand2 size={15} />
              Gerar imagem — {platformInfo.label}
            </button>
          )}

          {imageState === "generating" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                background: "var(--surface)",
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              <Loader2
                size={16}
                style={{ animation: "spin 1s linear infinite", color: "var(--accent)" }}
              />
              Gerando com Flux 1.1 Pro… (~10-30 segundos)
            </div>
          )}

          {imageState === "error" && (
            <div
              role="alert"
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                background: "var(--error-bg)",
                border: "1px solid var(--error-border)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <p style={{ fontSize: 13, color: "var(--error)" }}>{imageError}</p>
              <button
                className="btn btn-sm btn-ghost"
                onClick={handleGenerateImage}
                style={{ alignSelf: "flex-start" }}
              >
                <RefreshCw size={12} />
                Tentar novamente
              </button>
            </div>
          )}

          {imageState === "done" && imageUrl && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  position: "relative",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                }}
              >
                <Image
                  src={imageUrl}
                  alt={`Imagem gerada para ${brand.name}`}
                  width={680}
                  height={680}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <Eye size={13} />
                  Abrir original
                </a>
                <a
                  href={imageUrl}
                  download={`xquads-${brand.name.toLowerCase().replace(/\s+/g, "-")}.png`}
                  className="btn btn-secondary btn-sm"
                >
                  <Download size={13} />
                  Baixar
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Raw response toggle */}
      <div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setShowRaw((p) => !p)}
          aria-expanded={showRaw}
        >
          <FileText size={12} />
          {showRaw ? "Ocultar" : "Ver"} resposta completa do squad
        </button>
        {showRaw && (
          <div
            className="pre-wrap animate-in-fast"
            style={{
              marginTop: 8,
              padding: 14,
              borderRadius: "var(--radius-md)",
              background: "var(--bg-base)",
              border: "1px solid var(--border)",
              fontSize: 12,
              lineHeight: 1.6,
              color: "var(--text-secondary)",
              maxHeight: 400,
              overflowY: "auto",
            }}
          >
            {rawText}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
        <button className="btn btn-ghost" onClick={onBack}>
          <ArrowLeft size={15} />
          Editar
        </button>
        <button className="btn btn-secondary" onClick={onNewContent} style={{ flex: 1 }}>
          <RefreshCw size={15} />
          Novo conteúdo
        </button>
        <CopyButton text={rawText} label="Copiar tudo" variant="secondary" />
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function StudioApp() {
  const [step, setStep] = useState<Step>("brand");
  const [brand, setBrand] = useState<Brand>({
    name: "",
    segment: "",
    colors: "#2563EB, #F97316, #FFFFFF",
    tone: "professional",
    audience: "",
  });
  const [contentType, setContentType] = useState<ContentType>("single_post");
  const [platform, setPlatform] = useState<Platform>("instagram_feed");
  const [brief, setBrief] = useState("");
  const [references, setReferences] = useState("");
  const [result, setResult] = useState<ContentResult | null>(null);
  const [rawText, setRawText] = useState("");
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [activeStep, setActiveStep] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = useCallback(async () => {
    if (!brand.name.trim() || !brief.trim()) {
      setError("Preencha o nome da empresa e o briefing do conteúdo");
      return;
    }

    setError(null);
    setIsLoading(true);
    const pipeline = PIPELINES[contentType] ?? PIPELINES.single_post;
    setPipelineSteps(pipeline);
    setActiveStep(0);
    setStep("generating");

    // Simulate pipeline step progression while waiting for the API
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= pipeline.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, Math.max(2500, (25000 / pipeline.length)));

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, contentType, platform, brief, references }),
      });

      clearInterval(stepInterval);
      setActiveStep(pipeline.length); // all done

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Erro desconhecido. Tente novamente.");
        setStep("create");
        setIsLoading(false);
        return;
      }

      const parsed = parseResult(data.result as string);
      setRawText(data.result as string);
      setResult(parsed);
      setStep("result");
    } catch (err) {
      clearInterval(stepInterval);
      setError(err instanceof Error ? `Erro de conexão: ${err.message}` : "Erro de conexão");
      setStep("create");
    } finally {
      setIsLoading(false);
    }
  }, [brand, contentType, platform, brief, references]);

  const handleNewContent = useCallback(() => {
    setResult(null);
    setRawText("");
    setError(null);
    setActiveStep(-1);
    setStep("create");
  }, []);

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "24px 16px 48px",
        minHeight: "100dvh",
      }}
    >
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Sparkles
            size={22}
            style={{ color: "var(--accent)" }}
            strokeWidth={1.8}
          />
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            Xquads Studio
          </h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          Social media content generation powered by AI agent squads
        </p>
        {/* Agent badges row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 5,
            marginTop: 12,
          }}
          aria-label="Agentes disponíveis"
        >
          {Object.keys(AGENT_CONFIG)
            .slice(0, 7)
            .map((id) => (
              <AgentBadge key={id} agentId={id} small />
            ))}
        </div>

        {/* Templates quick access */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <Link
            href="/template"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 12 }}
          >
            <LayoutList size={13} />
            Template Studio
          </Link>
        </div>
      </header>

      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* Steps */}
      {step === "brand" && (
        <BrandStep
          brand={brand}
          setBrand={setBrand}
          onNext={() => setStep("create")}
        />
      )}

      {(step === "create" || (step === "generating" && isLoading)) && step === "create" && (
        <CreateStep
          contentType={contentType}
          setContentType={setContentType}
          platform={platform}
          setPlatform={setPlatform}
          brief={brief}
          setBrief={setBrief}
          references={references}
          setReferences={setReferences}
          error={error}
          onBack={() => setStep("brand")}
          onGenerate={generate}
          isLoading={isLoading}
        />
      )}

      {step === "generating" && (
        <GeneratingStep steps={pipelineSteps} activeStep={activeStep} />
      )}

      {step === "result" && result && (
        <ResultStep
          result={result}
          rawText={rawText}
          brand={brand}
          platform={platform}
          pipelineSteps={pipelineSteps}
          onNewContent={handleNewContent}
          onBack={() => setStep("create")}
        />
      )}
    </main>
  );
}
