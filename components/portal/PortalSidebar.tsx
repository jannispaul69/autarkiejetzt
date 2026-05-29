"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  BarChart3,
  Database,
  Building2,
  X,
  SlidersHorizontal,
  ShoppingCart,
} from "lucide-react";
import { createPortalBrowserClient } from "@/lib/supabase/portal-browser";
import { useRouter } from "next/navigation";

interface Props {
  isAdmin: boolean;
  buyerName: string;
  open?: boolean;
  onClose?: () => void;
}

const buyerNav = [
  { href: "/portal/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/portal/leads",         label: "Meine Leads",   icon: Users },
  { href: "/portal/marktplatz",    label: "Marktplatz",    icon: ShoppingCart },
  { href: "/portal/einstellungen", label: "Einstellungen", icon: SlidersHorizontal },
];

const adminNav = [
  { href: "/portal/admin", label: "Übersicht", icon: BarChart3 },
  { href: "/portal/admin/leads", label: "Alle Leads", icon: Database },
  { href: "/portal/admin/buyers", label: "Käufer", icon: Building2 },
  { href: "/portal/admin/settings", label: "Einstellungen", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  badge,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  active: boolean;
  badge?: number | null;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-white/10 text-white"
          : "text-white/60 hover:bg-white/8 hover:text-white"
      }`}
    >
      <Icon className="flex-shrink-0" size={17} />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="ml-auto flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-[#F4B400] text-[#1A1A1A] text-[10px] font-bold flex items-center justify-center leading-none">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

export default function PortalSidebar({ isAdmin, buyerName, open, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [marketplaceCount, setMarketplaceCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/portal/marketplace-count")
      .then((r) => r.json())
      .then((d) => setMarketplaceCount(d.count ?? 0))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    const supabase = createPortalBrowserClient();
    await supabase.auth.signOut();
    router.push("/portal/login");
    router.refresh();
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <span className="font-bold text-white text-base tracking-tight">
          ☀️ Autarkie Jetzt
        </span>
        {onClose && (
          <button onClick={onClose} className="text-white/50 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {isAdmin && (
          <>
            <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
              Admin
            </p>
            {adminNav.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={
                  item.href === "/portal/admin"
                    ? pathname === "/portal/admin"
                    : pathname.startsWith(item.href)
                }
                onClick={onClose}
              />
            ))}
            <div className="my-3 border-t border-white/10" />
            <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
              Käufer
            </p>
          </>
        )}
        {buyerNav.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={
              item.href === "/portal/dashboard"
                ? pathname === "/portal/dashboard"
                : pathname.startsWith(item.href)
            }
            badge={item.href === "/portal/marktplatz" ? marketplaceCount : undefined}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <p className="px-4 mb-2 text-xs text-white/40 truncate">{buyerName}</p>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white transition-colors"
        >
          <LogOut size={17} />
          Abmelden
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col w-60 shrink-0 h-screen sticky top-0"
        style={{ backgroundColor: "#1A1A2E" }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 flex flex-col"
            style={{ backgroundColor: "#1A1A2E" }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
