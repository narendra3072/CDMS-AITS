"use client"

import { AppSidebar } from "@/components/layout/sidebar"
import { AppHeader } from "@/components/layout/header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useAppStore } from "@/store/app-store"
import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { StudentsPage } from "@/components/dashboard/students-page"
import { FacultyPage } from "@/components/dashboard/faculty-page"
import { DepartmentsPage } from "@/components/dashboard/departments-page"
import { UsersPage } from "@/components/dashboard/users-page"
import { NotificationsPage } from "@/components/dashboard/notifications-page"
import { CmsPage } from "@/components/dashboard/cms-page"
import { ReportsPage } from "@/components/dashboard/reports-page"
import { ProfilePage } from "@/components/dashboard/profile-page"
import { AttendancePage } from "@/components/dashboard/attendance-page"

function PageContent() {
  const { currentPage } = useAppStore()

  switch (currentPage) {
    case "dashboard":
      return <DashboardPage />
    case "students":
      return <StudentsPage />
    case "faculty":
      return <FacultyPage />
    case "departments":
      return <DepartmentsPage />
    case "attendance":
      return <AttendancePage />
    case "users":
      return <UsersPage />
    case "notifications":
      return <NotificationsPage />
    case "cms":
      return <CmsPage />
    case "reports":
      return <ReportsPage />
    case "profile":
      return <ProfilePage />
    default:
      return <DashboardPage />
  }
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-auto">
          <PageContent />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
