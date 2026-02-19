"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/search-bar";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatDocument, formatPhone } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type ClientFormData } from "@/lib/validators";
import { Plus, Users, Mail, Phone, Building } from "lucide-react";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", page.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/clients?${params}`);
      const data = await res.json();
      setClients(data.clients || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const openCreate = () => {
    setEditingClient(null);
    reset({
      name: "",
      email: "",
      phone: "",
      document: "",
      documentType: "CPF",
      company: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: "",
      status: "ACTIVE",
    });
    setDialogOpen(true);
  };

  const openEdit = (client: any) => {
    setEditingClient(client);
    reset({
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      document: client.document || "",
      documentType: client.documentType || "CPF",
      company: client.company || "",
      address: client.address || "",
      city: client.city || "",
      state: client.state || "",
      zipCode: client.zipCode || "",
      notes: client.notes || "",
      status: client.status,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: ClientFormData) => {
    setSaving(true);
    try {
      const url = editingClient
        ? `/api/clients/${editingClient.id}`
        : "/api/clients";
      const method = editingClient ? "PUT" : "POST";

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
      fetchClients();
    } catch {
      alert("Erro ao salvar cliente");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Cliente",
      render: (item: any) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.email}</p>
        </div>
      ),
    },
    {
      key: "document",
      label: "Documento",
      render: (item: any) => (
        <span className="text-sm">
          {item.document ? formatDocument(item.document) : "—"}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Telefone",
      render: (item: any) => (
        <span className="text-sm">
          {item.phone ? formatPhone(item.phone) : "—"}
        </span>
      ),
    },
    {
      key: "company",
      label: "Empresa",
      render: (item: any) => (
        <span className="text-sm">{item.company || "—"}</span>
      ),
    },
    {
      key: "_count",
      label: "Contratos",
      render: (item: any) => (
        <span className="text-sm font-medium">{item._count?.contracts || 0}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item: any) => <Badge status={item.status} size="sm" />,
    },
    {
      key: "createdAt",
      label: "Cadastro",
      render: (item: any) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (item: any) => (
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
      ),
    },
  ];

  return (
    <div>
      <Header title="Clientes" description="Gerencie seus clientes" />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
            <SearchBar
              placeholder="Buscar clientes..."
              onSearch={handleSearch}
              className="flex-1 max-w-md"
            />
            <Select
              options={[
                { value: "", label: "Todos os status" },
                { value: "ACTIVE", label: "Ativo" },
                { value: "INACTIVE", label: "Inativo" },
                { value: "SUSPENDED", label: "Suspenso" },
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
            Novo Cliente
          </Button>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={clients}
          pagination={pagination}
          onPageChange={setPage}
          loading={loading}
          emptyMessage="Nenhum cliente encontrado"
          emptyIcon={<Users className="h-8 w-8 text-muted-foreground" />}
        />
      </div>

      {/* Dialog Create/Edit */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingClient ? "Editar Cliente" : "Novo Cliente"}
        description={
          editingClient
            ? "Atualize os dados do cliente"
            : "Preencha os dados para cadastrar um novo cliente"
        }
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome *"
              placeholder="Nome completo"
              icon={<Users className="h-4 w-4" />}
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Email *"
              type="email"
              placeholder="email@exemplo.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Telefone"
              placeholder="(11) 99999-9999"
              icon={<Phone className="h-4 w-4" />}
              {...register("phone")}
            />
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <Select
                  label="Tipo"
                  options={[
                    { value: "CPF", label: "CPF" },
                    { value: "CNPJ", label: "CNPJ" },
                  ]}
                  {...register("documentType")}
                />
              </div>
              <div className="col-span-2">
                <Input
                  label="Documento"
                  placeholder="000.000.000-00"
                  {...register("document")}
                />
              </div>
            </div>
            <Input
              label="Empresa"
              placeholder="Nome da empresa"
              icon={<Building className="h-4 w-4" />}
              {...register("company")}
            />
            <Select
              label="Status"
              options={[
                { value: "ACTIVE", label: "Ativo" },
                { value: "INACTIVE", label: "Inativo" },
                { value: "SUSPENDED", label: "Suspenso" },
              ]}
              {...register("status")}
            />
            <Input
              label="Endereço"
              placeholder="Rua, número"
              {...register("address")}
            />
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Input label="Cidade" placeholder="Cidade" {...register("city")} />
              </div>
              <Input label="UF" placeholder="SP" {...register("state")} />
            </div>
          </div>

          <Textarea
            label="Observações"
            placeholder="Anotações sobre o cliente..."
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
              {editingClient ? "Salvar Alterações" : "Cadastrar Cliente"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
