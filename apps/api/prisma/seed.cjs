require('dotenv/config');

const argon2 = require("argon2");
const { PrismaPg } = require("@prisma/adapter-pg");
const {
  BillingCycle,
  PlatformRole,
  Prisma,
  PrismaClient,
  SubscriptionStatus,
  TenantRole,
} = require("@prisma/client");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for seeding.");
}

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function seedPlans() {
  const planPayloads = [
    {
      code: "trial",
      name: "Trial 14 days",
      description: "Trial 14 days, max 15 participants per event, no avatar upload.",
      billingCycle: BillingCycle.ONE_TIME,
      priceAmount: new Prisma.Decimal(0),
      currency: "VND",
      isActive: true,
      trialDays: 14,
      maxParticipantsPerEvent: 15,
      allowParticipantAvatar: false,
      allowLargeImport: false,
      maxImportRows: 15,
    },
    {
      code: "pro",
      name: "Pro",
      description: "Production plan for high-volume draws and avatar upload.",
      billingCycle: BillingCycle.MONTHLY,
      priceAmount: new Prisma.Decimal(299000),
      currency: "VND",
      isActive: true,
      trialDays: null,
      maxParticipantsPerEvent: null,
      allowParticipantAvatar: true,
      allowLargeImport: true,
      maxImportRows: 100000,
    },
    {
      code: "business",
      name: "Business",
      description: "Enterprise plan with larger quota and custom support.",
      billingCycle: BillingCycle.MONTHLY,
      priceAmount: new Prisma.Decimal(999000),
      currency: "VND",
      isActive: true,
      trialDays: null,
      maxParticipantsPerEvent: null,
      allowParticipantAvatar: true,
      allowLargeImport: true,
      maxImportRows: 500000,
    },
  ];

  for (const payload of planPayloads) {
    await prisma.plan.upsert({
      where: { code: payload.code },
      update: payload,
      create: payload,
    });
  }
}

async function seedDefaultTenant() {
  const ownerEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@lottery.local";
  const ownerPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@123456";

  const passwordHash = await argon2.hash(ownerPassword);

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {
      fullName: "System Admin",
      platformRole: PlatformRole.SUPER_ADMIN,
      passwordHash,
    },
    create: {
      email: ownerEmail,
      fullName: "System Admin",
      passwordHash,
      platformRole: PlatformRole.SUPER_ADMIN,
    },
  });

  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-tenant" },
    update: {
      name: "Demo Tenant",
      timezone: "Asia/Ho_Chi_Minh",
      locale: "vi",
      participantHardCap: 20000,
    },
    create: {
      slug: "demo-tenant",
      name: "Demo Tenant",
      timezone: "Asia/Ho_Chi_Minh",
      locale: "vi",
      participantHardCap: 20000,
    },
  });

  await prisma.tenantMembership.upsert({
    where: {
      tenantId_userId: {
        tenantId: tenant.id,
        userId: owner.id,
      },
    },
    update: {
      role: TenantRole.OWNER,
      isDefault: true,
    },
    create: {
      tenantId: tenant.id,
      userId: owner.id,
      role: TenantRole.OWNER,
      isDefault: true,
    },
  });

  const trialPlan = await prisma.plan.findUniqueOrThrow({
    where: { code: "trial" },
  });

  const now = new Date();
  const trialEndAt = new Date(now);
  trialEndAt.setDate(trialEndAt.getDate() + 14);

  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      tenantId: tenant.id,
      status: {
        in: [SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!existingSubscription) {
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: trialPlan.id,
        status: SubscriptionStatus.TRIALING,
        trialStartAt: now,
        trialEndAt,
        currentPeriodStart: now,
        currentPeriodEnd: trialEndAt,
      },
    });
  }
}

async function main() {
  await seedPlans();
  await seedDefaultTenant();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed.");
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error("Seed failed:", error);
    process.exit(1);
  });

