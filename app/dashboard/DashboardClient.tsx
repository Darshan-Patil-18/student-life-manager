'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import TaskManager from '@/components/TaskManager'
import Reminder from '@/components/Reminder'
import ExpenseTracker from '@/components/ExpenseTracker'

type Tab = 'tasks' | 'reminder' | 'expenses'

interface Props {
  avatarUrl: string | null
  fullName: string
}

export default function DashboardClient({ avatarUrl, fullName }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('tasks')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'tasks',
      label: 'Task Manager',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: 'reminder',
      label: 'Reminder',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      id: 'expenses',
      label: 'Expense Tracker',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* App Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-base hidden sm:block">
              Student Life Manager
            </span>
            <span className="font-bold text-gray-900 text-base sm:hidden">
              SLM
            </span>
          </div>

          {/* User area */}
          <div className="flex items-center gap-3">
            {/* User info */}
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  {fullName[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[120px] truncate">
                {fullName}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg px-3 py-1.5 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Tab navigation */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">
                  {tab.id === 'tasks' ? 'Tasks' : tab.id === 'reminder' ? 'Reminder' : 'Expenses'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {activeTab === 'tasks' && <TaskManager />}
        {activeTab === 'reminder' && <Reminder />}
        {activeTab === 'expenses' && <ExpenseTracker />}
      </main>
    </div>
  )
}
