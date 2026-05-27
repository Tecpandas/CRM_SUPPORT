import { useEffect } from "react";

export default function Toast({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => onClose(), 2000);
    return () => window.clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
      <div className="rounded-xl border bg-white/90 p-3 text-sm text-slate-900 shadow-lg backdrop-blur">
        {message}
      </div>
    </div>
  );
}

