"use client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { GlossaryTerm } from "@/types/api";
import { findTermsInText } from "@/lib/glossary";

interface Props {
  text: string;
}

export function JargonTooltip({ text }: Props) {
  const termMap = findTermsInText(text);
  if (!termMap.size) return <span>{text}</span>;

  const sortedTerms = Array.from(termMap.values()).sort((a, b) => b.term.length - a.term.length);

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining) {
    let earliest: { index: number; term: GlossaryTerm } | null = null;
    for (const term of sortedTerms) {
      const regex = new RegExp(`\\b${term.term}\\b`, "i");
      const match = regex.exec(remaining);
      if (match && (!earliest || match.index < earliest.index)) {
        earliest = { index: match.index, term };
      }
    }

    if (!earliest) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (earliest.index > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, earliest.index)}</span>);
    }

    const matchedText = remaining.slice(earliest.index, earliest.index + earliest.term.term.length);
    parts.push(
      <Tooltip key={key++}>
        <TooltipTrigger>
          <span className="jargon-term text-[var(--taxzy-slate)] cursor-help">{matchedText}</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-semibold mb-1">{earliest.term.term}</p>
          <p className="text-sm">{earliest.term.definition}</p>
          {earliest.term.example && (
            <p className="text-xs text-muted-foreground mt-1 italic">{earliest.term.example}</p>
          )}
        </TooltipContent>
      </Tooltip>
    );

    remaining = remaining.slice(earliest.index + earliest.term.term.length);
  }

  return <>{parts}</>;
}
