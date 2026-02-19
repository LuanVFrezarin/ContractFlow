import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, notFound } from "@/lib/api-helpers";
import { contractSchema } from "@/lib/validators";

// GET /api/contracts/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        invoices: {
          orderBy: { dueDate: "asc" },
        },
        addendums: {
          orderBy: { effectiveDate: "desc" },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { user: { select: { name: true } } },
        },
        _count: { select: { invoices: true } },
      },
    });

    if (!contract) return notFound("Contrato não encontrado");

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Get contract error:", error);
    return NextResponse.json({ error: "Erro ao buscar contrato" }, { status: 500 });
  }
}

// PUT /api/contracts/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const validation = contractSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const existing = await prisma.contract.findUnique({
      where: { id: params.id },
    });

    if (!existing) return notFound("Contrato não encontrado");

    const data = validation.data;

    const contract = await prisma.contract.update({
      where: { id: params.id },
      data: {
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
      },
      include: {
        client: { select: { name: true } },
      },
    });

    await prisma.activity.create({
      data: {
        type: "CONTRACT_UPDATED",
        description: `Contrato "${contract.title}" (${contract.code}) atualizado`,
        userId: user.id,
        clientId: contract.clientId,
        contractId: contract.id,
      },
    });

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Update contract error:", error);
    return NextResponse.json({ error: "Erro ao atualizar contrato" }, { status: 500 });
  }
}

// DELETE /api/contracts/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const existing = await prisma.contract.findUnique({
      where: { id: params.id },
    });

    if (!existing) return notFound("Contrato não encontrado");

    // Cancelar em vez de deletar
    const contract = await prisma.contract.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    });

    // Cancelar faturas pendentes
    await prisma.invoice.updateMany({
      where: {
        contractId: params.id,
        status: { in: ["PENDING", "OVERDUE"] },
      },
      data: { status: "CANCELLED" },
    });

    await prisma.activity.create({
      data: {
        type: "CONTRACT_CANCELLED",
        description: `Contrato "${existing.title}" (${existing.code}) foi cancelado`,
        userId: user.id,
        clientId: existing.clientId,
        contractId: existing.id,
      },
    });

    return NextResponse.json({ message: "Contrato cancelado" });
  } catch (error) {
    console.error("Delete contract error:", error);
    return NextResponse.json({ error: "Erro ao cancelar contrato" }, { status: 500 });
  }
}
