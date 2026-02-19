"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  BarChart3,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  Settings,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Clientes",
    href: "/dashboard/clients",
    icon: Users,
    exact: false,
  },
  {
    label: "Contratos",
    href: "/dashboard/contracts",
    icon: FileText,
    exact: false,
  },
  {
    label: "Cobranças",
    href: "/dashboard/invoices",
    icon: Receipt,
    exact: false,
  },
  {
    label: "Relatórios",
    href: "/dashboard/reports",
    icon: BarChart3,
    exact: false,
  },
  {
    label: "Notificações",
    href: "/dashboard/notifications",
    icon: Bell,
    exact: false,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col transition-all duration-300 ease-in-out",
        "bg-slate-950 border-r border-slate-800/60",
        collapsed ? "w-[68px]" : "w-[248px]"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 border-b border-slate-800/60 shrink-0",
          collapsed ? "justify-center px-4" : "gap-3 px-5"
        )}
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 shrink-0">
          <Zap className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-white text-[15px] leading-none">
              ContractFlow
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
              Gestão Empresarial
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">
            Menu Principal
          </p>
        )}

        {menuItems.map((item) => {
          const isActive =
            item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150",
                collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                isActive
                  ? "bg-blue-600/15 text-blue-400 shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive ? "text-blue-400" : "text-slate-500"
                )}
              />
              {!collapsed && (
                <span className={cn(isActive ? "text-blue-300" : "")}>
                  {item.label}
                </span>
              )}
              {!collapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}

        {!collapsed && (
          <div className="pt-4">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">
              Sistema
            </p>
          </div>
        )}
        {(() => {
          const isSettingsActive = pathname === "/dashboard/settings" || pathname.startsWith("/dashboard/settings/");
          return (
            <Link
              href="/dashboard/settings"
              title={collapsed ? "Configurações" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150",
                collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                isSettingsActive
                  ? "bg-blue-600/15 text-blue-400 shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <Settings className={cn("h-[18px] w-[18px] shrink-0 transition-colors", isSettingsActive ? "text-blue-400" : "text-slate-500")} />
              {!collapsed && <span className={cn(isSettingsActive ? "text-blue-300" : "")}>Configurações</span>}
              {!collapsed && isSettingsActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })()}
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-800/60 p-3 shrink-0">
        {session?.user && !collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {session.user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate leading-none mb-0.5">
                {session.user.name}
              </p>
              <p className="text-xs text-slate-500 truncate leading-none">
                {session.user.email}
              </p>
            </div>
          </div>
        )}

        {collapsed && session?.user && (
          <div className="flex items-center justify-center mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {session.user.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "flex items-center gap-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 w-full",
            collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
          )}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-slate-800 border border-slate-700 shadow-lg flex items-center justify-center hover:bg-slate-700 transition-colors z-50"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-slate-400" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-slate-400" />
        )}
      </button>
    </aside>
  );
}
