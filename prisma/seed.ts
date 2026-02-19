import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // ============================================
  // CRIAR USUÁRIO ADMIN
  // ============================================
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@contractflow.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@contractflow.com",
      password: hashedPassword,
      role: "ADMIN",
      phone: "11999999999",
    },
  });
  console.log("✅ Usuário admin criado:", admin.email);

  // ============================================
  // CRIAR CLIENTES
  // ============================================
  const clientsData = [
    {
      name: "TechSolutions Ltda",
      email: "contato@techsolutions.com.br",
      phone: "11987654321",
      document: "12345678000190",
      documentType: "CNPJ" as const,
      company: "TechSolutions Ltda",
      address: "Av. Paulista, 1000",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310100",
      status: "ACTIVE" as const,
    },
    {
      name: "Maria Silva Consultoria",
      email: "maria@silvaconsultoria.com",
      phone: "21976543210",
      document: "98765432000145",
      documentType: "CNPJ" as const,
      company: "Silva Consultoria ME",
      address: "Rua Copacabana, 500",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "22050002",
      status: "ACTIVE" as const,
    },
    {
      name: "João Santos",
      email: "joao.santos@gmail.com",
      phone: "31987654321",
      document: "12345678901",
      documentType: "CPF" as const,
      company: "",
      address: "Rua da Bahia, 200",
      city: "Belo Horizonte",
      state: "MG",
      zipCode: "30160011",
      status: "ACTIVE" as const,
    },
    {
      name: "Digital Agency XPTO",
      email: "financeiro@xpto.agency",
      phone: "41976543210",
      document: "55667788000134",
      documentType: "CNPJ" as const,
      company: "XPTO Digital Agency",
      address: "Rua XV de Novembro, 300",
      city: "Curitiba",
      state: "PR",
      zipCode: "80020310",
      status: "ACTIVE" as const,
    },
    {
      name: "StartupGo Tecnologia",
      email: "admin@startupgo.io",
      phone: "51987654321",
      document: "99887766000122",
      documentType: "CNPJ" as const,
      company: "StartupGo Tecnologia S.A.",
      address: "Av. Ipiranga, 1500",
      city: "Porto Alegre",
      state: "RS",
      zipCode: "90160093",
      status: "ACTIVE" as const,
    },
    {
      name: "Ana Oliveira Design",
      email: "ana@oliveira.design",
      phone: "61976543210",
      document: "11223344556",
      documentType: "CPF" as const,
      company: "Ana Oliveira Design",
      address: "SQS 308 Bloco A",
      city: "Brasília",
      state: "DF",
      zipCode: "70356080",
      status: "INACTIVE" as const,
    },
    {
      name: "CloudHost Brasil",
      email: "comercial@cloudhost.com.br",
      phone: "11934567890",
      document: "44556677000189",
      documentType: "CNPJ" as const,
      company: "CloudHost Brasil Ltda",
      address: "Av. Brigadeiro Faria Lima, 2000",
      city: "São Paulo",
      state: "SP",
      zipCode: "01451001",
      status: "ACTIVE" as const,
    },
    {
      name: "Farmácia Saúde Total",
      email: "gerencia@saudetotal.com.br",
      phone: "85987654321",
      document: "33445566000178",
      documentType: "CNPJ" as const,
      company: "Farmácia Saúde Total",
      address: "Av. Beira Mar, 800",
      city: "Fortaleza",
      state: "CE",
      zipCode: "60165121",
      status: "ACTIVE" as const,
    },
  ];

  const clients = [];
  for (const data of clientsData) {
    const client = await prisma.client.upsert({
      where: { email: data.email },
      update: {},
      create: {
        ...data,
        createdById: admin.id,
      },
    });
    clients.push(client);
  }
  console.log(`✅ ${clients.length} clientes criados`);

  // ============================================
  // CRIAR CONTRATOS
  // ============================================
  const now = new Date();
  const contractsData = [
    {
      code: "CTR-2024-001",
      clientIndex: 0,
      title: "Manutenção de Sistemas",
      description: "Contrato de manutenção mensal de sistemas internos",
      value: 4500.0,
      billingCycle: "MONTHLY" as const,
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2025, 11, 31),
      paymentDay: 10,
      renewalType: "AUTOMATIC" as const,
      status: "ACTIVE" as const,
    },
    {
      code: "CTR-2024-002",
      clientIndex: 1,
      title: "Consultoria Estratégica",
      description: "Consultoria trimestral em gestão empresarial",
      value: 8000.0,
      billingCycle: "QUARTERLY" as const,
      startDate: new Date(2024, 2, 1),
      endDate: new Date(2025, 8, 30),
      paymentDay: 15,
      renewalType: "MANUAL" as const,
      status: "ACTIVE" as const,
    },
    {
      code: "CTR-2024-003",
      clientIndex: 2,
      title: "Suporte Técnico Premium",
      description: "Suporte técnico 24/7 com SLA garantido",
      value: 2200.0,
      billingCycle: "MONTHLY" as const,
      startDate: new Date(2024, 3, 1),
      endDate: new Date(2025, 3, 30),
      paymentDay: 5,
      renewalType: "AUTOMATIC" as const,
      status: "ACTIVE" as const,
    },
    {
      code: "CTR-2024-004",
      clientIndex: 3,
      title: "Desenvolvimento Web",
      description: "Manutenção e melhorias contínuas no site",
      value: 6000.0,
      billingCycle: "MONTHLY" as const,
      startDate: new Date(2024, 1, 1),
      endDate: new Date(2025, 7, 31),
      paymentDay: 20,
      renewalType: "MANUAL" as const,
      status: "ACTIVE" as const,
    },
    {
      code: "CTR-2024-005",
      clientIndex: 4,
      title: "Licença SaaS Enterprise",
      description: "Licença anual da plataforma enterprise",
      value: 36000.0,
      billingCycle: "ANNUAL" as const,
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2025, 11, 31),
      paymentDay: 1,
      renewalType: "AUTOMATIC" as const,
      status: "ACTIVE" as const,
    },
    {
      code: "CTR-2024-006",
      clientIndex: 6,
      title: "Hospedagem Cloud",
      description: "Serviço de hospedagem cloud com backup incluso",
      value: 1800.0,
      billingCycle: "MONTHLY" as const,
      startDate: new Date(2024, 5, 1),
      endDate: new Date(2025, 5, 30),
      paymentDay: 10,
      renewalType: "AUTOMATIC" as const,
      status: "ACTIVE" as const,
    },
    {
      code: "CTR-2024-007",
      clientIndex: 7,
      title: "Sistema de Gestão",
      description: "Licença e suporte do sistema de gestão farmacêutica",
      value: 3500.0,
      billingCycle: "MONTHLY" as const,
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2025, 6, 31),
      paymentDay: 15,
      renewalType: "MANUAL" as const,
      status: "ACTIVE" as const,
    },
    {
      code: "CTR-2023-010",
      clientIndex: 5,
      title: "Design UX/UI",
      description: "Redesign do aplicativo mobile",
      value: 15000.0,
      billingCycle: "SEMIANNUAL" as const,
      startDate: new Date(2023, 6, 1),
      endDate: new Date(2024, 6, 30),
      paymentDay: 10,
      renewalType: "NONE" as const,
      status: "EXPIRED" as const,
    },
  ];

  const contracts = [];
  for (const data of contractsData) {
    const contract = await prisma.contract.upsert({
      where: { code: data.code },
      update: {},
      create: {
        code: data.code,
        clientId: clients[data.clientIndex].id,
        title: data.title,
        description: data.description,
        value: data.value,
        billingCycle: data.billingCycle,
        startDate: data.startDate,
        endDate: data.endDate,
        paymentDay: data.paymentDay,
        renewalType: data.renewalType,
        status: data.status,
        createdById: admin.id,
      },
    });
    contracts.push(contract);
  }
  console.log(`✅ ${contracts.length} contratos criados`);

  // ============================================
  // CRIAR FATURAS
  // ============================================
  let invoiceCount = 0;

  for (const contract of contracts) {
    if (contract.status !== "ACTIVE" && contract.status !== "EXPIRED") continue;

    let currentDate = new Date(contract.startDate);
    const endDate = new Date(contract.endDate);
    const maxInvoices = 24; // Limitar
    let count = 0;

    while (currentDate <= endDate && count < maxInvoices) {
      const dueDate = new Date(currentDate);
      dueDate.setDate(contract.paymentDay);

      invoiceCount++;
      const code = `INV-${String(invoiceCount).padStart(4, "0")}`;

      // Determinar status baseado na data
      let status: "PAID" | "PENDING" | "OVERDUE" = "PENDING";
      let paidAt = null;
      let paidAmount = null;
      let paymentMethod = null;

      if (dueDate < now) {
        // 80% das faturas antigas são pagas
        if (Math.random() < 0.8) {
          status = "PAID";
          paidAt = new Date(dueDate);
          paidAt.setDate(paidAt.getDate() + Math.floor(Math.random() * 5));
          paidAmount = contract.value;
          paymentMethod = ["PIX", "Boleto", "Transferência", "Cartão de Crédito"][
            Math.floor(Math.random() * 4)
          ];
        } else {
          status = "OVERDUE";
        }
      }

      const monthName = dueDate.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });

      await prisma.invoice.upsert({
        where: { code },
        update: {},
        create: {
          code,
          contractId: contract.id,
          clientId: contract.clientId,
          amount: contract.value,
          dueDate,
          paidAt,
          paidAmount,
          paymentMethod,
          description: `${contract.title} - ${monthName}`,
          status,
          createdById: admin.id,
        },
      });

      count++;

      // Avançar data
      switch (contract.billingCycle) {
        case "WEEKLY":
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case "BIWEEKLY":
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case "MONTHLY":
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case "QUARTERLY":
          currentDate.setMonth(currentDate.getMonth() + 3);
          break;
        case "SEMIANNUAL":
          currentDate.setMonth(currentDate.getMonth() + 6);
          break;
        case "ANNUAL":
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
      }
    }
  }
  console.log(`✅ ${invoiceCount} faturas criadas`);

  // ============================================
  // CRIAR ATIVIDADES
  // ============================================
  const activities = [
    {
      type: "USER_LOGIN" as const,
      description: "Administrador fez login no sistema",
      userId: admin.id,
    },
    {
      type: "CLIENT_CREATED" as const,
      description: `Cliente "TechSolutions Ltda" foi cadastrado`,
      userId: admin.id,
      clientId: clients[0].id,
    },
    {
      type: "CONTRACT_CREATED" as const,
      description: `Contrato "Manutenção de Sistemas" (CTR-2024-001) criado`,
      userId: admin.id,
      clientId: clients[0].id,
      contractId: contracts[0].id,
    },
    {
      type: "INVOICE_PAID" as const,
      description: `Fatura INV-0001 - TechSolutions Ltda - Status: PAID`,
      userId: admin.id,
      clientId: clients[0].id,
      contractId: contracts[0].id,
    },
    {
      type: "CLIENT_CREATED" as const,
      description: `Cliente "Digital Agency XPTO" foi cadastrado`,
      userId: admin.id,
      clientId: clients[3].id,
    },
    {
      type: "CONTRACT_CREATED" as const,
      description: `Contrato "Desenvolvimento Web" (CTR-2024-004) criado para Digital Agency XPTO`,
      userId: admin.id,
      clientId: clients[3].id,
      contractId: contracts[3].id,
    },
  ];

  for (const activity of activities) {
    await prisma.activity.create({ data: activity });
  }
  console.log(`✅ ${activities.length} atividades criadas`);

  // ============================================
  // CRIAR NOTIFICAÇÕES
  // ============================================
  const notifications = [
    {
      userId: admin.id,
      title: "Contrato próximo do vencimento",
      message: "O contrato 'Suporte Técnico Premium' de João Santos vence em 30 dias.",
      type: "CONTRACT_EXPIRING" as const,
      link: "/dashboard/contracts",
    },
    {
      userId: admin.id,
      title: "Fatura vencida",
      message: "A fatura INV-0015 de Maria Silva Consultoria está vencida há 5 dias.",
      type: "INVOICE_OVERDUE" as const,
      link: "/dashboard/invoices",
    },
    {
      userId: admin.id,
      title: "Pagamento recebido",
      message: "Pagamento de R$ 4.500,00 recebido de TechSolutions Ltda via PIX.",
      type: "INVOICE_PAID" as const,
      read: true,
      link: "/dashboard/invoices",
    },
    {
      userId: admin.id,
      title: "Bem-vindo ao ContractFlow!",
      message: "Seu sistema de gestão de contratos está pronto para uso. Explore o dashboard!",
      type: "SYSTEM" as const,
      read: true,
      link: "/dashboard",
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({ data: notification });
  }
  console.log(`✅ ${notifications.length} notificações criadas`);

  // ============================================
  // CRIAR ADITIVOS  
  // ============================================
  await prisma.addendum.create({
    data: {
      contractId: contracts[0].id,
      title: "Reajuste anual 2024",
      description: "Reajuste de 8% conforme IGPM acumulado",
      oldValue: 4166.67,
      newValue: 4500.0,
      effectiveDate: new Date(2024, 0, 1),
    },
  });

  await prisma.addendum.create({
    data: {
      contractId: contracts[3].id,
      title: "Aumento de escopo",
      description: "Inclusão de manutenção de app mobile no contrato",
      oldValue: 5000.0,
      newValue: 6000.0,
      effectiveDate: new Date(2024, 6, 1),
    },
  });
  console.log("✅ 2 aditivos criados");

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📧 Login: admin@contractflow.com");
  console.log("🔑 Senha: admin123\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erro no seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
