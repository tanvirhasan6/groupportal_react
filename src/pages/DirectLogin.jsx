import React from 'react'

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from 'react-hot-toast'

export default function DirectLogin({ onLogin }) {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const directLogin = async () => {

        const mobile = searchParams.get("mobile");
        const userid = searchParams.get("userid");

        // Immediately remove parameters from URL
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

        if (!mobile || !userid) {

            navigate("/login", {
                replace: true
            });

            return;
        }

        try {

            const res = await fetch("http://localhost:5002/api/grpclaimportal/directLoginCheck", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userid, mobile }),
                credentials: "include",
            })

            const secretData = await res.json()

            const policyno = secretData?.result?.policyno
            const password = secretData?.result?.password

            if (secretData?.status === 200 && policyno && password) {

                try {

                    const res = await fetch(
                        "http://localhost:5002/api/grpclaimportal/checkuser",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                userid,
                                policyno,
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

                    toast.error(data?.message || "Try Again");

                } catch (err) {
                    toast.error(err?.message || "Something went wrong.");
                    navigate("/login", {
                        replace: true
                    });
                }
            } else {
                toast.error('User Not Found!')
                navigate("/login", {
                    replace: true
                });
            }

        } catch (error) {
            console.error(error);
            navigate("/login", {
                replace: true
            });
        }

    };

    useEffect(() => {
        if (searchParams.get("mobile")) directLogin();
    }, [searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Logging in...</p>
        </div>
    );
}
