"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns"

const CATEGORIES = ["Travelogue", "SQL Practice", "ML Projects", "College Subjects", "Reading/Revision", "Other"]

export default function DailyLog({ logs, onLogSaved }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [entries, setEntries] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newEntry, setNewEntry] = useState({ category: "", hours: "", notes: "" })

  const start = startOfMonth(currentMonth)
  const end = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start, end })

  const getLogForDate = (date) => {
    return logs.find((log) => isSameDay(new Date(log.date), date))
  }

  const handleAddEntry = async () => {
    if (!newEntry.category) return

    const dateStr = format(selectedDate, "yyyy-MM-dd")
    const existingLog = getLogForDate(selectedDate)

    const logData = {
      date: dateStr,
      entries: existingLog?.entries ? [...existingLog.entries, newEntry] : [newEntry],
    }

    try {
      const response = await fetch("/api/logs/personal", {
        method: existingLog ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData),
      })
      const result = await response.json()
      onLogSaved(result)
      setNewEntry({ category: "", hours: "", notes: "" })
      setShowModal(false)
    } catch (error) {
      console.log("[v0] Error saving log:", error)
    }
  }

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const log = getLogForDate(day)
              const isSelected = isSameDay(day, selectedDate)
              const hasEntry = log && log.entries?.length > 0

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square rounded-lg font-medium text-sm transition-all ${
                    isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
                  } ${!isSameMonth(day, currentMonth) ? "text-gray-300" : ""} ${
                    hasEntry ? "bg-green-100 text-green-900" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {format(day, "d")}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="card sticky top-24">
          <h3 className="text-lg font-bold mb-4">{format(selectedDate, "MMM d, yyyy")}</h3>

          <div className="mb-4">
            {getLogForDate(selectedDate)?.entries?.map((entry, i) => (
              <div key={i} className="bg-green-50 p-3 rounded mb-2">
                <p className="font-semibold text-gray-900">{entry.category}</p>
                {entry.hours && <p className="text-sm text-gray-600">⏱ {entry.hours}h</p>}
                {entry.notes && <p className="text-sm text-gray-700 mt-1">{entry.notes}</p>}
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Entry
          </button>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="card max-w-md w-full mx-4">
                <h4 className="text-lg font-bold mb-4">Add Work Entry</h4>

                <select
                  value={newEntry.category}
                  onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                  className="w-full p-2 border rounded mb-3"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Hours (optional)"
                  value={newEntry.hours}
                  onChange={(e) => setNewEntry({ ...newEntry, hours: e.target.value })}
                  className="w-full p-2 border rounded mb-3"
                />

                <textarea
                  placeholder="Quick notes (optional)"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  className="w-full p-2 border rounded mb-4 resize-none h-20"
                />

                <div className="flex gap-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 p-2 border rounded hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleAddEntry} className="flex-1 btn btn-primary">
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
