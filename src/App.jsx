"use client"

import { useState, useEffect } from "react"
import { Calendar, BarChart3, BookOpen } from "lucide-react"
import DailyLog from "./components/DailyLog"
import Analytics from "./components/Analytics"
import WeeklyReflection from "./components/WeeklyReflection"
import "./App.css"

export default function App() {
  const [logs, setLogs] = useState([])
  const [reflections, setReflections] = useState([])
  const [activeTab, setActiveTab] = useState("log")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/logs/personal")
        if (response.ok) {
          const data = await response.json()
          setLogs(data)
        }
      } catch (error) {
        console.log("[v0] Error fetching logs:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  useEffect(() => {
    const fetchReflections = async () => {
      try {
        const response = await fetch("/api/reflections/personal")
        if (response.ok) {
          const data = await response.json()
          setReflections(data)
        }
      } catch (error) {
        console.log("[v0] Error fetching reflections:", error)
      }
    }
    fetchReflections()
  }, [])

  const handleLogSaved = (newLog) => {
    const existingIndex = logs.findIndex((log) => log.date === newLog.date)
    if (existingIndex > -1) {
      const updated = [...logs]
      updated[existingIndex] = newLog
      setLogs(updated)
    } else {
      setLogs([newLog, ...logs])
    }
  }

  const handleReflectionSaved = (newReflection) => {
    setReflections([newReflection, ...reflections])
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Personal Productivity Ledger</h1>
          <p className="text-gray-600 mt-1">Track your consistency, not perfection</p>
        </div>
      </header>

      <nav className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 flex gap-8">
          <button
            onClick={() => setActiveTab("log")}
            className={`py-4 px-2 border-b-2 font-medium transition-colors ${
              activeTab === "log"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Calendar className="inline mr-2 h-5 w-5" />
            Daily Log
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-4 px-2 border-b-2 font-medium transition-colors ${
              activeTab === "analytics"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <BarChart3 className="inline mr-2 h-5 w-5" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("reflection")}
            className={`py-4 px-2 border-b-2 font-medium transition-colors ${
              activeTab === "reflection"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <BookOpen className="inline mr-2 h-5 w-5" />
            Weekly Reflection
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "log" && <DailyLog logs={logs} onLogSaved={handleLogSaved} />}
        {activeTab === "analytics" && <Analytics logs={logs} />}
        {activeTab === "reflection" && (
          <WeeklyReflection reflections={reflections} onReflectionSaved={handleReflectionSaved} />
        )}
      </main>
    </div>
  )
}
