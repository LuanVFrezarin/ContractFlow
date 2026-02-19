import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";


// GET /api/notifications
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 });
  }
}

// PUT /api/notifications - Marcar como lida
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const { id, readAll } = body;

    if (readAll) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
    } else if (id) {
      await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
    }

    return NextResponse.json({ message: "Notificações atualizadas" });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json({ error: "Erro ao atualizar notificações" }, { status: 500 });
  }
}
