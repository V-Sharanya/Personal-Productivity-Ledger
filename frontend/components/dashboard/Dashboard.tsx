"use client"

import { useState, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import DailyLog from "../logs/DailyLog"
import Analytics from "../analytics/Analytics"
import WeeklyReflection from "../reflection/WeeklyReflection"

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState("log")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Productivity Ledger</h1>
            <p className="text-gray-600 text-sm">Welcome, {user?.username}!</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: "log", label: "Daily Log" },
              { id: "analytics", label: "Analytics" },
              { id: "reflection", label: "Weekly Reflection" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "log" && <DailyLog userId={user?.id || 0} />}
        {activeTab === "analytics" && <Analytics userId={user?.id || 0} />}
        {activeTab === "reflection" && <WeeklyReflection userId={user?.id || 0} />}
      </main>
    </div>
  )
}
