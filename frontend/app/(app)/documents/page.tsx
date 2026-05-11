"use client";
import { useEffect, useState } from "react";
import { getDocuments } from "@/lib/api";
import { UploadZone } from "@/components/documents/UploadZone";
import { DocCard } from "@/components/documents/DocCard";
import { AISGuide } from "@/components/documents/AISGuide";
import { motion } from "framer-motion";
import type { Document, DocumentUploadResponse } from "@/types/api";

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
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-3">Uploaded documents</p>
          <div className="space-y-3">
            {docs.map((doc) => (
              <DocCard key={doc.doc_id} doc={doc} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
