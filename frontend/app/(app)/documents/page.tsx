"use client";
import { useEffect, useState } from "react";
import { getDocuments } from "@/lib/api";
import { UploadZone, FolderUploadResult } from "@/components/documents/UploadZone";
import { DocGridCard } from "@/components/documents/DocGridCard";
import { FolderGridCard } from "@/components/documents/FolderGridCard";
import { CreateFolderSheet } from "@/components/documents/CreateFolderSheet";
import { AISGuide } from "@/components/documents/AISGuide";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, FolderOpen } from "lucide-react";
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

  useEffect(() => {
    setFolders(loadFolders());
    getDocuments().then(setDocs).catch(() => {});
  }, []);

  const updateFolders = (next: FolderGroup[]) => {
    setFolders(next);
    saveFolders(next);
  };

  const onUpload = (res: DocumentUploadResponse, filename: string) => {
{ href: "/itr-wizard", label: "Wizard",    icon: ClipboardList },    setDocs((prev) => [
      { doc_id: res.doc_id, doc_type: res.doc_type, filename, uploaded_at: new Date().toISOString() },
      ...prev,
    ]);
  };

  const onFolderUpload = (result: FolderUploadResult) => {
    const next = [
      { id: `${result.folderName}-${Date.now()}`, folderName: result.folderName, docs: result.docs, uploadedAt: result.uploadedAt },
      ...folders,
    ];
    updateFolders(next);
  };

  const createFolder = (name: string) => {
    if (folders.some((f) => f.folderName.toLowerCase() === name.toLowerCase())) return;
    updateFolders([
      { id: `${name}-${Date.now()}`, folderName: name, docs: [], uploadedAt: new Date().toISOString() },
      ...folders,
    ]);
  };

  const onDeleteDoc = (id: number) => setDocs((prev) => prev.filter((d) => d.doc_id !== id));

  const onDeleteDocInFolder = (folderId: string, docId: number) => {
    updateFolders(folders.map((f) =>
      f.id === folderId ? { ...f, docs: f.docs.filter((d) => d.doc_id !== docId) } : f
    ));
  };

  const onDeleteFolder = (folderId: string) => {
    if (openFolderId === folderId) setOpenFolderId(null);
    updateFolders(folders.filter((f) => f.id !== folderId));
  };

  const onAddFilesToFolder = (folderId: string, newDocs: Document[]) => {
    updateFolders(folders.map((f) =>
      f.id === folderId ? { ...f, docs: [...f.docs, ...newDocs] } : f
    ));
  };

  const openFolder = folders.find((f) => f.id === openFolderId) ?? null;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <div className="flex items-start justify-between">
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
          {!openFolder && <CreateFolderSheet onCreateFolder={createFolder} />}
        </div>
      </motion.div>

      {/* Upload zone — hidden when inside a folder */}
      {!openFolder && (
        <>
          <UploadZone onUploadSuccess={onUpload} onFolderUpload={onFolderUpload} />
          <AISGuide />
        </>
      )}

      {/* Grid */}
      <AnimatePresence mode="wait">
        {openFolder ? (
          /* ── Folder contents ── */
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
                <p className="text-xs mt-1">Hover the folder card and click + to add files</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                {openFolder.docs.map((doc) => (
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
          /* ── Root grid ── */
          <motion.div
            key="root"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2 }}
          >
            {(folders.length > 0 || docs.length > 0) && (
              <div className="space-y-6">
                {/* Folders section */}
                {folders.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-3">Folders</p>
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                      {folders.map((folder) => (
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

                {/* Loose files section */}
                {docs.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-3">Files</p>
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                      {docs.map((doc) => (
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
