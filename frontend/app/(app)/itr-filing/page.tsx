"use client";
import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileJson, Download, CheckCircle, AlertCircle, Upload, X } from "lucide-react";
import { convertITRJson } from "@/lib/api";

type Format = "xml" | "csv" | "json";

const FORMATS: { value: Format; label: string; description: string }[] = [
  { value: "xml", label: "XML", description: "ITR-compatible XML for e-filing portals" },
  { value: "csv", label: "CSV", description: "Flat spreadsheet — open in Excel or Sheets" },
  { value: "json", label: "JSON", description: "Pretty-printed JSON for review or APIs" },
];

export default function ITRFilingPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>("xml");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const acceptFile = (f: File) => {
    if (!f.name.endsWith(".json")) {
      setError("Please upload a .json file.");
      return;
    }
    setFile(f);
    setError(null);
    setSuccess(null);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { blob, filename } = await convertITRJson(file, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess(`Converted and downloaded as ${filename}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <div className="flex items-center gap-2 mb-1">
          <FileJson size={20} className="text-[var(--taxzy-slate)]" />
          <h1 className="text-xl font-bold text-[var(--foreground)]">ITR filing</h1>
        </div>
        <p className="text-sm text-[var(--taxzy-stone)]">Upload a JSON file and convert it to XML, CSV, or JSON</p>
      </motion.div>

      {/* Drop zone */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
            dragging
              ? "border-[var(--taxzy-slate)] bg-[var(--taxzy-slate)]/5"
              : "border-[var(--border)] hover:border-[var(--taxzy-slate)] hover:bg-[var(--muted)]"
          }`}
        >
          <input ref={inputRef} type="file" accept=".json,application/json" className="hidden" onChange={onInputChange} />

          {file ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileJson size={28} className="text-[var(--taxzy-slate)] shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)] truncate">{file.name}</p>
                  <p className="text-xs text-[var(--taxzy-stone)]">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setSuccess(null); setError(null); }}
                className="p-1 rounded-md hover:bg-[var(--muted)] text-[var(--taxzy-stone)] shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload size={32} className="mx-auto text-[var(--taxzy-stone)]" />
              <p className="text-sm font-medium text-[var(--foreground)]">Drop your JSON file here</p>
              <p className="text-xs text-[var(--taxzy-stone)]">or click to browse</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Format selector */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="space-y-2"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)]">Target format</p>
        <div className="grid grid-cols-3 gap-2">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFormat(f.value)}
              className={`rounded-xl border p-3 text-left transition-colors ${
                format === f.value
                  ? "border-[var(--taxzy-slate)] bg-[var(--taxzy-slate)]/10"
                  : "border-[var(--border)] hover:border-[var(--taxzy-slate)]/50"
              }`}
            >
              <p className={`text-sm font-bold mb-0.5 ${format === f.value ? "text-[var(--taxzy-slate)]" : "text-[var(--foreground)]"}`}>
                {f.label}
              </p>
              <p className="text-[10px] text-[var(--taxzy-stone)] leading-tight">{f.description}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Status messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          <CheckCircle size={16} className="shrink-0" />
          {success}
        </div>
      )}

      {/* Convert button */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <button
          onClick={handleConvert}
          disabled={!file || loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[var(--taxzy-slate)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
          ) : (
            <Download size={16} />
          )}
          {loading ? "Converting…" : `Convert & download as ${format.toUpperCase()}`}
        </button>
      </motion.div>
    </div>
  );
}
