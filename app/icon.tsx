import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/// Favicon: the periwinkle/coral capsule mark with ochre stake dot.
/// Matches the in-product wordmark lockup at all sizes.
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "transparent" }}>
        <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ftop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9396F0" />
              <stop offset="100%" stopColor="#5C5FCE" />
            </linearGradient>
            <linearGradient id="fbot" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F09A8C" />
              <stop offset="100%" stopColor="#C56353" />
            </linearGradient>
            <clipPath id="fclip">
              <rect x="20" y="6" width="24" height="52" rx="12" ry="12" />
            </clipPath>
          </defs>
          <g clipPath="url(#fclip)">
            <rect x="20" y="6" width="24" height="26" fill="url(#ftop)" />
            <rect x="20" y="32" width="24" height="26" fill="url(#fbot)" />
            <line x1="20" y1="32" x2="44" y2="32" stroke="#1A1F2E" strokeWidth="1.5" opacity="0.55" />
          </g>
          <rect x="20" y="6" width="24" height="52" rx="12" ry="12" fill="none" stroke="#1A1F2E" strokeWidth="2.4" />
          <circle cx="32" cy="32" r="5" fill="#E8A452" stroke="#1A1F2E" strokeWidth="1.8" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
