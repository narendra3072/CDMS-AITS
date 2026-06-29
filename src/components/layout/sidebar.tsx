"use client"

import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import { useAppStore, type PageName } from "@/store/app-store"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Building2,
  UserCog,
  Bell,
  FileText,
  BarChart3,
  CalendarCheck,
  LogOut,
  UserCircle,
} from "lucide-react"

interface MenuItem {
  label: string
  page: PageName
  icon: React.ReactNode
  roles: string[]
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    page: "dashboard",
    icon: <LayoutDashboard className="size-4" />,
    roles: ["admin", "faculty", "student"],
  },
  {
    label: "Students",
    page: "students",
    icon: <GraduationCap className="size-4" />,
    roles: ["admin", "faculty"],
  },
  {
    label: "Faculty",
    page: "faculty",
    icon: <Users className="size-4" />,
    roles: ["admin"],
  },
  {
    label: "Departments",
    page: "departments",
    icon: <Building2 className="size-4" />,
    roles: ["admin", "faculty"],
  },
  {
    label: "Attendance",
    page: "attendance",
    icon: <CalendarCheck className="size-4" />,
    roles: ["admin", "faculty", "student"],
  },
  {
    label: "Users",
    page: "users",
    icon: <UserCog className="size-4" />,
    roles: ["admin"],
  },
  {
    label: "Notifications",
    page: "notifications",
    icon: <Bell className="size-4" />,
    roles: ["admin", "faculty", "student"],
  },
  {
    label: "CMS",
    page: "cms",
    icon: <FileText className="size-4" />,
    roles: ["admin"],
  },
  {
    label: "Reports",
    page: "reports",
    icon: <BarChart3 className="size-4" />,
    roles: ["admin"],
  },
  {
    label: "Profile",
    page: "profile",
    icon: <UserCircle className="size-4" />,
    roles: ["student"],
  },
]

export function AppSidebar() {
  const { data: session } = useSession()
  const { currentPage, setCurrentPage } = useAppStore()
  const { setOpenMobile } = useSidebar()

  const userRole = (session?.user as any)?.role || "student"
  const userName = session?.user?.name || "User"

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  )

  const handleNavigation = (page: PageName) => {
    setCurrentPage(page)
    setOpenMobile(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-emerald-100">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <img
            src="/aits.png"
            alt="AITS logo"
            className="size-9 rounded-full object-contain bg-white ring-1 ring-emerald-100 shrink-0"
          />
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-sm font-bold text-gray-900">Portal</h2>
            <p className="text-[10px] text-gray-500 leading-tight">Annamacharya Institute</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-emerald-700/60 text-[11px] font-semibold uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.page}>
                  <SidebarMenuButton
                    isActive={currentPage === item.page}
                    onClick={() => handleNavigation(item.page)}
                    tooltip={item.label}
                    className={
                      currentPage === item.page
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 font-medium"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center">
          <Avatar className="size-8 border border-emerald-200">
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-medium">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium truncate text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
          </div>
          <button
            onClick={() => signOut({ redirect: false })}
            className="group-data-[collapsible=icon]:hidden p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              onClick={() => signOut({ redirect: false })}
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
            >
              <LogOut className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
