'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Expense {
  id: string
  item_name: string
  cost: number
  expense_date: string
  created_at: string
}

function getTodayISO() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatINR(amount: number) {
  return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })
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

function getMonthLabel(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

function getMonthKey(dateStr: string) {
  return dateStr.slice(0, 7) // "YYYY-MM"
}

export default function ExpenseTracker() {
  const supabase = createClient()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [itemName, setItemName] = useState('')
  const [cost, setCost] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState('')
  const [editCost, setEditCost] = useState('')

  useEffect(() => {
    fetchExpenses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchExpenses() {
    setLoading(true)
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false })
    setExpenses(data ?? [])
    setLoading(false)
  }

  async function addExpense() {
    const name = itemName.trim()
    const costVal = parseFloat(cost)
    if (!name || isNaN(costVal) || costVal <= 0) return

    setAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setAdding(false); return }

    const { error } = await supabase.from('expenses').insert({
      item_name: name,
      cost: costVal,
      user_id: user.id,
      expense_date: getTodayISO(),
    })
    if (!error) {
      setItemName('')
      setCost('')
      await fetchExpenses()
    }
    setAdding(false)
  }

  async function deleteExpense(id: string) {
    await supabase.from('expenses').delete().eq('id', id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  async function saveEdit(id: string) {
    const name = editItem.trim()
    const costVal = parseFloat(editCost)
    if (!name || isNaN(costVal) || costVal <= 0) return
    await supabase
      .from('expenses')
      .update({ item_name: name, cost: costVal })
      .eq('id', id)
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, item_name: name, cost: costVal } : e))
    )
    setEditingId(null)
  }

  // Group by date
  const grouped = expenses.reduce<Record<string, Expense[]>>((acc, exp) => {
    if (!acc[exp.expense_date]) acc[exp.expense_date] = []
    acc[exp.expense_date].push(exp)
    return acc
  }, {})

  // Group dates by month
  const today = getTodayISO()
  const currentMonth = getMonthKey(today)
  const sortedDates = Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1))

  // Get all months ordered
  const monthsSet = new Set(sortedDates.map(getMonthKey))
  const sortedMonths = [...monthsSet].sort((a, b) => (a > b ? -1 : 1))

  // Monthly totals
  const monthTotals = sortedMonths.reduce<Record<string, number>>((acc, month) => {
    acc[month] = expenses
      .filter((e) => getMonthKey(e.expense_date) === month)
      .reduce((sum, e) => sum + Number(e.cost), 0)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Add expense input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Add New Expense
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addExpense()}
            placeholder="Item name (e.g. Lunch, Books)"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
          />
          <div className="flex gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addExpense()}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-32 border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
              />
            </div>
            <button
              onClick={addExpense}
              disabled={adding || !itemName.trim() || !cost}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm cursor-pointer whitespace-nowrap"
            >
              {adding ? '…' : 'Add'}
            </button>
          </div>
        </div>
      </div>

      {/* Expense list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="text-4xl mb-3">💰</div>
          <p className="text-gray-400 text-sm">No expenses yet. Add your first expense above!</p>
        </div>
      ) : (
        sortedMonths.map((month) => {
          const datesInMonth = sortedDates.filter((d) => getMonthKey(d) === month)
          const isCurrentMonth = month === currentMonth

          return (
            <div key={month} className="space-y-3">
              {/* Monthly total banner */}
              <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${
                isCurrentMonth
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-800 text-white'
              }`}>
                <span className="font-semibold text-sm">
                  {getMonthLabel(datesInMonth[0])}
                </span>
                <span className="font-bold text-base">
                  Total: {formatINR(monthTotals[month])}
                </span>
              </div>

              {/* Date groups */}
              {datesInMonth.map((date) => {
                const dayTotal = grouped[date].reduce((sum, e) => sum + Number(e.cost), 0)
                const isToday = date === today

                return (
                  <div key={date} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Date header */}
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        {formatDateLabel(date)}
                      </span>
                    </div>

                    {/* Expenses */}
                    <ul className="divide-y divide-gray-50">
                      {grouped[date].map((expense) => (
                        <li key={expense.id} className="px-4 py-3">
                          {editingId === expense.id ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                autoFocus
                                type="text"
                                value={editItem}
                                onChange={(e) => setEditItem(e.target.value)}
                                className="flex-1 border border-emerald-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                              />
                              <div className="flex gap-2">
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                  <input
                                    type="number"
                                    value={editCost}
                                    onChange={(e) => setEditCost(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveEdit(expense.id)
                                      if (e.key === 'Escape') setEditingId(null)
                                    }}
                                    className="w-28 border border-emerald-300 rounded-lg pl-5 pr-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                  />
                                </div>
                                <button
                                  onClick={() => saveEdit(expense.id)}
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
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{expense.item_name}</p>
                              </div>
                              <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                {formatINR(Number(expense.cost))}
                              </span>
                              {/* Edit/Delete (only today) */}
                              {isToday && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingId(expense.id)
                                      setEditItem(expense.item_name)
                                      setEditCost(String(expense.cost))
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                    title="Edit"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => deleteExpense(expense.id)}
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

                    {/* Daily total */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">Daily Total</span>
                      <span className="text-sm font-bold text-gray-800">{formatINR(dayTotal)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })
      )}
    </div>
  )
}
