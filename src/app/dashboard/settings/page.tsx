"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Check,
  KeyRound,
  Mail,
  Phone,
  Sun,
  Moon,
  Monitor,
  AlertCircle,
  Loader2,
} from "lucide-react";

type Tab = "profile" | "notifications" | "security" | "appearance";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "security", label: "Segurança", icon: Shield },
  { id: "appearance", label: "Aparência", icon: Palette },
];

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none",
        enabled ? "bg-blue-600" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("ADMIN");

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Notification state
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifBrowser, setNotifBrowser] = useState(true);
  const [notifInvoice, setNotifInvoice] = useState(true);
  const [notifContract, setNotifContract] = useState(true);
  const [notifOverdue, setNotifOverdue] = useState(true);

  // Appearance state
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  // Carregar dados reais do perfil
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone || "");
        if (data.role) setRole(data.role);
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar");
        return;
      }
      setSaved(true);
      await updateSession({ name: data.name });
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Erro ao alterar senha");
        return;
      }
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch {
      setPasswordError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header title="Configurações" description="Gerencie sua conta e preferências" />

      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {/* Tab bar */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── PERFIL ─────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {loadingProfile ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-sm text-slate-500">Carregando perfil...</span>
                  </div>
                ) : (
                  <>
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-blue-500/25 shrink-0">
                        {(name || "U")[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{name || "Usuário"}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{email}</p>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          <User className="inline h-3.5 w-3.5 mr-1 text-slate-400" />
                          Nome completo
                        </label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Seu nome"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          <Mail className="inline h-3.5 w-3.5 mr-1 text-slate-400" />
                          E-mail
                        </label>
                        <Input value={email} disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                        <p className="text-xs text-slate-400 mt-1">O e-mail não pode ser alterado.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          <Phone className="inline h-3.5 w-3.5 mr-1 text-slate-400" />
                          Telefone
                        </label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Nível de acesso
                        </label>
                        <div className="flex items-center gap-2 h-10">
                          <CustomBadge variant="info">{role}</CustomBadge>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={saving || loadingProfile}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                {saved ? <Check className="h-4 w-4" /> : saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saved ? "Salvo!" : saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </div>
        )}

        {/* ─── NOTIFICAÇÕES ──────────────────────────── */}
        {activeTab === "notifications" && (
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-500" />
                  Preferências de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-400 mb-4">Escolha quais alertas deseja receber.</p>
                <div className="divide-y divide-slate-100">
                  {[
                    { label: "Notificações por e-mail", desc: "Receba alertas no seu e-mail cadastrado.", value: notifEmail, onChange: setNotifEmail },
                    { label: "Notificações no navegador", desc: "Alertas via push no navegador (quando disponível).", value: notifBrowser, onChange: setNotifBrowser },
                    { label: "Faturas pendentes e pagas", desc: "Alertas quando faturas são pagas ou vencem em breve.", value: notifInvoice, onChange: setNotifInvoice },
                    { label: "Contratos vencendo", desc: "Aviso quando um contrato estiver próximo do fim.", value: notifContract, onChange: setNotifContract },
                    { label: "Faturas em atraso", desc: "Alerta imediato quando faturas passam do vencimento.", value: notifOverdue, onChange: setNotifOverdue },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <Toggle enabled={item.value} onChange={item.onChange} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> As notificações são geradas automaticamente pelo sistema. Veja todas na página de{" "}
                <a href="/dashboard/notifications" className="underline font-semibold">Notificações</a>.
              </p>
            </div>
          </div>
        )}

        {/* ─── SEGURANÇA ─────────────────────────────── */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-blue-500" />
                  Alterar Senha
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {passwordError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {passwordError}
                  </div>
                )}
                {passwordSaved && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0" />
                    Senha alterada com sucesso!
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha atual</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nova senha</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-slate-400 mt-1">Mínimo 6 caracteres.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar nova senha</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> As senhas não coincidem.
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleChangePassword}
                    disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 disabled:opacity-50"
                  >
                    {passwordSaved ? <Check className="h-4 w-4" /> : saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    {passwordSaved ? "Alterada!" : saving ? "Alterando..." : "Alterar senha"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-slate-400" />
                  Sessão Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Navegador Web</p>
                    <p className="text-xs text-slate-500 mt-0.5">Sessão iniciada — {session?.user?.email}</p>
                  </div>
                  <CustomBadge variant="success">Ativa</CustomBadge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── APARÊNCIA ─────────────────────────────── */}
        {activeTab === "appearance" && (
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-blue-500" />
                  Tema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      { id: "light", label: "Claro", icon: Sun, preview: "bg-white border-slate-200" },
                      { id: "dark", label: "Escuro", icon: Moon, preview: "bg-slate-900 border-slate-700" },
                      { id: "system", label: "Sistema", icon: Monitor, preview: "bg-gradient-to-br from-white to-slate-800 border-slate-300" },
                    ] as const
                  ).map((t) => {
                    const Icon = t.icon;
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-150",
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        )}
                      >
                        <div className={cn("w-full h-12 rounded-lg border", t.preview)} />
                        <div className="flex items-center gap-1.5">
                          <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-blue-600" : "text-slate-400")} />
                          <span className={cn("text-sm font-medium", isSelected ? "text-blue-700" : "text-slate-600")}>
                            {t.label}
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 ml-0.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  O tema escuro está em desenvolvimento. Atualmente o sistema utiliza o tema claro.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
