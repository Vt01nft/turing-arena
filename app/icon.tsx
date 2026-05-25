import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/// Favicon: just the gold tri-lobed rim with navy interior, no text
/// (text would be unreadable at 32px). The dot in the center hints at
/// the "stake / pot" accent without crowding the silhouette.
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "transparent" }}>
        <svg width="32" height="32" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="frim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F4C892" />
              <stop offset="50%" stopColor="#E8A452" />
              <stop offset="100%" stopColor="#8B5E1F" />
            </linearGradient>
          </defs>
          <path
            d="M 31.7,50.6 A 34 34 0 1 1 96.3,50.6 A 34 34 0 0 1 64,105.9 A 34 34 0 0 1 31.7,50.6 Z"
            fill="#1A1F2E"
            stroke="url(#frim)"
            strokeWidth="12"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="64" cy="68" r="6" fill="#E8A452" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
