"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  UserCircle,
  GraduationCap,
  Building2,
  BookOpen,
  Mail,
  Calendar,
  Phone,
  MapPin,
  FileText,
} from "lucide-react"

export function ProfilePage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/stats")
        if (res.ok) {
          const data = await res.json()
          setProfileData(data)
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const userName = session?.user?.name || "User"
  const userEmail = session?.user?.email || ""

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  const student = profileData?.student
  const faculty = profileData?.faculty

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Profile Header */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="size-20 border-4 border-emerald-100">
              <AvatarFallback className="bg-emerald-600 text-white text-xl font-bold">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-900">{userName}</h2>
              <p className="text-sm text-gray-500">{userEmail}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 capitalize" variant="outline">
                  {role}
                </Badge>
                {student && (
                  <Badge variant="secondary" className="text-xs">
                    {student.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Profile Details */}
      {role === "student" && student && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="size-4 text-emerald-600" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProfileField icon={<BookOpen className="size-4" />} label="Enrollment No" value={student.enrollmentNo} />
              <ProfileField icon={<Building2 className="size-4" />} label="Department" value={student.department?.name} />
              <ProfileField icon={<FileText className="size-4" />} label="Program" value={student.program?.name || "N/A"} />
              <ProfileField icon={<BookOpen className="size-4" />} label="Section" value={student.section || "A"} />
              <ProfileField icon={<Calendar className="size-4" />} label="Semester / Year" value={`Semester ${student.semester} / Year ${student.year}`} />
              <ProfileField icon={<Calendar className="size-4" />} label="Admission Date" value={new Date(student.admissionDate).toLocaleDateString()} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCircle className="size-4 text-emerald-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProfileField icon={<Mail className="size-4" />} label="Email" value={userEmail} />
              <ProfileField icon={<Phone className="size-4" />} label="Phone" value={student.phone || "N/A"} />
              <ProfileField icon={<MapPin className="size-4" />} label="Address" value={student.address || "N/A"} />
              <ProfileField icon={<UserCircle className="size-4" />} label="Gender" value={student.gender || "N/A"} />
              <ProfileField icon={<UserCircle className="size-4" />} label="Blood Group" value={student.bloodGroup || "N/A"} />
              {student.guardianName && (
                <ProfileField icon={<UserCircle className="size-4" />} label="Guardian" value={`${student.guardianName} ${student.guardianPhone ? `(${student.guardianPhone})` : ""}`} />
              )}
            </CardContent>
          </Card>

          {student.documents && student.documents.length > 0 && (
            <Card className="border-0 shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="size-4 text-emerald-600" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {student.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <FileText className="size-5 text-emerald-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{doc.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Faculty Profile Details */}
      {role === "faculty" && faculty && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="size-4 text-emerald-600" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProfileField icon={<BookOpen className="size-4" />} label="Employee ID" value={faculty.employeeId} />
              <ProfileField icon={<Building2 className="size-4" />} label="Department" value={faculty.department?.name} />
              <ProfileField icon={<UserCircle className="size-4" />} label="Designation" value={faculty.designation || "N/A"} />
              <ProfileField icon={<BookOpen className="size-4" />} label="Specialization" value={faculty.specialization || "N/A"} />
              <ProfileField icon={<BookOpen className="size-4" />} label="Qualification" value={faculty.qualification || "N/A"} />
              <ProfileField icon={<Calendar className="size-4" />} label="Experience" value={`${faculty.experience} years`} />
              <ProfileField icon={<Calendar className="size-4" />} label="Join Date" value={new Date(faculty.joinDate).toLocaleDateString()} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <UserCircle className="size-4 text-emerald-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProfileField icon={<Mail className="size-4" />} label="Email" value={userEmail} />
              <ProfileField icon={<Phone className="size-4" />} label="Phone" value={faculty.phone || "N/A"} />
              <ProfileField icon={<MapPin className="size-4" />} label="Address" value={faculty.address || "N/A"} />
              <ProfileField icon={<UserCircle className="size-4" />} label="Gender" value={faculty.gender || "N/A"} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Profile */}
      {role === "admin" && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCircle className="size-4 text-emerald-600" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProfileField icon={<Mail className="size-4" />} label="Email" value={userEmail} />
            <ProfileField icon={<UserCircle className="size-4" />} label="Role" value="Administrator" />
            <ProfileField icon={<Calendar className="size-4" />} label="Unread Notifications" value={String(profileData?.unreadNotifications || 0)} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ProfileField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-gray-400">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  )
}
