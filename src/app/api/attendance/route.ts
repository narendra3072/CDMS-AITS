import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

const validStatuses = new Set(["present", "absent", "late"])

function dayFromParam(value: string | null) {
  const source = value || new Date().toISOString().slice(0, 10)
  return new Date(`${source}T00:00:00.000Z`)
}

export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth("admin", "faculty", "student")
  if (error) return error

  const { searchParams } = new URL(req.url)
  const date = dayFromParam(searchParams.get("date"))
  const subject = searchParams.get("subject")?.trim()
  const role = (session?.user as any)?.role
  const userId = (session?.user as any)?.id

  const studentsWhere: any = { status: "active" }
  const recordsWhere: any = { date }
  if (subject) recordsWhere.subject = subject

  if (role === "faculty") {
    const faculty = await db.faculty.findUnique({ where: { userId } })
    if (!faculty) return NextResponse.json({ error: "Faculty profile not found" }, { status: 404 })
    studentsWhere.departmentId = faculty.departmentId
    recordsWhere.student = { departmentId: faculty.departmentId }
  }

  if (role === "student") {
    const student = await db.student.findUnique({ where: { userId } })
    if (!student) return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    studentsWhere.id = student.id
    recordsWhere.studentId = student.id
  }

  const [students, records] = await Promise.all([
    db.student.findMany({
      where: studentsWhere,
      include: {
        user: { select: { name: true, email: true } },
        department: { select: { name: true, code: true } },
      },
      orderBy: [{ department: { name: "asc" } }, { enrollmentNo: "asc" }],
    }),
    db.attendanceRecord.findMany({
      where: recordsWhere,
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            department: { select: { name: true, code: true } },
          },
        },
        faculty: { include: { user: { select: { name: true } } } },
      },
      orderBy: [{ subject: "asc" }, { student: { enrollmentNo: "asc" } }],
    }),
  ])

  return NextResponse.json({ students, records })
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth("faculty")
  if (error) return error

  const userId = (session?.user as any)?.id
  const faculty = await db.faculty.findUnique({ where: { userId } })
  if (!faculty) return NextResponse.json({ error: "Faculty profile not found" }, { status: 404 })

  const body = await req.json()
  const subject = String(body.subject || "").trim()
  const records = Array.isArray(body.records) ? body.records : []
  const date = dayFromParam(body.date || null)

  if (!subject || records.length === 0) {
    return NextResponse.json({ error: "Subject and attendance records are required" }, { status: 400 })
  }

  for (const record of records) {
    const status = String(record.status || "present")
    if (!validStatuses.has(status)) {
      return NextResponse.json({ error: "Invalid attendance status" }, { status: 400 })
    }
  }

  const studentIds = records.map((record: any) => String(record.studentId || "")).filter(Boolean)
  const students = await db.student.findMany({
    where: { id: { in: studentIds }, departmentId: faculty.departmentId, status: "active" },
    select: { id: true },
  })
  const allowedStudentIds = new Set(students.map((student) => student.id))

  if (allowedStudentIds.size !== studentIds.length) {
    return NextResponse.json({ error: "Faculty can only mark attendance for active students in their department" }, { status: 403 })
  }

  const saved = await db.$transaction(
    records.map((record: any) => {
      const studentId = String(record.studentId)
      const status = String(record.status || "present")
      return db.attendanceRecord.upsert({
        where: { studentId_date_subject: { studentId, date, subject } },
        update: {
          facultyId: faculty.id,
          status,
          remarks: record.remarks ? String(record.remarks) : null,
        },
        create: {
          studentId,
          facultyId: faculty.id,
          date,
          subject,
          status,
          remarks: record.remarks ? String(record.remarks) : null,
        },
      })
    })
  )

  return NextResponse.json({ records: saved })
}
