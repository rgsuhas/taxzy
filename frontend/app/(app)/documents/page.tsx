"use client";
import { useRef, useEffect, useState } from "react";
import { getDocuments, uploadDocument } from "@/lib/api";
import { UploadZone, FolderUploadResult } from "@/components/documents/UploadZone";
import { DocGridCard } from "@/components/documents/DocGridCard";
import { FolderGridCard } from "@/components/documents/FolderGridCard";
import { CreateFolderSheet } from "@/components/documents/CreateFolderSheet";
import { AISGuide } from "@/components/documents/AISGuide";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, FolderOpen, Plus, Loader2, SearchX } from "lucide-react";
import { useTaxStore } from "@/store/taxStore";
import type { Document, DocumentUploadResponse } from "@/types/api";

interface FolderGroup {
  id: string;
  folderName: string;
  docs: Document[];
  uploadedAt: string;
}

const STORAGE_KEY = "taxzy_folders";

function loadFolders(): FolderGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFolders(folders: FolderGroup[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [folders, setFolders] = useState<FolderGroup[]>([]);
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [addingToFolder, setAddingToFolder] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFolders(loadFolders());
    getDocuments().then(setDocs).catch(() => {});
  }, []);

  // Always use functional update to avoid stale closures
  const mutateFolders = (updater: (prev: FolderGroup[]) => FolderGroup[]) => {
    setFolders((prev) => {
      const next = updater(prev);
      saveFolders(next);
      return next;
    });
  };

  // ── Root-level uploads ──
  const onUpload = (res: DocumentUploadResponse, filename: string) => {
    setDocs((prev) => [
      { doc_id: res.doc_id, doc_type: res.doc_type, filename, uploaded_at: new Date().toISOString() },
      ...prev,
    ]);
  };

  const onFolderUpload = (result: FolderUploadResult) => {
    mutateFolders((prev) => [
      { id: `${result.folderName}-${Date.now()}`, folderName: result.folderName, docs: result.docs, uploadedAt: result.uploadedAt },
      ...prev,
    ]);
  };

  // ── Folder management ──
  const createFolder = (name: string) => {
    mutateFolders((prev) => {
      if (prev.some((f) => f.folderName.toLowerCase() === name.toLowerCase())) return prev;
      return [
        { id: `${name}-${Date.now()}`, folderName: name, docs: [], uploadedAt: new Date().toISOString() },
        ...prev,
      ];
    });
  };

  const onDeleteFolder = (folderId: string) => {
    if (openFolderId === folderId) setOpenFolderId(null);
    mutateFolders((prev) => prev.filter((f) => f.id !== folderId));
  };

  const onAddFilesToFolder = (folderId: string, newDocs: Document[]) => {
    mutateFolders((prev) =>
      prev.map((f) => f.id === folderId ? { ...f, docs: [...f.docs, ...newDocs] } : f)
    );
  };

  const onDeleteDocInFolder = (folderId: string, docId: number) => {
    mutateFolders((prev) =>
      prev.map((f) => f.id === folderId ? { ...f, docs: f.docs.filter((d) => d.doc_id !== docId) } : f)
    );
  };

  // ── Upload files directly into the open folder ──
  const handleUploadIntoOpenFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!openFolderId) return;
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setAddingToFolder(true);
    const added: Document[] = [];
    try {
      for (const file of files) {
        const res = await uploadDocument(file);
        added.push({ doc_id: res.doc_id, doc_type: res.doc_type, filename: file.name, uploaded_at: new Date().toISOString() });
      }
      onAddFilesToFolder(openFolderId, added);
    } catch {}
    finally { setAddingToFolder(false); e.target.value = ""; }
  };

  const onDeleteDoc = (id: number) => setDocs((prev) => prev.filter((d) => d.doc_id !== id));

  const openFolder = folders.find((f) => f.id === openFolderId) ?? null;

  const { searchQuery } = useTaxStore();
  const q = searchQuery.trim().toLowerCase();

  // Filtered views
  const visibleFolders = q
    ? folders.filter((f) =>
        f.folderName.toLowerCase().includes(q) ||
        f.docs.some((d) => d.filename.toLowerCase().includes(q))
      )
    : folders;

  const visibleDocs = q
    ? docs.filter((d) => d.filename.toLowerCase().includes(q))
    : docs;

  // Inside an open folder, also filter the files
  const visibleFolderDocs = openFolder
    ? q
      ? openFolder.docs.filter((d) => d.filename.toLowerCase().includes(q))
      : openFolder.docs
    : [];

  const noResults = q && visibleFolders.length === 0 && visibleDocs.length === 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {openFolder ? (
              <>
                <button
                  onClick={() => setOpenFolderId(null)}
                  className="flex items-center gap-1 text-sm text-[var(--taxzy-stone)] hover:text-[var(--foreground)] transition-colors"
                >
                  <ChevronLeft size={16} />
                  Documents
                </button>
                <span className="text-[var(--taxzy-stone)]">/</span>
                <div className="flex items-center gap-1.5">
                  <FolderOpen size={16} className="text-amber-500 shrink-0" />
                  <span className="text-sm font-semibold text-[var(--foreground)] truncate">{openFolder.folderName}</span>
                </div>
              </>
            ) : (
              <div>
                <h1 className="text-xl font-bold text-[var(--foreground)] mb-1">Documents</h1>
                <p className="text-sm text-[var(--taxzy-stone)]">Upload files or organise them into monthly folders</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {openFolder ? (
            <div>
              <button
                onClick={() => folderInputRef.current?.click()}
                disabled={addingToFolder}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-colors font-medium text-[var(--foreground)] disabled:opacity-40"
              >
                {addingToFolder ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                Add files
              </button>
              <input
                ref={folderInputRef}
                type="file"
                multiple
                accept=".pdf,.json,.xml"
                className="hidden"
                onChange={handleUploadIntoOpenFolder}
              />
            </div>
          ) : (
            <CreateFolderSheet onCreateFolder={createFolder} />
          )}
        </div>
      </motion.div>

      {/* Upload zone — only on root view */}
      {!openFolder && (
        <>
          <UploadZone onUploadSuccess={onUpload} onFolderUpload={onFolderUpload} />
          <AISGuide />
        </>
      )}

      {/* Grid */}
      <AnimatePresence mode="wait">
        {openFolder ? (
          <motion.div
            key={openFolder.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            {openFolder.docs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--taxzy-stone)]">
                <FolderOpen size={40} className="text-amber-300 mb-3" />
                <p className="text-sm font-medium">This folder is empty</p>
                <p className="text-xs mt-1 mb-4">Click "Add files" above to upload files into this folder</p>
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-[var(--taxzy-slate)] text-white font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus size={13} />
                  Add files
                </button>
              </div>
            ) : visibleFolderDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--taxzy-stone)]">
                <SearchX size={36} className="mb-3 opacity-40" />
                <p className="text-sm font-medium">No files match "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {visibleFolderDocs.map((doc) => (
                  <DocGridCard
                    key={doc.doc_id}
                    doc={doc}
                    onDelete={(id) => onDeleteDocInFolder(openFolder.id, id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="root"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2 }}
          >
            {noResults ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--taxzy-stone)]">
                <SearchX size={36} className="mb-3 opacity-40" />
                <p className="text-sm font-medium">No results for "{searchQuery}"</p>
                <p className="text-xs mt-1">Try a different file or folder name</p>
              </div>
            ) : (folders.length > 0 || docs.length > 0) && (
              <div className="space-y-6">
                {visibleFolders.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-3">Folders</p>
                    <div className="grid grid-cols-3 gap-3">
                      {visibleFolders.map((folder) => (
                        <FolderGridCard
                          key={folder.id}
                          folderName={folder.folderName}
                          fileCount={folder.docs.length}
                          onOpen={() => setOpenFolderId(folder.id)}
                          onDelete={() => onDeleteFolder(folder.id)}
                          onAddFiles={(newDocs) => onAddFilesToFolder(folder.id, newDocs)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {visibleDocs.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-3">Files</p>
                    <div className="grid grid-cols-3 gap-3">
                      {visibleDocs.map((doc) => (
                        <DocGridCard key={doc.doc_id} doc={doc} onDelete={onDeleteDoc} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
