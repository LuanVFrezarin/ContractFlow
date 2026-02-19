import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";


// GET /api/dashboard - Dados do dashboard
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Queries paralelas para performance
    const [
      totalClients,
      activeClients,
      totalContracts,
      activeContracts,
      totalInvoices,
      pendingInvoices,
      overdueInvoices,
      paidInvoicesThisMonth,
      allActiveContracts,
      recentActivities,
      expiringContracts,
      overdueInvoicesList,
      monthlyRevenue,
      invoicesByStatus,
    ] = await Promise.all([
      // Contadores gerais
      prisma.client.count(),
      prisma.client.count({ where: { status: "ACTIVE" } }),
      prisma.contract.count(),
      prisma.contract.count({ where: { status: "ACTIVE" } }),
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: "PENDING" } }),
      prisma.invoice.count({ where: { status: "OVERDUE" } }),

      // Faturamento do mês
      prisma.invoice.aggregate({
        where: {
          status: "PAID",
          paidAt: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { paidAmount: true },
        _count: true,
      }),

      // Contratos ativos para MRR
      prisma.contract.findMany({
        where: { status: "ACTIVE" },
        select: { value: true, billingCycle: true, status: true },
      }),

      // Últimas atividades
      prisma.activity.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, avatar: true } },
          client: { select: { name: true } },
          contract: { select: { title: true, code: true } },
        },
      }),

      // Contratos vencendo em 30 dias
      prisma.contract.findMany({
        where: {
          status: "ACTIVE",
          endDate: { lte: thirtyDaysFromNow, gte: now },
        },
        include: {
          client: { select: { name: true } },
        },
        orderBy: { endDate: "asc" },
        take: 5,
      }),

      // Faturas vencidas
      prisma.invoice.findMany({
        where: {
          status: "OVERDUE",
        },
        include: {
          client: { select: { name: true } },
          contract: { select: { title: true } },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),

      // Receita dos últimos 12 meses
      getMonthlyRevenue(),

      // Faturas por status
      getInvoicesByStatus(),
    ]);

    // Calcular MRR
    const mrr = allActiveContracts.reduce((acc, c) => {
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

    // Calcular taxa de inadimplência
    const totalDueInvoices = pendingInvoices + overdueInvoices + (paidInvoicesThisMonth._count || 0);
    const defaultRate = totalDueInvoices > 0 ? (overdueInvoices / totalDueInvoices) * 100 : 0;

    return NextResponse.json({
      kpis: {
        totalClients,
        activeClients,
        totalContracts,
        activeContracts,
        totalInvoices,
        pendingInvoices,
        overdueInvoices,
        mrr,
        arr: mrr * 12,
        revenueThisMonth: paidInvoicesThisMonth._sum.paidAmount || 0,
        defaultRate: Math.round(defaultRate * 100) / 100,
      },
      recentActivities,
      expiringContracts,
      overdueInvoicesList,
      monthlyRevenue,
      invoicesByStatus,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Erro ao carregar dashboard" }, { status: 500 });
  }
}

// Receita mensal dos últimos 12 meses
async function getMonthlyRevenue() {
  const months = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const revenue = await prisma.invoice.aggregate({
      where: {
        status: "PAID",
        paidAt: { gte: start, lte: end },
      },
      _sum: { paidAmount: true },
    });

    const pending = await prisma.invoice.aggregate({
      where: {
        status: { in: ["PENDING", "OVERDUE"] },
        dueDate: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });

    months.push({
      month: start.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      receita: revenue._sum.paidAmount || 0,
      pendente: pending._sum.amount || 0,
    });
  }

  return months;
}

// Faturas por status (para gráfico de pizza)
async function getInvoicesByStatus() {
  const statuses = ["PAID", "PENDING", "OVERDUE", "CANCELLED", "PARTIAL"];
  const results = [];

  for (const status of statuses) {
    const count = await prisma.invoice.count({ where: { status: status as any } });
    if (count > 0) {
      results.push({ status, count });
    }
  }

  return results;
}
