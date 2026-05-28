import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/// iOS home-screen icon (180×180): capsule mark centered on the bone bg
/// with rounded-corner-safe padding.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#E8EBF3",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="atop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9396F0" />
              <stop offset="100%" stopColor="#5C5FCE" />
            </linearGradient>
            <linearGradient id="abot" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F09A8C" />
              <stop offset="100%" stopColor="#C56353" />
            </linearGradient>
            <clipPath id="aclip">
              <rect x="20" y="6" width="24" height="52" rx="12" ry="12" />
            </clipPath>
          </defs>
          <g clipPath="url(#aclip)">
            <rect x="20" y="6" width="24" height="26" fill="url(#atop)" />
            <rect x="20" y="32" width="24" height="26" fill="url(#abot)" />
            <line x1="20" y1="32" x2="44" y2="32" stroke="#1A1F2E" strokeWidth="1.5" opacity="0.55" />
          </g>
          <rect x="20" y="6" width="24" height="52" rx="12" ry="12" fill="none" stroke="#1A1F2E" strokeWidth="2.2" />
          <circle cx="32" cy="32" r="4.5" fill="#E8A452" stroke="#1A1F2E" strokeWidth="1.4" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
