import { create } from "zustand";
import type { TaxProfile, TaxCalculation, Message, StructuredUpdate } from "@/types/api";

type Theme = "light" | "dark";

interface TaxStore {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Tax profile
  profile: TaxProfile | null;
  calculation: TaxCalculation | null;
  setProfile: (profile: TaxProfile) => void;
  setCalculation: (calc: TaxCalculation) => void;
  updateProfileFromChat: (update: StructuredUpdate) => void;

  // Chat state
  messages: Message[];
  isStreaming: boolean;
  currentConversationId: number | null;
  streamingContent: string;
  setMessages: (messages: Message[]) => void;
  appendMessage: (message: Message) => void;
  setStreaming: (val: boolean) => void;
  setStreamingContent: (content: string) => void;
  appendStreamingChunk: (chunk: string) => void;
  setConversationId: (id: number | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Filing progress
  filingProgress: number;
  computeFilingProgress: () => void;
}

export const useTaxStore = create<TaxStore>((set, get) => ({
  theme: "light",
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  },

  profile: null,
  calculation: null,
  setProfile: (profile) => {
    set({ profile });
    get().computeFilingProgress();
  },
  setCalculation: (calculation) => set({ calculation }),
  updateProfileFromChat: (update) => {
    const current = get().profile;
    if (!current) return;
    const updated: TaxProfile = {
      ...current,
      ...(update.income !== undefined && { gross_income: update.income }),
      ...(update.tds !== undefined && { tds_paid: update.tds }),
      ...(update.pan !== undefined && { pan: update.pan }),
      ...(update.deductions !== undefined && {
        deductions: { ...current.deductions, ...update.deductions } as TaxProfile["deductions"],
      }),
    };
    set({ profile: updated });
    get().computeFilingProgress();
  },

  messages: [],
  isStreaming: false,
  currentConversationId: null,
  streamingContent: "",
  setMessages: (messages) => set({ messages }),
  appendMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setStreamingContent: (streamingContent) => set({ streamingContent }),
  appendStreamingChunk: (chunk) => set((s) => ({ streamingContent: s.streamingContent + chunk })),
  setConversationId: (id) => set({ currentConversationId: id }),

  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  filingProgress: 0,
  computeFilingProgress: () => {
    const p = get().profile;
    if (!p) { set({ filingProgress: 0 }); return; }
    const fields = [p.pan, p.full_name, p.gross_income, p.tds_paid, p.regime, p.deductions, p.ay];
    const filled = fields.filter((f) => f !== null && f !== undefined).length;
    set({ filingProgress: Math.round((filled / fields.length) * 100) });
  },
}));
