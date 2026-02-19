import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, badRequest } from "@/lib/api-helpers";
import bcrypt from "bcryptjs";

// GET /api/settings - Dados do perfil do usuário
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 });
  }
}

// PUT /api/settings - Atualizar perfil
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const { name, phone, currentPassword, newPassword } = body;

    // Se está alterando senha, validar senha atual
    if (newPassword) {
      if (!currentPassword) {
        return badRequest("Senha atual é obrigatória para alterar a senha.");
      }

      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser) return unauthorized();

      const isValid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isValid) {
        return badRequest("Senha atual incorreta.");
      }

      if (newPassword.length < 6) {
        return badRequest("Nova senha deve ter no mínimo 6 caracteres.");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return NextResponse.json({ message: "Senha alterada com sucesso." });
    }

    // Atualizar perfil
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Erro ao atualizar configurações" }, { status: 500 });
  }
}
