"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  GraduationCap,
  Users,
  Building2,
  UserCog,
  TrendingUp,
  BookOpen,
} from "lucide-react"

interface AdminStats {
  totalStudents: number
  totalFaculty: number
  totalDepartments: number
  totalPrograms: number
  totalUsers: number
  activeStudents: number
  studentsByDept: { name: string; count: number }[]
  facultyByDept: { name: string; count: number }[]
  recentStudents: any[]
  recentNotifications: any[]
  genderDistribution: { name: string; value: number }[]
}

interface FacultyStats {
  faculty: any
  departmentStudents: number
  departmentFaculty: number
  unreadNotifications: number
}

interface StudentStats {
  student: any
  unreadNotifications: number
}

export function DashboardPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role || "student"
  const [loading, setLoading] = useState(true)

  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [facultyStats, setFacultyStats] = useState<FacultyStats | null>(null)
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats")
        if (res.ok) {
          const data = await res.json()
          if (role === "admin") setAdminStats(data)
          else if (role === "faculty") setFacultyStats(data)
          else setStudentStats(data)
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [role])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (role === "admin" && adminStats) {
    return <AdminDashboard stats={adminStats} />
  }

  if (role === "faculty" && facultyStats) {
    return <FacultyDashboard stats={facultyStats} />
  }

  if (role === "student" && studentStats) {
    return <StudentDashboard stats={studentStats} />
  }

  return (
    <div className="p-6">
      <p className="text-gray-500">Unable to load dashboard data.</p>
    </div>
  )
}

function AdminDashboard({ stats }: { stats: AdminStats }) {
  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: <GraduationCap className="size-5" />,
      description: `${stats.activeStudents} active`,
      color: "emerald",
    },
    {
      title: "Total Faculty",
      value: stats.totalFaculty,
      icon: <Users className="size-5" />,
      description: "Across all departments",
      color: "teal",
    },
    {
      title: "Departments",
      value: stats.totalDepartments,
      icon: <Building2 className="size-5" />,
      description: `${stats.totalPrograms} programs`,
      color: "cyan",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <UserCog className="size-5" />,
      description: "System accounts",
      color: "amber",
    },
  ]

  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", iconBg: "bg-emerald-100" },
    teal: { bg: "bg-teal-50", text: "text-teal-700", iconBg: "bg-teal-100" },
    cyan: { bg: "bg-cyan-50", text: "text-cyan-700", iconBg: "bg-cyan-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", iconBg: "bg-amber-100" },
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Welcome back, Administrator</h2>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s an overview of your institution.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const colors = colorMap[card.color]
          return (
            <Card key={card.title} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{card.description}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${colors.iconBg}`}>
                    <span className={colors.text}>{card.icon}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="size-4 text-emerald-600" />
              Students by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.studentsByDept.map((dept) => (
                <div key={dept.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{dept.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{
                          width: `${Math.max(10, (dept.count / Math.max(...stats.studentsByDept.map(d => d.count), 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-6 text-right">{dept.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="size-4 text-teal-600" />
              Faculty by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.facultyByDept.map((dept) => (
                <div key={dept.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{dept.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full"
                        style={{
                          width: `${Math.max(10, (dept.count / Math.max(...stats.facultyByDept.map(d => d.count), 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-6 text-right">{dept.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Students */}
      {stats.recentStudents && stats.recentStudents.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Students</CardTitle>
            <CardDescription>Latest enrolled students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentStudents.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <GraduationCap className="size-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.user?.name}</p>
                      <p className="text-xs text-gray-400">{s.enrollmentNo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{s.department?.name}</p>
                    <Badge variant="secondary" className="text-[10px] mt-0.5">{s.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function FacultyDashboard({ stats }: { stats: FacultyStats }) {
  const faculty = stats.faculty
  const isHod = faculty?.designation?.toLowerCase() === "hod"
  const departmentFaculty = faculty?.department?.faculties || []
  const coreSubjects = faculty?.department?.subjects || []

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Welcome back, {faculty?.user?.name || "Faculty"}</h2>
        <p className="text-sm text-gray-500 mt-1">Department overview and quick access.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Department Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.departmentStudents}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-100">
                <GraduationCap className="size-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Department Faculty</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.departmentFaculty}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-teal-100">
                <Users className="size-5 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Unread Notifications</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.unreadNotifications}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-100">
                <Building2 className="size-5 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {faculty && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Department:</span> <span className="font-medium">{faculty.department?.name}</span></div>
              <div><span className="text-gray-500">Designation:</span> <span className="font-medium">{faculty.designation || "N/A"}</span></div>
              <div><span className="text-gray-500">Specialization:</span> <span className="font-medium">{faculty.specialization || "N/A"}</span></div>
              <div><span className="text-gray-500">Experience:</span> <span className="font-medium">{faculty.experience} years</span></div>
            </div>
          </CardContent>
        </Card>
      )}

      {isHod && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="size-4 text-teal-600" />
                Department Faculty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {departmentFaculty.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.user?.name}</p>
                      <p className="text-xs text-gray-500">{item.user?.email}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{item.designation || "Faculty"}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="size-4 text-emerald-600" />
                Core Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {coreSubjects.map((subject: any) => (
                  <div key={subject.id} className="rounded-md bg-emerald-50 px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{subject.name}</p>
                    <p className="text-xs text-emerald-700">{subject.code}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function StudentDashboard({ stats }: { stats: StudentStats }) {
  const student = stats.student

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Welcome back, {student?.user?.name || "Student"}</h2>
        <p className="text-sm text-gray-500 mt-1">Your academic overview at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Semester</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{student?.semester || "N/A"}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-100">
                <BookOpen className="size-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Unread Notifications</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.unreadNotifications}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-teal-100">
                <Building2 className="size-5 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {student && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Academic Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Enrollment No:</span> <span className="font-medium">{student.enrollmentNo}</span></div>
              <div><span className="text-gray-500">Department:</span> <span className="font-medium">{student.department?.name}</span></div>
              <div><span className="text-gray-500">Program:</span> <span className="font-medium">{student.program?.name || "N/A"}</span></div>
              <div><span className="text-gray-500">Year:</span> <span className="font-medium">{student.year}</span></div>
              <div><span className="text-gray-500">Section:</span> <span className="font-medium">{student.section || "A"}</span></div>
              <div><span className="text-gray-500">Status:</span> <Badge variant="secondary" className="text-xs">{student.status}</Badge></div>
              <div><span className="text-gray-500">Gender:</span> <span className="font-medium">{student.gender || "N/A"}</span></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-6 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
