import { ensureDemoUsers } from '@/lib/seed-demo-users'

export async function bootstrapApp() {
  await ensureDemoUsers()
}
