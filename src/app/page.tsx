import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  BarChart3,
  FileText,
  Users,
  Receipt,
  Bell,
  Shield,
  Zap,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Gradient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[100px]" />
        <div className="absolute -bottom-40 right-1/3 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            ContractFlow
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <span className="hover:text-white transition-colors cursor-pointer">Funcionalidades</span>
          <span className="hover:text-white transition-colors cursor-pointer">Segurança</span>
          <span className="hover:text-white transition-colors cursor-pointer">Suporte</span>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
          >
            Começar grátis
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Plataforma de Gestão Empresarial B2B
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight">
            Controle total dos seus{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-300 bg-clip-text text-transparent animate-gradient">
              contratos
            </span>
            {" "}e{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              cobranças
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Plataforma completa para empresas que precisam gerenciar contratos
            recorrentes, faturamento automático, controle de inadimplência e
            relatórios financeiros em tempo real.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="group flex items-center gap-2 px-8 py-3.5 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50"
            >
              Começar Agora — É Grátis
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-3.5 text-base font-semibold border border-slate-700 text-slate-300 rounded-xl hover:border-slate-500 hover:text-white transition-all"
            >
              Ver demonstração
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>14 dias grátis</span>
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Suporte em português</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview mockup */}
        <div className="relative mx-auto max-w-5xl mb-24">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-2xl blur-2xl scale-95" />
          <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
            {/* Mock top bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="flex-1 mx-4 h-6 bg-slate-800 rounded-md flex items-center px-3">
                <span className="text-xs text-slate-500">app.contractflow.com/dashboard</span>
              </div>
            </div>
            {/* Mock dashboard layout */}
            <div className="flex h-64">
              {/* Mock sidebar */}
              <div className="w-48 bg-slate-950 border-r border-slate-800 p-4 space-y-2 shrink-0">
                <div className="h-8 bg-blue-500/20 rounded-lg flex items-center gap-2 px-3">
                  <div className="w-4 h-4 rounded bg-blue-400" />
                  <div className="h-3 w-16 bg-blue-400/60 rounded" />
                </div>
                {["Clientes", "Contratos", "Cobranças", "Relatórios"].map((item, i) => (
                  <div key={item} className="h-8 bg-slate-800/50 rounded-lg flex items-center gap-2 px-3">
                    <div className="w-4 h-4 rounded bg-slate-600" />
                    <div className={`h-3 bg-slate-600 rounded`} style={{width: `${40 + i * 8}px`}} />
                  </div>
                ))}
              </div>
              {/* Mock content */}
              <div className="flex-1 p-4 space-y-4 bg-slate-900/50">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "MRR", color: "blue", val: "R$ 48.5k" },
                    { label: "Clientes", color: "emerald", val: "127" },
                    { label: "Contratos", color: "purple", val: "89" },
                    { label: "Inadimpl.", color: "amber", val: "2.1%" },
                  ].map(({ label, color, val }) => (
                    <div key={label} className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                      <div className="text-xs text-slate-500 mb-1">{label}</div>
                      <div className={`text-sm font-bold text-${color}-400`}>{val}</div>
                      <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full bg-${color}-500 rounded-full`} style={{width: "65%"}} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 bg-slate-800/60 rounded-xl border border-slate-700/50 h-24 p-3">
                    <div className="text-xs text-slate-500 mb-2">Receita Mensal</div>
                    <div className="flex items-end gap-1 h-12">
                      {[40, 55, 45, 70, 60, 80, 75, 90, 85, 95, 88, 100].map((h, i) => (
                        <div key={i} className="flex-1 bg-blue-500/60 rounded-t" style={{height: `${h}%`}} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 h-24 p-3">
                    <div className="text-xs text-slate-500 mb-2">Por Status</div>
                    <div className="flex items-center justify-center h-12">
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-r-amber-400 border-b-red-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 py-10 border-y border-slate-800">
          {[
            { value: "500+", label: "Empresas ativas" },
            { value: "R$2M+", label: "Gerenciados/mês" },
            { value: "98%", label: "Taxa de uptime" },
            { value: "24h", label: "Suporte técnico" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{value}</p>
              <p className="text-sm text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Tudo que sua empresa precisa
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Uma plataforma completa para automatizar e escalar sua gestão de contratos e receita recorrente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: FileText,
                color: "blue",
                gradient: "from-blue-500/20 to-blue-600/5",
                title: "Contratos Inteligentes",
                desc: "Gerencie vigência, valores, ciclos de cobrança e renovações automáticas. Histórico completo de aditivos.",
              },
              {
                icon: Receipt,
                color: "emerald",
                gradient: "from-emerald-500/20 to-emerald-600/5",
                title: "Cobranças Automáticas",
                desc: "Faturas geradas automaticamente no dia do vencimento. Controle de pagamentos parciais e inadimplência.",
              },
              {
                icon: BarChart3,
                color: "indigo",
                gradient: "from-indigo-500/20 to-indigo-600/5",
                title: "Dashboard & KPIs",
                desc: "MRR, ARR, churn rate, inadimplência e fluxo de caixa em tempo real. Visão 360° do negócio.",
              },
              {
                icon: Users,
                color: "purple",
                gradient: "from-purple-500/20 to-purple-600/5",
                title: "Gestão de Clientes",
                desc: "Cadastro completo com CPF/CNPJ, histórico de contratos, cobranças e comunicações por cliente.",
              },
              {
                icon: Bell,
                color: "amber",
                gradient: "from-amber-500/20 to-amber-600/5",
                title: "Alertas Proativos",
                desc: "Notificações automáticas de contratos vencendo, faturas em atraso e renovações pendentes.",
              },
              {
                icon: Shield,
                color: "red",
                gradient: "from-rose-500/20 to-rose-600/5",
                title: "Segurança Enterprise",
                desc: "Controle de acesso por perfil (Admin, Gerente, Visualizador). Logs de auditoria completos.",
              },
            ].map(({ icon: Icon, color, gradient, title, desc }) => (
              <div
                key={title}
                className={`relative p-6 rounded-xl bg-gradient-to-br ${gradient} border border-slate-800 hover:border-slate-700 transition-all group hover:-translate-y-0.5`}
              >
                <div className={`w-11 h-11 rounded-xl bg-${color}-500/15 flex items-center justify-center mb-4`}>
                  <Icon className={`h-5 w-5 text-${color}-400`} />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                text: "Reduziu em 80% o tempo que gastávamos controlando contratos em planilhas. Hoje temos visibilidade total do nosso MRR.",
                name: "Carlos Mendes",
                role: "CEO, TechSolutions LTDA",
                stars: 5,
              },
              {
                text: "A geração automática de cobranças economizou horas de trabalho por mês. A inadimplência caiu de 12% para 2%.",
                name: "Priscila Costa",
                role: "Diretora Financeira, AgencyPro",
                stars: 5,
              },
              {
                text: "Dashboard completo com tudo que precisamos: MRR, contratos vencendo, faturas em aberto. Indispensável.",
                name: "Rafael Lima",
                role: "COO, ConectoServiços",
                stars: 5,
              },
            ].map(({ text, name, role, stars }) => (
              <div
                key={name}
                className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs text-slate-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mb-24 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <TrendingUp className="h-3.5 w-3.5" />
              Comece em menos de 5 minutos
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Pronto para escalar sua receita?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Crie sua conta agora e tenha controle total dos seus contratos e cobranças. Sem complexidade, sem planilhas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group flex items-center gap-2 px-8 py-3.5 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-xl shadow-blue-500/30"
              >
                Criar conta gratuita
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 px-8 py-3.5 text-base font-semibold border border-slate-700 text-slate-300 rounded-xl hover:border-slate-500 hover:text-white transition-all"
              >
                <Clock className="h-4 w-4" />
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">ContractFlow</span>
        </div>
        <p className="text-sm text-slate-600">
          © 2025 ContractFlow. Plataforma de gestão empresarial B2B.
        </p>
      </footer>
    </div>
  );
}
