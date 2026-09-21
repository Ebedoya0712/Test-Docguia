import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const DEFAULT_DATABASE_URL =
  "postgresql://postgres.vfwnrcolilhkttmbexuj:13864489Ei%40@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

function getCleanDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) return DEFAULT_DATABASE_URL;

  // Limpiar espacios accidentales, comillas y saltos de línea que rompen el parser de Prisma
  const clean = raw.trim().replace(/^["']|["']$/g, "").replace(/\s+/g, "");

  if (!clean.startsWith("postgresql://") && !clean.startsWith("postgres://")) {
    return DEFAULT_DATABASE_URL;
  }

  return clean;
}

const databaseUrl = getCleanDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
