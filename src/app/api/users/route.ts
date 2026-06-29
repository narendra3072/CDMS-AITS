import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"
import bcrypt from "bcryptjs"

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth("admin")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const role = searchParams.get("role")
  const search = searchParams.get("search") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")

  const where: any = {}
  if (role) where.role = role
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { username: { contains: search } },
      { email: { contains: search } },
    ]
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: { id: true, username: true, email: true, name: true, role: true, isActive: true, createdAt: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.user.count({ where }),
  ])

  return NextResponse.json({ users, total, page, limit })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("admin")
  if (error) return error

  const body = await req.json()
  const { username, email, password, name, role } = body

  if (!username || !email || !password || !name || !role) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  const existing = await db.user.findFirst({
    where: { OR: [{ username }, { email }] },
  })
  if (existing) {
    return NextResponse.json({ error: "Username or email already exists" }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await db.user.create({
    data: { username, email, password: hashedPassword, name, role },
    select: { id: true, username: true, email: true, name: true, role: true, isActive: true, createdAt: true },
  })

  return NextResponse.json(user, { status: 201 })
}
