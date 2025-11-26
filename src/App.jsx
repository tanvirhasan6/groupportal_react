import React, { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import { UserContext } from "./context/UserContext"
import Login from "./pages/Login"
import DashboardLayout from "./components/DashboardLayout"
import DashboardPage from "./pages/DashboardPage"
import ProfilePage from "./pages/Profile"
import ClaimsPage from "./pages/NewClaim"

export default function App() {

  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)  

  // Optional: fetch user info from cookie/localStorage
  useEffect(() => {
    const cookie = document.cookie
      .split(" ")
      .find((row) => row.startsWith("user_info="))

    if (cookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookie.split("=")[1]))
        setUserInfo(parsed.USERNAME ? parsed : null)
      } catch {
        setUserInfo(null)
      }
    }

    setLoading(false)

  }, [])

  if (loading) return null

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/grpclaimportal/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: userInfo.USERNAME }),
        credentials: "include",
      })

      const data = await res.json()

      if (data?.status === 200) {
        // Remove local user state
        setUserInfo(null)

        // Remove cookie from browser manually (user_info only session_token is httpOnly)
        document.cookie = "user_info= Max-Age=0 path=/"
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <UserContext.Provider value={userInfo}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={userInfo ? <Navigate to="/dashboard" /> : <Login onLogin={setUserInfo} />}
          />

          {/* Dashboard layout with nested routes */}
          <Route
            path="/dashboard"
            element={
              userInfo ? (
                <DashboardLayout userInfo={userInfo} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="newclaim" element={<ClaimsPage />} />
            {/* 
            <Route path="HealthCard" element={<ClaimsPage />} />
            <Route path="DeathClaim" element={<ClaimsPage />} />
            <Route path="Manage" element={<ClaimsPage />} />
            <Route path="MissingInfo" element={<ClaimsPage />} /> */}
          </Route>

          {/* catch-all redirect */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  )
}
