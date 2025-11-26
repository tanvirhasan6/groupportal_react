import React, { useState, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function SetPassword({ onSubmit }) {
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const passwordStrength = (pw) => {
        if (!pw) return { score: 0, label: "" };
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        const labels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];
        return { score, label: labels[score] };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // validations
        if (!userid.trim()) return setError("Please enter User ID or Mobile number.");
        if (password.length < 8) return setError("Password must be at least 8 characters.");
        if (password !== confirm) return setError("Passwords do not match.");

        setLoading(true);
        try {
            if (onSubmit) {
                await onSubmit(userid, password); // user-provided API call
            } else {
                // fallback mock
                await new Promise((r) => setTimeout(r, 900));
            }
            setSuccess("Password changed successfully. You can now log in.");
            setUserid("");
            setPassword("");
            setConfirm("");
        } catch (err) {
            setError("Could not update password. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    const strength = passwordStrength(password);

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f172a] via-[#07103a] to-[#02203a] p-6">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md backdrop-blur-md bg-white/6 border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-white">Reset password</h2>
                        <p className="text-sm text-slate-300">
                            Enter your User ID or mobile and pick a secure password.
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-slate-300 mb-2">User ID or Mobile</label>
                    <input
                        value={userid}
                        onChange={(e) => setUserid(e.target.value)}
                        placeholder="username or 01XXXXXXXXX"
                        className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                        autoComplete="off"
                    />
                </div>

                <div className="relative">
                    <label className="block text-sm text-slate-300 mb-2">New password</label>
                    <input
                        type={showPwd ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPwd((s) => !s)}
                        className="absolute right-2 top-9 p-2 rounded-md text-slate-200/80 hover:bg-white/5"
                    >
                        {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>

                    {/* strength bar */}
                    <div className="mt-2">
                        <div className="h-2 w-full bg-white/6 rounded-full overflow-hidden">
                            <div
                                style={{ width: `${(strength.score / 4) * 100}%` }}
                                className="h-full bg-linear-to-r from-emerald-400 to-cyan-400 transition-all duration-300"
                            />
                        </div>
                        <div className="mt-1 text-xs text-slate-300">{strength.label}</div>
                    </div>
                </div>

                <div className="relative">
                    <label className="block text-sm text-slate-300 mb-2">Confirm password</label>
                    <input
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm((s) => !s)}
                        className="absolute right-2 top-9 p-2 rounded-md text-slate-200/80 hover:bg-white/5"
                    >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {error && <div className="text-sm text-rose-400">{error}</div>}
                {success && <div className="text-sm text-emerald-300">{success}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-medium bg-linear-to-r from-cyan-400/60 to-indigo-500/60 hover:from-cyan-400/80 hover:to-indigo-500/80 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>

                <div className="pt-2 text-center text-xs text-red-300">
                    Tip: Use a mix of upper & lower case letters, numbers, and symbols for a stronger password.
                </div>

                <button
                    type="button"
                    onClick={() => window.location.href = "/login"}
                    className="text-sm text-gray-400 hover:underline cursor-pointer"
                >
                    Back
                </button>
            </form>
        </div>
    );
}
