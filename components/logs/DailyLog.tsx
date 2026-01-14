"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"

interface DailyLogEntry {
  id?: number
  date: string
  summary: string
  tasks_completed: number
  mood: string
  energy_level: number
  focus_rating: number
  notes: string
}

export default function DailyLog({ userId }: { userId: number }) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [log, setLog] = useState<DailyLogEntry>({
    date,
    summary: "",
    tasks_completed: 0,
    mood: "neutral",
    energy_level: 5,
    focus_rating: 5,
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchLog()
  }, [date, userId])

  const fetchLog = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/logs/${userId}/${date}`)
      const data = await response.json()
      if (data && data.id) {
        setLog(data)
      } else {
        setLog({
          date,
          summary: "",
          tasks_completed: 0,
          mood: "neutral",
          energy_level: 5,
          focus_rating: 5,
          notes: "",
        })
      }
    } catch (error) {
      console.error("Error fetching log:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const method = log.id ? "PUT" : "POST"
      const url = log.id ? `http://localhost:5000/api/logs/${log.id}` : "http://localhost:5000/api/logs"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          log.id
            ? {
                summary: log.summary,
                tasks_completed: log.tasks_completed,
                mood: log.mood,
                energy_level: log.energy_level,
                focus_rating: log.focus_rating,
                notes: log.notes,
              }
            : {
                user_id: userId,
                ...log,
              },
        ),
      })

      const result = await response.json()
      if (result.success || result.id) {
        setMessage(log.id ? "Log updated successfully!" : "Log created successfully!")
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      setMessage("Error saving log")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const moods = ["terrible", "bad", "neutral", "good", "excellent"]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Daily Log</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">What did you accomplish today?</label>
          <textarea
            value={log.summary}
            onChange={(e) => setLog({ ...log, summary: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your main accomplishments and activities..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tasks Completed</label>
            <input
              type="number"
              min="0"
              value={log.tasks_completed}
              onChange={(e) => setLog({ ...log, tasks_completed: Number.parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
            <select
              value={log.mood}
              onChange={(e) => setLog({ ...log, mood: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {moods.map((mood) => (
                <option key={mood} value={mood}>
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Energy Level (1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              value={log.energy_level}
              onChange={(e) => setLog({ ...log, energy_level: Number.parseInt(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{log.energy_level}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Focus Rating (1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              value={log.focus_rating}
              onChange={(e) => setLog({ ...log, focus_rating: Number.parseInt(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{log.focus_rating}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
          <textarea
            value={log.notes}
            onChange={(e) => setLog({ ...log, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional thoughts or observations..."
          />
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Daily Log"}
        </button>
      </form>
    </div>
  )
}
