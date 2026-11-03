import React, { useState, lazy, Suspense, useEffect, useRef } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { io } from "socket.io-client"
import toast, { Toaster } from 'react-hot-toast'

import { UserContext } from "./context/UserContext"
import ClaimDetails from "./pages/ClaimDetails";
import Manage from "./pages/Manage";
import Missing from "./pages/Missing";
import Swal from "sweetalert2"


const Login = lazy(() => import("./pages/Login"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AllClaims = lazy(() => import("./pages/AllClaim"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const ClaimsPage = lazy(() => import("./pages/NewClaim"));
const FaqPage = lazy(() => import("./pages/Faq"));
const HealthCarePage = lazy(() => import("./pages/Healthcard"));
const HospitalPage = lazy(() => import("./pages/Hospitals"));
const DirectLogin = lazy(() => import("./pages/DirectLogin"));
const ResellerLogin = lazy(() => import("./pages/ResellerLogin"));

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

  const authCheckPromise = useRef(null);
  const logoutHandled = useRef(false);
  const intervalRef = useRef(null);
  const hadSession = useRef(false);

  const checkAuth = async () => {
    if (authCheckPromise.current) return authCheckPromise.current;

    const check = async () => {
      let lastError;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const res = await fetch(
            "http://localhost:5002/api/grpclaimportal/current-user",
            {
              method: "GET",
              credentials: "include",
            }
          );

          if (res.status === 401) {
            setUserInfo(null);

            if (hadSession.current && !logoutHandled.current) {
              logoutHandled.current = true;
              hadSession.current = false;
              stopPolling();

              await Swal.fire({
                icon: "warning",
                title: "Session Ended",
                text: "Your session has expired. Please sign in again.",
                confirmButtonText: "OK",
                allowOutsideClick: false,
                allowEscapeKey: false,
              });
            }

            return false;
          }

          if (!res.ok) {
            throw new Error(`Auth check failed with status ${res.status}`);
          }

          const data = await res.json();
          const authenticatedUser = data.user_details || null;

          setUserInfo(authenticatedUser);

          if (authenticatedUser) {
            hadSession.current = true;
            logoutHandled.current = false;
          }

          return Boolean(authenticatedUser);
        } catch (err) {
          lastError = err;
          if (attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
          }
        }
      }

      console.warn("Auth check temporarily unavailable:", lastError);
      return Boolean(userInfo);
    };

    const promise = check().finally(() => {
      if (authCheckPromise.current === promise) authCheckPromise.current = null;
      setLoading(false);
    });

    authCheckPromise.current = promise;
    return promise;
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
    }, 3000);

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
        // localStorage.removeItem("loggedin");
        stopPolling()
        setUserInfo(null)
        authCheckPromise.current = null;
        hadSession.current = false;
        logoutHandled.current = false;
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

            <Route
              path="/groupResellerLogin"
              element={userInfo ? <Navigate to="/dashboard" replace /> : <ResellerLogin onLogin={checkAuth} />}
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
