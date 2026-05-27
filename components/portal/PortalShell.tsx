"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import PortalSidebar from "./PortalSidebar";

interface Props {
  isAdmin: boolean;
  buyerName: string;
  pageTitle: string;
  children: React.ReactNode;
}

export default function PortalShell({
  isAdmin,
  buyerName,
  pageTitle,
  children,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PortalSidebar
        isAdmin={isAdmin}
        buyerName={buyerName}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-4 bg-white border-b border-gray-200">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-800"
            onClick={() => setSidebarOpen(true)}
            aria-label="Menü öffnen"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-base font-semibold text-gray-900 flex-1 truncate">
            {pageTitle}
          </h1>
          <span className="hidden sm:block text-sm text-gray-400 truncate max-w-48">
            {buyerName}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
