"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { CalendarCheck, Save, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type AttendanceStatus = "present" | "absent" | "late"

interface StudentRow {
  id: string
  enrollmentNo: string
  semester: number
  user?: { name: string; email: string }
  department?: { name: string; code: string }
}

interface AttendanceRecord {
  id: string
  studentId: string
  subject: string
  status: AttendanceStatus
  remarks?: string | null
  faculty?: { user?: { name: string } }
  student?: StudentRow
}

const statusStyles: Record<AttendanceStatus, string> = {
  present: "bg-emerald-50 text-emerald-700 border-emerald-200",
  absent: "bg-red-50 text-red-700 border-red-200",
  late: "bg-amber-50 text-amber-700 border-amber-200",
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function AttendancePage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role || "student"
  const canMark = role === "faculty"

  const [date, setDate] = useState(today())
  const [subject, setSubject] = useState("General")
  const [students, setStudents] = useState<StudentRow[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [draft, setDraft] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({})
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchAttendance = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ date })
      if (subject.trim()) params.set("subject", subject.trim())

      const res = await fetch(`/api/attendance?${params}`)
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to load attendance")
        return
      }

      const data = await res.json()
      setStudents(data.students || [])
      setRecords(data.records || [])

      const nextDraft: Record<string, { status: AttendanceStatus; remarks: string }> = {}
      for (const student of data.students || []) {
        const record = (data.records || []).find((item: AttendanceRecord) => item.studentId === student.id)
        nextDraft[student.id] = {
          status: record?.status || "present",
          remarks: record?.remarks || "",
        }
      }
      setDraft(nextDraft)
    } catch {
      toast.error("Unable to load attendance")
    } finally {
      setLoading(false)
    }
  }, [date, subject])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return students
    return students.filter((student) => {
      const name = student.user?.name?.toLowerCase() || ""
      const enrollmentNo = student.enrollmentNo.toLowerCase()
      const department = student.department?.name?.toLowerCase() || ""
      return name.includes(term) || enrollmentNo.includes(term) || department.includes(term)
    })
  }, [search, students])

  const recordByStudent = useMemo(() => {
    return new Map(records.map((record) => [record.studentId, record]))
  }, [records])

  const saveAttendance = async () => {
    if (!subject.trim()) {
      toast.error("Subject is required")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          subject: subject.trim(),
          records: students.map((student) => ({
            studentId: student.id,
            status: draft[student.id]?.status || "present",
            remarks: draft[student.id]?.remarks || null,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to save attendance")
        return
      }

      toast.success("Attendance saved")
      fetchAttendance()
    } catch {
      toast.error("Unable to save attendance")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
          <p className="text-sm text-gray-500">
            {canMark ? "Mark and edit attendance for your department." : "View attendance records."}
          </p>
        </div>
        {canMark && (
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={saveAttendance} disabled={saving || loading}>
            <Save className="size-4" />
            {saving ? "Saving..." : "Save Attendance"}
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-[180px_220px_1fr]">
            <div className="space-y-2">
              <Label htmlFor="attendance-date">Date</Label>
              <Input id="attendance-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance-subject">Subject</Label>
              <Input id="attendance-subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="General" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance-search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="attendance-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search students or departments"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarCheck className="size-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Enrollment No</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                    {!canMark && <TableHead>Marked By</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const record = recordByStudent.get(student.id)
                    const current = draft[student.id]?.status || record?.status || "present"

                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{student.user?.name}</p>
                            <p className="text-xs text-gray-400">{student.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{student.enrollmentNo}</TableCell>
                        <TableCell>{student.department?.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">Sem {student.semester}</Badge>
                        </TableCell>
                        <TableCell>
                          {canMark ? (
                            <Select
                              value={current}
                              onValueChange={(value) =>
                                setDraft((items) => ({
                                  ...items,
                                  [student.id]: { status: value as AttendanceStatus, remarks: items[student.id]?.remarks || "" },
                                }))
                              }
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                                <SelectItem value="late">Late</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : record ? (
                            <Badge variant="outline" className={`capitalize ${statusStyles[record.status]}`}>
                              {record.status}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">Not marked</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {canMark ? (
                            <Input
                              value={draft[student.id]?.remarks || ""}
                              onChange={(event) =>
                                setDraft((items) => ({
                                  ...items,
                                  [student.id]: { status: items[student.id]?.status || "present", remarks: event.target.value },
                                }))
                              }
                              placeholder="Optional"
                              className="min-w-[180px]"
                            />
                          ) : (
                            <span className="text-sm text-gray-600">{record?.remarks || "-"}</span>
                          )}
                        </TableCell>
                        {!canMark && (
                          <TableCell className="text-sm text-gray-600">
                            {record?.faculty?.user?.name || "-"}
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
