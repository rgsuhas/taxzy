"use client";
import { useEffect, useState } from "react";
import { getDocuments } from "@/lib/api";
import { UploadZone } from "@/components/documents/UploadZone";
import { DocCard } from "@/components/documents/DocCard";
import { AISGuide } from "@/components/documents/AISGuide";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, FolderClosed, ChevronDown } from "lucide-react";
import type { Document, DocumentUploadResponse } from "@/types/api";

function getMonthKey(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function groupByMonth(docs: Document[]): Map<string, Document[]> {
  const map = new Map<string, Document[]>();
  for (const doc of docs) {
    const key = getMonthKey(doc.uploaded_at);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(doc);
  }
  return map;
}

function FolderGroup({
  month,
  docs,
  onDelete,
  defaultOpen,
}: {
  month: string;
  docs: Document[];
  onDelete: (id: number) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--border)" }}
    >
      {/* Folder header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--muted)]"
        style={{ background: "var(--card)" }}
      >
        {open ? (
          <FolderOpen size={16} className="text-[var(--taxzy-slate)] flex-shrink-0" />
        ) : (
          <FolderClosed size={16} className="text-[var(--taxzy-stone)] flex-shrink-0" />
        )}
        <span className="text-sm font-semibold text-[var(--foreground)] flex-1">{month}</span>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(61,90,128,0.09)", color: "#3D5A80" }}
        >
          {docs.length} file{docs.length !== 1 ? "s" : ""}
        </span>
        <ChevronDown
          size={14}
          className="text-[var(--taxzy-stone)] transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Folder contents */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-3 py-2 space-y-2"
              style={{ borderTop: "1px solid var(--border)", background: "var(--muted)" }}
            >
              {docs.map((doc) => (
                <DocCard key={doc.doc_id} doc={doc} onDelete={onDelete} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    getDocuments().then(setDocs).catch(() => {});
  }, []);

  const onUpload = (res: DocumentUploadResponse) => {
    const newDoc: Document = {
      doc_id: res.doc_id,
      doc_type: res.doc_type,
      filename: `Document_${res.doc_id}`,
      uploaded_at: new Date().toISOString(),
    };
    setDocs((prev) => [newDoc, ...prev]);
  };

  const onDelete = (id: number) => setDocs((prev) => prev.filter((d) => d.doc_id !== id));

  const grouped = groupByMonth(docs);
  const months = Array.from(grouped.keys());

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <h1 className="text-xl font-bold text-[var(--foreground)] mb-1">Documents</h1>
        <p className="text-sm text-[var(--taxzy-stone)]">Upload Form 16, AIS, or any tax document</p>
      </motion.div>

      <UploadZone onUploadSuccess={onUpload} />
      <AISGuide />

      {docs.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-3">
            Uploaded documents
          </p>
          <div className="space-y-3">
            {months.map((month, i) => (
              <FolderGroup
                key={month}
                month={month}
                docs={grouped.get(month)!}
                onDelete={onDelete}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
