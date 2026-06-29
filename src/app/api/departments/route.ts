import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET(req: NextRequest) {
  const { error } = await requireAuth("admin", "faculty")
  if (error) return error

  const departments = await db.department.findMany({
    include: {
      _count: { select: { students: true, faculties: true, programs: true, subjects: true } },
      hod: { include: { user: { select: { name: true } } } },
      faculties: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { employeeId: "asc" },
      },
      subjects: { where: { isCore: true }, orderBy: { code: "asc" } },
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(departments)
}

export async function POST(req: NextRequest) {
  const { error } = await requireAuth("admin")
  if (error) return error

  const body = await req.json()
  const { name, code, description, hodId } = body

  if (!name || !code) {
    return NextResponse.json({ error: "Name and code are required" }, { status: 400 })
  }

  const department = await db.department.create({
    data: { name, code, description: description || null, hodId: hodId || null },
    include: {
      _count: { select: { students: true, faculties: true, programs: true, subjects: true } },
      hod: { include: { user: { select: { name: true } } } },
      faculties: { include: { user: { select: { name: true, email: true } } } },
      subjects: { where: { isCore: true }, orderBy: { code: "asc" } },
    },
  })

  return NextResponse.json(department, { status: 201 })
}
