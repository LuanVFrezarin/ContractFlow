"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.unreadCount || 0))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm shadow-slate-100">
      {/* Left: Page title */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-none">{title}</h1>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5 leading-none">{description}</p>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search button */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition-all hidden md:flex">
          <Search className="h-4 w-4" />
          <span className="text-slate-400">Pesquisar...</span>
          <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <Link
          href="/dashboard/notifications"
          className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
        >
          <Bell className="h-[18px] w-[18px] text-slate-500" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-200 mx-1" />

        {/* User */}
        {session?.user && (
          <button className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {session.user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-800 leading-none">
                {session.user.name?.split(" ")[0]}
              </p>
              <p className="text-xs text-slate-400 leading-none mt-0.5">
                Administrador
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:block" />
          </button>
        )}
      </div>
    </header>
  );
}
