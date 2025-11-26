import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function Login( {onLogin} ) {
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
                            onSuccess={(data) => {
                                setUserData(data);
                                setScreen("set");
                            }}
                            onLogin={onLogin}
                        />
                    )}

                    {screen === "forgot" && (
                        <ForgotPassword
                            onBack={() => setScreen("login")}
                            onNext={() => setScreen("otp")}
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
                </div>
            </div>
        </div>
    );
}

// -------------------------------------------------------------------

function LogIn({ onForgot, onSuccess, onLogin }) {
    const navigate = useNavigate();
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:5001/api/grpclaimportal/checkuser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userid, password }),
                credentials: "include",
            });

            const data = await res.json();

            if (data?.status === 200) {
               
                onLogin(data.result || { USERNAME: userid });

                // Navigate
                navigate("/dashboard", { replace: true });
                return;
            }

            if (data?.status === 201) {
                onSuccess(data.result);
                return;
            }

            setError(data?.message || "Login failed");
        } catch (err) {
            setError(err.message || "Something went wrong");
        }

        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-center mb-6 bg-linear-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                Welcome Back
            </h2>

            <form className="space-y-5" onSubmit={handleLogin} autoComplete="off">
                <div>
                    <label className="text-sm text-gray-300">Userid / Mobile</label>
                    <input
                        type="text"
                        placeholder="Enter your userid or mobile"
                        className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition"
                        value={userid}
                        onChange={(e) => setUserid(e.target.value)}
                        autoComplete="new-id"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-300">Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400 outline-none transition"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                </div>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-3 rounded-lg bg-linear-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90 transition font-medium"
                >
                    {loading ? "Logging in..." : "Log In"}
                </button>
            </form>
        </div>
    );
}

// -------------------------------------------------------------------

function ForgotPassword({ onBack, onNext }) {
    return (
        <div>
            <h2 className="text-2xl font-semibold text-center mb-6 bg-linear-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
                Forgot Password
            </h2>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label className="text-sm text-gray-300">Email or Mobile</label>
                    <input
                        type="text"
                        placeholder="Enter your email or mobile"
                        className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition"
                    />
                </div>

                <div className="flex justify-between">
                    <button type="button" onClick={onBack} className="text-sm text-gray-400 hover:underline">
                        Back
                    </button>
                    <button type="button" onClick={onNext} className="text-sm text-cyan-400 hover:underline">
                        Send OTP
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
                `http://localhost:5001/api/grpclaimportal/validateOtp?otpCode=${code}&password=${password}&userData=${encodeURIComponent(
                    JSON.stringify(userData)
                )}`
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

        try {
            const res = await fetch("http://localhost:5001/api/grpclaimportal/getPasswordOtp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userData }),
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
