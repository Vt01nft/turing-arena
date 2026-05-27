import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-static";

const C = {
  bone: "#E8EBF3",
  paper: "#FFFFFF",
  ink: "#1A1F2E",
  ink2: "#3A4256",
  ink3: "#6E7689",
  ochre: "#E8A452",
  human: "#F09A8C",
  humanDeep: "#C56353",
  machine: "#9396F0",
  machineDeep: "#5C5FCE",
};

/// GET /api/logo/banner
/// Returns a 1500×500 PNG suitable for an X / Twitter header or a
/// DoraHacks cover image. Mark on the left, wordmark + tagline on
/// the right with the brand drift blobs behind.
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          background: C.bone,
          fontFamily: "sans-serif",
          position: "relative",
          padding: "0 96px",
        }}
      >
        {/* Drift blobs */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -140,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: `radial-gradient(circle, ${C.machine}44, transparent 70%)`,
            filter: "blur(50px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -100,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: `radial-gradient(circle, ${C.human}33, transparent 70%)`,
            filter: "blur(60px)",
            display: "flex",
          }}
        />

        {/* Mark */}
        <svg width="280" height="280" viewBox="0 0 64 64" style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="banTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={C.machine} />
              <stop offset="100%" stopColor={C.machineDeep} />
            </linearGradient>
            <linearGradient id="banBot" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={C.human} />
              <stop offset="100%" stopColor={C.humanDeep} />
            </linearGradient>
            <radialGradient id="banShine" cx="32%" cy="20%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.10" />
            </radialGradient>
            <clipPath id="banClip">
              <rect x="20" y="6" width="24" height="52" rx="12" ry="12" />
            </clipPath>
          </defs>
          <g clipPath="url(#banClip)">
            <rect x="20" y="6" width="24" height="26" fill="url(#banTop)" />
            <rect x="20" y="32" width="24" height="26" fill="url(#banBot)" />
            <rect x="20" y="6" width="24" height="52" fill="url(#banShine)" />
            <line x1="20" y1="32" x2="44" y2="32" stroke={C.ink} strokeWidth="1.2" opacity="0.55" />
          </g>
          <rect x="20" y="6" width="24" height="52" rx="12" ry="12" fill="none" stroke={C.ink} strokeWidth="1.5" />
          <circle cx="32" cy="32" r="4" fill={C.ochre} stroke={C.ink} strokeWidth="1.2" />
        </svg>

        {/* Right-side text block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 56,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 14,
              fontSize: 96,
              fontWeight: 600,
              color: C.ink,
              letterSpacing: -3,
              lineHeight: 1,
            }}
          >
            <span>turing</span>
            <span
              style={{
                display: "flex",
                width: 14,
                height: 14,
                borderRadius: 9999,
                background: C.ochre,
                alignSelf: "center",
              }}
            />
            <span>arena</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 30,
              color: C.ink2,
              letterSpacing: -0.5,
            }}
          >
            Bet on{" "}
            <em style={{ fontStyle: "italic", color: C.humanDeep, fontFamily: "serif", margin: "0 8px" }}>
              humans
            </em>
            . Or bet on the{" "}
            <em style={{ fontStyle: "italic", color: C.machineDeep, fontFamily: "serif", margin: "0 8px" }}>
              machines
            </em>
            .
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 18,
              color: C.ink3,
              letterSpacing: 0.5,
              fontFamily: "monospace",
              gap: 14,
            }}
          >
            <span>MANTLE TURING TEST HACKATHON 2026</span>
            <span style={{ display: "flex", color: C.ochre }}>·</span>
            <span>turing-arena-nu.vercel.app</span>
          </div>
        </div>
      </div>
    ),
    { width: 1500, height: 500 },
  );
}
