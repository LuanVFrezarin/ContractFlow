"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, formatDate } from "@/lib/utils";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  FileText,
  Receipt,
  AlertTriangle,
  RefreshCw,
  Info,
} from "lucide-react";
import Link from "next/link";

const typeIcons: Record<string, any> = {
  CONTRACT_EXPIRING: AlertTriangle,
  INVOICE_OVERDUE: Receipt,
  INVOICE_PAID: Check,
  CONTRACT_RENEWED: RefreshCw,
  SYSTEM: Info,
};

const typeColors: Record<string, string> = {
  CONTRACT_EXPIRING: "text-amber-600",
  INVOICE_OVERDUE: "text-red-600",
  INVOICE_PAID: "text-emerald-600",
  CONTRACT_RENEWED: "text-blue-600",
  SYSTEM: "text-gray-600",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <div>
      <Header
        title="Notificações"
        description={`${unreadCount} não lida${unreadCount !== 1 ? "s" : ""}`}
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Toolbar */}
        {unreadCount > 0 && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {/* Empty */}
        {!loading && notifications.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <BellOff className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">Nenhuma notificação</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              As notificações aparecem automaticamente quando contratos estiverem vencendo ou faturas estiverem em atraso.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-lg mx-auto text-left">
              <p className="text-sm font-semibold text-blue-800 mb-2">Como funcionam as notificações?</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Contratos que vencem nos próximos 30 dias geram alertas automaticamente</li>
                <li>• Faturas vencidas são sinalizadas para ação imediata</li>
                <li>• Pagamentos recebidos geram confirmação aqui</li>
                <li>• Configure suas preferências em <a href="/dashboard/settings" className="underline font-semibold">Configurações</a></li>
              </ul>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Bell;
              const color = typeColors[notification.type] || "text-gray-600";

              return (
                <Card
                  key={notification.id}
                  className={cn(
                    "transition-all duration-200",
                    !notification.read && "border-primary/30 bg-primary/5"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "rounded-full p-2 shrink-0",
                          !notification.read ? "bg-primary/10" : "bg-muted"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", color)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p
                              className={cn(
                                "text-sm",
                                !notification.read
                                  ? "font-semibold text-foreground"
                                  : "text-foreground"
                              )}
                            >
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {notification.message}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          {notification.link && (
                            <Link
                              href={notification.link}
                              className="text-xs text-primary hover:underline"
                            >
                              Ver detalhes →
                            </Link>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              Marcar como lida
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
