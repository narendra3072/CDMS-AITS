"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, GraduationCap, ShieldCheck, Users } from "lucide-react"

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_420px]">
          <div className="space-y-7">
            <div className="flex items-center gap-3">
              <img
                src="/aits.png"
                alt="AITS logo"
                className="size-20 rounded-full bg-white object-contain shadow-md ring-1 ring-emerald-100"
              />
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">AITS</p>
                <h1 className="text-3xl font-bold text-gray-950 md:text-5xl">Portal</h1>
              </div>
            </div>

            <div className="max-w-2xl space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 md:text-4xl">
                Annamacharya Institute of Technology and Sciences
              </h2>
              <p className="text-base leading-7 text-gray-600">
                A single academic portal for students, faculty, attendance, departments, notifications, and institutional records.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-11 bg-emerald-600 px-6 text-white hover:bg-emerald-700"
                onClick={() => router.push("/login")}
              >
                Login
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="h-11 px-6"
                onClick={() => router.push("/portal")}
              >
                Open Portal
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            <Feature icon={<GraduationCap className="size-5" />} title="Student Records" text="Branch, degree, year, semester, section, and roll number details." />
            <Feature icon={<Users className="size-5" />} title="Faculty Access" text="Faculty accounts can mark and edit attendance for their department." />
            <Feature icon={<ShieldCheck className="size-5" />} title="Role Dashboards" text="Separate views for admin, faculty, and students after login." />
          </div>
        </div>
      </section>
    </main>
  )
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-emerald-100 bg-white/80 p-5 shadow-sm">
      <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-gray-500">{text}</p>
    </div>
  )
}
