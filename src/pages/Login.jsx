import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from 'react-hot-toast'

import SearchableSelect from "../components/SearchableSelect";

export default function Login({ onLogin }) {
    const [screen, setScreen] = useState("login");
    const [userData, setUserData] = useState(null);
    const [password, setPassword] = useState("");

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-800 via-gray-900 to-gray-800 text-white p-4">
            <div className="relative w-full max-w-sm sm:max-w-md p-0 bg-transparent rounded-2xl">
                <div className="rounded-2xl border border-gray-700 bg-gray-900/70 backdrop-blur-md shadow-lg p-8">
                    {screen === "login" && (
                        <LogIn
                            onForgot={() => setScreen("forgot")}
                            onPassword={(data) => {
                                setUserData(data);
                                setScreen("set");
                            }}
                            onSuccess={(data) => {
                                setUserData(data);
                                setScreen("password");
                            }}
                        />
                    )}

                    {screen === "forgot" && (
                        <ForgotPassword
                            onBack={() => setScreen("login")}
                            onNext={() => setScreen("login")}
                        />
                    )}

                    {screen === "otp" && (
                        <OTPInput
                            onBack={() => setScreen("login")}
                            userData={userData}
                            password={password}
                        />
                    )}

                    {screen === "set" && (
                        <SetPassword
                            userData={userData}
                            onBack={() => setScreen("login")}
                            onNext={() => setScreen("otp")}
                            setPassword={setPassword}
                        />
                    )}

                    {screen === "password" && (
                        <PasswordLogin
                            userData={userData}
                            onLogin={onLogin}
                            onBack={() => setScreen("login")}
                        />
                    )}

                </div>
            </div>
        </div>
    );
}

// -------------------------------------------------------------------

function LogIn({ onForgot, onPassword, onSuccess, }) {

    const [userid, setUserid] = useState("");
    const [policyno, setPolicyno] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [policyList, setPolicyList] = useState([])

    const policyData = async () => {
        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/policyList`,
                {
                    method: "GET",
                }
            );
            const data = await res.json();
            if (data?.status === 200) {
                const formatted = (data.result || []).map((item) => ({
                    value: item.POLICY_NO,
                    label: item.ORGANIZATION,
                }));
                setPolicyList(formatted);
            }
        } catch (error) {
            toast.error(`${error}`);
        }
    }

    useEffect(() => {
        policyData()
    }, [])

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:5001/api/grpclaimportal/checkuserPassword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userid, policyno }),
            });

            const data = await res.json();

            console.log(data);


            if (data?.status === 201) {
                onPassword({ userid, policyno, });
                return;
            }

            if (data?.status === 200) {
                onSuccess({ userid, policyno, });
                return;
            }

            setError(data?.message || "Not Found!");

        } catch (err) {
            setError(err.message || "Something went wrong");
        }

        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-center mb-6 bg-linear-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                Group Claim Login
            </h2>

            <form className="space-y-5" onSubmit={handleLogin} autoComplete="off">

                <div className='col-span-4'>
                    <SearchableSelect
                        label="Policy List"
                        options={policyList}
                        value={policyno}
                        onChange={
                            (val) => {
                                const selected = policyList.find(d => d.value === val)
                                setPolicyno(selected.value)
                            }
                        }
                        placeholder="Select Policy"
                        disabled={false}
                        onFocus={(e) => e.target.select()}
                    />
                </div>
                <div>
                    <label className="text-sm text-gray-300">Id/Code</label>
                    <input
                        type="text"
                        placeholder="Enter your userid or mobile"
                        className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition"
                        value={userid}
                        onChange={(e) => setUserid(e.target.value)}
                        autoComplete="new-id"
                    />
                </div>

                {/* <div>
                    <label className="text-sm text-gray-300">Password</label>
                    <input
                        type="password"
                        placeholder="********"
                        className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400 outline-none transition"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                </div> */}

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <p className="text-red-400 underline cursor-pointer text-end" onClick={onForgot}>Forget Password ?</p>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-3 rounded-lg bg-linear-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90 transition font-medium"
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                ></path>
                            </svg>
                            <span>Logging in...</span>
                        </div>
                    ) : (
                        'Log In'
                    )}
                </button>

                <span className="text-xs text-red-400 text-justify">
                    সকলের অবগতির জন্য জানানে যাচ্ছে যে, নিজ নামের ব্যাংক বা মোবাইল ব্যাংকিং একাউন্ট না দেয়া, ব্যাংক একাউন্টের নামে গড়মিল, ব্যাংক শাখার নামে গড়মিল, ভুল একাউন্ট নাম্বার, মোবাইল ব্যাংকিং একাউন্টের কেওয়াইসি আপডেট না থাকার কারণে অনেকের বীমা দাবির টাকা ফেরত চলে আসছে বা পরিশোধে বিলম্ব হচ্ছে। তাই নিজ নামের ব্যাংক একাউন্টের সঠিক তথ্য দেয়ার জন্য অনুরোধ করছি।
                </span>
            </form>
        </div>
    );
}

// -------------------------------------------------------------------

function ForgotPassword({ onBack, onNext }) {

    const [userid, setUserid] = useState("");
    const [policyno, setPolicyno] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [policyList, setPolicyList] = useState([])

    const policyData = async () => {
        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/policyList`,
                {
                    method: "GET",
                }
            );
            const data = await res.json();
            if (data?.status === 200) {
                const formatted = (data.result || []).map((item) => ({
                    value: item.POLICY_NO,
                    label: item.ORGANIZATION,
                }));
                setPolicyList(formatted);
            }
        } catch (error) {
            toast.error(`${error}`);
        }
    }

    useEffect(() => {
        policyData()
    }, [])

    const handleGetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("http://localhost:5001/api/grpclaimportal/forgetPassword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userid, policyno }),
            });

            const data = await res.json();

            console.log(data);
            
            if (data?.success) {
                toast.success(data?.message)
                await new Promise(resolve => setTimeout(resolve, 3000));
                onNext()
            }else{
                toast.error(data?.message)
            }

        } catch (err) {
            setError(err.message || "Something went wrong");
        }

        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-center mb-6 bg-linear-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                Forget Password?
            </h2>

            <form className="space-y-5" onSubmit={handleGetPassword} autoComplete="off">

                <div className='col-span-4'>
                    <SearchableSelect
                        label="Policy List"
                        options={policyList}
                        value={policyno}
                        onChange={
                            (val) => {
                                const selected = policyList.find(d => d.value === val)
                                setPolicyno(selected.value)
                            }
                        }
                        placeholder="Select Policy"
                        disabled={false}
                        onFocus={(e) => e.target.select()}
                    />
                </div>
                <div>
                    <label className="text-sm text-gray-300">Id/Code</label>
                    <input
                        type="text"
                        placeholder="Enter your userid or mobile"
                        className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition"
                        value={userid}
                        onChange={(e) => setUserid(e.target.value)}
                        autoComplete="new-id"
                    />
                </div>


                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <div className="flex justify-between">
                    <button type="button" onClick={onBack} className="text-sm text-gray-400 hover:underline">
                        Back
                    </button>
                    <button
                        disabled={loading}
                        type="submit"
                        className="text-sm text-gray-400 hover:underline cursor-pointer"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                                <span>Sending...</span>
                            </div>
                        ) : (
                            'Get Message'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

// -------------------------------------------------------------------

function OTPInput({ onBack, password, userData }) {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(Array(8).fill(""));
    const [alert, setAlert] = useState("");
    const [loading, setLoading] = useState(false);
    const inputsRef = useRef([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join("");

        if (otp.includes("")) return setAlert("Please complete the OTP");

        setLoading(true);
        setAlert("");

        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/validateOtp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        otpCode: code,
                        password,
                        userid: userData.userid,
                        policyno: userData.policyno,
                    }),
                }
            );

            const data = await res.json();

            if (data?.status === 200) navigate("/dashboard");
            else setAlert(data.message || "OTP verification failed");
        } catch {
            setAlert("Something went wrong");
        }

        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-center mb-6 bg-linear-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                Enter OTP
            </h2>

            {alert && <div className="mb-4 px-4 py-2 bg-red-500 rounded-lg text-white text-sm">{alert}</div>}

            <form onSubmit={handleSubmit} className="space-y-6 text-center">
                <div className="flex justify-center gap-2">
                    {otp.map((val, i) => (
                        <input
                            key={i}
                            ref={(el) => (inputsRef.current[i] = el)}
                            maxLength={1}
                            value={val}
                            onChange={(e) => {
                                const newOtp = [...otp];
                                newOtp[i] = e.target.value.replace(/\D/, "");
                                setOtp(newOtp);

                                if (e.target.value && i < 7) inputsRef.current[i + 1].focus();
                            }}
                            className="w-10 h-12 text-center text-lg font-semibold rounded-lg bg-gray-800 border border-gray-700 focus:border-fuchsia-400"
                        />
                    ))}
                </div>

                <div className="flex justify-between">
                    <button type="button" onClick={onBack} className="text-sm text-gray-400 hover:underline">
                        Back
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="relative text-sm text-cyan-400 hover:underline disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </div>
            </form>
        </div>
    );
}

// -------------------------------------------------------------------

function SetPassword({ userData, onBack, onNext, setPassword }) {
    const [localPassword, setLocalPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (localPassword.length < 5) return setError("Password must be at least 5 characters.");
        if (localPassword !== confirm) return setError("Passwords do not match.");

        setLoading(true);

        console.log(userData);


        try {
            const res = await fetch("http://localhost:5001/api/grpclaimportal/getPasswordOtp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userid: userData.userid,
                    policyno: userData.policyno
                }),
            });

            const data = await res.json();
            if (data?.status === 200) {
                setPassword(localPassword);
                onNext();
            }
        } catch (err) {
            setError("Could not update password. Try again.");
        }

        setLoading(false);
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-2xl font-semibold text-white">Reset password</h2>

                <div className="relative">
                    <label className="text-sm text-slate-300">New password</label>
                    <input
                        type={showPwd ? "text" : "password"}
                        value={localPassword}
                        onChange={(e) => setLocalPassword(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-white"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-2 top-9 p-2 text-slate-200"
                    >
                        {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="relative">
                    <label className="text-sm text-slate-300">Confirm password</label>
                    <input
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-white"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-2 top-9 p-2 text-slate-200"
                    >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-linear-to-r from-cyan-400 to-indigo-500 text-black"
                >
                    {loading ? "Setting..." : "Set Password"}
                </button>

                <button type="button" onClick={onBack} className="text-sm text-gray-400 hover:underline">
                    Back
                </button>

            </form>
        </div>
    );
}


// -------------------------------------------------------------------

function PasswordLogin({ userData, onBack, onLogin }) {

    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!password.trim()) {
            setError("Please enter your password.");
            return;
        }

        setLoading(true);
        setError("");

        try {

            const res = await fetch(
                "http://localhost:5001/api/grpclaimportal/checkuser",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        userid: userData.userid,
                        policyno: userData.policyno,
                        password,
                    }),
                }
            );

            const data = await res.json();

            if (data.status === 200) {

                await onLogin();

                // Navigate
                navigate("/dashboard", { replace: true });

                return;
            }

            setError(data.message || "Invalid password.");

        } catch (err) {

            setError(err.message || "Something went wrong.");

        }

        setLoading(false);
    };

    return (
        <div>

            <p className="text-sm text-gray-400 text-center mb-6">Enter your password to continue.</p>

            <form
                onSubmit={handleLogin}
                className="space-y-5"
                autoComplete="off"
            >

                <div>
                    <label className="text-sm text-gray-300">
                        User ID
                    </label>

                    <input
                        disabled
                        value={
                            userData.USERID ||
                            userData.USERNAME ||
                            userData.userid
                        }
                        className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-700 border border-gray-700 text-gray-400 cursor-not-allowed"
                    />
                </div>

                <div className="relative">

                    <label className="text-sm text-gray-300">
                        Password
                    </label>

                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400 outline-none transition"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[38px] text-gray-400 hover:text-white"
                    >
                        {showPassword ? (
                            <EyeOff size={18} />
                        ) : (
                            <Eye size={18} />
                        )}
                    </button>

                </div>

                {error && (
                    <p className="text-red-400 text-sm text-center">
                        {error}
                    </p>
                )}

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-3 rounded-lg bg-linear-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90 transition font-medium"
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">

                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />

                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>

                            <span>Logging in...</span>

                        </div>
                    ) : (
                        "Continue"
                    )}
                </button>

                <button
                    type="button"
                    onClick={onBack}
                    className="w-full py-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition"
                >
                    Back
                </button>

            </form>

        </div>
    );
}