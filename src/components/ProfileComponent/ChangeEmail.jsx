import React, { useRef, useState } from "react";
import { useUser } from "../../context/UserContext";
import toast, { Toaster } from "react-hot-toast";

const ChangeEmail = () => {
    const user = useUser();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(Array(8).fill(""));
    const [stepOTP, setStepOTP] = useState(false);

    const inputsOTPRef = useRef([]);

    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    // ------------------ EMAIL VALIDATION --------------------
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // ------------------ OTP INPUT HANDLERS --------------------
    const handleOTPChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < otp.length - 1) {
            inputsOTPRef.current[index + 1]?.focus();
        }
    };

    const handleOTPKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsOTPRef.current[index - 1]?.focus();
        }
        if (e.key === "ArrowLeft" && index > 0) {
            inputsOTPRef.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < otp.length - 1) {
            inputsOTPRef.current[index + 1]?.focus();
        }
    };

    const handleOTPPaste = (e, index) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
        if (!pasteData) return;

        const newOtp = [...otp];
        pasteData.split("").forEach((digit, i) => {
            if (index + i < otp.length) newOtp[index + i] = digit;
        });

        setOtp(newOtp);

        const nextIndex = Math.min(index + pasteData.length, otp.length - 1);
        inputsOTPRef.current[nextIndex]?.focus();
    };

    // ------------------ SUBMIT EMAIL --------------------
    const handleMailUpdate = async () => {
        if (!email) {
            toast.error("Please enter an email address.");
            return;
        }

        if (!isValidEmail(email)) {
            toast.error("Invalid email format.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/profile/mailChange?policyno=${user?.POLICY_NO}&userid=${user?.USERNAME}&mobile=${user?.MOBILE}&emailid=${email}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (data?.status === 201) {
                toast.error(data?.message);
                setLoading(false);
                return;
            }

            if (data?.status === 200) {
                toast.success("OTP sent to your mobile.");
                setStepOTP(true); // ENABLE OTP SECTION
            }
        } catch (err) {
            toast.error("Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    // ------------------ VERIFY OTP --------------------
    const handleVerifyOTP = async () => {
        const code = otp.join("");

        if (otp.includes("")) {
            toast.error("Please complete the OTP");
            return;
        }

        setOtpLoading(true);

        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/profile/mailChangeOTPVerify?otpCode=${code}&emailid=${email}&policyno=${user?.POLICY_NO}&userid=${user?.USERNAME}&password=${user?.PASSWORD}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (data.status === 200) {
                toast.success("Email updated successfully!");
                setTimeout(() => {
                    window.location.reload();
                }, 800);
            } else {
                toast.error(data?.message || "Invalid OTP");
                inputsOTPRef.current[0]?.focus();
            }
        } catch (err) {
            toast.error("Verification failed.");
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <>
            <Toaster position="top-center" />

            {/* EMAIL INPUT */}
            <div className="w-full flex justify-center items-center gap-2">
                <input
                    type="email"
                    placeholder="New Email"
                    className="w-96 border-0 border-b border-gray-500 bg-transparent 
          focus:border-cyan-200 focus:ring-0 focus:outline-none 
          placeholder-gray-400 text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                {!stepOTP && (
                    <button
                        type="button"
                        className="text-sm text-cyan-400 hover:underline"
                        onClick={handleMailUpdate}
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Submit"}
                    </button>
                )}
            </div>

            {/* OTP SECTION */}
            {stepOTP && (
                <div className="mt-3 flex flex-col items-center gap-3">
                    {/* OTP BOXES */}
                    <div className="flex justify-center gap-1.5 sm:gap-3">
                        {otp.map((val, i) => (
                            <input
                                key={i}
                                ref={(el) => (inputsOTPRef.current[i] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={val}
                                onChange={(e) => handleOTPChange(i, e.target.value)}
                                onKeyDown={(e) => handleOTPKeyDown(i, e)}
                                onPaste={(e) => handleOTPPaste(e, i)}
                                className="w-8 sm:w-10 h-12 text-center text-lg font-semibold 
                rounded-lg bg-gray-800 border border-gray-700 
                focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400 
                outline-none transition"
                            />
                        ))}
                    </div>

                    {/* VERIFY BUTTON */}
                    <button
                        type="button"
                        disabled={otpLoading}
                        className="w-full px-4 py-3 rounded-xl font-medium bg-linear-to-r 
            from-cyan-400/60 to-indigo-500/60 hover:from-cyan-400/80 
            hover:to-indigo-500/80 disabled:opacity-50 text-slate-900"
                        onClick={handleVerifyOTP}
                    >
                        {otpLoading ? (
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
                                <span>Verifying...</span>
                            </div>
                        ) : (
                            "Verify OTP"
                        )}
                    </button>
                </div>
            )}
        </>
    );
};

export default ChangeEmail;
