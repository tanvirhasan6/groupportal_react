import React, { useState, lazy, Suspense, useEffect, useRef } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { io } from "socket.io-client"
import toast, { Toaster } from 'react-hot-toast'

import { UserContext } from "./context/UserContext"
import ClaimDetails from "./pages/ClaimDetails";
import Manage from "./pages/Manage";
import Missing from "./pages/Missing";
import Swal from "sweetalert2"

import DirectLogin from "./pages/DirectLogin"

const Login = lazy(() => import("./pages/Login"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AllClaims = lazy(() => import("./pages/AllClaim"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const ClaimsPage = lazy(() => import("./pages/NewClaim"));
const FaqPage = lazy(() => import("./pages/Faq"));
const HealthCarePage = lazy(() => import("./pages/Healthcard"));
const HospitalPage = lazy(() => import("./pages/Hospitals"));

const Skeleton = () => (
  <div className="p-4 animate-pulse space-y-3">
    <div className="h-6 bg-gray-400 rounded w-1/3"></div>
    <div className="h-4 bg-gray-400 rounded w-1/4"></div>
    <div className="h-48 bg-gray-400 rounded w-full"></div>
  </div>
)


export default function App() {

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const authChecking = useRef(false);
  const logoutHandled = useRef(false);
  const intervalRef = useRef(null);
  const hadSession = useRef(false);

  const checkAuth = async () => {

    if (authChecking.current) return;

    authChecking.current = true;

    try {
      const res = await fetch(
        "http://localhost:5002/api/grpclaimportal/current-user",
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      setUserInfo(data.user_details || null);

      if (data?.user_details) {
        hadSession.current = true;
      }

    } catch (err) {
      console.log(err);

      setUserInfo(null);

      // User was never logged in
      if (!hadSession.current) {
        return;
      }

      if (!logoutHandled.current) {

        logoutHandled.current = true;
        clearInterval(intervalRef.current);

        await Swal.fire({
          icon: "warning",
          title: "Session Ended",
          text: "Your account has been logged out as your session time is over.",
          confirmButtonText: "OK",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });
      }

    } finally {
      authChecking.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!userInfo) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      checkAuth();
    }, 10000);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [userInfo]);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };


  const handleLogout = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:5002/api/grpclaimportal/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: userInfo.USERNAME, policyno: userInfo.POLICY_NO }),
        credentials: "include",
      })

      const data = await res.json()

      if (data?.status === 200) {
        stopPolling()
        setUserInfo(null)
        authChecking.current = false;
      }
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Skeleton />;
  }

  return (
    <UserContext.Provider value={userInfo}>
      <Toaster position="top-center" />
      <BrowserRouter>
        <Suspense fallback={<Skeleton />}>
          <Routes>
            <Route
              path="/login"
              element={userInfo ? <Navigate to="/dashboard" replace /> : <Login onLogin={checkAuth} />}
            />

            <Route
              path="/groupDirectLogin"
              element={userInfo ? <Navigate to="/dashboard" replace /> : <DirectLogin onLogin={checkAuth} />}
            />

            {/* <Route
              path="/groupDirectLogin"
              element={<DirectLogin onLogin={checkAuth}/>}
            /> */}

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
              <Route path="allClaims" element={<AllClaims />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="newclaim" element={<ClaimsPage />} />

              <Route path="healthcard" element={<HealthCarePage />} />
              <Route path="hospitals" element={<HospitalPage />} />
              <Route path="manage" element={<Manage />} />
              <Route path="missinginfo" element={<Missing />} />
              <Route path="faq" element={<FaqPage />} />
              <Route path="claimDetails" element={<ClaimDetails />} />

            </Route>

            {/* catch-all redirect */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </UserContext.Provider>
  )
}