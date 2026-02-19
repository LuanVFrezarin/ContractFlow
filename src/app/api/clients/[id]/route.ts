import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, notFound } from "@/lib/api-helpers";
import { clientSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";


// GET /api/clients/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        contracts: {
          orderBy: { createdAt: "desc" },
          include: {
            _count: { select: { invoices: true } },
          },
        },
        invoices: {
          orderBy: { dueDate: "desc" },
          take: 10,
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { user: { select: { name: true } } },
        },
        _count: {
          select: { contracts: true, invoices: true },
        },
      },
    });

    if (!client) return notFound("Cliente não encontrado");

    return NextResponse.json(client);
  } catch (error) {
    console.error("Get client error:", error);
    return NextResponse.json({ error: "Erro ao buscar cliente" }, { status: 500 });
  }
}

// PUT /api/clients/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const validation = clientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const existing = await prisma.client.findUnique({
      where: { id: params.id },
    });

    if (!existing) return notFound("Cliente não encontrado");

    const client = await prisma.client.update({
      where: { id: params.id },
      data: validation.data,
    });

    await prisma.activity.create({
      data: {
        type: "CLIENT_UPDATED",
        description: `Cliente "${client.name}" foi atualizado`,
        userId: user.id,
        clientId: client.id,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Update client error:", error);
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 });
  }
}

// DELETE /api/clients/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const existing = await prisma.client.findUnique({
      where: { id: params.id },
      include: { _count: { select: { contracts: true } } },
    });

    if (!existing) return notFound("Cliente não encontrado");

    if (existing._count.contracts > 0) {
      return NextResponse.json(
        { error: "Cliente possui contratos vinculados. Inative-o em vez de excluir." },
        { status: 400 }
      );
    }

    await prisma.client.delete({ where: { id: params.id } });

    await prisma.activity.create({
      data: {
        type: "CLIENT_DELETED",
        description: `Cliente "${existing.name}" foi removido`,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: "Cliente removido" });
  } catch (error) {
    console.error("Delete client error:", error);
    return NextResponse.json({ error: "Erro ao remover cliente" }, { status: 500 });
  }
}
