"use client";
import { FileText, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { deleteDocument } from "@/lib/api";
import type { Document } from "@/types/api";

interface Props {
  doc: Document;
  onDelete: (id: number) => void;
}

export function DocCard({ doc, onDelete }: Props) {
  const handleDelete = async () => {
    try {
      await deleteDocument(doc.doc_id);
      onDelete(doc.doc_id);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-4"
    >
      <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center shrink-0">
        <FileText size={18} className="text-[var(--taxzy-slate)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-[var(--foreground)]">{doc.filename}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">{doc.doc_type}</Badge>
          <span className="text-xs text-[var(--taxzy-stone)]">
            {new Date(doc.uploaded_at).toLocaleDateString("en-IN")}
          </span>
        </div>
      </div>
      <button
        onClick={handleDelete}
        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
      >
        <Trash2 size={14} className="text-[var(--taxzy-stone)] hover:text-destructive" />
      </button>
    </motion.div>
  );
}
