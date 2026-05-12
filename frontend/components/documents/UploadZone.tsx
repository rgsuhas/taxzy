"use client";
import { useRef, useState, DragEvent } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X, Folder } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { uploadDocument } from "@/lib/api";
import type { Document, DocumentUploadResponse } from "@/types/api";

export interface FolderUploadResult {
  folderName: string;
  docs: Document[];
  uploadedAt: string;
}

interface Props {
  onUploadSuccess: (result: DocumentUploadResponse, filename: string) => void;
  onFolderUpload: (result: FolderUploadResult) => void;
}

async function readFolderEntries(entry: FileSystemDirectoryEntry): Promise<File[]> {
  return new Promise((resolve) => {
    const reader = entry.createReader();
    const files: File[] = [];

    const readBatch = () => {
      reader.readEntries(async (entries) => {
        if (!entries.length) return resolve(files);
        for (const e of entries) {
          if (e.isFile) {
            await new Promise<void>((res) => {
              (e as FileSystemFileEntry).file((f) => { files.push(f); res(); });
            });
          }
        }
        readBatch();
      });
    };
    readBatch();
  });
}

export function UploadZone({ onUploadSuccess, onFolderUpload }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [folderProgress, setFolderProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<DocumentUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setUploading(true);
    setError(null);
    setResult(null);
    setProgress(20);
    try {
      const interval = setInterval(() => setProgress((p) => Math.min(p + 15, 85)), 400);
      const res = await uploadDocument(file);
      clearInterval(interval);
      setProgress(100);
      setResult(res);
      onUploadSuccess(res, file.name);
    } catch (e) {
      setError((e as Error).message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFolderFiles = async (folderName: string, files: File[]) => {
    if (!files.length) return;
    setError(null);
    setFolderProgress({ done: 0, total: files.length });
    const docs: Document[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const res = await uploadDocument(files[i]);
        docs.push({
          doc_id: res.doc_id,
          doc_type: res.doc_type,
          filename: files[i].name,
          uploaded_at: new Date().toISOString(),
        });
        setFolderProgress({ done: i + 1, total: files.length });
      }
      onFolderUpload({ folderName, docs, uploadedAt: new Date().toISOString() });
    } catch (e) {
      setError((e as Error).message || "Folder upload failed");
    } finally {
      setFolderProgress(null);
    }
  };

  const onDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    const items = Array.from(e.dataTransfer.items);
    const folderEntry = items
      .map((i) => i.webkitGetAsEntry?.())
      .find((entry) => entry?.isDirectory) as FileSystemDirectoryEntry | undefined;

    if (folderEntry) {
      const files = await readFolderEntries(folderEntry);
      await handleFolderFiles(folderEntry.name, files);
      return;
    }

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFolderInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const folderName = files[0].webkitRelativePath.split("/")[0] || "Folder";
    await handleFolderFiles(folderName, files);
    e.target.value = "";
  };

  const dismiss = () => { setResult(null); setError(null); setFileName(null); setProgress(0); };

  const isBusy = uploading || !!folderProgress;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => !isBusy && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors",
          dragging
            ? "border-[var(--taxzy-slate)] bg-[var(--muted)]"
            : "border-[var(--border)] hover:border-[var(--taxzy-slate)] hover:bg-[var(--muted)/30]"
        )}
      >
        <Upload size={28} className="text-[var(--taxzy-slate)]" />
        <div className="text-center">
          <p className="font-medium text-[var(--foreground)]">Drop a file or folder here</p>
          <p className="text-sm text-[var(--taxzy-stone)] mt-0.5">PDF, JSON, XML — or drag an entire folder</p>
        </div>
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); if (!isBusy) fileInputRef.current?.click(); }}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-colors font-medium text-[var(--foreground)]"
          >
            Browse file
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); if (!isBusy) folderInputRef.current?.click(); }}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-colors font-medium text-[var(--foreground)] flex items-center gap-1.5"
          >
            <Folder size={12} />
            Browse folder
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.json,.xml"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
        />
        <input
          ref={folderInputRef}
          type="file"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({ webkitdirectory: "", multiple: true } as any)}
          className="hidden"
          onChange={onFolderInputChange}
        />
      </div>

      <AnimatePresence>
        {/* Single file upload progress */}
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <FileText size={16} className="text-[var(--taxzy-slate)]" />
              <span className="text-sm font-medium truncate flex-1">{fileName}</span>
            </div>
            <div className="w-full bg-[var(--muted)] rounded-full h-1.5">
              <motion.div
                className="h-1.5 rounded-full bg-[var(--taxzy-slate)]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {/* Folder upload progress */}
        {folderProgress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <Folder size={16} className="text-amber-600" />
              <span className="text-sm font-medium flex-1">
                Uploading files… {folderProgress.done}/{folderProgress.total}
              </span>
            </div>
            <div className="w-full bg-[var(--muted)] rounded-full h-1.5">
              <motion.div
                className="h-1.5 rounded-full bg-amber-500"
                animate={{ width: `${(folderProgress.done / folderProgress.total) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {/* Success card */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={16} className="text-[var(--taxzy-success)] shrink-0" />
                <span className="text-sm font-medium text-[var(--foreground)]">Extracted successfully</span>
              </div>
              <button onClick={dismiss}><X size={14} className="text-[var(--taxzy-stone)]" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(result.extracted_fields).map(([k, v]) => (
                <div key={k} className="text-xs">
                  <span className="text-[var(--taxzy-stone)] capitalize">{k.replace(/_/g, " ")}: </span>
                  <span className="font-medium text-[var(--foreground)]">{String(v)}</span>
                </div>
              ))}
            </div>
            {result.merged_into_profile && (
              <p className="text-xs text-[var(--taxzy-success)] mt-3">Merged into your tax profile</p>
            )}
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3"
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
