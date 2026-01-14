"use client"

import { useState } from "react"
import { format, startOfWeek, endOfWeek } from "date-fns"

export default function WeeklyReflection({ reflections, onReflectionSaved }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    highlights: "",
    challenges: "",
    lessons: "",
    nextWeek: "",
  })

  const currentWeek = {
    start: format(startOfWeek(new Date()), "yyyy-MM-dd"),
    end: format(endOfWeek(new Date()), "yyyy-MM-dd"),
  }

  const handleSave = async () => {
    if (!formData.highlights && !formData.challenges && !formData.lessons && !formData.nextWeek) {
      return
    }

    try {
      const response = await fetch("/api/reflections/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStart: currentWeek.start,
          weekEnd: currentWeek.end,
          highlights: formData.highlights,
          challenges: formData.challenges,
          lessons: formData.lessons,
          nextWeek: formData.nextWeek,
        }),
      })
      const result = await response.json()
      onReflectionSaved(result)
      setFormData({ highlights: "", challenges: "", lessons: "", nextWeek: "" })
      setShowForm(false)
    } catch (error) {
      console.log("[v0] Error saving reflection:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-bold mb-2">This Week's Reflection</h3>
        <p className="text-sm text-gray-600 mb-4">
          {currentWeek.start} to {currentWeek.end}
        </p>

        {showForm ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">What went well?</label>
              <textarea
                value={formData.highlights}
                onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                className="w-full p-3 border rounded h-24 resize-none"
                placeholder="Share your wins..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">What was challenging?</label>
              <textarea
                value={formData.challenges}
                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                className="w-full p-3 border rounded h-24 resize-none"
                placeholder="What held you back?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Key lessons learned?</label>
              <textarea
                value={formData.lessons}
                onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
                className="w-full p-3 border rounded h-24 resize-none"
                placeholder="What did you discover?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Goals for next week?</label>
              <textarea
                value={formData.nextWeek}
                onChange={(e) => setFormData({ ...formData, nextWeek: e.target.value })}
                className="w-full p-3 border rounded h-24 resize-none"
                placeholder="What's your focus?"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 p-2 border rounded hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 btn btn-primary">
                Save Reflection
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} className="btn btn-primary w-full">
            Write This Week's Reflection
          </button>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Past Reflections</h3>
        {reflections.length > 0 ? (
          reflections.map((reflection, i) => (
            <div key={i} className="card">
              <p className="text-sm text-gray-600 mb-3">
                {reflection.weekStart} to {reflection.weekEnd}
              </p>
              {reflection.highlights && (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700">Highlights:</p>
                  <p className="text-sm text-gray-600">{reflection.highlights}</p>
                </div>
              )}
              {reflection.challenges && (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700">Challenges:</p>
                  <p className="text-sm text-gray-600">{reflection.challenges}</p>
                </div>
              )}
              {reflection.lessons && (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700">Lessons:</p>
                  <p className="text-sm text-gray-600">{reflection.lessons}</p>
                </div>
              )}
              {reflection.nextWeek && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Next Week:</p>
                  <p className="text-sm text-gray-600">{reflection.nextWeek}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No reflections yet. Take time to reflect!</p>
        )}
      </div>
    </div>
  )
}
