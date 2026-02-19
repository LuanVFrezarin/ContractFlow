"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#f97316"];

export default function ReportsPage() {
  const [reportType, setReportType] = useState("revenue");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 12);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [groupBy, setGroupBy] = useState("month");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: reportType,
        startDate,
        endDate,
        groupBy,
      });
      const res = await fetch(`/api/reports?${params}`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, startDate, endDate, groupBy]);

  return (
    <div>
      <Header title="Relatórios" description="Análise e insights do seu negócio" />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <Select
                label="Tipo de Relatório"
                options={[
                  { value: "revenue", label: "Faturamento" },
                  { value: "clients", label: "Clientes" },
                  { value: "contracts", label: "Contratos" },
                  { value: "cashflow", label: "Fluxo de Caixa" },
                ]}
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              />
              <Input
                label="Data Início"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="Data Fim"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              {reportType === "revenue" && (
                <Select
                  label="Agrupar por"
                  options={[
                    { value: "day", label: "Dia" },
                    { value: "week", label: "Semana" },
                    { value: "month", label: "Mês" },
                  ]}
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                />
              )}
              <Button onClick={fetchReport} loading={loading}>
                <BarChart3 className="h-4 w-4" />
                Gerar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {/* Revenue Report */}
        {!loading && data && reportType === "revenue" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPICard
                title="Receita Total"
                value={formatCurrency(data.totalRevenue)}
                icon={DollarSign}
                iconColor="text-emerald-600"
              />
              <KPICard
                title="Total de Faturas Pagas"
                value={data.totalInvoices}
                icon={TrendingUp}
                iconColor="text-blue-600"
              />
              <KPICard
                title="Ticket Médio"
                value={formatCurrency(data.averageTicket)}
                icon={BarChart3}
                iconColor="text-purple-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bar Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Faturamento por Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.byPeriod}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value: number) => [formatCurrency(value), "Receita"]}
                          contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                        />
                        <Bar dataKey="total" name="Receita" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Clients */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.topClients?.map((client: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground w-5">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium">{client.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {client.count} faturas
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatCurrency(client.total)}
                        </span>
                      </div>
                    ))}
                    {(!data.topClients || data.topClients.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Sem dados
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Client Report */}
        {!loading && data && reportType === "clients" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <KPICard
                title="Total de Clientes"
                value={data.totalClients}
                icon={Users}
                iconColor="text-blue-600"
              />
              <KPICard
                title="Clientes Ativos"
                value={data.activeClients}
                icon={Users}
                iconColor="text-emerald-600"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Clientes por Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Cliente
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                          Faturado
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                          Pago
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                          Saldo
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                          Vencidas
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.clients?.map((client: any) => (
                        <tr key={client.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium">{client.name}</p>
                            <p className="text-xs text-muted-foreground">{client.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge status={client.status} size="sm" />
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            {formatCurrency(client.totalBilled)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-emerald-600 font-medium">
                            {formatCurrency(client.totalPaid)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            <span className={client.balance > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}>
                              {formatCurrency(client.balance)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            {client.overdueCount > 0 ? (
                              <span className="text-red-600 font-medium">{client.overdueCount}</span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Contract Report */}
        {!loading && data && reportType === "contracts" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <KPICard
                title="Total de Contratos"
                value={data.totalContracts}
                icon={FileText}
                iconColor="text-blue-600"
              />
              <KPICard
                title="Valor Ativo Total"
                value={formatCurrency(data.totalActiveValue)}
                icon={DollarSign}
                iconColor="text-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.byStatus?.map((item: any) => ({
                            ...item,
                            name: item.status,
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="count"
                        >
                          {data.byStatus?.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* By Cycle */}
              <Card>
                <CardHeader>
                  <CardTitle>Por Periodicidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.byCycle} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                        <YAxis dataKey="cycle" type="category" tick={{ fontSize: 11 }} stroke="#9ca3af" width={100} />
                        <Tooltip />
                        <Bar dataKey="count" name="Qtd" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Cashflow Report */}
        {!loading && data && reportType === "cashflow" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Recebido"
                value={formatCurrency(data.totalReceived)}
                icon={ArrowUpRight}
                iconColor="text-emerald-600"
              />
              <KPICard
                title="A Receber"
                value={formatCurrency(data.totalPending)}
                icon={DollarSign}
                iconColor="text-amber-600"
              />
              <KPICard
                title="Vencido"
                value={formatCurrency(data.totalOverdue)}
                icon={ArrowDownRight}
                iconColor="text-red-600"
              />
              <KPICard
                title="Total Esperado"
                value={formatCurrency(data.totalExpected)}
                icon={TrendingUp}
                iconColor="text-blue-600"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição do Fluxo de Caixa</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Progress bar */}
                <div className="space-y-4">
                  <div className="h-8 bg-muted rounded-full overflow-hidden flex">
                    {data.totalExpected > 0 && (
                      <>
                        <div
                          className="h-full bg-emerald-500 flex items-center justify-center text-white text-xs font-medium"
                          style={{
                            width: `${(data.totalReceived / data.totalExpected) * 100}%`,
                          }}
                        >
                          {((data.totalReceived / data.totalExpected) * 100).toFixed(0)}%
                        </div>
                        <div
                          className="h-full bg-amber-400 flex items-center justify-center text-white text-xs font-medium"
                          style={{
                            width: `${(data.totalPending / data.totalExpected) * 100}%`,
                          }}
                        >
                          {((data.totalPending / data.totalExpected) * 100).toFixed(0)}%
                        </div>
                        <div
                          className="h-full bg-red-400 flex items-center justify-center text-white text-xs font-medium"
                          style={{
                            width: `${(data.totalOverdue / data.totalExpected) * 100}%`,
                          }}
                        >
                          {((data.totalOverdue / data.totalExpected) * 100).toFixed(0)}%
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-sm text-muted-foreground">Recebido</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="text-sm text-muted-foreground">Pendente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="text-sm text-muted-foreground">Vencido</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
