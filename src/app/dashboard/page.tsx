"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getDaysUntil } from "@/lib/utils";
import {
  Users,
  FileText,
  Receipt,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Activity,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6b7280", "#f97316"];
const STATUS_LABELS: Record<string, string> = {
  PAID: "Pago",
  PENDING: "Pendente",
  OVERDUE: "Vencido",
  CANCELLED: "Cancelado",
  PARTIAL: "Parcial",
};

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  colorScheme: "blue" | "emerald" | "purple" | "amber" | "red";
}

function KPICard({ title, value, description, icon: Icon, trend, trendValue, colorScheme }: KPICardProps) {
  const schemes = {
    blue: {
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      gradient: "from-blue-500 to-blue-600",
      border: "border-blue-100",
    },
    emerald: {
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      gradient: "from-emerald-500 to-emerald-600",
      border: "border-emerald-100",
    },
    purple: {
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      gradient: "from-purple-500 to-purple-600",
      border: "border-purple-100",
    },
    amber: {
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      gradient: "from-amber-500 to-amber-600",
      border: "border-amber-100",
    },
    red: {
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      gradient: "from-red-500 to-red-600",
      border: "border-red-100",
    },
  };

  const s = schemes[colorScheme];

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border p-5 bg-white shadow-sm hover:shadow-md transition-shadow",
      s.border
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.iconBg)}>
          <Icon className={cn("h-5 w-5", s.iconColor)} />
        </div>
        {trend && trendValue && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg",
            trend === "up" && "bg-emerald-50 text-emerald-600",
            trend === "down" && "bg-red-50 text-red-600",
            trend === "neutral" && "bg-slate-100 text-slate-500",
          )}>
            {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
            {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
            {trend === "neutral" && <Minus className="h-3 w-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 leading-none mb-1">
          {value}
        </p>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {description && (
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        )}
      </div>
      {/* Decorative gradient bar at bottom */}
      <div className={cn("absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r", s.gradient)} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div>
      <Header title="Dashboard" description="Visão geral do sistema" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-80 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-80 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Custom tooltip for recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xl">
        <p className="text-xs font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name}: {p.name === "Receita" || p.name === "Pendente"
              ? formatCurrency(p.value)
              : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!data) return null;

  const {
    kpis,
    recentActivities,
    expiringContracts,
    overdueInvoicesList,
    monthlyRevenue,
    invoicesByStatus,
  } = data;

  return (
    <div className="animate-fade-in">
      <Header title="Dashboard" description="Visão geral da plataforma" />

      <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-64px)]">

        {/* Guia Rápido - Como usar o sistema */}
        <details className="group bg-white border border-blue-200 rounded-xl shadow-sm">
          <summary className="flex items-center justify-between cursor-pointer p-4 hover:bg-blue-50/50 transition-colors rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-lg">🚀</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Como usar o ContractFlow</h3>
                <p className="text-xs text-slate-500 mt-0.5">Clique para ver o passo a passo</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-90" />
          </summary>
          <div className="px-4 pb-4 border-t border-blue-100 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/dashboard/clients" className="flex gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group/step">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 group-hover/step:text-blue-700">Cadastrar Clientes</p>
                  <p className="text-xs text-slate-500 mt-0.5">Adicione os clientes com nome, e-mail, CPF/CNPJ e endereço.</p>
                </div>
              </Link>
              <Link href="/dashboard/contracts" className="flex gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group/step">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 group-hover/step:text-blue-700">Criar Contratos</p>
                  <p className="text-xs text-slate-500 mt-0.5">Vincule contratos com valor, período e ciclo de cobrança. As faturas são geradas automaticamente.</p>
                </div>
              </Link>
              <Link href="/dashboard/invoices" className="flex gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group/step">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 group-hover/step:text-blue-700">Gerenciar Cobranças</p>
                  <p className="text-xs text-slate-500 mt-0.5">Veja as faturas, registre pagamentos (total ou parcial) e acompanhe inadimplências.</p>
                </div>
              </Link>
              <Link href="/dashboard/reports" className="flex gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group/step">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">4</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 group-hover/step:text-blue-700">Ver Relatórios</p>
                  <p className="text-xs text-slate-500 mt-0.5">Analise receita, clientes, fluxo de caixa e status dos contratos.</p>
                </div>
              </Link>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              💡 As faturas são geradas automaticamente ao criar um contrato. Basta registrar o pagamento quando receber.
            </p>
          </div>
        </details>

        {/* KPI Cards - Primary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Receita Mensal (MRR)"
            value={formatCurrency(kpis.mrr)}
            description={`ARR: ${formatCurrency(kpis.arr)}`}
            icon={DollarSign}
            colorScheme="emerald"
          />
          <KPICard
            title="Clientes Ativos"
            value={kpis.activeClients}
            description={`${kpis.totalClients} no total`}
            icon={Users}
            colorScheme="blue"
          />
          <KPICard
            title="Contratos Ativos"
            value={kpis.activeContracts}
            description={`${kpis.totalContracts} no total`}
            icon={FileText}
            colorScheme="purple"
          />
          <KPICard
            title="Taxa de Inadimplência"
            value={`${kpis.defaultRate}%`}
            description={`${kpis.overdueInvoices} faturas vencidas`}
            icon={AlertTriangle}
            trend={Number(kpis.defaultRate) > 5 ? "down" : "up"}
            trendValue={Number(kpis.defaultRate) > 5 ? "Atenção" : "Saudável"}
            colorScheme={Number(kpis.defaultRate) > 5 ? "red" : "emerald"}
          />
        </div>

        {/* KPI Cards - Secondary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard
            title="Faturado este Mês"
            value={formatCurrency(kpis.revenueThisMonth)}
            icon={TrendingUp}
            colorScheme="emerald"
          />
          <KPICard
            title="Faturas Pendentes"
            value={kpis.pendingInvoices}
            icon={Clock}
            colorScheme="amber"
          />
          <KPICard
            title="Total de Faturas"
            value={kpis.totalInvoices}
            icon={Receipt}
            colorScheme="blue"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2 shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-800 text-base">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                  Receita Mensal
                </CardTitle>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-blue-500 rounded" />
                    <span className="text-slate-500">Recebido</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-amber-400 rounded" style={{borderStyle: "dashed"}} />
                    <span className="text-slate-500">Pendente</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPendente" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                      width={55}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="receita"
                      name="Receita"
                      stroke="#3b82f6"
                      fill="url(#colorReceita)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pendente"
                      name="Pendente"
                      stroke="#f59e0b"
                      fill="url(#colorPendente)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={{ r: 4, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-slate-800 text-base">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-purple-600" />
                </div>
                Faturas por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={invoicesByStatus.map((item: any) => ({
                        ...item,
                        name: STATUS_LABELS[item.status] || item.status,
                      }))}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {invoicesByStatus.map((_: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span style={{ color: "#64748b", fontSize: "11px" }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Expiring Contracts */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                  Contratos Vencendo em 30 dias
                </CardTitle>
                {expiringContracts.length > 0 && (
                  <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                    {expiringContracts.length} alertas
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {expiringContracts.length === 0 ? (
                <div className="flex items-center gap-3 py-4 text-sm text-slate-500">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Nenhum contrato vencendo nos próximos 30 dias
                </div>
              ) : (
                <div className="space-y-2">
                  {expiringContracts.map((contract: any) => {
                    const days = getDaysUntil(contract.endDate);
                    const isUrgent = days <= 7;
                    return (
                      <Link
                        key={contract.id}
                        href="/dashboard/contracts"
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{contract.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {contract.client.name} · Vence em {formatDate(contract.endDate)}
                          </p>
                        </div>
                        <div className={cn(
                          "ml-3 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0",
                          isUrgent
                            ? "bg-red-100 text-red-600"
                            : "bg-amber-100 text-amber-600"
                        )}>
                          {days}d
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overdue Invoices */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  Faturas Vencidas
                </CardTitle>
                {overdueInvoicesList.length > 0 && (
                  <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    {overdueInvoicesList.length} faturas
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {overdueInvoicesList.length === 0 ? (
                <div className="flex items-center gap-3 py-4 text-sm text-slate-500">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Nenhuma fatura em atraso. Excelente!
                </div>
              ) : (
                <div className="space-y-2">
                  {overdueInvoicesList.map((invoice: any) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-red-50/30 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{invoice.client.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {invoice.contract.title} · Venceu {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                      <div className="ml-3 text-sm font-bold text-red-600 shrink-0">
                        {formatCurrency(invoice.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                Atividades Recentes
              </CardTitle>
              <span className="text-xs text-slate-400">Últimas 10 ações</span>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">Nenhuma atividade recente.</p>
            ) : (
              <div className="space-y-0">
                {recentActivities.map((activity: any, index: number) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "flex items-start gap-3 py-3",
                      index < recentActivities.length - 1 && "border-b border-slate-50"
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                        {activity.user.name[0]}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">{activity.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activity.user.name} · {formatDate(activity.createdAt)}
                      </p>
                    </div>
                    <Badge status={activity.type.split("_")[1] || activity.type} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
