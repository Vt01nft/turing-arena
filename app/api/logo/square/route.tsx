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

/// GET /api/logo/square
/// Returns a 1024×1024 PNG branded with the capsule mark + wordmark.
/// Ready to upload as a DoraHacks / Twitter / Vercel profile picture.
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: C.bone,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Soft lavender drift behind */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -200,
            width: 760,
            height: 760,
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
            right: -160,
            width: 640,
            height: 640,
            borderRadius: 9999,
            background: `radial-gradient(circle, ${C.human}33, transparent 70%)`,
            filter: "blur(60px)",
            display: "flex",
          }}
        />

        {/* Mark */}
        <svg width="420" height="420" viewBox="0 0 64 64" style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="logoTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={C.machine} />
              <stop offset="100%" stopColor={C.machineDeep} />
            </linearGradient>
            <linearGradient id="logoBot" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={C.human} />
              <stop offset="100%" stopColor={C.humanDeep} />
            </linearGradient>
            <radialGradient id="logoShine" cx="32%" cy="20%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.10" />
            </radialGradient>
            <clipPath id="logoClip">
              <rect x="20" y="6" width="24" height="52" rx="12" ry="12" />
            </clipPath>
          </defs>
          <g clipPath="url(#logoClip)">
            <rect x="20" y="6" width="24" height="26" fill="url(#logoTop)" />
            <rect x="20" y="32" width="24" height="26" fill="url(#logoBot)" />
            <rect x="20" y="6" width="24" height="52" fill="url(#logoShine)" />
            <line x1="20" y1="32" x2="44" y2="32" stroke={C.ink} strokeWidth="1.2" opacity="0.55" />
          </g>
          <rect x="20" y="6" width="24" height="52" rx="12" ry="12" fill="none" stroke={C.ink} strokeWidth="1.5" />
          <circle cx="32" cy="32" r="4" fill={C.ochre} stroke={C.ink} strokeWidth="1.2" />
        </svg>

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 18,
            marginTop: 32,
            fontSize: 88,
            fontWeight: 600,
            color: C.ink,
            letterSpacing: -3,
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

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 28,
            color: C.ink3,
            letterSpacing: -0.5,
          }}
        >
          Bet on humans. Or bet on the machines.
        </div>
      </div>
    ),
    { width: 1024, height: 1024 },
  );
}
