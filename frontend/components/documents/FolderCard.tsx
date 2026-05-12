"use client";
import { useRef, useState } from "react";
import { Folder, FolderOpen, FileText, ChevronRight, Trash2, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { deleteDocument, uploadDocument } from "@/lib/api";
import type { Document } from "@/types/api";

interface Props {
  folderName: string;
  docs: Document[];
  uploadedAt: string;
  onDeleteFile: (docId: number) => void;
  onDeleteFolder: () => void;
  onAddFiles: (docs: Document[]) => void;
}

export function FolderCard({ folderName, docs, uploadedAt, onDeleteFile, onDeleteFolder, onAddFiles }: Props) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDeleteFile = async (docId: number) => {
    try {
      await deleteDocument(docId);
      onDeleteFile(docId);
    } catch {}
  };

  const handleAddFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const added: Document[] = [];
    try {
      for (const file of files) {
        const res = await uploadDocument(file);
        added.push({
          doc_id: res.doc_id,
          doc_type: res.doc_type,
          filename: file.name,
          uploaded_at: new Date().toISOString(),
        });
      }
      onAddFiles(added);
      setOpen(true);
    } catch {}
    finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const isEmpty = docs.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden"
    >
      {/* Folder header row */}
      <div className="flex items-center gap-2 p-4">
        <button
          onClick={() => !isEmpty && setOpen((v) => !v)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            {open ? (
              <FolderOpen size={18} className="text-amber-600" />
            ) : (
              <Folder size={18} className="text-amber-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-[var(--foreground)]">{folderName}</p>
            <p className="text-xs text-[var(--taxzy-stone)] mt-0.5">
              {isEmpty ? "Empty" : `${docs.length} ${docs.length === 1 ? "file" : "files"}`}
              {" · "}
              {new Date(uploadedAt).toLocaleDateString("en-IN")}
            </p>
          </div>
          {!isEmpty && (
            <ChevronRight
              size={16}
              className={`text-[var(--taxzy-stone)] shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
            />
          )}
        </button>

        {/* Add files button */}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          title="Add files to folder"
          className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors text-[var(--taxzy-stone)] hover:text-[var(--taxzy-slate)] disabled:opacity-40"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.json,.xml"
          className="hidden"
          onChange={handleAddFiles}
        />

        {/* Delete folder */}
        <button
          onClick={onDeleteFolder}
          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
        >
          <Trash2 size={14} className="text-[var(--taxzy-stone)] hover:text-destructive" />
        </button>
      </div>

      {/* Expandable file list */}
      <AnimatePresence initial={false}>
        {open && !isEmpty && (
          <motion.div
            key="files"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--border)] divide-y divide-[var(--border)]">
              {docs.map((doc) => (
                <div key={doc.doc_id} className="flex items-center gap-3 px-4 py-3 pl-[4.25rem]">
                  <div className="w-8 h-8 rounded-md bg-[var(--muted)] flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-[var(--taxzy-slate)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-[var(--foreground)]">{doc.filename}</p>
                    <Badge variant="secondary" className="text-[9px] uppercase tracking-wide mt-0.5">{doc.doc_type}</Badge>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(doc.doc_id)}
                    className="p-1 rounded-md hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={12} className="text-[var(--taxzy-stone)] hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
