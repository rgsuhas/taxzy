"use client";
import { useRef, useState } from "react";
import { Trash2, Plus, Loader2, MoreVertical, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadDocument } from "@/lib/api";
import type { Document } from "@/types/api";

interface Props {
  folderName: string;
  fileCount: number;
  onOpen: () => void;
  onDelete: () => void;
  onAddFiles: (docs: Document[]) => void;
}

export function FolderGridCard({ folderName, fileCount, onOpen, onDelete, onAddFiles }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const added: Document[] = [];
    try {
      for (const file of files) {
        const res = await uploadDocument(file);
        added.push({ doc_id: res.doc_id, doc_type: res.doc_type, filename: file.name, uploaded_at: new Date().toISOString() });
      }
      onAddFiles(added);
    } catch {}
    finally { setUploading(false); e.target.value = ""; }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="relative bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
      onClick={onOpen}
    >
      {/* Folder banner */}
      <div className="bg-gradient-to-br from-amber-400 to-orange-500 flex flex-col items-center justify-center py-7 gap-2 relative rounded-t-2xl overflow-hidden">
        {/* Folder shape */}
        <div className="relative w-16 h-12">
          {/* Folder tab */}
          <div className="absolute top-0 left-0 w-7 h-3 bg-white/30 rounded-t-md" />
          {/* Folder body */}
          <div className="absolute top-2.5 inset-x-0 bottom-0 bg-white/25 rounded-md rounded-tl-none" />
          {/* Inner lines suggesting files */}
          <div className="absolute top-5 left-2.5 right-2.5 space-y-1">
            <div className="h-0.5 bg-white/40 rounded" />
            <div className="h-0.5 bg-white/40 rounded w-3/4" />
            <div className="h-0.5 bg-white/40 rounded w-1/2" />
          </div>
        </div>

        {/* File count badge */}
        <span className="text-[10px] font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
          {fileCount === 0 ? "Empty" : `${fileCount} ${fileCount === 1 ? "file" : "files"}`}
        </span>
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5 flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-[var(--foreground)] truncate leading-tight">{folderName}</p>
          <p className="text-[10px] text-[var(--taxzy-stone)] mt-0.5">Folder</p>
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
                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-7 z-50 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl py-1 w-36"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onOpen(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    <FolderOpen size={12} />
                    Open
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); inputRef.current?.click(); }}
                    disabled={uploading}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-40"
                  >
                    {uploading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                    Add files
                  </button>
                  <div className="border-t border-[var(--border)] my-1" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete folder
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.json,.xml"
        className="hidden"
        onChange={handleAddFiles}
      />
    </motion.div>
  );
}
