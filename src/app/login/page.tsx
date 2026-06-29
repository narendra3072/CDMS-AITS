"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import LoginPage from "@/components/auth/login-page"

export default function LoginRoute() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace("/portal")
    }
  }, [router, session, status])

  return <LoginPage />
}
