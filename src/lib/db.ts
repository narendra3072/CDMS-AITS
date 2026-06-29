import { PrismaClient } from '@prisma/client'
import { ensureDemoUsers } from '@/lib/seed-demo-users'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

void ensureDemoUsers()