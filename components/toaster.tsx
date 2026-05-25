"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

type ToastKind = "info" | "success" | "error" | "warn";

type Toast = {
  id: number;
  kind: ToastKind;
  title: string;
  body?: string;
  href?: string;
  ttl: number;
};

type ToastCtx = {
  push: (t: Omit<Toast, "id" | "ttl"> & { ttl?: number }) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <ToasterProvider>");
  return ctx;
}

let nextId = 1;

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback<ToastCtx["push"]>((t) => {
    const id = nextId++;
    const toast: Toast = { id, ttl: 4500, ...t };
    setToasts((prev) => [...prev, toast]);
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <Host toasts={toasts} setToasts={setToasts} />
    </Ctx.Provider>
  );
}

function Host({
  toasts,
  setToasts,
}: {
  toasts: Toast[];
  setToasts: React.Dispatch<React.SetStateAction<Toast[]>>;
}) {
  const dismiss = useCallback(
    (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [setToasts],
  );
  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none"
      style={{ maxWidth: 380 }}
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, toast.ttl);
    return () => clearTimeout(id);
  }, [toast.ttl, onDismiss]);

  const tint =
    toast.kind === "success"
      ? { color: "var(--vs-positive)", bg: "rgba(74,158,127,0.10)", border: "rgba(74,158,127,0.30)" }
      : toast.kind === "error"
        ? { color: "var(--vs-negative)", bg: "rgba(221,115,104,0.10)", border: "rgba(221,115,104,0.30)" }
        : toast.kind === "warn"
          ? { color: "var(--vs-ochre-deep)", bg: "rgba(232,164,82,0.12)", border: "rgba(232,164,82,0.32)" }
          : { color: "var(--vs-machine-deep)", bg: "rgba(123,125,235,0.10)", border: "rgba(123,125,235,0.32)" };

  const inner = (
    <div
      className="surface-paper p-3.5 pointer-events-auto animate-toast"
      style={{
        boxShadow: "var(--vs-shadow-2)",
        borderColor: tint.border,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-1 h-1.5 w-1.5 rounded-full shrink-0"
          style={{ background: tint.color }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-ink">{toast.title}</div>
          {toast.body && <div className="text-[12px] text-ink-2 mt-1 leading-snug">{toast.body}</div>}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-ink-3 hover:text-ink transition-colors -mr-1 -mt-1 p-1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );

  return toast.href ? (
    <a href={toast.href} className="block no-underline" target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    inner
  );
}
