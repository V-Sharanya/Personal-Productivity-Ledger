"use client"

import { useContext } from "react"
import { AuthProvider, AuthContext } from "@/context/AuthContext"
import LoginPage from "@/components/auth/LoginPage"
import Dashboard from "@/components/dashboard/Dashboard"

function PageContent() {
  const { user } = useContext(AuthContext)
  return <main>{user ? <Dashboard /> : <LoginPage />}</main>
}

export default function Home() {
  return (
    <AuthProvider>
      <PageContent />
    </AuthProvider>
  )
}
