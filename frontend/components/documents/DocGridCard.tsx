"use client";
import { useState } from "react";
import { Trash2, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { deleteDocument } from "@/lib/api";
import type { Document } from "@/types/api";

const TYPE_CONFIG: Record<string, { bg: string; text: string; label: string; ext: string }> = {
  form16:   { bg: "from-violet-500 to-violet-600",  text: "text-white",      label: "Form 16",  ext: "PDF"  },
  ais:      { bg: "from-cyan-500 to-cyan-600",       text: "text-white",      label: "AIS",      ext: "PDF"  },
  form16_pdf: { bg: "from-violet-500 to-violet-600", text: "text-white",      label: "Form 16",  ext: "PDF"  },
  ais_json: { bg: "from-blue-500 to-blue-600",       text: "text-white",      label: "AIS",      ext: "JSON" },
  json:     { bg: "from-blue-500 to-indigo-600",     text: "text-white",      label: "JSON",     ext: "JSON" },
  xml:      { bg: "from-emerald-500 to-teal-600",    text: "text-white",      label: "XML",      ext: "XML"  },
  pdf:      { bg: "from-rose-500 to-red-600",        text: "text-white",      label: "PDF",      ext: "PDF"  },
};

function getConfig(docType: string) {
  const key = docType.toLowerCase();
  return TYPE_CONFIG[key] ?? { bg: "from-slate-400 to-slate-500", text: "text-white", label: docType.toUpperCase(), ext: "FILE" };
}

interface Props {
  doc: Document;
  onDelete: (id: number) => void;
}

export function DocGridCard({ doc, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cfg = getConfig(doc.doc_type);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    try {
      await deleteDocument(doc.doc_id);
      onDelete(doc.doc_id);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="relative bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
    >
      {/* Colored banner */}
      <div className={`bg-gradient-to-br ${cfg.bg} flex flex-col items-center justify-center py-7 gap-1 rounded-t-2xl overflow-hidden`}>
        {/* File shape */}
        <div className="relative w-12 h-14">
          <div className="absolute inset-0 bg-white/20 rounded-lg" />
          <div className="absolute top-0 right-0 w-4 h-4 bg-white/10 rounded-bl-md" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-black tracking-tight ${cfg.text} opacity-90`}>{cfg.ext}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5 flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-[var(--foreground)] truncate leading-tight">{doc.filename}</p>
          <p className="text-[10px] text-[var(--taxzy-stone)] mt-0.5 uppercase tracking-wide">{cfg.label}</p>
        </div>

        {/* Menu trigger */}
        <div className="relative shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-[var(--muted)] transition-all"
          >
            <MoreVertical size={13} className="text-[var(--foreground)]" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-7 z-50 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl py-1 w-32"
                >
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
