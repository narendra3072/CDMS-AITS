import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth-guard"

export async function GET() {
  const { error, session } = await requireAuth("admin", "faculty", "student")
  if (error) return error

  const role = (session?.user as any)?.role
  const userId = (session?.user as any)?.id

  if (role === "admin") {
    const [
      totalStudents,
      totalFaculty,
      totalDepartments,
      totalPrograms,
      totalUsers,
      activeStudents,
      studentsByDept,
      facultyByDept,
      recentStudents,
      recentNotifications,
    ] = await Promise.all([
      db.student.count(),
      db.faculty.count(),
      db.department.count(),
      db.program.count(),
      db.user.count(),
      db.student.count({ where: { status: "active" } }),
      db.department.findMany({
        include: { _count: { select: { students: true } } },
        orderBy: { name: "asc" },
      }),
      db.department.findMany({
        include: { _count: { select: { faculties: true } } },
        orderBy: { name: "asc" },
      }),
      db.student.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          department: { select: { name: true } },
        },
      }),
      db.notification.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { recipients: true } } },
      }),
    ])

    return NextResponse.json({
      totalStudents, totalFaculty, totalDepartments, totalPrograms, totalUsers, activeStudents,
      studentsByDept: studentsByDept.map(d => ({ name: d.name, count: d._count.students })),
      facultyByDept: facultyByDept.map(d => ({ name: d.name, count: d._count.faculties })),
      recentStudents,
      recentNotifications,
      genderDistribution: await getGenderDistribution(),
    })
  }

  if (role === "faculty") {
    const faculty = await db.faculty.findUnique({
      where: { userId },
      include: {
        department: {
          include: {
            _count: { select: { students: true, faculties: true } },
            faculties: {
              include: { user: { select: { name: true, email: true } } },
              orderBy: { employeeId: "asc" },
            },
            subjects: { where: { isCore: true }, orderBy: { code: "asc" } },
          },
        },
      },
    })

    const unreadNotifications = await db.notificationRecipient.count({
      where: { userId, isRead: false },
    })

    return NextResponse.json({
      faculty,
      departmentStudents: faculty?.department?._count.students || 0,
      departmentFaculty: faculty?.department?._count.faculties || 0,
      unreadNotifications,
    })
  }

  // Student
  const student = await db.student.findUnique({
    where: { userId },
    include: {
      department: true,
      program: true,
      documents: true,
    },
  })

  const unreadNotifications = await db.notificationRecipient.count({
    where: { userId, isRead: false },
  })

  return NextResponse.json({
    student,
    unreadNotifications,
  })
}

async function getGenderDistribution() {
  const males = await db.student.count({ where: { gender: "Male" } })
  const females = await db.student.count({ where: { gender: "Female" } })
  const other = await db.student.count({ where: { gender: { notIn: ["Male", "Female"] } } })
  return [
    { name: "Male", value: males },
    { name: "Female", value: females },
    { name: "Other", value: other },
  ]
}
