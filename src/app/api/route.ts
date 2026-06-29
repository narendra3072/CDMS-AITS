import { NextResponse } from "next/server"
import { ensureDemoUsers } from "@/lib/seed-demo-users"

export async function GET() {
  await ensureDemoUsers()
  return NextResponse.json({ message: "Hello, world!" })
}