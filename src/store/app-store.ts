import { create } from "zustand"

export type PageName =
  | "dashboard"
  | "students"
  | "faculty"
  | "departments"
  | "attendance"
  | "users"
  | "notifications"
  | "cms"
  | "reports"
  | "profile"

interface AppState {
  currentPage: PageName
  sidebarOpen: boolean
  selectedId: string | null
  setCurrentPage: (page: PageName) => void
  setSidebarOpen: (open: boolean) => void
  setSelectedId: (id: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: "dashboard",
  sidebarOpen: true,
  selectedId: null,
  setCurrentPage: (page) => set({ currentPage: page, selectedId: null }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSelectedId: (id) => set({ selectedId: id }),
}))
