import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user) return null;
  return session.user as {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message: string = "Não encontrado") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function success(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}
