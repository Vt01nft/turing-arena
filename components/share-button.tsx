"use client";

import { useState } from "react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://turing-arena.vercel.app";

export function ShareButton({
  text,
  url,
  className,
}: {
  text: string;
  url: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const fullUrl = url.startsWith("http") ? url : `${SITE_URL}${url}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}&hashtags=MantleAIHackathon`;

  return (
    <div className="flex items-center gap-2">
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={
          className ??
          "inline-flex items-center gap-2 px-3.5 py-2 rounded-md surface hover:border-[var(--color-border-strong)] transition-colors text-[13px]"
        }
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share
      </a>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(fullUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors text-[11px] text-dim hover:text-fg mono"
      >
        {copied ? "copied" : "copy link"}
      </button>
    </div>
  );
}
