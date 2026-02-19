import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, badRequest } from "@/lib/api-helpers";
import { clientSchema } from "@/lib/validators";

// GET /api/clients - Listar clientes
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { document: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { contracts: true, invoices: true },
          },
        },
      }),
      prisma.client.count({ where }),
    ]);

    return NextResponse.json({
      clients,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get clients error:", error);
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 });
  }
}

// POST /api/clients - Criar cliente
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const validation = clientSchema.safeParse(body);

    if (!validation.success) {
      return badRequest(validation.error.errors[0].message);
    }

    const data = validation.data;

    // Verificar email duplicado
    const existing = await prisma.client.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return badRequest("Email já cadastrado para outro cliente");
    }

    const client = await prisma.client.create({
      data: {
        ...data,
        createdById: user.id,
      },
    });

    // Registrar atividade
    await prisma.activity.create({
      data: {
        type: "CLIENT_CREATED",
        description: `Cliente "${client.name}" foi cadastrado`,
        userId: user.id,
        clientId: client.id,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Create client error:", error);
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 });
  }
}
