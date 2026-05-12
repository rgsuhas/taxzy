"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  LayoutDashboard,
  FileText,
  ShoppingBag,
  ClipboardList,
  MapPin,
  Map,
  FileJson,
} from "lucide-react";

const nav = [
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Docs", icon: FileText },
  { href: "/itr-filing", label: "ITR", icon: FileJson },
  { href: "/itr-wizard", label: "Wizard",    icon: ClipboardList },
  { href: "/marketplace", label: "Market", icon: ShoppingBag },
  { href: "/tracker", label: "Tracker", icon: MapPin },
  { href: "/tax-usage", label: "Usage", icon: Map },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--sidebar)] border-t border-[var(--sidebar-border)] flex">
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium transition-colors",
              active ? "text-[var(--taxzy-slate)]" : "text-[var(--taxzy-stone)]"
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
