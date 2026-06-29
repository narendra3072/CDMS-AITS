import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const demoUsers = [
  {
    username: "admin",
    email: "admin@example.com",
    password: "admin123",
    name: "Admin",
    role: "admin",
  },
  {
    username: "udaykumar",
    email: "udaykumar@example.com",
    password: "udaykumar123",
    name: "Uday Kumar",
    role: "faculty",
  },
  {
    username: "narasimha",
    email: "narasimha@example.com",
    password: "narasimha123",
    name: "Narasimha",
    role: "student",
  },
] as const

let hasSeeded = false

export async function ensureDemoUsers() {
  if (hasSeeded) {
    return
  }

  hasSeeded = true

  try {
    for (const user of demoUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10)

      await prisma.user.upsert({
        where: { username: user.username },
        update: {
          email: user.email,
          password: hashedPassword,
          name: user.name,
          role: user.role,
          isActive: true,
        },
        create: {
          username: user.username,
          email: user.email,
          password: hashedPassword,
          name: user.name,
          role: user.role,
          isActive: true,
        },
      })
    }
  } catch (error) {
    console.error("Demo user seeding failed:", error)
  }
}
