'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Task {
  id: string
  content: string
  is_completed: boolean
  task_date: string
  created_at: string
}

function getTodayISO() {
  // Returns date in user's local timezone as YYYY-MM-DD
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDateLabel(dateStr: string) {
  const today = getTodayISO()
  if (dateStr === today) return 'Today'
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function TaskManager() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchTasks() {
    setLoading(true)
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('task_date', { ascending: false })
      .order('created_at', { ascending: false })
    setTasks(data ?? [])
    setLoading(false)
  }

  async function addTask() {
    const content = input.trim()
    if (!content) return
    setAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setAdding(false); return }

    const { error } = await supabase.from('tasks').insert({
      content,
      user_id: user.id,
      task_date: getTodayISO(),
      is_completed: false,
    })
    if (!error) {
      setInput('')
      await fetchTasks()
    }
    setAdding(false)
  }

  async function toggleComplete(task: Task) {
    await supabase
      .from('tasks')
      .update({ is_completed: !task.is_completed })
      .eq('id', task.id)
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, is_completed: !t.is_completed } : t
      )
    )
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  async function saveEdit(id: string) {
    const content = editContent.trim()
    if (!content) return
    await supabase.from('tasks').update({ content }).eq('id', id)
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, content } : t))
    )
    setEditingId(null)
  }

  // Group tasks by date
  const grouped = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (!acc[task.task_date]) acc[task.task_date] = []
    acc[task.task_date].push(task)
    return acc
  }, {})

  const today = getTodayISO()
  const sortedDates = Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1))

  return (
    <div className="space-y-6">
      {/* Add task input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Add New Task
        </h2>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="What do you need to do today?"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
          />
          <button
            onClick={addTask}
            disabled={adding || !input.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm cursor-pointer"
          >
            {adding ? '…' : 'Add'}
          </button>
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-400 text-sm">No tasks yet. Add your first task above!</p>
        </div>
      ) : (
        sortedDates.map((date) => (
          <div key={date} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Date header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                {formatDateLabel(date)}
              </span>
              <span className="text-xs text-gray-400">
                {grouped[date].filter((t) => t.is_completed).length}/{grouped[date].length} done
              </span>
            </div>

            {/* Tasks */}
            <ul className="divide-y divide-gray-50">
              {grouped[date].map((task) => (
                <li key={task.id} className="px-4 py-3">
                  {editingId === task.id ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(task.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        className="flex-1 border border-emerald-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                      <button
                        onClick={() => saveEdit(task.id)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleComplete(task)}
                        className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer ${
                          task.is_completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-300 hover:border-emerald-400'
                        }`}
                      >
                        {task.is_completed && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      {/* Content */}
                      <span
                        className={`flex-1 text-sm ${
                          task.is_completed
                            ? 'line-through text-gray-400'
                            : 'text-gray-800'
                        }`}
                      >
                        {task.content}
                      </span>

                      {/* Edit/Delete (only today) */}
                      {date === today && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <button
                            onClick={() => {
                              setEditingId(task.id)
                              setEditContent(task.content)
                            }}
                            className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  )
}
