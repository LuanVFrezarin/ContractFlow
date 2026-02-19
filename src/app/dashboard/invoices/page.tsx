"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/search-bar";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/ui/kpi-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Receipt,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  CreditCard,
} from "lucide-react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ paid: 0, pending: 0, overdue: 0, total: 0 });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", page.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/invoices?${params}`);
      const data = await res.json();
      setInvoices(data.invoices || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  const fetchStats = async () => {
    try {
      const [paidRes, pendingRes, overdueRes] = await Promise.all([
        fetch("/api/invoices?status=PAID&limit=1"),
        fetch("/api/invoices?status=PENDING&limit=1"),
        fetch("/api/invoices?status=OVERDUE&limit=1"),
      ]);
      const [paidData, pendingData, overdueData] = await Promise.all([
        paidRes.json(),
        pendingRes.json(),
        overdueRes.json(),
      ]);
      setStats({
        paid: paidData.pagination?.total || 0,
        pending: pendingData.pagination?.total || 0,
        overdue: overdueData.pagination?.total || 0,
        total: (paidData.pagination?.total || 0) +
               (pendingData.pagination?.total || 0) +
               (overdueData.pagination?.total || 0),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, [fetchInvoices]);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const openPayment = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaidAmount(invoice.amount.toString());
    setPaymentMethod("");
    setPaymentDialog(true);
  };

  const handlePayment = async (status: string) => {
    if (!selectedInvoice) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/invoices/${selectedInvoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          paidAmount: parseFloat(paidAmount),
          paymentMethod,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Erro ao atualizar");
        return;
      }

      setPaymentDialog(false);
      fetchInvoices();
      fetchStats();
    } catch {
      alert("Erro ao atualizar fatura");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "code",
      label: "Código",
      render: (item: any) => (
        <span className="font-mono text-sm font-medium text-primary">
          {item.code}
        </span>
      ),
    },
    {
      key: "client",
      label: "Cliente",
      render: (item: any) => (
        <div>
          <p className="font-medium text-foreground">{item.client?.name}</p>
          <p className="text-xs text-muted-foreground">{item.contract?.title}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Valor",
      render: (item: any) => (
        <div>
          <p className="font-semibold text-foreground">
            {formatCurrency(item.amount)}
          </p>
          {item.paidAmount && item.paidAmount !== item.amount && (
            <p className="text-xs text-emerald-600">
              Pago: {formatCurrency(item.paidAmount)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "dueDate",
      label: "Vencimento",
      render: (item: any) => (
        <div>
          <p className="text-sm">{formatDate(item.dueDate)}</p>
          {item.paidAt && (
            <p className="text-xs text-emerald-600">
              Pago em {formatDate(item.paidAt)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "paymentMethod",
      label: "Forma Pgto",
      render: (item: any) => (
        <span className="text-sm text-muted-foreground">
          {item.paymentMethod || "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item: any) => <Badge status={item.status} size="sm" />,
    },
    {
      key: "actions",
      label: "",
      render: (item: any) =>
        item.status === "PENDING" || item.status === "OVERDUE" ? (
          <Button
            variant="success"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openPayment(item);
            }}
          >
            <CreditCard className="h-3 w-3" />
            Pagar
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <Header title="Cobranças" description="Acompanhe suas faturas e pagamentos" />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard
            title="Pagas"
            value={stats.paid}
            icon={CheckCircle}
            iconColor="text-emerald-600"
          />
          <KPICard
            title="Pendentes"
            value={stats.pending}
            icon={Clock}
            iconColor="text-amber-600"
          />
          <KPICard
            title="Vencidas"
            value={stats.overdue}
            icon={AlertTriangle}
            iconColor="text-red-600"
          />
          <KPICard
            title="Total"
            value={stats.total}
            icon={Receipt}
            iconColor="text-blue-600"
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
            <SearchBar
              placeholder="Buscar faturas..."
              onSearch={handleSearch}
              className="flex-1 max-w-md"
            />
            <Select
              options={[
                { value: "", label: "Todos os status" },
                { value: "PENDING", label: "Pendente" },
                { value: "PAID", label: "Pago" },
                { value: "OVERDUE", label: "Vencido" },
                { value: "CANCELLED", label: "Cancelado" },
                { value: "PARTIAL", label: "Parcial" },
              ]}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-40"
            />
          </div>
        </div>

        {/* Dica */}
        {invoices.length === 0 && !loading && !search && !statusFilter && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Dica:</strong> As faturas são geradas automaticamente ao criar um contrato.
              Vá em <a href="/dashboard/contracts" className="underline font-semibold">Contratos</a> para criar um contrato e as cobranças serão geradas com base no ciclo escolhido.
            </p>
          </div>
        )}

        {/* Table */}
        <DataTable
          columns={columns}
          data={invoices}
          pagination={pagination}
          onPageChange={setPage}
          loading={loading}
          emptyMessage="Nenhuma fatura encontrada"
          emptyIcon={<Receipt className="h-8 w-8 text-muted-foreground" />}
        />
      </div>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        title="Registrar Pagamento"
        description={selectedInvoice ? `Fatura ${selectedInvoice.code} - ${selectedInvoice.client?.name}` : ""}
        size="sm"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Valor da fatura</span>
                <span className="font-bold">{formatCurrency(selectedInvoice.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Vencimento</span>
                <span className="text-sm">{formatDate(selectedInvoice.dueDate)}</span>
              </div>
            </div>

            <Input
              label="Valor pago"
              type="number"
              step="0.01"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              icon={<DollarSign className="h-4 w-4" />}
            />

            <Select
              label="Forma de pagamento"
              placeholder="Selecione"
              options={[
                { value: "PIX", label: "PIX" },
                { value: "Boleto", label: "Boleto" },
                { value: "Cartão de Crédito", label: "Cartão de Crédito" },
                { value: "Cartão de Débito", label: "Cartão de Débito" },
                { value: "Transferência", label: "Transferência" },
                { value: "Dinheiro", label: "Dinheiro" },
              ]}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handlePayment("PARTIAL")}
                loading={saving}
                disabled={parseFloat(paidAmount) >= selectedInvoice.amount}
              >
                Parcial
              </Button>
              <Button
                variant="success"
                className="flex-1"
                onClick={() => handlePayment("PAID")}
                loading={saving}
              >
                <CheckCircle className="h-4 w-4" />
                Pago Total
              </Button>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => handlePayment("CANCELLED")}
              loading={saving}
            >
              Cancelar Fatura
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
