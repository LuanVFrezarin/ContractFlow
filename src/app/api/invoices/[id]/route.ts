import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, notFound } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";


// GET /api/invoices/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        contract: true,
      },
    });

    if (!invoice) return notFound("Fatura não encontrada");

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Get invoice error:", error);
    return NextResponse.json({ error: "Erro ao buscar fatura" }, { status: 500 });
  }
}

// PUT /api/invoices/[id] - Atualizar status de pagamento
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const { status, paidAmount, paymentMethod } = body;

    const existing = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { client: true, contract: true },
    });

    if (!existing) return notFound("Fatura não encontrada");

    const updateData: any = { status };

    if (status === "PAID") {
      updateData.paidAt = new Date();
      updateData.paidAmount = paidAmount || existing.amount;
      updateData.paymentMethod = paymentMethod || null;
    }

    if (status === "PARTIAL") {
      updateData.paidAmount = paidAmount;
      updateData.paymentMethod = paymentMethod || null;
    }

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: { select: { name: true } },
        contract: { select: { title: true, code: true } },
      },
    });

    const activityType = status === "PAID" ? "INVOICE_PAID" : status === "CANCELLED" ? "INVOICE_CANCELLED" : "INVOICE_OVERDUE";

    await prisma.activity.create({
      data: {
        type: activityType,
        description: `Fatura ${invoice.code} - ${invoice.client.name} - Status: ${status}`,
        userId: user.id,
        clientId: invoice.clientId,
        contractId: invoice.contractId,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Update invoice error:", error);
    return NextResponse.json({ error: "Erro ao atualizar fatura" }, { status: 500 });
  }
}
