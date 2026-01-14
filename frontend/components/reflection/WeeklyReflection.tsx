"use client"

import type React from "react"

import { useState, useEffect } from "react"
import axios from "axios"
import { format, startOfWeek, endOfWeek } from "date-fns"

interface Reflection {
  id?: number
  week_start_date: string
  week_end_date: string
  highlights: string
  challenges: string
  lessons_learned: string
  next_week_goals: string
}

export default function WeeklyReflection({ userId }: { userId: number }) {
  const [reflection, setReflection] = useState<Reflection>({
    week_start_date: format(startOfWeek(new Date()), "yyyy-MM-dd"),
    week_end_date: format(endOfWeek(new Date()), "yyyy-MM-dd"),
    highlights: "",
    challenges: "",
    lessons_learned: "",
    next_week_goals: "",
  })
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchReflections()
  }, [userId])

  const fetchReflections = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reflections/${userId}`)
      setReflections(response.data)
    } catch (error) {
      console.error("Error fetching reflections:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      await axios.post("http://localhost:5000/api/reflections", {
        user_id: userId,
        ...reflection,
      })
      setMessage("Reflection saved successfully!")
      setShowForm(false)
      setReflection({
        week_start_date: format(startOfWeek(new Date()), "yyyy-MM-dd"),
        week_end_date: format(endOfWeek(new Date()), "yyyy-MM-dd"),
        highlights: "",
        challenges: "",
        lessons_learned: "",
        next_week_goals: "",
      })
      fetchReflections()
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Error saving reflection")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
        >
          {message}
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          + New Weekly Reflection
        </button>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Weekly Reflection</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Week Start Date</label>
                <input
                  type="date"
                  value={reflection.week_start_date}
                  onChange={(e) => setReflection({ ...reflection, week_start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Week End Date</label>
                <input
                  type="date"
                  value={reflection.week_end_date}
                  onChange={(e) => setReflection({ ...reflection, week_end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Highlights - What went well?</label>
              <textarea
                value={reflection.highlights}
                onChange={(e) => setReflection({ ...reflection, highlights: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your wins and positive moments this week..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Challenges - What was difficult?</label>
              <textarea
                value={reflection.challenges}
                onChange={(e) => setReflection({ ...reflection, challenges: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe any obstacles or struggles you faced..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lessons Learned</label>
              <textarea
                value={reflection.lessons_learned}
                onChange={(e) => setReflection({ ...reflection, lessons_learned: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What insights or lessons did you gain this week?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Next Week's Goals</label>
              <textarea
                value={reflection.next_week_goals}
                onChange={(e) => setReflection({ ...reflection, next_week_goals: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What are your goals and intentions for next week?"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Reflection"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Past Reflections</h2>
        {reflections.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No reflections yet. Start by creating your first weekly reflection!
          </div>
        ) : (
          reflections.map((ref) => (
            <div key={ref.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">
                {ref.week_start_date} to {ref.week_end_date}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Highlights</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{ref.highlights}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Challenges</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{ref.challenges}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Lessons Learned</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{ref.lessons_learned}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-700 mb-2">Next Week's Goals</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{ref.next_week_goals}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
