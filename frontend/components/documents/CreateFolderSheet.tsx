"use client";
import { useRef, useState } from "react";
import { FolderPlus, X, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  onCreateFolder: (name: string) => void;
}

function buildMonthSuggestions(): string[] {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const now = new Date();
  const year = now.getFullYear();
  const prevYear = year - 1;
  const suggestions: string[] = [];
  // current year months up to current month
  for (let i = 0; i <= now.getMonth(); i++) {
    suggestions.push(`${months[i]} ${year}`);
  }
  // previous year months after current month (so full previous year is accessible)
  for (let i = now.getMonth() + 1; i < 12; i++) {
    suggestions.push(`${months[i]} ${prevYear}`);
  }
  return suggestions.reverse(); // most recent first
}

export function CreateFolderSheet({ onCreateFolder }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = buildMonthSuggestions();

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onCreateFolder(trimmed);
    setName("");
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen((v) => !v); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-colors font-medium text-[var(--foreground)]"
      >
        <FolderPlus size={14} />
        New folder
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-9 z-30 w-72 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[var(--foreground)]">Create folder</p>
              <button onClick={() => setOpen(false)}>
                <X size={14} className="text-[var(--taxzy-stone)]" />
              </button>
            </div>

            {/* Custom name input */}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit(name)}
                placeholder="Folder name…"
                className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] placeholder:text-[var(--taxzy-stone)] outline-none focus:border-[var(--taxzy-slate)]"
              />
              <button
                onClick={() => submit(name)}
                disabled={!name.trim()}
                className="p-1.5 rounded-lg bg-[var(--taxzy-slate)] text-white disabled:opacity-40"
              >
                <Check size={14} />
              </button>
            </div>

            {/* Monthly quick-picks */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-2">
                Monthly quick-pick
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--muted)] hover:border-[var(--taxzy-slate)] hover:bg-[var(--taxzy-slate)]/10 transition-colors text-[var(--foreground)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click-away overlay */}
      {open && (
        <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
