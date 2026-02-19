import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateLong(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}

export function formatDocument(doc: string): string {
  const cleaned = doc.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export function generateCode(prefix: string, count: number): string {
  const year = new Date().getFullYear();
  const num = String(count + 1).padStart(3, "0");
  return `${prefix}-${year}-${num}`;
}

export function getDaysUntil(date: Date | string): number {
  const target = new Date(date);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    INACTIVE: "bg-gray-100 text-gray-700 border-gray-200",
    SUSPENDED: "bg-amber-100 text-amber-700 border-amber-200",
    DRAFT: "bg-blue-100 text-blue-700 border-blue-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200",
    EXPIRED: "bg-red-100 text-red-700 border-red-200",
    RENEWED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
    OVERDUE: "bg-red-100 text-red-700 border-red-200",
    PARTIAL: "bg-orange-100 text-orange-700 border-orange-200",
  };
  return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    SUSPENDED: "Suspenso",
    DRAFT: "Rascunho",
    CANCELLED: "Cancelado",
    EXPIRED: "Expirado",
    RENEWED: "Renovado",
    PENDING: "Pendente",
    PAID: "Pago",
    OVERDUE: "Vencido",
    PARTIAL: "Parcial",
    MONTHLY: "Mensal",
    QUARTERLY: "Trimestral",
    SEMIANNUAL: "Semestral",
    ANNUAL: "Anual",
    WEEKLY: "Semanal",
    BIWEEKLY: "Quinzenal",
    AUTOMATIC: "Automática",
    MANUAL: "Manual",
    NONE: "Sem renovação",
    CPF: "CPF",
    CNPJ: "CNPJ",
  };
  return labels[status] || status;
}

export function calculateMRR(contracts: { value: number; billingCycle: string; status: string }[]): number {
  return contracts
    .filter((c) => c.status === "ACTIVE")
    .reduce((acc, c) => {
      switch (c.billingCycle) {
        case "WEEKLY": return acc + c.value * 4.33;
        case "BIWEEKLY": return acc + c.value * 2.17;
        case "MONTHLY": return acc + c.value;
        case "QUARTERLY": return acc + c.value / 3;
        case "SEMIANNUAL": return acc + c.value / 6;
        case "ANNUAL": return acc + c.value / 12;
        default: return acc + c.value;
      }
    }, 0);
}
