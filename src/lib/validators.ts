import { z } from "zod";

// ============================================
// CLIENT SCHEMAS
// ============================================
export const clientSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  document: z.string().optional(),
  documentType: z.enum(["CPF", "CNPJ"]).default("CPF"),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// ============================================
// CONTRACT SCHEMAS
// ============================================
export const contractSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  title: z.string().min(2, "Título deve ter ao menos 2 caracteres"),
  description: z.string().optional(),
  value: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  billingCycle: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL"]).default("MONTHLY"),
  startDate: z.string().min(1, "Data de início obrigatória"),
  endDate: z.string().min(1, "Data de término obrigatória"),
  renewalType: z.enum(["AUTOMATIC", "MANUAL", "NONE"]).default("MANUAL"),
  paymentDay: z.coerce.number().min(1).max(28).default(10),
  notes: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "SUSPENDED", "CANCELLED", "EXPIRED", "RENEWED"]).default("ACTIVE"),
});

export type ContractFormData = z.infer<typeof contractSchema>;

// ============================================
// INVOICE SCHEMAS
// ============================================
export const invoiceSchema = z.object({
  contractId: z.string().min(1, "Selecione um contrato"),
  clientId: z.string().min(1, "Selecione um cliente"),
  amount: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  dueDate: z.string().min(1, "Data de vencimento obrigatória"),
  description: z.string().optional(),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED", "PARTIAL"]).default("PENDING"),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

// ============================================
// AUTH SCHEMAS
// ============================================
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme sua senha"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================
// ADDENDUM SCHEMA
// ============================================
export const addendumSchema = z.object({
  contractId: z.string().min(1, "Selecione um contrato"),
  title: z.string().min(2, "Título obrigatório"),
  description: z.string().optional(),
  oldValue: z.coerce.number().optional(),
  newValue: z.coerce.number().optional(),
  effectiveDate: z.string().min(1, "Data de vigência obrigatória"),
});

export type AddendumFormData = z.infer<typeof addendumSchema>;
