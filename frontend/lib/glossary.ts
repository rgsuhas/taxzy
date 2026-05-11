import Fuse from "fuse.js";
import type { GlossaryTerm } from "@/types/api";

let fuse: Fuse<GlossaryTerm> | null = null;
let terms: GlossaryTerm[] = [];

export async function initGlossary(glossaryTerms: GlossaryTerm[]) {
  terms = glossaryTerms;
  fuse = new Fuse(terms, {
    keys: ["term"],
    threshold: 0.2,
    includeScore: true,
  });
}

export function findTermsInText(text: string): Map<string, GlossaryTerm> {
  const found = new Map<string, GlossaryTerm>();
  if (!terms.length) return found;

  for (const term of terms) {
    const regex = new RegExp(`\\b${term.term}\\b`, "gi");
    if (regex.test(text)) {
      found.set(term.term.toLowerCase(), term);
    }
  }
  return found;
}

export function searchTerm(query: string): GlossaryTerm[] {
  if (!fuse) return [];
  return fuse.search(query).map((r) => r.item);
}

export { terms as glossaryTerms };
