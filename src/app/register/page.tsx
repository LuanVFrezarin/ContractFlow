"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, Zap, ArrowRight, CheckCircle2, Shield } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro ao criar conta");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 bg-white dark:bg-slate-950 lg:bg-slate-50 order-2 lg:order-1">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">ContractFlow</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                Criar sua conta
              </h1>
              <p className="text-sm text-slate-500">
                Comece a gerenciar seus contratos hoje mesmo
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <span className="text-red-600 text-xs font-bold">!</span>
                </div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nome completo"
                type="text"
                placeholder="Seu nome"
                icon={<User className="h-4 w-4" />}
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="Email corporativo"
                type="email"
                placeholder="voce@empresa.com"
                icon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                icon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register("password")}
              />

              <Input
                label="Confirmar senha"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-11 text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 border-0"
                size="lg"
                loading={loading}
              >
                {!loading && (
                  <span className="flex items-center gap-2">
                    Criar conta gratuita
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
              <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Seus dados estão seguros. Nunca compartilharemos suas informações.</span>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-center text-sm text-slate-500">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                  Entrar no painel
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Visual Dark */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-slate-950 items-center justify-center p-12 order-1 lg:order-2">
        {/* Background blobs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-indigo-600/25 blur-[80px]" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-blue-600/20 blur-[80px]" />

        <div className="relative z-10 max-w-sm w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/40">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">ContractFlow</span>
          </div>

          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Comece a organizar seus contratos{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              hoje
            </span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            Crie sua conta e tenha acesso imediato à plataforma de gestão de contratos mais completa do mercado.
          </p>

          <div className="space-y-3 mb-10">
            {[
              "Contratos com geração automática de cobranças",
              "Dashboard com MRR, churn e inadimplência",
              "Relatórios financeiros detalhados",
              "Alertas de vencimento e renovação automática",
              "Controle de acesso por perfil de usuário",
              "Histórico completo de auditoria",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm text-slate-300"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                {item}
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/8">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["C", "M", "R", "A"].map((letter, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"][i],
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">+500 empresas</p>
                <p className="text-xs text-slate-500">já utilizam a plataforma</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
