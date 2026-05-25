import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "transparent",
          position: "relative",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="7" fill="#15181f" />
          <path d="M 4.5 27.5 L 4.5 4.5 L 27.5 27.5 Z" fill="#6a8dff" />
          <path d="M 27.5 4.5 L 27.5 27.5 L 4.5 4.5 Z" fill="#ff5b8d" />
          <path
            d="M 4.5 4.5 L 27.5 27.5"
            stroke="#15181f"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
