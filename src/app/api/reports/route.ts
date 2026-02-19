import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";


// GET /api/reports
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "revenue";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const groupBy = searchParams.get("groupBy") || "month";

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    switch (type) {
      case "revenue":
        return NextResponse.json(await getRevenueReport(start, end, groupBy));
      case "clients":
        return NextResponse.json(await getClientReport(start, end));
      case "contracts":
        return NextResponse.json(await getContractReport(start, end));
      case "cashflow":
        return NextResponse.json(await getCashflowReport(start, end));
      default:
        return NextResponse.json({ error: "Tipo de relatório inválido" }, { status: 400 });
    }
  } catch (error) {
    console.error("Reports error:", error);
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
  }
}

async function getRevenueReport(start: Date, end: Date, groupBy: string) {
  const invoices = await prisma.invoice.findMany({
    where: {
      status: "PAID",
      paidAt: { gte: start, lte: end },
    },
    include: {
      client: { select: { name: true } },
      contract: { select: { title: true, billingCycle: true } },
    },
    orderBy: { paidAt: "asc" },
  });

  // Agrupar por período
  const grouped: Record<string, { total: number; count: number }> = {};

  invoices.forEach((inv) => {
    const date = new Date(inv.paidAt!);
    let key: string;

    if (groupBy === "day") {
      key = date.toLocaleDateString("pt-BR");
    } else if (groupBy === "week") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = `Semana ${weekStart.toLocaleDateString("pt-BR")}`;
    } else {
      key = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    }

    if (!grouped[key]) grouped[key] = { total: 0, count: 0 };
    grouped[key].total += inv.paidAmount || inv.amount;
    grouped[key].count++;
  });

  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.paidAmount || inv.amount), 0);

  // Top clientes por receita
  const clientRevenue: Record<string, { name: string; total: number; count: number }> = {};
  invoices.forEach((inv) => {
    const key = inv.clientId;
    if (!clientRevenue[key]) {
      clientRevenue[key] = { name: inv.client.name, total: 0, count: 0 };
    }
    clientRevenue[key].total += inv.paidAmount || inv.amount;
    clientRevenue[key].count++;
  });

  const topClients = Object.values(clientRevenue)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return {
    type: "revenue",
    period: { start, end },
    totalRevenue,
    totalInvoices: invoices.length,
    averageTicket: invoices.length > 0 ? totalRevenue / invoices.length : 0,
    byPeriod: Object.entries(grouped).map(([period, data]) => ({
      period,
      ...data,
    })),
    topClients,
  };
}

async function getClientReport(start: Date, end: Date) {
  const clients = await prisma.client.findMany({
    include: {
      contracts: {
        where: { status: "ACTIVE" },
        select: { value: true, billingCycle: true },
      },
      invoices: {
        where: { dueDate: { gte: start, lte: end } },
        select: { amount: true, paidAmount: true, status: true },
      },
      _count: { select: { contracts: true, invoices: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const report = clients.map((client) => {
    const totalBilled = client.invoices.reduce((acc, inv) => acc + inv.amount, 0);
    const totalPaid = client.invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((acc, inv) => acc + (inv.paidAmount || inv.amount), 0);
    const overdue = client.invoices.filter((inv) => inv.status === "OVERDUE").length;

    return {
      id: client.id,
      name: client.name,
      email: client.email,
      status: client.status,
      totalContracts: client._count.contracts,
      totalBilled,
      totalPaid,
      balance: totalBilled - totalPaid,
      overdueCount: overdue,
    };
  });

  return {
    type: "clients",
    period: { start, end },
    totalClients: clients.length,
    activeClients: clients.filter((c) => c.status === "ACTIVE").length,
    clients: report,
  };
}

async function getContractReport(start: Date, end: Date) {
  const contracts = await prisma.contract.findMany({
    where: {
      OR: [
        { startDate: { gte: start, lte: end } },
        { endDate: { gte: start, lte: end } },
        { AND: [{ startDate: { lte: start } }, { endDate: { gte: end } }] },
      ],
    },
    include: {
      client: { select: { name: true } },
      _count: { select: { invoices: true } },
    },
    orderBy: { startDate: "desc" },
  });

  const byStatus: Record<string, number> = {};
  const byCycle: Record<string, number> = {};
  let totalValue = 0;

  contracts.forEach((c) => {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    byCycle[c.billingCycle] = (byCycle[c.billingCycle] || 0) + 1;
    if (c.status === "ACTIVE") totalValue += c.value;
  });

  return {
    type: "contracts",
    period: { start, end },
    totalContracts: contracts.length,
    totalActiveValue: totalValue,
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    byCycle: Object.entries(byCycle).map(([cycle, count]) => ({ cycle, count })),
    contracts: contracts.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      client: c.client.name,
      value: c.value,
      status: c.status,
      billingCycle: c.billingCycle,
      startDate: c.startDate,
      endDate: c.endDate,
      invoiceCount: c._count.invoices,
    })),
  };
}

async function getCashflowReport(start: Date, end: Date) {
  // Recebimentos (faturas pagas)
  const received = await prisma.invoice.findMany({
    where: {
      status: "PAID",
      paidAt: { gte: start, lte: end },
    },
    select: { paidAmount: true, amount: true, paidAt: true },
  });

  // A receber (faturas pendentes)
  const pending = await prisma.invoice.findMany({
    where: {
      status: { in: ["PENDING", "OVERDUE"] },
      dueDate: { gte: start, lte: end },
    },
    select: { amount: true, dueDate: true, status: true },
  });

  const totalReceived = received.reduce((acc, inv) => acc + (inv.paidAmount || inv.amount), 0);
  const totalPending = pending.filter((inv) => inv.status === "PENDING").reduce((acc, inv) => acc + inv.amount, 0);
  const totalOverdue = pending.filter((inv) => inv.status === "OVERDUE").reduce((acc, inv) => acc + inv.amount, 0);

  return {
    type: "cashflow",
    period: { start, end },
    totalReceived,
    totalPending,
    totalOverdue,
    totalExpected: totalReceived + totalPending + totalOverdue,
    receivedPercentage: totalReceived > 0 ? (totalReceived / (totalReceived + totalPending + totalOverdue)) * 100 : 0,
  };
}
