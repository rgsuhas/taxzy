"use client";
import { useRef, useState, DragEvent } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { uploadDocument } from "@/lib/api";
import type { DocumentUploadResponse } from "@/types/api";

interface Props {
  onUploadSuccess: (result: DocumentUploadResponse) => void;
}

export function UploadZone({ onUploadSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DocumentUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

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
      onUploadSuccess(res);
    } catch (e) {
      setError((e as Error).message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const dismiss = () => { setResult(null); setError(null); setFileName(null); setProgress(0); };

  return (
    <div className="space-y-4">
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors",
          dragging
            ? "border-[var(--taxzy-slate)] bg-[var(--muted)]"
            : "border-[var(--border)] hover:border-[var(--taxzy-slate)] hover:bg-[var(--muted)/30]"
        )}
      >
        <Upload size={28} className="text-[var(--taxzy-slate)]" />
        <div className="text-center">
          <p className="font-medium text-[var(--foreground)]">Drop your document here</p>
          <p className="text-sm text-[var(--taxzy-stone)] mt-0.5">or click to browse — PDF, JSON, XML</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.json,.xml"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      <AnimatePresence>
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
