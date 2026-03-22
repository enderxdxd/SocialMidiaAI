"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  ChangeEvent,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Download,
  Smartphone,
  Monitor,
  CalendarDays,
  Plus,
  Trash2,
  FileText,
  X,
} from "lucide-react";

// ── Brand constants ──────────────────────────────────────────────────────────

const BRAND = {
  navy: "#020036",
  navyCard: "rgba(2, 0, 54, 0.96)",
  blue: "#1F2BFF",
  red: "#E30613",
  white: "#FFFFFF",
  grayCard: "#EAEBF2",
};

// ── Shared SVGs ──────────────────────────────────────────────────────────────

function XLogo({ size = 56 }: { size?: number }) {
  const h = size / 2;
  const band = size * 0.22;
  const ext = size * 0.13;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: "block", flexShrink: 0 }}>
      <rect width={size} height={size} rx={size * 0.15} fill={BRAND.navy} />
      <rect x={-ext} y={h - band / 2} width={size + ext * 2} height={band} rx={band * 0.4} fill="white" transform={`rotate(45 ${h} ${h})`} />
      <rect x={-ext} y={h - band / 2} width={size + ext * 2} height={band} rx={band * 0.4} fill={BRAND.red} transform={`rotate(-45 ${h} ${h})`} />
    </svg>
  );
}

function XMark({ size = 20, whiteColor = "white" }: { size?: number; whiteColor?: string }) {
  const h = size / 2;
  const band = size * 0.27;
  const ext = size * 0.14;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: "block", flexShrink: 0 }}>
      <rect x={-ext} y={h - band / 2} width={size + ext * 2} height={band} rx={band * 0.4} fill={whiteColor} transform={`rotate(45 ${h} ${h})`} />
      <rect x={-ext} y={h - band / 2} width={size + ext * 2} height={band} rx={band * 0.4} fill={BRAND.red} transform={`rotate(-45 ${h} ${h})`} />
    </svg>
  );
}

/** Repeating FLEX brand banner (absolute bottom of templates) */
function FlexBanner({ width, height = 110 }: { width: number; height?: number }) {
  const text = "• FLEX";
  const repeat = Math.ceil(width / 90) + 4;
  const items = Array.from({ length: repeat }, (_, i) => i);

  const Row = ({ offset, top }: { offset: number; top: number }) => (
    <div style={{
      position: "absolute",
      top,
      left: -offset,
      display: "flex",
      alignItems: "center",
      gap: 0,
      whiteSpace: "nowrap",
    }}>
      {items.map((i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", marginRight: 2 }}>
          <span style={{
            fontSize: height * 0.26,
            fontWeight: 900,
            color: "white",
            letterSpacing: "0.05em",
            fontFamily: "'Nunito', system-ui, sans-serif",
            opacity: 0.95,
          }}>
            {text}
          </span>
          <XMark size={height * 0.22} />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      width,
      height,
      background: "#06040A",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: 0,
    }}>
      <Row offset={0} top={height * 0.04} />
      <Row offset={width * 0.12} top={height * 0.36} />
      <Row offset={width * 0.05} top={height * 0.67} />
    </div>
  );
}

// ── Template: Story (1080 × 1920) ───────────────────────────────────────────

interface StoryData {
  photoUrl: string;
  handle: string;
  title: string;
  subtitle: string;
  date: string;
  days: string;
  time: string;
  professor: string;
  unidade: string;
  ctaText: string;
  badge: string;
}

function StoryTemplate({ d }: { d: StoryData }) {
  const W = 1080;
  const H = 1920;
  const bannerH = 130;
  const cardH = 760;
  const photoH = H - cardH;

  return (
    <div
      id="template-render"
      style={{
        width: W,
        height: H,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Nunito', system-ui, sans-serif",
        background: BRAND.navy,
      }}
    >
      {/* Photo area */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: W,
        height: photoH,
        background: "#111",
        backgroundImage: d.photoUrl ? `url(${d.photoUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}>
        {/* Dark gradient at bottom of photo */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 300,
          background: "linear-gradient(to bottom, transparent, rgba(2,0,54,0.98))",
        }} />

        {/* X logo */}
        <div style={{ position: "absolute", top: 52, left: 52 }}>
          <XLogo size={72} />
        </div>

        {/* @handle */}
        {d.handle && (
          <div style={{
            position: "absolute",
            top: 68,
            right: 52,
            fontSize: 28,
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "0.01em",
          }}>
            {d.handle}
          </div>
        )}
      </div>

      {/* Bottom card */}
      <div style={{
        position: "absolute",
        bottom: bannerH,
        left: 0,
        width: W,
        height: cardH,
        background: BRAND.navyCard,
        borderTopLeftRadius: 48,
        borderTopRightRadius: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: "48px 64px",
        boxSizing: "border-box",
      }}>
        {/* Badge (optional) */}
        {d.badge && (
          <div style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 999,
            padding: "12px 36px",
            fontSize: 26,
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.08em",
          }}>
            {d.badge}
          </div>
        )}

        {/* Title */}
        <div style={{
          fontSize: 128,
          fontWeight: 900,
          color: "white",
          textAlign: "center",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}>
          {d.title || "TÍTULO"}
        </div>

        {/* Subtitle */}
        {(d.subtitle || d.date) && (
          <div style={{
            fontSize: 38,
            fontWeight: 500,
            color: "rgba(255,255,255,0.88)",
            textAlign: "center",
            lineHeight: 1.4,
          }}>
            {d.subtitle && <div>{d.subtitle}</div>}
            {d.date && <div style={{ fontWeight: 700 }}>{d.date}</div>}
          </div>
        )}

        {/* Pills row 1: days + time */}
        {(d.days || d.time) && (
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
            {d.days && (
              <div style={{
                border: `3px solid white`,
                borderRadius: 999,
                padding: "18px 48px",
                fontSize: 32,
                fontWeight: 800,
                color: "white",
                letterSpacing: "0.04em",
              }}>
                {d.days}
              </div>
            )}
            {d.time && (
              <div style={{
                background: BRAND.red,
                borderRadius: 999,
                padding: "18px 48px",
                fontSize: 32,
                fontWeight: 800,
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}>
                <span>⏰</span>
                {d.time}
              </div>
            )}
          </div>
        )}

        {/* Professor pill */}
        {d.professor && (
          <div style={{
            background: "rgba(255,255,255,0.1)",
            border: "2px solid rgba(255,255,255,0.2)",
            borderRadius: 999,
            padding: "18px 48px",
            fontSize: 36,
            fontWeight: 800,
            color: BRAND.red,
            letterSpacing: "0.04em",
          }}>
            {d.professor}
          </div>
        )}

        {/* Pills row 2: CTA + location */}
        {(d.ctaText || d.unidade) && (
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
            {d.ctaText && (
              <div style={{
                background: BRAND.blue,
                borderRadius: 999,
                padding: "18px 56px",
                fontSize: 32,
                fontWeight: 800,
                color: "white",
                letterSpacing: "0.06em",
              }}>
                {d.ctaText}
              </div>
            )}
            {d.unidade && (
              <div style={{
                border: `3px solid white`,
                borderRadius: 999,
                padding: "18px 40px",
                fontSize: 28,
                fontWeight: 700,
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: 10,
                letterSpacing: "0.04em",
              }}>
                📍 {d.unidade}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FLEX banner */}
      <FlexBanner width={W} height={bannerH} />
    </div>
  );
}

// ── Template: Feed (1280 × 720) ──────────────────────────────────────────────

interface FeedData {
  photoUrl: string;
  handle: string;
  title: string;
  subtitle: string;
  date: string;
  days: string;
  time: string;
  professor: string;
  unidade: string;
  ctaText: string;
  badge: string;
}

function FeedTemplate({ d }: { d: FeedData }) {
  const W = 1280;
  const H = 720;
  const leftW = 560;
  const bannerH = 96;

  return (
    <div
      id="template-render"
      style={{
        width: W,
        height: H,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Nunito', system-ui, sans-serif",
        background: BRAND.navy,
      }}
    >
      {/* Photo — right side */}
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: W - leftW + 40,
        height: H,
        background: "#111",
        backgroundImage: d.photoUrl ? `url(${d.photoUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        {/* Gradient left edge to blend with card */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 200,
          height: "100%",
          background: `linear-gradient(to right, ${BRAND.navy}, transparent)`,
        }} />
      </div>

      {/* Left card */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: leftW,
        height: H - bannerH,
        background: BRAND.navy,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 20,
        padding: "44px 48px",
        boxSizing: "border-box",
      }}>
        {/* Decorative circle */}
        <div style={{
          position: "absolute",
          bottom: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: `3px solid rgba(31,43,255,0.3)`,
          pointerEvents: "none",
        }} />

        {/* X Logo */}
        <div style={{ marginBottom: 4 }}>
          <XLogo size={54} />
        </div>

        {/* Badge */}
        {d.badge && (
          <div style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 999,
            padding: "8px 24px",
            fontSize: 15,
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.08em",
            display: "inline-flex",
            alignSelf: "flex-start",
          }}>
            {d.badge}
          </div>
        )}

        {/* Title */}
        <div style={{
          fontSize: 88,
          fontWeight: 900,
          color: "white",
          lineHeight: 0.95,
          letterSpacing: "-0.02em",
        }}>
          {d.title || "TÍTULO"}
        </div>

        {/* Subtitle / Date */}
        {(d.subtitle || d.date) && (
          <div style={{
            fontSize: 22,
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.45,
          }}>
            {d.subtitle && <div>{d.subtitle}</div>}
            {d.date && <div style={{ fontWeight: 700 }}>{d.date}</div>}
          </div>
        )}

        {/* Pills */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Days + Time */}
          {(d.days || d.time) && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {d.days && (
                <div style={{
                  border: "2.5px solid white",
                  borderRadius: 999,
                  padding: "9px 24px",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "0.04em",
                }}>
                  {d.days}
                </div>
              )}
              {d.time && (
                <div style={{
                  background: BRAND.red,
                  borderRadius: 999,
                  padding: "9px 24px",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <span>⏰</span>
                  {d.time}
                </div>
              )}
            </div>
          )}

          {/* Professor */}
          {d.professor && (
            <div style={{
              background: "rgba(255,255,255,0.08)",
              border: "2px solid rgba(255,255,255,0.15)",
              borderRadius: 999,
              padding: "9px 24px",
              fontSize: 18,
              fontWeight: 800,
              color: BRAND.red,
              letterSpacing: "0.04em",
              display: "inline-flex",
              alignSelf: "flex-start",
            }}>
              {d.professor}
            </div>
          )}

          {/* Location + CTA */}
          {(d.unidade || d.ctaText) && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {d.unidade && (
                <div style={{
                  border: "2.5px solid white",
                  borderRadius: 999,
                  padding: "9px 22px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  letterSpacing: "0.04em",
                }}>
                  📍 {d.unidade}
                </div>
              )}
              {d.ctaText && (
                <div style={{
                  background: BRAND.red,
                  borderRadius: 999,
                  padding: "9px 28px",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "0.06em",
                }}>
                  {d.ctaText}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FLEX banner */}
      <FlexBanner width={W} height={bannerH} />
    </div>
  );
}

// ── Template: Schedule Grid (1280 × 720) ─────────────────────────────────────

interface ScheduleRow {
  id: string;
  professor: string;
  time: string;
  modalidade: string;
}

const MODALIDADE_ICON: Record<string, string> = {
  HIIT: "🏋",
  "CICLISMO INDOOR": "🚴",
  FUNCIONAL: "💪",
  YOGA: "🧘",
  PILATES: "🤸",
  SPINNING: "🚲",
  MUSCULAÇÃO: "🏋",
  CROSSFIT: "⚡",
  ZUMBA: "💃",
  BOXE: "🥊",
  ALONGAMENTO: "🙆",
  NATAÇÃO: "🏊",
};

const MODALIDADES = Object.keys(MODALIDADE_ICON);

interface ScheduleData {
  date: string;
  unidade: string;
  rows: ScheduleRow[];
}

function ScheduleGridTemplate({ d }: { d: ScheduleData }) {
  const W = 1280;
  const H = 720;
  const rowCount = d.rows.length;
  const pillPy = rowCount > 8 ? 6 : rowCount > 6 ? 9 : 11;
  const fs = rowCount > 8 ? 15 : rowCount > 6 ? 17 : 19;

  return (
    <div
      id="template-render"
      style={{
        width: W,
        height: H,
        background: BRAND.navy,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Nunito', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: "44px 56px",
        boxSizing: "border-box",
      }}
    >
      {/* Glow */}
      <div style={{
        position: "absolute", right: -100, top: -100, width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(80,50,220,0.25) 0%, transparent 68%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, position: "relative", zIndex: 1 }}>
        <XLogo size={64} />
        <h1 style={{ fontSize: 36, fontWeight: 900, color: "white", margin: 0, flex: 1 }}>
          Escalas de final de semana coletivas
        </h1>
        {d.unidade && (
          <div style={{
            background: "rgba(13,10,58,0.95)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding: "10px 22px",
            fontSize: 13,
            fontWeight: 700,
            color: "white",
            whiteSpace: "nowrap",
            letterSpacing: "0.05em",
          }}>
            📍 {d.unidade}
          </div>
        )}
      </div>

      {/* Card */}
      <div style={{
        background: "#EAEBF2",
        borderRadius: 20,
        padding: "18px 28px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: rowCount > 7 ? 6 : 9,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}>
        {/* Date */}
        <div style={{
          background: "white",
          borderRadius: 999,
          padding: "9px 28px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 2,
        }}>
          <span style={{ fontSize: 20 }}>📅</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: BRAND.blue, letterSpacing: "0.04em" }}>
            {d.date || "DOMINGO - 22 MARÇO"}
          </span>
        </div>

        {/* Rows */}
        {d.rows.map((row) => (
          <div key={row.id} style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
          }}>
            <div style={{
              background: BRAND.blue, borderRadius: 999,
              padding: `${pillPy}px 22px`,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
            }}>
              <span style={{ fontSize: fs, fontWeight: 800, color: "white", letterSpacing: "0.02em" }}>
                {row.professor}
              </span>
              <XMark size={fs + 2} />
            </div>
            <div style={{
              background: BRAND.red, borderRadius: 999,
              padding: `${pillPy}px 22px`,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: fs - 1 }}>⏰</span>
              <span style={{ fontSize: fs, fontWeight: 800, color: "white", letterSpacing: "0.06em" }}>
                {row.time}
              </span>
            </div>
            <div style={{
              background: "white", borderRadius: 999,
              padding: `${pillPy}px 22px`,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: fs - 1 }}>{MODALIDADE_ICON[row.modalidade] ?? "🏋"}</span>
              <span style={{ fontSize: fs, fontWeight: 800, color: BRAND.red, letterSpacing: "0.02em" }}>
                {row.modalidade}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Export to PNG ─────────────────────────────────────────────────────────────

async function exportToPng(element: HTMLElement, filename: string) {
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(element, {
    useCORS: true,
    allowTaint: true,
    scale: 1,
    logging: false,
    backgroundColor: null,
  });
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ── CSV parser for schedule ───────────────────────────────────────────────────

function parseCsv(text: string): ScheduleRow[] {
  const lines = text.trim().split("\n").filter(Boolean);
  return lines.map((line, i) => {
    // Support semicolon or comma separated
    const parts = line.split(/[;,\t]/).map((p) => p.trim().replace(/^"|"$/g, ""));
    return {
      id: String(i + 1),
      professor: (parts[0] ?? "").toUpperCase(),
      time: (parts[1] ?? "").toUpperCase(),
      modalidade: (parts[2] ?? "HIIT").toUpperCase(),
    };
  });
}

// ── Main Studio ───────────────────────────────────────────────────────────────

type TemplateType = "story" | "feed" | "schedule";

const DEFAULT_EVENT: StoryData & FeedData = {
  photoUrl: "",
  handle: "@flexfitnesscenter",
  title: "AULA BOXE",
  subtitle: "Com a Professora Júlia Barros",
  date: "A partir do dia 17/03.",
  days: "TERÇAS E QUINTAS",
  time: "16H00",
  professor: "PROF. JÚLIA BARROS",
  unidade: "UNIDADE BUENA VISTA",
  ctaText: "PARTICIPE",
  badge: "NOVA AULA",
};

const DEFAULT_SCHEDULE: ScheduleData = {
  date: "DOMINGO - 22 MARÇO",
  unidade: "UNIDADE BUENA VISTA",
  rows: [
    { id: "1", professor: "PROF. FRAN", time: "08H00", modalidade: "HIIT" },
    { id: "2", professor: "PROF. FRAN", time: "09H00", modalidade: "HIIT" },
    { id: "3", professor: "PROF. FRAN", time: "10H00", modalidade: "HIIT" },
    { id: "4", professor: "PROF. EDY", time: "10H00", modalidade: "CICLISMO INDOOR" },
    { id: "5", professor: "PROF. EDY", time: "11H00", modalidade: "CICLISMO INDOOR" },
    { id: "6", professor: "PROF. FRAN", time: "11H00", modalidade: "HIIT" },
    { id: "7", professor: "PROF. FRAN", time: "12H00", modalidade: "HIIT" },
  ],
};

export default function TemplateStudio() {
  const [type, setType] = useState<TemplateType>("story");
  const [eventData, setEventData] = useState<StoryData & FeedData>(DEFAULT_EVENT);
  const [scheduleData, setScheduleData] = useState<ScheduleData>(DEFAULT_SCHEDULE);
  const [exporting, setExporting] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [showCsvModal, setShowCsvModal] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const renderRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  // Dimensions per type
  const dims = type === "story" ? { w: 1080, h: 1920 } : { w: 1280, h: 720 };

  useEffect(() => {
    const update = () => {
      if (previewRef.current) {
        const containerW = previewRef.current.clientWidth;
        const containerH = previewRef.current.clientHeight;
        const scaleW = containerW / dims.w;
        const scaleH = containerH / dims.h;
        setScale(Math.min(scaleW, scaleH));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (previewRef.current) ro.observe(previewRef.current);
    return () => ro.disconnect();
  }, [dims.w, dims.h, type]);

  // Photo upload
  const handlePhotoUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEventData((prev) => ({ ...prev, photoUrl: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }, []);

  const updateEvent = useCallback(<K extends keyof (StoryData & FeedData)>(
    key: K,
    value: (StoryData & FeedData)[K]
  ) => {
    setEventData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Schedule row ops
  const addRow = () =>
    setScheduleData((prev) => ({
      ...prev,
      rows: [...prev.rows, { id: Date.now().toString(), professor: "PROF. NOME", time: "08H00", modalidade: "HIIT" }],
    }));
  const removeRow = (id: string) =>
    setScheduleData((prev) => ({ ...prev, rows: prev.rows.filter((r) => r.id !== id) }));
  const updateRow = (id: string, field: keyof ScheduleRow, value: string) =>
    setScheduleData((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    }));

  // CSV import
  const importCsv = () => {
    const parsed = parseCsv(csvText);
    if (parsed.length) {
      setScheduleData((prev) => ({ ...prev, rows: parsed }));
      setShowCsvModal(false);
      setCsvText("");
    }
  };

  // Export
  const handleExport = async () => {
    if (!renderRef.current) return;
    setExporting(true);
    try {
      const el = renderRef.current.querySelector("#template-render") as HTMLElement;
      if (!el) return;
      const names: Record<TemplateType, string> = {
        story: "story-divulgacao.png",
        feed: "feed-anuncio.png",
        schedule: "escala.png",
      };
      await exportToPng(el, names[type]);
    } finally {
      setExporting(false);
    }
  };

  const TABS: { id: TemplateType; label: string; icon: JSX.Element }[] = [
    { id: "story", label: "Story (9:16)", icon: <Smartphone size={14} /> },
    { id: "feed", label: "Feed (16:9)", icon: <Monitor size={14} /> },
    { id: "schedule", label: "Escala", icon: <CalendarDays size={14} /> },
  ];

  const isEvent = type === "story" || type === "feed";

  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg-page)", padding: "24px 16px 48px" }}>

      {/* Hidden full-res render for export */}
      <div
        ref={renderRef}
        style={{ position: "fixed", top: 0, left: "-9999px", zIndex: -1, pointerEvents: "none" }}
        aria-hidden="true"
      >
        {type === "story" && <StoryTemplate d={eventData} />}
        {type === "feed" && <FeedTemplate d={eventData} />}
        {type === "schedule" && <ScheduleGridTemplate d={scheduleData} />}
      </div>

      {/* CSV Modal */}
      {showCsvModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div className="card-elevated" style={{ width: 560, maxWidth: "95vw" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Importar CSV / Planilha</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCsvModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
              Cole os dados da sua planilha (Excel, Sheets). Cada linha deve conter: <code>PROFESSOR; HORÁRIO; MODALIDADE</code>
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, background: "var(--surface)", padding: "8px 12px", borderRadius: 6, fontFamily: "monospace" }}>
              PROF. FRAN; 08H00; HIIT<br />
              PROF. EDY; 10H00; CICLISMO INDOOR<br />
              PROF. FRAN; 11H00; HIIT
            </p>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Cole aqui..."
              rows={8}
              style={{ width: "100%", resize: "vertical", fontFamily: "monospace", fontSize: 13 }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setShowCsvModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={importCsv} disabled={!csvText.trim()}>
                Importar {csvText.trim() ? `(${parseCsv(csvText).length} linhas)` : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href="/" className="btn btn-ghost btn-sm">
            <ArrowLeft size={15} />
            Studio
          </Link>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Template Studio
            </h1>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
              Crie posts com as fotos e a identidade da academia
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleExport} disabled={exporting}>
            <Download size={15} />
            {exporting ? "Exportando…" : "Baixar PNG"}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`btn btn-sm ${type === t.id ? "btn-primary" : "btn-ghost"}`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Photo upload (event templates) */}
            {isEvent && (
              <div className="card-elevated">
                <p className="section-label">Foto da academia</p>
                <label style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 8, padding: 20, border: "2px dashed var(--border)",
                  borderRadius: "var(--radius-md)", cursor: "pointer",
                  background: eventData.photoUrl ? "transparent" : "var(--surface)",
                  position: "relative", overflow: "hidden", minHeight: 100,
                }}>
                  {eventData.photoUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={eventData.photoUrl}
                        alt="Preview da foto"
                        style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }}
                      />
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Clique para trocar</span>
                    </>
                  ) : (
                    <>
                      <Upload size={24} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
                        Clique para enviar foto<br />
                        <span style={{ fontSize: 11 }}>JPG, PNG, WEBP</span>
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                  />
                </label>
              </div>
            )}

            {/* Event fields */}
            {isEvent && (
              <div className="card-elevated">
                <p className="section-label">Conteúdo</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { key: "handle" as const, label: "@Handle", placeholder: "@flexfitnesscenter" },
                    { key: "badge" as const, label: "Badge (ex: NOVA AULA)", placeholder: "NOVA AULA" },
                    { key: "title" as const, label: "Título principal *", placeholder: "AULA BOXE" },
                    { key: "subtitle" as const, label: "Subtítulo", placeholder: "Com a Professora Júlia Barros" },
                    { key: "date" as const, label: "Data/vigência", placeholder: "A partir do dia 17/03." },
                    { key: "days" as const, label: "Dias", placeholder: "TERÇAS E QUINTAS" },
                    { key: "time" as const, label: "Horário", placeholder: "16H00" },
                    { key: "professor" as const, label: "Professor(a)", placeholder: "PROF. JÚLIA BARROS" },
                    { key: "unidade" as const, label: "Unidade", placeholder: "UNIDADE BUENA VISTA" },
                    { key: "ctaText" as const, label: "Botão CTA", placeholder: "PARTICIPE" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="label">{label}</label>
                      <input
                        value={eventData[key]}
                        onChange={(e) => updateEvent(key, e.target.value)}
                        placeholder={placeholder}
                        style={{ fontSize: 13 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule fields */}
            {type === "schedule" && (
              <>
                <div className="card-elevated">
                  <p className="section-label">Informações gerais</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label className="label">Data</label>
                      <input
                        value={scheduleData.date}
                        onChange={(e) => setScheduleData((p) => ({ ...p, date: e.target.value.toUpperCase() }))}
                        placeholder="DOMINGO - 22 MARÇO"
                        style={{ fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label className="label">Unidade</label>
                      <input
                        value={scheduleData.unidade}
                        onChange={(e) => setScheduleData((p) => ({ ...p, unidade: e.target.value.toUpperCase() }))}
                        placeholder="UNIDADE BUENA VISTA"
                        style={{ fontSize: 13 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="card-elevated">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <p className="section-label" style={{ margin: 0 }}>
                      Horários ({scheduleData.rows.length})
                    </p>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => setShowCsvModal(true)}>
                        <FileText size={12} />
                        CSV
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={addRow}>
                        <Plus size={12} />
                        Add
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 380, overflowY: "auto" }}>
                    {scheduleData.rows.map((row, idx) => (
                      <div
                        key={row.id}
                        style={{
                          padding: "8px 10px",
                          borderRadius: "var(--radius-md)",
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 5,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>#{idx + 1}</span>
                          <button
                            className="btn btn-icon btn-ghost"
                            onClick={() => removeRow(row.id)}
                            style={{ width: 20, height: 20 }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                        <input
                          value={row.professor}
                          onChange={(e) => updateRow(row.id, "professor", e.target.value.toUpperCase())}
                          placeholder="PROF. NOME"
                          style={{ fontSize: 12, padding: "5px 9px" }}
                        />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                          <input
                            value={row.time}
                            onChange={(e) => updateRow(row.id, "time", e.target.value.toUpperCase())}
                            placeholder="08H00"
                            style={{ fontSize: 12, padding: "5px 9px" }}
                          />
                          <select
                            value={row.modalidade}
                            onChange={(e) => updateRow(row.id, "modalidade", e.target.value)}
                            style={{ fontSize: 12, padding: "5px 9px" }}
                          >
                            {MODALIDADES.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                            {!MODALIDADES.includes(row.modalidade) && (
                              <option value={row.modalidade}>{row.modalidade}</option>
                            )}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Preview */}
          <div>
            <p className="section-label" style={{ marginBottom: 10 }}>
              Preview em tempo real — {dims.w}×{dims.h}px
            </p>
            <div
              ref={previewRef}
              style={{
                width: "100%",
                aspectRatio: type === "story" ? "9/16" : "16/9",
                position: "relative",
                overflow: "hidden",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
                background: BRAND.navy,
                maxHeight: type === "story" ? 680 : undefined,
                margin: "0 auto",
                maxWidth: type === "story" ? 383 : undefined,
              }}
            >
              <div style={{
                width: dims.w,
                height: dims.h,
                transformOrigin: "top left",
                transform: `scale(${scale})`,
                position: "absolute",
                top: 0,
                left: 0,
              }}>
                {type === "story" && <StoryTemplate d={eventData} />}
                {type === "feed" && <FeedTemplate d={eventData} />}
                {type === "schedule" && <ScheduleGridTemplate d={scheduleData} />}
              </div>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}>
              Clique em "Baixar PNG" para exportar em alta resolução
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
