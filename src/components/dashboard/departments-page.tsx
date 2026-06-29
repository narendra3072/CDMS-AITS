"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  Pencil,
  Trash2,
} from "lucide-react"

export function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([])
  const [faculties, setFaculties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "", code: "", description: "", hodId: "",
  })

  const fetchDepartments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/departments")
      if (res.ok) {
        const data = await res.json()
        setDepartments(data)
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchFaculties = useCallback(async () => {
    try {
      const res = await fetch("/api/faculty?limit=100")
      if (res.ok) {
        const data = await res.json()
        setFaculties(data.faculties)
      }
    } catch {
      // Ignore
    }
  }, [])

  useEffect(() => {
    fetchDepartments()
    fetchFaculties()
  }, [fetchDepartments, fetchFaculties])

  const handleSubmit = async () => {
    if (editMode && editId) {
      try {
        const res = await fetch(`/api/departments/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            code: form.code,
            description: form.description || null,
            hodId: form.hodId || null,
          }),
        })
        if (res.ok) {
          toast.success("Department updated successfully")
          setDialogOpen(false)
          resetForm()
          fetchDepartments()
        } else {
          const data = await res.json()
          toast.error(data.error || "Failed to update department")
        }
      } catch {
        toast.error("An error occurred")
      }
    } else {
      try {
        const res = await fetch("/api/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            code: form.code,
            description: form.description || null,
            hodId: form.hodId || null,
          }),
        })
        if (res.ok) {
          toast.success("Department created successfully")
          setDialogOpen(false)
          resetForm()
          fetchDepartments()
        } else {
          const data = await res.json()
          toast.error(data.error || "Failed to create department")
        }
      } catch {
        toast.error("An error occurred")
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return
    try {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Department deleted successfully")
        fetchDepartments()
      } else {
        toast.error("Failed to delete department")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const handleEdit = (dept: any) => {
    setEditMode(true)
    setEditId(dept.id)
    setForm({
      name: dept.name || "",
      code: dept.code || "",
      description: dept.description || "",
      hodId: dept.hodId || "",
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setForm({ name: "", code: "", description: "", hodId: "" })
    setEditMode(false)
    setEditId(null)
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Departments</h2>
          <p className="text-sm text-gray-500">{departments.length} departments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="size-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editMode ? "Edit Department" : "Add New Department"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="AIDS" />
                </div>
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CS" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Department description..." />
              </div>
              <div className="space-y-2">
                <Label>Head of Department</Label>
                <Select value={form.hodId} onValueChange={(v) => setForm({ ...form, hodId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select HOD" /></SelectTrigger>
                  <SelectContent>
                    {faculties.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.user?.name} ({f.employeeId})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>Cancel</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit}>
                  {editMode ? "Update Department" : "Create Department"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <Building2 className="size-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{dept.name}</CardTitle>
                      <Badge variant="secondary" className="text-[10px] mt-0.5">{dept.code}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => handleEdit(dept)}>
                      <Pencil className="size-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7 text-red-500 hover:text-red-700" onClick={() => handleDelete(dept.id)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {dept.description && (
                  <CardDescription className="mb-3 text-xs">{dept.description}</CardDescription>
                )}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-md bg-gray-50">
                    <GraduationCap className="size-4 text-emerald-500 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-gray-900">{dept._count?.students || 0}</p>
                    <p className="text-[10px] text-gray-400">Students</p>
                  </div>
                  <div className="p-2 rounded-md bg-gray-50">
                    <Users className="size-4 text-teal-500 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-gray-900">{dept._count?.faculties || 0}</p>
                    <p className="text-[10px] text-gray-400">Faculty</p>
                  </div>
                  <div className="p-2 rounded-md bg-gray-50">
                    <BookOpen className="size-4 text-cyan-500 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-gray-900">{dept._count?.programs || 0}</p>
                    <p className="text-[10px] text-gray-400">Programs</p>
                  </div>
                  <div className="p-2 rounded-md bg-gray-50">
                    <BookOpen className="size-4 text-amber-500 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-gray-900">{dept._count?.subjects || 0}</p>
                    <p className="text-[10px] text-gray-400">Subjects</p>
                  </div>
                </div>
                {dept.hod && (
                  <p className="text-xs text-gray-500 mt-3">
                    HOD: <span className="font-medium text-gray-700">{dept.hod.user?.name}</span>
                  </p>
                )}
                {dept.subjects?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Core Subjects</p>
                    <div className="flex flex-wrap gap-1.5">
                      {dept.subjects.map((subject: any) => (
                        <Badge key={subject.id} variant="secondary" className="text-[10px]">
                          {subject.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {dept.faculties?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Faculty</p>
                    <div className="space-y-1">
                      {dept.faculties.map((faculty: any) => (
                        <div key={faculty.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700">{faculty.user?.name}</span>
                          <span className="text-gray-400">{faculty.designation || "Faculty"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
