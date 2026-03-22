"use client";

import { useState, useRef, useEffect, useCallback, ChangeEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Download, Sparkles, X, RefreshCw, ChevronLeft, ChevronRight, Shuffle, LayoutPanelLeft, Columns2, Maximize2, ImageIcon, AlignCenter, CalendarRange } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LayoutSpec } from "@/app/api/template/generate/route";

// ─── Brand ───────────────────────────────────────────────────────────────────

const B = {
  navy: "#020036",
  navyDeep: "#06040A",
  card: "rgba(8, 4, 42, 0.94)",
  blue: "#1F2BFF",
  red: "#E30613",
};

// ─── SVG Primitives ───────────────────────────────────────────────────────────

/**
 * Brand X mark — two crossing diagonal bars (white / and red \) on transparent bg.
 * SVG viewport clips the bar ends naturally, creating clean diagonal tips.
 * drop-shadow is applied by the caller when needed for contrast.
 */
function XMark({ size = 56, redColor = B.red }: { size?: number; redColor?: string }) {
  const cx = size / 2, cy = size / 2;
  // len > size so bars reach corner-to-corner and get cleanly clipped by viewport
  const len = size * 1.5;
  const bw = size * 0.235;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0, overflow: "hidden" }}
    >
      {/* White arm: bottom-left → top-right */}
      <rect x={(size - len) / 2} y={cy - bw / 2} width={len} height={bw}
        fill="white" transform={`rotate(45 ${cx} ${cy})`} />
      {/* Red arm: top-left → bottom-right (drawn on top) */}
      <rect x={(size - len) / 2} y={cy - bw / 2} width={len} height={bw}
        fill={redColor} transform={`rotate(-45 ${cx} ${cy})`} />
    </svg>
  );
}

/** Large faint X watermark for backgrounds */
function XWatermark({ size = 600, opacity = 0.05 }: { size?: number; opacity?: number }) {
  const cx = size / 2, cy = size / 2;
  const len = size * 1.5;
  const bw = size * 0.235;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}
      style={{ display: "block", opacity, pointerEvents: "none", overflow: "hidden" }}>
      <rect x={(size - len) / 2} y={cy - bw / 2} width={len} height={bw}
        fill="white" transform={`rotate(45 ${cx} ${cy})`} />
      <rect x={(size - len) / 2} y={cy - bw / 2} width={len} height={bw}
        fill="white" transform={`rotate(-45 ${cx} ${cy})`} />
    </svg>
  );
}

/**
 * Brand X logo — uses the real PNG file from /logos/logo-x.png when available.
 * Falls back to the SVG approximation if the file hasn't been saved yet.
 * Use this for all header/corner logo positions.
 */
function XCornerLogo({ size = 60 }: { size?: number }) {
  const [useSvg, setUseSvg] = useState(false);

  if (!useSvg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/logos/logo-x.png"
        alt="Flex"
        width={size}
        height={size}
        style={{ display: "block", flexShrink: 0, objectFit: "contain" }}
        onError={() => setUseSvg(true)}
      />
    );
  }

  // SVG fallback until PNG is placed in public/logos/logo-x.png
  return (
    <div style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.7))", flexShrink: 0 }}>
      <XMark size={size} />
    </div>
  );
}

/** Diagonal FLEX ribbon banner — "FLEX[x] • FLEX[x] •" italic, X snug against FLEX */
function DiagonalFlexBanner({ width, height = 116 }: { width: number; height?: number }) {
  const stripH = Math.round(height / 3.1);
  const angle = -6.5;
  const extra = width * 0.14;
  const totalW = width + extra * 2;
  const fs = Math.round(stripH * 0.52);   // text height
  const xSz = Math.round(fs * 0.72);       // X mark ~72% of text size — small accent
  const gap = Math.round(fs * 0.6);        // gap between units (before FLEX)
  // Approximate pixels per unit to compute repeat count
  const unitW = fs * 3.0 + xSz + gap;
  const repeat = Math.ceil(totalW / unitW) + 4;

  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, width, height, overflow: "hidden" }}>
      {[0, 1, 2].map((si) => (
        <div
          key={si}
          style={{
            position: "absolute",
            top: si * (stripH * 0.96),
            left: -extra,
            width: totalW,
            height: stripH,
            background: B.navyDeep,
            transform: `rotate(${angle}deg)`,
            transformOrigin: "center center",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {Array.from({ length: repeat }, (_, ri) => (
            <span key={ri} style={{ display: "inline-flex", alignItems: "center", flexShrink: 0, marginLeft: gap }}>
              {/* "FLEX" in bold italic */}
              <span style={{
                color: "white",
                fontWeight: 900,
                fontStyle: "italic",
                fontSize: fs,
                letterSpacing: "0.05em",
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1,
              }}>
                FLEX
              </span>
              {/* X mark — snug against FLEX, same crossing-bars style */}
              <XMark size={xSz} redColor={B.red} />
              {/* Bullet separator */}
              <span style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: Math.round(fs * 0.55),
                marginLeft: Math.round(gap * 0.45),
                lineHeight: 1,
              }}>
                •
              </span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Pill component ───────────────────────────────────────────────────────────

type PillVariant = "outline-blue" | "outline-white" | "red" | "blue" | "white-red" | "dark";

function Pill({ text, variant, icon, fs = 30, py = 18, px }: {
  text: string; variant: PillVariant; icon?: string; fs?: number; py?: number; px?: number;
}) {
  const _px = px ?? Math.round(py * 2.2);
  const map: Record<PillVariant, { bg: string; border: string; color: string }> = {
    "outline-blue":  { bg: "transparent", border: "2.5px solid white", color: B.blue },
    "outline-white": { bg: "transparent", border: "2.5px solid white", color: "white" },
    "red":           { bg: B.red,  border: "none", color: "white" },
    "blue":          { bg: B.blue, border: "none", color: "white" },
    "white-red":     { bg: "white", border: "none", color: B.red },
    "dark":          { bg: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.15)", color: B.red },
  };
  const st = map[variant];
  return (
    <div style={{ background: st.bg, border: st.border, borderRadius: 999, padding: `${py}px ${_px}px`, fontSize: fs, fontWeight: 800, color: st.color, letterSpacing: "0.04em", display: "inline-flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
      {icon && <span style={{ fontSize: fs * 0.85 }}>{icon}</span>}
      {text}
    </div>
  );
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function titleFontSize(size: LayoutSpec["titleSize"], max: number, mid: number, min: number) {
  return size === "hero" ? max : size === "medium" ? mid : min;
}

function LocationPills({ locations, fs = 30, py = 18 }: { locations: string[]; fs?: number; py?: number }) {
  if (!locations?.length) return null;
  const perRow = locations.length <= 2 ? locations.length : 2;
  const rows: string[][] = [];
  for (let i = 0; i < locations.length; i += perRow) {
    rows.push(locations.slice(i, i + perRow));
  }
  return (
    <>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "flex-start" }}>
          {row.map((loc, li) => (
            <Pill key={li} text={`📍 ${loc}`} variant="blue" fs={fs} py={py} />
          ))}
        </div>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT 1 — feed-card-left (Glúteos / Jiu-Jitsu style)
// 1280×720 | Photo right, dark card left, X logo ABOVE card, X watermark bg
// ─────────────────────────────────────────────────────────────────────────────

function LayoutFeedCardLeft({ s, photo }: { s: LayoutSpec; photo: string }) {
  const W = 1280, H = 720, bannerH = 116, leftW = 600;
  const fs = titleFontSize(s.titleSize, 98, 80, 62);

  return (
    <div id="template-render" style={{ width: W, height: H, position: "relative", overflow: "hidden", fontFamily: "'Nunito', system-ui, sans-serif", background: B.navy }}>

      {/* Large X watermark — background */}
      <div style={{ position: "absolute", top: -60, left: -80, opacity: 0.055, pointerEvents: "none" }}>
        <XWatermark size={680} />
      </div>

      {/* Blue/purple glow — left edge */}
      <div style={{ position: "absolute", left: -120, top: 0, width: 360, height: H, background: "radial-gradient(ellipse at left, rgba(20,40,200,0.22) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Photo — right side */}
      <div style={{ position: "absolute", top: 0, right: 0, width: W - leftW + 70, height: H, background: "#111", backgroundImage: photo ? `url(${photo})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}>
        {/* Gradient blend into dark card */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 240, height: "100%", background: `linear-gradient(to right, ${B.navy}, transparent)` }} />
      </div>

      {/* Left column — floating elements + card */}
      <div style={{ position: "absolute", top: 0, left: 0, width: leftW, height: H - bannerH, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", padding: "0 44px", gap: 14, boxSizing: "border-box" }}>

        {/* X Logo — floats above card */}
        <XCornerLogo size={72} />

        {/* Badge — floats above card */}
        {s.badge && (
          <div style={{ background: "rgba(14,10,46,0.92)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 999, padding: "9px 28px", fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.08em" }}>
            {s.badge}
          </div>
        )}

        {/* Dark card */}
        <div style={{ background: B.card, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "26px 30px", width: "100%", display: "flex", flexDirection: "column", gap: 14, boxSizing: "border-box" }}>

          {/* Title */}
          <div style={{ fontSize: fs, fontWeight: 900, color: "white", lineHeight: 0.95, letterSpacing: "-0.02em" }}>
            {s.title}
          </div>

          {/* Subtitle / Date */}
          {(s.subtitle || s.date) && (
            <div style={{ fontSize: 22, fontWeight: 400, color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>
              {s.subtitle && <div>{s.subtitle}</div>}
              {s.date && <div style={{ fontWeight: 700 }}>{s.date}</div>}
            </div>
          )}

          {/* Pills */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(s.days || s.time) && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {s.days && <Pill text={s.days} variant="outline-blue" fs={16} py={10} />}
                {s.time && <Pill text={s.time} variant="red" icon="🕐" fs={16} py={10} />}
              </div>
            )}
            {s.professor && (
              <Pill text={s.professor} variant="white-red" fs={18} py={10} />
            )}
            {(s.locations?.length > 0 || s.ctaText) && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {s.locations?.slice(0, 1).map((loc, i) => (
                  <Pill key={i} text={`📍 ${loc}`} variant="blue" fs={13} py={10} />
                ))}
                {s.ctaText && <Pill text={s.ctaText} variant="red" fs={15} py={10} />}
              </div>
            )}
          </div>
        </div>
      </div>

      <DiagonalFlexBanner width={W} height={bannerH} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT 2 — story-split (Flex Woman style)
// 1080×1920 | Photo top ~42%, FLEX diagonal divider, dark card section, FLEX bottom
// ─────────────────────────────────────────────────────────────────────────────

function LayoutStorySplit({ s, photo }: { s: LayoutSpec; photo: string }) {
  const W = 1080, H = 1920;
  const photoH = Math.round(H * 0.43);
  const midBannerH = 96;
  const bottomBannerH = 90;
  const cardH = H - photoH - midBannerH - bottomBannerH;
  const fs = titleFontSize(s.titleSize, 138, 112, 88);

  return (
    <div id="template-render" style={{ width: W, height: H, position: "relative", overflow: "hidden", fontFamily: "'Nunito', system-ui, sans-serif", background: B.navy }}>

      {/* Photo — top portion */}
      <div style={{ position: "absolute", top: 0, left: 0, width: W, height: photoH, background: "#111", backgroundImage: photo ? `url(${photo})` : undefined, backgroundSize: "cover", backgroundPosition: "center top" }}>
        {/* Dark bottom fade into FLEX banner */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 160, background: "linear-gradient(to bottom, transparent, rgba(6,4,10,0.9))" }} />

        {/* X logo top-left */}
        <div style={{ position: "absolute", top: 52, left: 52 }}>
          <XCornerLogo size={96} />
        </div>

        {/* @handle top-right */}
        <div style={{ position: "absolute", top: 66, right: 52, fontSize: 30, fontWeight: 700, color: "rgba(255,255,255,0.88)", letterSpacing: "0.01em" }}>
          @flexfitnesscenter
        </div>
      </div>

      {/* Middle FLEX diagonal banner — the divider */}
      <div style={{ position: "absolute", top: photoH, left: 0, width: W, height: midBannerH }}>
        <DiagonalFlexBanner width={W} height={midBannerH} />
      </div>

      {/* Card section */}
      <div style={{ position: "absolute", top: photoH + midBannerH, left: 0, width: W, height: cardH, background: B.navy, display: "flex", flexDirection: "column", justifyContent: "center", padding: "50px 68px", gap: 32, boxSizing: "border-box" }}>

        {/* X watermark behind card content */}
        <div style={{ position: "absolute", top: -80, right: -80, opacity: 0.045, pointerEvents: "none" }}>
          <XWatermark size={640} />
        </div>

        {/* Badge */}
        {s.badge && (
          <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, padding: "12px 36px", fontSize: 26, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.07em", alignSelf: "flex-start" }}>
            {s.badge}
          </div>
        )}

        {/* Title */}
        <div style={{ fontSize: fs, fontWeight: 900, color: "white", lineHeight: 1, letterSpacing: "-0.02em" }}>
          {s.title}
        </div>

        {/* Subtitle */}
        {(s.subtitle || s.date) && (
          <div style={{ fontSize: 42, fontWeight: 400, color: "rgba(255,255,255,0.88)", lineHeight: 1.35 }}>
            {s.subtitle && <div>{s.subtitle}</div>}
            {s.date && <div style={{ fontWeight: 700, marginTop: 6 }}>{s.date}</div>}
          </div>
        )}

        {/* Pills */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {(s.days || s.time) && (
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {s.days && <Pill text={s.days} variant="outline-blue" fs={30} py={16} />}
              {s.time && <Pill text={s.time} variant="red" icon="🕐" fs={30} py={16} />}
            </div>
          )}
          {s.professor && <Pill text={s.professor} variant="white-red" fs={34} py={16} />}
          {s.ctaText && (
            <div style={{ display: "flex" }}>
              <Pill text={s.ctaText} variant={s.accentColor === "blue" ? "blue" : "red"} fs={32} py={18} />
            </div>
          )}
          {/* Multiple locations */}
          {s.locations?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Two per row */}
              {s.locations.reduce<string[][]>((rows, loc, i) => {
                if (i % 2 === 0) rows.push([loc]);
                else rows[rows.length - 1].push(loc);
                return rows;
              }, []).map((row, ri) => (
                <div key={ri} style={{ display: "flex", gap: 18 }}>
                  {row.map((loc, li) => (
                    <Pill key={li} text={`📍 ${loc}`} variant="blue" fs={28} py={16} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom FLEX banner */}
      <div style={{ position: "absolute", bottom: 0, left: 0, width: W, height: bottomBannerH }}>
        <DiagonalFlexBanner width={W} height={bottomBannerH} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT 3 — story-full-bleed
// 1080×1920 | Photo fills 100%, gradient overlay, color accent stripe, text bottom
// ─────────────────────────────────────────────────────────────────────────────

function LayoutStoryFullBleed({ s, photo }: { s: LayoutSpec; photo: string }) {
  const W = 1080, H = 1920, bannerH = 130;
  const accent = s.accentColor === "blue" ? B.blue : B.red;
  const fs = titleFontSize(s.titleSize, 168, 134, 100);

  return (
    <div id="template-render" style={{ width: W, height: H, position: "relative", overflow: "hidden", fontFamily: "'Nunito', system-ui, sans-serif", background: "#111" }}>

      {/* Full photo */}
      {photo && (
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${photo})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      )}

      {/* Gradient overlays */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(2,0,54,0.6) 0%, transparent 35%, transparent 42%, rgba(2,0,54,0.9) 72%, rgba(2,0,54,0.99) 100%)" }} />

      {/* Left accent stripe */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 14, height: H - bannerH, background: accent }} />

      {/* Top: X logo + handle */}
      <div style={{ position: "absolute", top: 56, left: 64, right: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <XCornerLogo size={96} />
        <div style={{ fontSize: 30, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>@flexfitnesscenter</div>
      </div>

      {/* Bottom content */}
      <div style={{ position: "absolute", bottom: bannerH, left: 0, right: 0, padding: "0 80px 72px", display: "flex", flexDirection: "column", gap: 28 }}>
        {s.badge && (
          <div style={{ background: accent, borderRadius: 999, padding: "10px 30px", fontSize: 26, fontWeight: 700, color: "white", letterSpacing: "0.07em", display: "inline-flex", alignSelf: "flex-start" }}>
            {s.badge}
          </div>
        )}
        <div style={{ fontSize: fs, fontWeight: 900, color: "white", lineHeight: 1, letterSpacing: "-0.025em" }}>
          {s.title}
        </div>
        {(s.subtitle || s.date) && (
          <div style={{ fontSize: 42, fontWeight: 400, color: "rgba(255,255,255,0.9)", lineHeight: 1.38 }}>
            {s.subtitle && <div>{s.subtitle}</div>}
            {s.date && <div style={{ fontWeight: 700 }}>{s.date}</div>}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {(s.days || s.time) && (
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {s.days && <Pill text={s.days} variant="outline-white" fs={32} py={18} />}
              {s.time && <Pill text={s.time} variant="red" icon="🕐" fs={32} py={18} />}
            </div>
          )}
          {s.professor && <Pill text={s.professor} variant="dark" fs={36} py={18} />}
          {(s.ctaText || s.locations?.length > 0) && (
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              {s.ctaText && <Pill text={s.ctaText} variant={s.accentColor === "blue" ? "blue" : "red"} fs={34} py={20} />}
              {s.locations?.slice(0, 1).map((loc, i) => (
                <Pill key={i} text={`📍 ${loc}`} variant="outline-white" fs={30} py={18} />
              ))}
            </div>
          )}
        </div>
      </div>

      <DiagonalFlexBanner width={W} height={bannerH} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT 4 — story-photo-card (Aula Boxe style)
// 1080×1920 | Photo top 55%, rounded dark card bottom, handle + logo on photo
// ─────────────────────────────────────────────────────────────────────────────

function LayoutStoryPhotoCard({ s, photo }: { s: LayoutSpec; photo: string }) {
  const W = 1080, H = 1920, bannerH = 130, cardH = 820, photoH = H - cardH;
  const fs = titleFontSize(s.titleSize, 148, 118, 92);

  return (
    <div id="template-render" style={{ width: W, height: H, position: "relative", overflow: "hidden", fontFamily: "'Nunito', system-ui, sans-serif", background: B.navy }}>

      {/* Photo */}
      <div style={{ position: "absolute", top: 0, left: 0, width: W, height: photoH, background: "#111", backgroundImage: photo ? `url(${photo})` : undefined, backgroundSize: "cover", backgroundPosition: "center top" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 280, background: `linear-gradient(to bottom, transparent, ${B.navy})` }} />
        <div style={{ position: "absolute", top: 52, left: 52 }}><XCornerLogo size={96} /></div>
        <div style={{ position: "absolute", top: 66, right: 52, fontSize: 30, fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>@flexfitnesscenter</div>
      </div>

      {/* Card */}
      <div style={{ position: "absolute", bottom: bannerH, left: 0, width: W, height: cardH, background: "rgba(4, 2, 28, 0.97)", borderTopLeftRadius: 52, borderTopRightRadius: 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, padding: "52px 70px", boxSizing: "border-box" }}>

        {/* X watermark on card */}
        <div style={{ position: "absolute", right: -60, top: -60, opacity: 0.04, pointerEvents: "none" }}>
          <XWatermark size={520} />
        </div>

        {s.badge && (
          <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "12px 36px", fontSize: 26, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.08em" }}>
            {s.badge}
          </div>
        )}

        <div style={{ fontSize: fs, fontWeight: 900, color: "white", textAlign: "center", lineHeight: 1, letterSpacing: "-0.02em" }}>
          {s.title}
        </div>

        {(s.subtitle || s.date) && (
          <div style={{ fontSize: 40, fontWeight: 400, color: "rgba(255,255,255,0.88)", textAlign: "center", lineHeight: 1.4 }}>
            {s.subtitle && <div>{s.subtitle}</div>}
            {s.date && <div style={{ fontWeight: 700, marginTop: 6 }}>{s.date}</div>}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center", width: "100%" }}>
          {(s.days || s.time) && (
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center" }}>
              {s.days && <Pill text={s.days} variant="outline-blue" fs={32} py={18} />}
              {s.time && <Pill text={s.time} variant="red" icon="🕐" fs={32} py={18} />}
            </div>
          )}
          {s.professor && <Pill text={s.professor} variant="white-red" fs={36} py={18} />}
          {(s.ctaText || s.locations?.length > 0) && (
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center" }}>
              {s.ctaText && <Pill text={s.ctaText} variant={s.accentColor === "blue" ? "blue" : "red"} fs={34} py={22} />}
              {s.locations?.slice(0, 1).map((loc, i) => (
                <Pill key={i} text={`📍 ${loc}`} variant="outline-white" fs={30} py={18} />
              ))}
            </div>
          )}
        </div>
      </div>

      <DiagonalFlexBanner width={W} height={bannerH} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT 5 — feed-bold-text (no photo, geometric)
// 1280×720 | Bold typography, accent stripe, geometric X decorations, no photo
// ─────────────────────────────────────────────────────────────────────────────

function LayoutFeedBoldText({ s }: { s: LayoutSpec }) {
  const W = 1280, H = 720, bannerH = 116;
  const accent = s.accentColor === "blue" ? B.blue : B.red;
  const fs = titleFontSize(s.titleSize, 210, 158, 118);

  return (
    <div id="template-render" style={{ width: W, height: H, position: "relative", overflow: "hidden", fontFamily: "'Nunito', system-ui, sans-serif", background: B.navy }}>

      {/* Large X watermark — centered-right */}
      <div style={{ position: "absolute", right: -100, top: -80, opacity: 0.06, pointerEvents: "none" }}>
        <XWatermark size={700} />
      </div>

      {/* Geometric circle — bottom left */}
      <div style={{ position: "absolute", left: -80, bottom: bannerH - 20, width: 340, height: 340, borderRadius: "50%", border: `3px solid ${accent}28`, pointerEvents: "none" }} />

      {/* Accent stripe — top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 9, background: accent }} />

      {/* Vertical accent stripe — left edge */}
      <div style={{ position: "absolute", top: 9, left: 0, width: 9, height: H - bannerH - 9, background: accent, opacity: 0.55 }} />

      {/* Content */}
      <div style={{ position: "absolute", top: 9, left: 0, right: 0, bottom: bannerH, display: "flex", flexDirection: "column", justifyContent: "center", padding: "36px 72px 36px 80px", gap: 20, boxSizing: "border-box" }}>

        {/* Top row: X logo + badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 4 }}>
          <XCornerLogo size={68} />
          {s.badge && (
            <div style={{ background: accent, borderRadius: 999, padding: "6px 22px", fontSize: 15, fontWeight: 800, color: "white", letterSpacing: "0.08em" }}>
              {s.badge}
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{ fontSize: fs, fontWeight: 900, color: "white", lineHeight: 0.9, letterSpacing: "-0.03em" }}>
          {s.title}
        </div>

        {/* Subtitle / Date */}
        {(s.subtitle || s.date) && (
          <div style={{ fontSize: 28, fontWeight: 400, color: "rgba(255,255,255,0.85)", lineHeight: 1.4, maxWidth: 820 }}>
            {s.subtitle && <span>{s.subtitle} </span>}
            {s.date && <span style={{ fontWeight: 700 }}>{s.date}</span>}
          </div>
        )}

        {/* Pills */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          {s.days && <Pill text={s.days} variant="outline-blue" fs={17} py={12} />}
          {s.time && <Pill text={s.time} variant="red" icon="🕐" fs={17} py={12} />}
          {s.professor && <Pill text={s.professor} variant="white-red" fs={17} py={12} />}
          {s.locations?.slice(0, 1).map((loc, i) => (
            <Pill key={i} text={`📍 ${loc}`} variant="blue" fs={15} py={12} />
          ))}
          {s.ctaText && <Pill text={s.ctaText} variant={s.accentColor === "blue" ? "blue" : "red"} fs={18} py={12} />}
        </div>
      </div>

      <DiagonalFlexBanner width={W} height={bannerH} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT 6 — schedule-grid (1280×720)
// ─────────────────────────────────────────────────────────────────────────────

const MOD_ICON: Record<string, string> = {
  HIIT: "🏋", "CICLISMO INDOOR": "🚴", FUNCIONAL: "💪", YOGA: "🧘",
  PILATES: "🤸", SPINNING: "🚲", MUSCULAÇÃO: "🏋", CROSSFIT: "⚡",
  ZUMBA: "💃", BOXE: "🥊", NATAÇÃO: "🏊",
};

function LayoutScheduleGrid({ s }: { s: LayoutSpec }) {
  const W = 1280, H = 720;
  const rows = s.schedule?.rows ?? [];
  const rc = rows.length;
  const py = rc > 8 ? 6 : rc > 6 ? 9 : 11;
  const fs = rc > 8 ? 15 : rc > 6 ? 17 : 19;

  return (
    <div id="template-render" style={{ width: W, height: H, background: B.navy, position: "relative", overflow: "hidden", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column", padding: "44px 56px", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", right: -100, top: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(80,50,220,0.22) 0%, transparent 68%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -60, left: -60, opacity: 0.04, pointerEvents: "none" }}><XWatermark size={500} /></div>

      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, position: "relative", zIndex: 1 }}>
        <XCornerLogo size={72} />
        <h1 style={{ fontSize: 36, fontWeight: 900, color: "white", margin: 0, flex: 1 }}>
          Escalas de final de semana coletivas
        </h1>
        {s.schedule?.unidade && (
          <div style={{ background: "rgba(13,10,58,0.95)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 999, padding: "10px 22px", fontSize: 13, fontWeight: 700, color: "white", whiteSpace: "nowrap" }}>
            📍 {s.schedule.unidade}
          </div>
        )}
      </div>

      <div style={{ background: "#EAEBF2", borderRadius: 20, padding: "18px 28px", flex: 1, display: "flex", flexDirection: "column", gap: rc > 7 ? 6 : 9, position: "relative", zIndex: 1, overflow: "hidden" }}>
        <div style={{ background: "white", borderRadius: 999, padding: "9px 28px", display: "flex", alignItems: "center", gap: 12, marginBottom: 2 }}>
          <span style={{ fontSize: 20 }}>📅</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: B.blue, letterSpacing: "0.04em" }}>{s.schedule?.date ?? "DOMINGO"}</span>
        </div>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div style={{ background: B.blue, borderRadius: 999, padding: `${py}px 22px`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: fs, fontWeight: 800, color: "white" }}>{row.professor}</span>
              <XMark size={fs + 2} />
            </div>
            <div style={{ background: B.red, borderRadius: 999, padding: `${py}px 22px`, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: fs - 1 }}>🕐</span>
              <span style={{ fontSize: fs, fontWeight: 800, color: "white", letterSpacing: "0.06em" }}>{row.time}</span>
            </div>
            <div style={{ background: "white", borderRadius: 999, padding: `${py}px 22px`, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: fs - 1 }}>{MOD_ICON[row.modalidade] ?? "🏋"}</span>
              <span style={{ fontSize: fs, fontWeight: 800, color: B.red }}>{row.modalidade}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dynamic router ───────────────────────────────────────────────────────────

function DynamicTemplate({ spec, photo }: { spec: LayoutSpec; photo: string }) {
  switch (spec.layout) {
    case "feed-card-left":    return <LayoutFeedCardLeft s={spec} photo={photo} />;
    case "story-split":       return <LayoutStorySplit s={spec} photo={photo} />;
    case "story-full-bleed":  return <LayoutStoryFullBleed s={spec} photo={photo} />;
    case "story-photo-card":  return <LayoutStoryPhotoCard s={spec} photo={photo} />;
    case "feed-bold-text":    return <LayoutFeedBoldText s={spec} />;
    case "schedule-grid":     return <LayoutScheduleGrid s={spec} />;
  }
}

function canvasDims(layout: LayoutSpec["layout"]) {
  return layout === "story-split" || layout === "story-full-bleed" || layout === "story-photo-card"
    ? { w: 1080, h: 1920 }
    : { w: 1280, h: 720 };
}

// ─── Main component ───────────────────────────────────────────────────────────

const PROMPTS = [
  "Nova aula de glúteos com o Prof. Lailson, terças e quintas 08h10, Unidade Marista",
  "Jiu-jitsu kids chegou! Aulão experimental dia 07 de março, 9h, vagas limitadas — Unidade Marista",
  "Flex Woman — programa exclusivo para mulheres. Inscrições de 09 a 22 de fevereiro, R$90",
  "Promoção: 50% de desconto na matrícula, válida até esta sexta-feira",
  "Escala de domingo: PROF. FRAN 08H00 HIIT, PROF. EDY 10H00 CICLISMO — Unidade Buena Vista",
];

const LAYOUT_OPTIONS: { id: LayoutSpec["layout"]; label: string; Icon: LucideIcon }[] = [
  { id: "feed-card-left",   label: "Feed Card",   Icon: LayoutPanelLeft },
  { id: "story-split",      label: "Story Split", Icon: Columns2 },
  { id: "story-full-bleed", label: "Full Bleed",  Icon: Maximize2 },
  { id: "story-photo-card", label: "Foto Card",   Icon: ImageIcon },
  { id: "feed-bold-text",   label: "Bold Text",   Icon: AlignCenter },
  { id: "schedule-grid",    label: "Escala",      Icon: CalendarRange },
];

export default function AITemplateGenerator() {
  const [prompt, setPrompt] = useState("");
  const [library, setLibrary] = useState<string[]>([]);   // all uploaded photos
  const [photoIndex, setPhotoIndex] = useState(0);         // which one is active
  const [spec, setSpec] = useState<LayoutSpec | null>(null);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  // Active photo is just the current index in the library
  const photo = library[photoIndex] ?? "";

  const previewRef = useRef<HTMLDivElement>(null);
  const renderRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  const d = spec ? canvasDims(spec.layout) : { w: 1280, h: 720 };
  const isPortrait = spec && (spec.layout === "story-split" || spec.layout === "story-full-bleed" || spec.layout === "story-photo-card");

  useEffect(() => {
    const update = () => {
      if (!previewRef.current) return;
      const cw = previewRef.current.clientWidth - 64;
      const ch = previewRef.current.clientHeight - 64;
      setScale(Math.min(cw / d.w, ch > 0 ? ch / d.h : 9999, 1));
    };
    update();
    const ro = new ResizeObserver(update);
    if (previewRef.current) ro.observe(previewRef.current);
    return () => ro.disconnect();
  }, [d.w, d.h, spec]);

  // Pre-load gym photos from public/gym-photos/ on mount
  useEffect(() => {
    fetch("/api/gym-photos")
      .then((r) => r.json())
      .then(({ photos }: { photos: string[] }) => {
        if (photos.length > 0) {
          setLibrary(photos);
          setPhotoIndex(0);
        }
      })
      .catch(() => {});
  }, []);

  // Add multiple photos to the library
  const handleLibraryUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setLibrary((prev) => {
          const next = [...prev, url];
          // Auto-select the first added photo if library was empty
          if (prev.length === 0) setPhotoIndex(0);
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
    // reset input so same files can be re-selected
    e.target.value = "";
  }, []);

  const nextPhoto = useCallback(() => {
    setPhotoIndex((i) => (i + 1) % library.length);
  }, [library.length]);

  const prevPhoto = useCallback(() => {
    setPhotoIndex((i) => (i - 1 + library.length) % library.length);
  }, [library.length]);

  const removeFromLibrary = useCallback((idx: number) => {
    setLibrary((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      setPhotoIndex((pi) => (pi >= next.length ? Math.max(0, next.length - 1) : pi));
      return next;
    });
  }, []);

  const shufflePhoto = useCallback(() => {
    setLibrary((lib) => {
      if (lib.length > 1) {
        setPhotoIndex((pi) => {
          let next = pi;
          while (next === pi) next = Math.floor(Math.random() * lib.length);
          return next;
        });
      }
      return lib;
    });
  }, []);

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/template/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar");
      setSpec(data as LayoutSpec);
      // Auto-pick a random photo from library if available
      if (library.length > 0) {
        setPhotoIndex(Math.floor(Math.random() * library.length));
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!renderRef.current || !spec) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const el = renderRef.current.querySelector("#template-render") as HTMLElement;
      if (!el) return;
      const canvas = await html2canvas(el, { useCORS: true, allowTaint: true, scale: 1, logging: false, backgroundColor: null });
      const link = document.createElement("a");
      link.download = `flex-${spec.layout}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(false);
    }
  };

  const updateSpec = <K extends keyof LayoutSpec>(key: K, value: LayoutSpec[K]) => {
    setSpec((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "var(--bg-page)", overflow: "hidden" }}>

      {/* Hidden full-res render for export */}
      <div ref={renderRef} style={{ position: "fixed", top: 0, left: "-9999px", zIndex: -1, pointerEvents: "none" }} aria-hidden="true">
        {spec && <DynamicTemplate spec={spec} photo={photo} />}
      </div>

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "0 20px", height: 54, flexShrink: 0,
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-base)",
      }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 13, fontWeight: 500, textDecoration: "none", transition: "all 140ms" }}>
          <ArrowLeft size={14} /> Studio
        </Link>

        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 16, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Template Studio
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>IA</span>
        </div>

        {/* Layout chip row */}
        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
          {LAYOUT_OPTIONS.map(({ id, label, Icon }) => {
            const active = spec?.layout === id;
            return (
              <button
                key={id}
                onClick={() => spec && updateSpec("layout", id)}
                disabled={!spec}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "5px 10px", borderRadius: 8, border: "1px solid",
                  borderColor: active ? "var(--accent)" : "var(--border)",
                  background: active ? "var(--accent-subtle)" : "transparent",
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  fontSize: 12, fontWeight: 600, cursor: spec ? "pointer" : "default",
                  opacity: spec ? 1 : 0.4,
                  transition: "all 140ms var(--easing)",
                }}
                title={label}
              >
                <Icon size={12} />
                <span style={{ display: "none", /* hide on narrow */ whiteSpace: "nowrap" }}>{label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />

        {spec && (
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 16px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg, #7F77DD 0%, #5E52D4 100%)",
              color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
              opacity: exporting ? 0.6 : 1, transition: "opacity 140ms",
            }}
          >
            <Download size={14} />
            {exporting ? "Exportando…" : "Baixar PNG"}
          </button>
        )}
      </header>

      {/* ── Main split ──────────────────────────────────────── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "360px 1fr", minHeight: 0 }}>

        {/* ── Left panel ────────────────────────────────────── */}
        <aside style={{
          overflowY: "auto", padding: "14px 14px 24px",
          display: "flex", flexDirection: "column", gap: 10,
          borderRight: "1px solid var(--border)",
          background: "var(--bg-base)",
        }}>

          {/* Prompt */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", borderRadius: 14, padding: 14 }}>
            <p className="section-label">Descreva o post</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Nova aula de glúteos com o Prof. Lailson, terças e quintas 8h10, Unidade Marista"
              rows={3}
              style={{ fontSize: 13, minHeight: 72, resize: "vertical" }}
              onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) generate(); }}
            />

            {/* Example prompts */}
            <div style={{ marginTop: 6, marginBottom: 10 }}>
              {PROMPTS.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(ex)}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "4px 8px", background: "none", border: "none",
                    cursor: "pointer", color: "var(--text-muted)", fontSize: 11,
                    borderRadius: 6, lineHeight: 1.4, transition: "color 120ms",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  ↗ {ex.length > 62 ? ex.slice(0, 62) + "…" : ex}
                </button>
              ))}
            </div>

            <button
              onClick={generate}
              disabled={generating || !prompt.trim()}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "11px 16px", borderRadius: 10, border: "none",
                background: generating ? "var(--surface)" : "linear-gradient(135deg, #7F77DD 0%, #5E52D4 100%)",
                color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer",
                opacity: (!prompt.trim() && !generating) ? 0.45 : 1,
                transition: "all 180ms var(--easing)",
              }}
            >
              <Sparkles size={16} />
              {generating ? "Gerando layout…" : "Gerar com IA"}
            </button>
            {error && <p style={{ fontSize: 12, color: "var(--error)", marginTop: 8 }}>{error}</p>}
          </div>

          {/* Photo library */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p className="section-label" style={{ margin: 0 }}>
                Fotos {library.length > 0 && <span style={{ color: "var(--accent)", marginLeft: 4 }}>{library.length}</span>}
              </p>
              <div style={{ display: "flex", gap: 5 }}>
                {library.length > 1 && (
                  <button
                    onClick={shufflePhoto}
                    title="Foto aleatória"
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                  >
                    <Shuffle size={11} /> Aleatória
                  </button>
                )}
                <label style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: 11, fontWeight: 600, cursor: "pointer", position: "relative" }}>
                  <Upload size={11} /> {library.length === 0 ? "Adicionar" : "+"}
                  <input type="file" accept="image/*" multiple onChange={handleLibraryUpload} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
                </label>
              </div>
            </div>

            {library.length === 0 ? (
              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "18px 12px", border: "2px dashed var(--border)", borderRadius: 10, cursor: "pointer", position: "relative", color: "var(--text-muted)" }}>
                <Upload size={20} />
                <span style={{ fontSize: 12, textAlign: "center", lineHeight: 1.5 }}>
                  Arraste fotos ou clique<br />
                  <span style={{ fontSize: 10 }}>Várias de uma vez</span>
                </span>
                <input type="file" accept="image/*" multiple onChange={handleLibraryUpload} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
              </label>
            ) : (
              <>
                {/* Active photo */}
                <div style={{ position: "relative", marginBottom: 8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={library[photoIndex]} alt="" style={{ width: "100%", height: 116, objectFit: "cover", borderRadius: 9, display: "block" }} />
                  {library.length > 1 && (
                    <>
                      <button onClick={prevPhoto} style={{ position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.65)", border: "none", width: 28, height: 28, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <ChevronLeft size={14} style={{ color: "white" }} />
                      </button>
                      <button onClick={nextPhoto} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.65)", border: "none", width: 28, height: 28, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <ChevronRight size={14} style={{ color: "white" }} />
                      </button>
                      <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.65)", borderRadius: 999, padding: "2px 10px", fontSize: 10, color: "white", fontWeight: 600 }}>
                        {photoIndex + 1} / {library.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail strip */}
                <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 2 }}>
                  {library.map((img, idx) => (
                    <div key={idx} style={{ position: "relative", flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img} alt="" onClick={() => setPhotoIndex(idx)}
                        style={{ width: 42, height: 42, objectFit: "cover", borderRadius: 6, cursor: "pointer", display: "block", border: idx === photoIndex ? "2px solid var(--accent)" : "2px solid transparent", opacity: idx === photoIndex ? 1 : 0.5, transition: "opacity 140ms" }}
                      />
                      <button
                        onClick={() => removeFromLibrary(idx)}
                        style={{ position: "absolute", top: -4, right: -4, width: 15, height: 15, borderRadius: 999, background: B.red, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                        aria-label="Remover foto"
                      >
                        <X size={8} style={{ color: "white" }} />
                      </button>
                    </div>
                  ))}
                </div>

                {spec?.photoHint && (
                  <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, fontStyle: "italic" }}>
                    Sugestão da IA: &ldquo;{spec.photoHint}&rdquo;
                  </p>
                )}
              </>
            )}
          </div>

          {/* Quick edit — always visible when spec exists */}
          {spec && (
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", borderRadius: 14, padding: 14 }}>
              <p className="section-label">Ajustar conteúdo</p>

              {/* Accent color */}
              <div style={{ marginBottom: 10 }}>
                <label className="label">Cor de acento</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {(["red", "blue"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => updateSpec("accentColor", c)}
                      style={{
                        flex: 1, padding: "7px 8px", borderRadius: 8, border: "2px solid",
                        borderColor: spec.accentColor === c ? (c === "red" ? B.red : B.blue) : "var(--border)",
                        background: spec.accentColor === c ? (c === "red" ? `${B.red}22` : `${B.blue}22`) : "var(--surface)",
                        color: c === "red" ? B.red : B.blue,
                        fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 140ms",
                      }}
                    >
                      {c === "red" ? "● Vermelho" : "● Azul"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(["badge", "title", "subtitle", "date", "days", "time", "professor", "ctaText"] as const).map((key) => (
                  <div key={key}>
                    <label className="label" style={{ textTransform: "capitalize" }}>{key}</label>
                    <input
                      value={(spec[key] as string) ?? ""}
                      onChange={(e) => updateSpec(key, (e.target.value || null) as string & null)}
                      style={{ fontSize: 12, padding: "6px 10px" }}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={generate}
                disabled={generating}
                style={{ width: "100%", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                <RefreshCw size={12} /> Regenerar
              </button>
            </div>
          )}
        </aside>

        {/* ── Preview area ──────────────────────────────────── */}
        <div
          ref={previewRef}
          style={{
            flex: 1, minHeight: 0, overflow: "hidden",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: 32,
            background: "radial-gradient(ellipse at 50% 35%, rgba(127,119,221,0.07) 0%, transparent 65%)",
          }}
        >
          {spec ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, animation: "fade-in 240ms var(--easing) both" }}>
              {/* Template frame */}
              <div style={{
                position: "relative",
                width: d.w * scale,
                height: d.h * scale,
                flexShrink: 0,
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.75)",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: d.w, height: d.h, transformOrigin: "top left", transform: `scale(${scale})` }}>
                  <DynamicTemplate spec={spec} photo={photo} />
                </div>
              </div>

              {/* Info bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.w}×{d.h}px</span>
                <span style={{ fontSize: 11, color: "var(--border-strong)" }}>·</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{spec.layout}</span>
                <span style={{ fontSize: 11, color: "var(--border-strong)" }}>·</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Clique &ldquo;Baixar PNG&rdquo; para exportar em alta resolução</span>
              </div>
            </div>
          ) : (
            /* Empty state */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center", maxWidth: 380 }}>
              <div style={{
                width: 88, height: 88, borderRadius: 22,
                background: "var(--surface)", border: "1px solid var(--border-strong)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 40px var(--accent-glow)",
              }}>
                <Sparkles size={36} style={{ color: "var(--accent)", opacity: 0.7 }} />
              </div>
              <div>
                <p style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--text-primary)", margin: "0 0 8px" }}>
                  Crie seu post
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>
                  Descreva a aula, promoção ou evento no painel ao lado.<br />
                  A IA escolhe o melhor layout e aplica o branding da Flex automaticamente.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                {LAYOUT_OPTIONS.map(({ id, label, Icon }) => (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 11, color: "var(--text-muted)" }}>
                    <Icon size={11} /> {label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
