import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ContractFlow — Gestão de Contratos & Cobranças",
  description:
    "Sistema completo de gestão de contratos, cobranças recorrentes, clientes e relatórios financeiros. Gerencie seus contratos de forma inteligente.",
  keywords: ["contratos", "cobranças", "gestão", "financeiro", "SaaS"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
