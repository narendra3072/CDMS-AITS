"use client"

import { useEffect, useState, useCallback } from "react"
import type { ReactNode } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Plus,
  Search,
  GraduationCap,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

export function StudentsPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [students, setStudents] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedDept, setSelectedDept] = useState("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "", email: "", username: "", password: "",
    enrollmentNo: "", departmentId: "", programId: "",
    semester: "1", year: "1", section: "A", phone: "", gender: "",
  })

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (search) params.set("search", search)
      if (selectedDept !== "all") params.set("departmentId", selectedDept)

      const res = await fetch(`/api/students?${params}`)
      if (res.ok) {
        const data = await res.json()
        setStudents(data.students)
        setTotal(data.total)
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }, [page, search, selectedDept])

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch("/api/departments")
      if (res.ok) {
        const data = await res.json()
        setDepartments(data)
      }
    } catch {
      // Ignore
    }
  }, [])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleSubmit = async () => {
    if (editMode && editId) {
      try {
        const res = await fetch(`/api/students/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name, email: form.email,
            departmentId: form.departmentId,
            semester: parseInt(form.semester),
            year: parseInt(form.year),
            section: form.section || "A",
            phone: form.phone || null,
            gender: form.gender || null,
          }),
        })
        if (res.ok) {
          toast.success("Student updated successfully")
          setDialogOpen(false)
          resetForm()
          fetchStudents()
        } else {
          const data = await res.json()
          toast.error(data.error || "Failed to update student")
        }
      } catch {
        toast.error("An error occurred")
      }
    } else {
      try {
        const res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            semester: parseInt(form.semester),
            year: parseInt(form.year),
            phone: form.phone || null,
            gender: form.gender || null,
          }),
        })
        if (res.ok) {
          toast.success("Student created successfully")
          setDialogOpen(false)
          resetForm()
          fetchStudents()
        } else {
          const data = await res.json()
          toast.error(data.error || "Failed to create student")
        }
      } catch {
        toast.error("An error occurred")
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Student deleted successfully")
        fetchStudents()
      } else {
        toast.error("Failed to delete student")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const handleViewDetails = async (student: any) => {
    setSelectedStudent(student)
    setDetailsOpen(true)

    try {
      const res = await fetch(`/api/students/${student.id}`)
      if (res.ok) {
        setSelectedStudent(await res.json())
      }
    } catch {
      toast.error("Failed to load student details")
    }
  }

  const handleEdit = (student: any) => {
    setEditMode(true)
    setEditId(student.id)
    setForm({
      name: student.user?.name || "",
      email: student.user?.email || "",
      username: student.user?.username || "",
      password: "",
      enrollmentNo: student.enrollmentNo || "",
      departmentId: student.departmentId || "",
      programId: student.programId || "",
      semester: String(student.semester || 1),
      year: String(student.year || 1),
      section: student.section || "A",
      phone: student.phone || "",
      gender: student.gender || "",
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setForm({
    name: "", email: "", username: "", password: "",
    enrollmentNo: "", departmentId: "", programId: "",
    semester: "1", year: "1", section: "A", phone: "", gender: "",
    })
    setEditMode(false)
    setEditId(null)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Students</h2>
          <p className="text-sm text-gray-500">{total} total students</p>
        </div>
        {role === "admin" && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="size-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editMode ? "Edit Student" : "Add New Student"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@aits.edu.in" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Username *</Label>
                    <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="narasimha" disabled={editMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>{editMode ? "Password (leave blank to keep)" : "Password *"}</Label>
                    <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Enrollment No *</Label>
                    <Input value={form.enrollmentNo} onChange={(e) => setForm({ ...form, enrollmentNo: e.target.value })} placeholder="23701A3001" disabled={editMode} />
                  </div>
                  <div className="space-y-2">
                    <Label>Department *</Label>
                    <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select value={form.semester} onValueChange={(v) => setForm({ ...form, semester: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8].map(s => (
                          <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select value={form.year} onValueChange={(v) => setForm({ ...form, year: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4].map(y => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Section</Label>
                    <Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="A" />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 123 456 7890" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>Cancel</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit}>
                    {editMode ? "Update Student" : "Create Student"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by name, enrollment no, or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <Select value={selectedDept} onValueChange={(v) => { setSelectedDept(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <GraduationCap className="size-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Gmail</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Degree</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Section</TableHead>
                    {role === "admin" && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow
                      key={s.id}
                      className="cursor-pointer"
                      onClick={() => handleViewDetails(s)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{s.user?.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{s.enrollmentNo}</TableCell>
                      <TableCell>{s.user?.email}</TableCell>
                      <TableCell>{s.department?.name}</TableCell>
                      <TableCell>{s.program?.name || "B.Tech"}</TableCell>
                      <TableCell>Year {s.year}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">Sem {s.semester}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200" variant="outline">
                          {s.section || "A"}
                        </Badge>
                      </TableCell>
                      {role === "admin" && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleEdit(s)
                              }}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-red-500 hover:text-red-700"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleDelete(s.id)
                              }}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedStudent?.user?.name || "Student Details"}</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-5 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <DetailItem label="Enrollment No" value={selectedStudent.enrollmentNo} />
                <DetailItem label="Username" value={selectedStudent.user?.username} />
                <DetailItem label="Email" value={selectedStudent.user?.email} />
                <DetailItem label="Phone" value={selectedStudent.phone || "N/A"} />
                <DetailItem label="Department" value={selectedStudent.department?.name} />
                <DetailItem label="Program" value={selectedStudent.program?.name || "B.Tech"} />
                <DetailItem label="Year" value={`Year ${selectedStudent.year}`} />
                <DetailItem label="Semester" value={`Semester ${selectedStudent.semester}`} />
                <DetailItem label="Section" value={selectedStudent.section || "A"} />
                <DetailItem label="Gender" value={selectedStudent.gender || "N/A"} />
                <DetailItem label="Blood Group" value={selectedStudent.bloodGroup || "N/A"} />
                <DetailItem label="Status" value={selectedStudent.status || "active"} />
                <DetailItem label="Guardian" value={selectedStudent.guardianName || "N/A"} />
                <DetailItem label="Guardian Phone" value={selectedStudent.guardianPhone || "N/A"} />
              </div>

              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Address</p>
                <p className="text-sm text-gray-900">{selectedStudent.address || "N/A"}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Documents</p>
                {selectedStudent.documents?.length ? (
                  <div className="space-y-2">
                    {selectedStudent.documents.map((document: any) => (
                      <div key={document.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <span>{document.name}</span>
                        <Badge variant="secondary" className="text-xs">{document.type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No documents uploaded</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="size-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-3 text-sm text-gray-600">Page {page} of {totalPages}</span>
            <Button variant="outline" size="icon" className="size-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md bg-gray-50 p-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
    </div>
  )
}
