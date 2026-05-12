"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  MessageSquare,
  LayoutDashboard,
  FileText,
  ShoppingBag,
  MapPin,
  Map,
  FileJson,
} from "lucide-react";

const nav = [
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/itr-filing", label: "ITR filing", icon: FileJson },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/tracker", label: "Tracker", icon: MapPin },
  { href: "/tax-usage", label: "Tax usage", icon: Map },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] px-4 py-6 shrink-0">
      <Link href="/" className="mb-8 px-2">
        <span className="font-extrabold text-xl text-[var(--taxzy-slate)] tracking-tight">Taxzy</span>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--taxzy-slate)] text-white shadow-sm"
                    : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--taxzy-slate)]"
                )}
              >
                <Icon size={16} />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2 pt-4 border-t border-[var(--sidebar-border)]">
        <p className="text-xs text-[var(--taxzy-stone)]">Taxzy &copy; 2024</p>
      </div>
    </aside>
  );
}
