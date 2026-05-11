"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink } from "lucide-react";

const steps = [
  { n: 1, text: 'Go to the Income Tax portal — incometax.gov.in — and log in with your PAN and password.' },
  { n: 2, text: 'Click "e-File" in the top navigation menu.' },
  { n: 3, text: 'Select "Income Tax Returns" → "Annual Information Statement (AIS)".' },
  { n: 4, text: 'On the AIS page, click the "Download" button and choose JSON format.' },
  { n: 5, text: 'Upload the downloaded JSON file here — Taxzy will extract your income, TDS, and interest data automatically.' },
];

export function AISGuide() {
  return (
    <Accordion className="bg-[var(--card)] border border-[var(--border)] rounded-xl">
      <AccordionItem value="ais" className="border-none px-5">
        <AccordionTrigger className="text-sm font-medium text-[var(--foreground)] py-4 hover:no-underline">
          How to download your AIS from the IT portal
        </AccordionTrigger>
        <AccordionContent className="pb-5">
          <ol className="space-y-3">
            {steps.map((s) => (
              <li key={s.n} className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-[var(--taxzy-slate)] text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  {s.n}
                </span>
                <p className="text-sm text-[var(--foreground)]">{s.text}</p>
              </li>
            ))}
          </ol>
          <a
            href="https://eportal.incometax.gov.in/iec/foservices/#/pre-login/ais"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-sm text-[var(--taxzy-slate)] font-medium hover:underline"
          >
            Open IT portal <ExternalLink size={13} />
          </a>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
