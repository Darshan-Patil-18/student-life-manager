import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const avatarUrl = user.user_metadata?.avatar_url ?? null
  const fullName = user.user_metadata?.full_name ?? user.email ?? 'Student'

  return <DashboardClient avatarUrl={avatarUrl} fullName={fullName} />
}
