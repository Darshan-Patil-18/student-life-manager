import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  // Server-side: if already logged in, redirect to dashboard
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-green-50 opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-50 opacity-60" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        {/* App icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-8 shadow-lg shadow-green-200">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          Student Life Manager
        </h1>
        <p className="text-gray-500 text-lg mb-10 leading-relaxed">
          Organize your tasks, set reminders, and track your expenses — all in one place.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {['✅ Task Manager', '⏰ Reminders', '💰 Expense Tracker'].map((f) => (
            <span
              key={f}
              className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium"
            >
              {f}
            </span>
          ))}
        </div>

        {/* Google Sign In */}
        <SignInWithGoogle />

        <p className="mt-6 text-xs text-gray-400">
          Your data is private and only visible to you.
        </p>
      </div>
    </main>
  )
}

function SignInWithGoogle() {
  async function signIn() {
    'use server'
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://studentlifemanager.netlify.app/auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (data.url) {
      redirect(data.url)
    }
    if (error) {
      redirect('/?error=auth')
    }
  }

  return (
    <form action={signIn}>
      <button
        type="submit"
        className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm hover:shadow-md hover:border-gray-300 active:scale-95 cursor-pointer w-full justify-center"
        style={{ transition: 'all 0.15s ease' }}
      >
        {/* Google logo SVG */}
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-gray-700 font-semibold text-base">
          Continue with Google
        </span>
      </button>
    </form>
  )
}
