import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, badRequest } from "@/lib/api-helpers";
import { contractSchema } from "@/lib/validators";
import { generateCode } from "@/lib/utils";

// GET /api/contracts
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const clientId = searchParams.get("clientId") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { client: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) where.status = status;
    if (clientId) where.clientId = clientId;

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { id: true, name: true, email: true } },
          _count: { select: { invoices: true } },
        },
      }),
      prisma.contract.count({ where }),
    ]);

    return NextResponse.json({
      contracts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get contracts error:", error);
    return NextResponse.json({ error: "Erro ao buscar contratos" }, { status: 500 });
  }
}

// POST /api/contracts
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const validation = contractSchema.safeParse(body);

    if (!validation.success) {
      return badRequest(validation.error.errors[0].message);
    }

    const data = validation.data;

    // Gerar código único
    const count = await prisma.contract.count();
    const code = generateCode("CTR", count);

    const contract = await prisma.contract.create({
      data: {
        code,
        clientId: data.clientId,
        title: data.title,
        description: data.description,
        value: data.value,
        billingCycle: data.billingCycle,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        renewalType: data.renewalType,
        paymentDay: data.paymentDay,
        notes: data.notes,
        status: data.status,
        createdById: user.id,
      },
      include: {
        client: { select: { name: true } },
      },
    });

    // Gerar cobranças automaticamente se contrato ativo
    if (contract.status === "ACTIVE") {
      await generateInvoicesForContract(contract, user.id);
    }

    await prisma.activity.create({
      data: {
        type: "CONTRACT_CREATED",
        description: `Contrato "${contract.title}" (${contract.code}) criado para ${contract.client.name}`,
        userId: user.id,
        clientId: contract.clientId,
        contractId: contract.id,
      },
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error("Create contract error:", error);
    return NextResponse.json({ error: "Erro ao criar contrato" }, { status: 500 });
  }
}

// Função para gerar cobranças automaticamente
async function generateInvoicesForContract(
  contract: {
    id: string;
    clientId: string;
    value: number;
    billingCycle: string;
    startDate: Date;
    endDate: Date;
    paymentDay: number;
    title: string;
  },
  userId: string
) {
  const invoices = [];
  let currentDate = new Date(contract.startDate);
  const endDate = new Date(contract.endDate);
  let invoiceCount = await prisma.invoice.count();

  while (currentDate <= endDate) {
    const dueDate = new Date(currentDate);
    dueDate.setDate(contract.paymentDay);

    // Se o dia de pagamento já passou neste mês, usar o próximo ciclo
    if (dueDate < new Date(contract.startDate)) {
      advanceDate(currentDate, contract.billingCycle);
      continue;
    }

    invoiceCount++;
    const code = generateCode("INV", invoiceCount - 1);

    invoices.push({
      code,
      contractId: contract.id,
      clientId: contract.clientId,
      amount: contract.value,
      dueDate,
      description: `${contract.title} - ${dueDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
      status: "PENDING" as const,
      createdById: userId,
    });

    advanceDate(currentDate, contract.billingCycle);
  }

  if (invoices.length > 0) {
    await prisma.invoice.createMany({ data: invoices });
  }

  return invoices.length;
}

function advanceDate(date: Date, cycle: string) {
  switch (cycle) {
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "BIWEEKLY":
      date.setDate(date.getDate() + 14);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "QUARTERLY":
      date.setMonth(date.getMonth() + 3);
      break;
    case "SEMIANNUAL":
      date.setMonth(date.getMonth() + 6);
      break;
    case "ANNUAL":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
}
