"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/search-bar";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate, getStatusLabel, getDaysUntil } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contractSchema, type ContractFormData } from "@/lib/validators";
import { Plus, FileText, Calendar, DollarSign } from "lucide-react";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [detailContract, setDetailContract] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
  });

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", page.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/contracts?${params}`);
      const data = await res.json();
      setContracts(data.contracts || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients?limit=100");
      const data = await res.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchClients();
  }, [fetchContracts]);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const openCreate = () => {
    setEditingContract(null);
    const today = new Date().toISOString().split("T")[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    reset({
      clientId: "",
      title: "",
      description: "",
      value: 0,
      billingCycle: "MONTHLY",
      startDate: today,
      endDate: nextYear.toISOString().split("T")[0],
      renewalType: "MANUAL",
      paymentDay: 10,
      notes: "",
      status: "ACTIVE",
    });
    setDialogOpen(true);
  };

  const openEdit = (contract: any) => {
    setEditingContract(contract);
    reset({
      clientId: contract.clientId,
      title: contract.title,
      description: contract.description || "",
      value: contract.value,
      billingCycle: contract.billingCycle,
      startDate: new Date(contract.startDate).toISOString().split("T")[0],
      endDate: new Date(contract.endDate).toISOString().split("T")[0],
      renewalType: contract.renewalType,
      paymentDay: contract.paymentDay,
      notes: contract.notes || "",
      status: contract.status,
    });
    setDialogOpen(true);
  };

  const openDetail = async (contract: any) => {
    try {
      const res = await fetch(`/api/contracts/${contract.id}`);
      const data = await res.json();
      setDetailContract(data);
      setDetailOpen(true);
    } catch (error) {
      console.error("Error fetching contract detail:", error);
    }
  };

  const onSubmit = async (data: ContractFormData) => {
    setSaving(true);
    try {
      const url = editingContract
        ? `/api/contracts/${editingContract.id}`
        : "/api/contracts";
      const method = editingContract ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Erro ao salvar");
        return;
      }

      setDialogOpen(false);
      fetchContracts();
    } catch {
      alert("Erro ao salvar contrato");
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
      key: "title",
      label: "Contrato",
      render: (item: any) => (
        <div>
          <p className="font-medium text-foreground">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.client?.name}</p>
        </div>
      ),
    },
    {
      key: "value",
      label: "Valor",
      render: (item: any) => (
        <div>
          <p className="font-semibold text-foreground">
            {formatCurrency(item.value)}
          </p>
          <p className="text-xs text-muted-foreground">
            {getStatusLabel(item.billingCycle)}
          </p>
        </div>
      ),
    },
    {
      key: "period",
      label: "Vigência",
      render: (item: any) => (
        <div>
          <p className="text-sm">
            {formatDate(item.startDate)} — {formatDate(item.endDate)}
          </p>
          {item.status === "ACTIVE" && (
            <p className="text-xs text-muted-foreground">
              {getDaysUntil(item.endDate)} dias restantes
            </p>
          )}
        </div>
      ),
    },
    {
      key: "invoices",
      label: "Faturas",
      render: (item: any) => (
        <span className="text-sm">{item._count?.invoices || 0}</span>
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
      render: (item: any) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openDetail(item);
            }}
          >
            Ver
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(item);
            }}
          >
            Editar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Header title="Contratos" description="Gerencie seus contratos" />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
            <SearchBar
              placeholder="Buscar contratos..."
              onSearch={handleSearch}
              className="flex-1 max-w-md"
            />
            <Select
              options={[
                { value: "", label: "Todos os status" },
                { value: "ACTIVE", label: "Ativo" },
                { value: "DRAFT", label: "Rascunho" },
                { value: "SUSPENDED", label: "Suspenso" },
                { value: "CANCELLED", label: "Cancelado" },
                { value: "EXPIRED", label: "Expirado" },
              ]}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-40"
            />
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo Contrato
          </Button>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={contracts}
          pagination={pagination}
          onPageChange={setPage}
          loading={loading}
          emptyMessage="Nenhum contrato encontrado"
          emptyIcon={<FileText className="h-8 w-8 text-muted-foreground" />}
        />
      </div>

      {/* Dialog Create/Edit */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingContract ? "Editar Contrato" : "Novo Contrato"}
        description={
          editingContract
            ? "Atualize os dados do contrato"
            : "Preencha os dados para criar um novo contrato. As cobranças serão geradas automaticamente."
        }
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Cliente *"
              placeholder="Selecione um cliente"
              options={clients.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              error={errors.clientId?.message}
              {...register("clientId")}
            />
            <Input
              label="Título *"
              placeholder="Ex: Manutenção Mensal"
              icon={<FileText className="h-4 w-4" />}
              error={errors.title?.message}
              {...register("title")}
            />
            <Input
              label="Valor *"
              type="number"
              step="0.01"
              placeholder="1500.00"
              icon={<DollarSign className="h-4 w-4" />}
              error={errors.value?.message}
              {...register("value")}
            />
            <Select
              label="Periodicidade"
              options={[
                { value: "WEEKLY", label: "Semanal" },
                { value: "BIWEEKLY", label: "Quinzenal" },
                { value: "MONTHLY", label: "Mensal" },
                { value: "QUARTERLY", label: "Trimestral" },
                { value: "SEMIANNUAL", label: "Semestral" },
                { value: "ANNUAL", label: "Anual" },
              ]}
              {...register("billingCycle")}
            />
            <Input
              label="Data de Início *"
              type="date"
              icon={<Calendar className="h-4 w-4" />}
              error={errors.startDate?.message}
              {...register("startDate")}
            />
            <Input
              label="Data de Término *"
              type="date"
              icon={<Calendar className="h-4 w-4" />}
              error={errors.endDate?.message}
              {...register("endDate")}
            />
            <Input
              label="Dia do Vencimento"
              type="number"
              min="1"
              max="28"
              placeholder="10"
              {...register("paymentDay")}
            />
            <Select
              label="Tipo de Renovação"
              options={[
                { value: "AUTOMATIC", label: "Automática" },
                { value: "MANUAL", label: "Manual" },
                { value: "NONE", label: "Sem renovação" },
              ]}
              {...register("renewalType")}
            />
            <Select
              label="Status"
              options={[
                { value: "DRAFT", label: "Rascunho" },
                { value: "ACTIVE", label: "Ativo" },
                { value: "SUSPENDED", label: "Suspenso" },
              ]}
              {...register("status")}
            />
          </div>

          <Textarea
            label="Descrição"
            placeholder="Detalhes do contrato..."
            {...register("description")}
          />

          <Textarea
            label="Observações"
            placeholder="Observações internas..."
            {...register("notes")}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingContract ? "Salvar Alterações" : "Criar Contrato"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Dialog Detail */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailContract?.title}
        description={`Código: ${detailContract?.code}`}
        size="xl"
      >
        {detailContract && (
          <div className="space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Valor</p>
                <p className="text-lg font-bold">{formatCurrency(detailContract.value)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Periodicidade</p>
                <p className="text-lg font-bold">{getStatusLabel(detailContract.billingCycle)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge status={detailContract.status} />
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Faturas</p>
                <p className="text-lg font-bold">{detailContract.invoices?.length || 0}</p>
              </div>
            </div>

            {/* Client */}
            <div className="p-4 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Cliente</p>
              <p className="font-medium">{detailContract.client?.name}</p>
              <p className="text-sm text-muted-foreground">{detailContract.client?.email}</p>
            </div>

            {/* Vigência */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Início</p>
                <p className="font-medium">{formatDate(detailContract.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Término</p>
                <p className="font-medium">{formatDate(detailContract.endDate)}</p>
              </div>
            </div>

            {/* Invoices */}
            {detailContract.invoices?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Cobranças</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {detailContract.invoices.map((inv: any) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div>
                        <p className="text-sm font-medium">{inv.code}</p>
                        <p className="text-xs text-muted-foreground">
                          Vence em {formatDate(inv.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">
                          {formatCurrency(inv.amount)}
                        </span>
                        <Badge status={inv.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
