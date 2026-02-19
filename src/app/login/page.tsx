"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Zap, ArrowRight, TrendingUp, Users, FileText, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [justRegistered, setJustRegistered] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setJustRegistered(params.get("registered") === "true");
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual Dark */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-slate-950 items-center justify-center p-12">
        {/* Background blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blue-600/25 blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-indigo-600/20 blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full bg-blue-500/10 blur-[60px]" />

        <div className="relative z-10 max-w-sm w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/40">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">ContractFlow</span>
          </div>

          {/* Hero text */}
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Gerencie sua receita com{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              inteligência
            </span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            Contratos, cobranças e relatórios financeiros centralizados em uma plataforma enterprise.
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            {[
              { icon: TrendingUp, label: "Taxa de recebimento", value: "97.8%", iconBg: "bg-emerald-500/20", iconColor: "text-emerald-400" },
              { icon: Users, label: "Clientes ativos", value: "500+", iconBg: "bg-blue-500/20", iconColor: "text-blue-400" },
              { icon: FileText, label: "Contratos gerenciados", value: "2.4k+", iconBg: "bg-indigo-500/20", iconColor: "text-indigo-400" },
              { icon: BarChart3, label: "Economia de tempo", value: "12h/sem", iconBg: "bg-purple-500/20", iconColor: "text-purple-400" },
            ].map(({ icon: Icon, label, value, iconBg, iconColor }) => (
              <div
                key={label}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", iconBg)}>
                  <Icon className={cn("h-4 w-4", iconColor)} />
                </div>
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Bottom trust */}
          <p className="text-xs text-slate-600 text-center">
            Utilizado por empresas de TI, serviços e tecnologia em todo o Brasil
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 bg-white dark:bg-slate-950 lg:bg-slate-50">
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
                Bem-vindo de volta
              </h1>
              <p className="text-sm text-slate-500">
                Entre na sua conta para acessar o painel
              </p>
            </div>

            {justRegistered && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="text-emerald-600 text-xs font-bold">✓</span>
                </div>
                Conta criada com sucesso! Faça login para acessar.
              </div>
            )}

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
                label="Email corporativo"
                type="email"
                placeholder="voce@empresa.com"
                icon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register("email")}
              />

              <div>
                <Input
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                  {...register("password")}
                />
                <div className="text-right mt-1.5">
                  <span
                    className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
                    onClick={() => alert("Para redefinir a senha, entre em contato com o administrador do sistema ou crie uma nova conta.")}
                  >
                    Esqueceu a senha?
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-11 text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 border-0"
                size="lg"
                loading={loading}
              >
                {!loading && (
                  <span className="flex items-center gap-2">
                    Entrar no painel
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-center text-sm text-slate-500 mb-4">
                Não tem uma conta?{" "}
                <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-700">
                  Criar conta grátis
                </Link>
              </p>

              {/* Demo credentials */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                  Conta de demonstração
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Email:</span>
                    <span className="font-mono text-slate-700 ml-1">admin@contractflow.com</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Senha:</span>
                    <span className="font-mono text-slate-700 ml-1">admin123</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
