"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Trash2, ArrowLeft, Printer } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface ScheduleRow {
  id: string;
  professor: string;
  time: string;
  modalidade: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const MODALIDADES = [
  "HIIT",
  "CICLISMO INDOOR",
  "FUNCIONAL",
  "YOGA",
  "PILATES",
  "SPINNING",
  "MUSCULAÇÃO",
  "CROSSFIT",
  "ZUMBA",
  "ALONGAMENTO",
];

const MODALIDADE_ICON: Record<string, string> = {
  "HIIT": "🏋",
  "CICLISMO INDOOR": "🚴",
  "FUNCIONAL": "💪",
  "YOGA": "🧘",
  "PILATES": "🤸",
  "SPINNING": "🚲",
  "MUSCULAÇÃO": "🏋",
  "CROSSFIT": "⚡",
  "ZUMBA": "💃",
  "ALONGAMENTO": "🙆",
};

const DEFAULT_ROWS: ScheduleRow[] = [
  { id: "1", professor: "PROF. FRAN", time: "08H00", modalidade: "HIIT" },
  { id: "2", professor: "PROF. FRAN", time: "09H00", modalidade: "HIIT" },
  { id: "3", professor: "PROF. FRAN", time: "10H00", modalidade: "HIIT" },
  { id: "4", professor: "PROF. EDY", time: "10H00", modalidade: "CICLISMO INDOOR" },
  { id: "5", professor: "PROF. EDY", time: "11H00", modalidade: "CICLISMO INDOOR" },
  { id: "6", professor: "PROF. FRAN", time: "11H00", modalidade: "HIIT" },
  { id: "7", professor: "PROF. FRAN", time: "12H00", modalidade: "HIIT" },
];

// ── SVG: X Brand logo ──────────────────────────────────────────────────────

function XBrandLogo({ size = 64 }: { size?: number }) {
  const half = size / 2;
  const band = size * 0.21;
  const ext = size * 0.12;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0 }}
    >
      <rect width={size} height={size} rx={size * 0.14} fill="#020036" />
      {/* White band (bottom-left → top-right) */}
      <rect
        x={-ext}
        y={half - band / 2}
        width={size + ext * 2}
        height={band}
        rx={band * 0.45}
        fill="white"
        transform={`rotate(45 ${half} ${half})`}
      />
      {/* Red band (top-left → bottom-right) */}
      <rect
        x={-ext}
        y={half - band / 2}
        width={size + ext * 2}
        height={band}
        rx={band * 0.45}
        fill="#E30613"
        transform={`rotate(-45 ${half} ${half})`}
      />
    </svg>
  );
}

// ── SVG: X mark (inside professor pill) ───────────────────────────────────

function XMark({ size = 22 }: { size?: number }) {
  const half = size / 2;
  const band = size * 0.26;
  const ext = size * 0.12;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0 }}
    >
      <rect
        x={-ext}
        y={half - band / 2}
        width={size + ext * 2}
        height={band}
        rx={band * 0.45}
        fill="white"
        transform={`rotate(45 ${half} ${half})`}
      />
      <rect
        x={-ext}
        y={half - band / 2}
        width={size + ext * 2}
        height={band}
        rx={band * 0.45}
        fill="#E30613"
        transform={`rotate(-45 ${half} ${half})`}
      />
    </svg>
  );
}

// ── Template (1280×720 fixed canvas) ──────────────────────────────────────

function ScheduleTemplate({
  date,
  unidade,
  rows,
}: {
  date: string;
  unidade: string;
  rows: ScheduleRow[];
}) {
  // Dynamic font sizes based on row count
  const rowCount = rows.length;
  const pillPy = rowCount > 8 ? 7 : rowCount > 6 ? 9 : 11;
  const fontSize = rowCount > 8 ? 16 : rowCount > 6 ? 17 : 19;
  const rowGap = rowCount > 8 ? 5 : rowCount > 6 ? 7 : 9;

  return (
    <div
      id="schedule-template"
      style={{
        width: 1280,
        height: 720,
        background: "#020036",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Nunito', 'DM Sans', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: "44px 56px",
        boxSizing: "border-box",
      }}
    >
      {/* Background glow — upper right */}
      <div
        style={{
          position: "absolute",
          right: -100,
          top: -100,
          width: 550,
          height: 550,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(80, 50, 220, 0.28) 0%, transparent 68%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 28,
          position: "relative",
          zIndex: 1,
        }}
      >
        <XBrandLogo size={66} />

        <h1
          style={{
            fontSize: 38,
            fontWeight: 900,
            color: "white",
            margin: 0,
            flex: 1,
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
          }}
        >
          Escalas de final de semana coletivas
        </h1>

        {/* Location badge */}
        <div
          style={{
            background: "rgba(13, 10, 58, 0.95)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding: "10px 22px",
            fontSize: 14,
            fontWeight: 700,
            color: "white",
            whiteSpace: "nowrap",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          📍 {unidade}
        </div>
      </div>

      {/* Main card */}
      <div
        style={{
          background: "#EAEBF2",
          borderRadius: 20,
          padding: "20px 28px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: rowGap,
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        {/* Date header */}
        <div
          style={{
            background: "white",
            borderRadius: 999,
            padding: "10px 28px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 2,
          }}
        >
          <span style={{ fontSize: 22 }}>📅</span>
          <span
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#1F2BFF",
              letterSpacing: "0.04em",
            }}
          >
            {date}
          </span>
        </div>

        {/* Rows */}
        {rows.map((row) => (
          <div
            key={row.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              alignItems: "stretch",
            }}
          >
            {/* Professor */}
            <div
              style={{
                background: "#1F2BFF",
                borderRadius: 999,
                padding: `${pillPy}px 22px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize,
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "0.02em",
                }}
              >
                {row.professor}
              </span>
              <XMark size={fontSize + 2} />
            </div>

            {/* Time */}
            <div
              style={{
                background: "#E30613",
                borderRadius: 999,
                padding: `${pillPy}px 22px`,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: fontSize - 1 }}>⏰</span>
              <span
                style={{
                  fontSize,
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "0.06em",
                }}
              >
                {row.time}
              </span>
            </div>

            {/* Modalidade */}
            <div
              style={{
                background: "white",
                borderRadius: 999,
                padding: `${pillPy}px 22px`,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: fontSize - 1 }}>
                {MODALIDADE_ICON[row.modalidade] ?? "🏋"}
              </span>
              <span
                style={{
                  fontSize,
                  fontWeight: 800,
                  color: "#E30613",
                  letterSpacing: "0.02em",
                }}
              >
                {row.modalidade}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function EscalaTemplatePage() {
  const [date, setDate] = useState("DOMINGO - 22 MARÇO");
  const [unidade, setUnidade] = useState("UNIDADE BUENA VISTA");
  const [rows, setRows] = useState<ScheduleRow[]>(DEFAULT_ROWS);

  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const update = () => {
      if (previewRef.current) {
        setScale(previewRef.current.clientWidth / 1280);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (previewRef.current) ro.observe(previewRef.current);
    return () => ro.disconnect();
  }, []);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: Date.now().toString(), professor: "PROF. NOME", time: "08H00", modalidade: "HIIT" },
    ]);
  };

  const removeRow = (id: string) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const updateRow = useCallback(
    (id: string, field: keyof ScheduleRow, value: string) =>
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
      ),
    []
  );

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--bg-page)",
        padding: "24px 16px 48px",
      }}
    >
      {/* Print styles */}
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .print-template {
            display: block !important;
            position: fixed;
            top: 0; left: 0;
            width: 1280px;
            height: 720px;
          }
        }
        .print-template { display: none; }
      `}</style>

      {/* Hidden full-res template for print */}
      <div className="print-template" aria-hidden="true">
        <ScheduleTemplate date={date} unidade={unidade} rows={rows} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto" }} className="no-print">
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 28,
          }}
        >
          <Link
            href="/"
            className="btn btn-ghost btn-sm"
            aria-label="Voltar para o Studio"
          >
            <ArrowLeft size={15} />
            Studio
          </Link>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 20,
                fontWeight: 800,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              Template — Escala de Aulas
            </h1>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
              Preencha os dados, visualize em tempo real e exporte
            </p>
          </div>
          <button onClick={() => window.print()} className="btn btn-primary">
            <Printer size={15} />
            Exportar / Imprimir
          </button>
        </div>

        {/* Grid: form (left) + preview (right) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* ── Form panel ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Meta */}
            <div className="card-elevated">
              <p className="section-label">Informações gerais</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label htmlFor="tpl-date" className="label">
                    Data
                  </label>
                  <input
                    id="tpl-date"
                    value={date}
                    onChange={(e) => setDate(e.target.value.toUpperCase())}
                    placeholder="DOMINGO - 22 MARÇO"
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div>
                  <label htmlFor="tpl-unidade" className="label">
                    Unidade
                  </label>
                  <input
                    id="tpl-unidade"
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value.toUpperCase())}
                    placeholder="UNIDADE BUENA VISTA"
                    style={{ fontSize: 13 }}
                  />
                </div>
              </div>
            </div>

            {/* Rows */}
            <div className="card-elevated">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <p className="section-label" style={{ margin: 0 }}>
                  Horários ({rows.length})
                </p>
                <button onClick={addRow} className="btn btn-sm btn-secondary">
                  <Plus size={13} />
                  Adicionar
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: 440,
                  overflowY: "auto",
                }}
              >
                {rows.map((row, idx) => (
                  <div
                    key={row.id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          fontWeight: 600,
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <button
                        onClick={() => removeRow(row.id)}
                        className="btn btn-icon btn-ghost"
                        aria-label={`Remover linha ${idx + 1}`}
                        style={{ width: 22, height: 22, borderRadius: 5 }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>

                    <input
                      value={row.professor}
                      onChange={(e) =>
                        updateRow(row.id, "professor", e.target.value.toUpperCase())
                      }
                      placeholder="PROF. NOME"
                      aria-label={`Professor linha ${idx + 1}`}
                      style={{ fontSize: 12, padding: "6px 10px" }}
                    />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 6,
                      }}
                    >
                      <input
                        value={row.time}
                        onChange={(e) =>
                          updateRow(row.id, "time", e.target.value.toUpperCase())
                        }
                        placeholder="08H00"
                        aria-label={`Horário linha ${idx + 1}`}
                        style={{ fontSize: 12, padding: "6px 10px" }}
                      />
                      <select
                        value={row.modalidade}
                        onChange={(e) =>
                          updateRow(row.id, "modalidade", e.target.value)
                        }
                        aria-label={`Modalidade linha ${idx + 1}`}
                        style={{ fontSize: 12, padding: "6px 10px" }}
                      >
                        {MODALIDADES.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
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

            {/* Export instructions */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                background: "var(--info-bg)",
                border: "1px solid rgba(96,165,250,0.15)",
                fontSize: 12,
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: "var(--info)", display: "block", marginBottom: 4 }}>
                Como exportar:
              </strong>
              1. Clique em Exportar / Imprimir<br />
              2. Selecione &quot;Salvar como PDF&quot;<br />
              3. Ou tire um print do preview ao lado
            </div>
          </div>

          {/* ── Preview panel ── */}
          <div>
            <p className="section-label" style={{ marginBottom: 10 }}>
              Preview em tempo real — 1280×720px
            </p>
            <div
              ref={previewRef}
              style={{
                width: "100%",
                aspectRatio: "16/9",
                position: "relative",
                overflow: "hidden",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
                background: "#020036",
              }}
            >
              <div
                style={{
                  width: 1280,
                  height: 720,
                  transformOrigin: "top left",
                  transform: `scale(${scale})`,
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              >
                <ScheduleTemplate date={date} unidade={unidade} rows={rows} />
              </div>
            </div>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Exportar → Salvar como PDF → abrir o PDF → Print Screen para PNG
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
