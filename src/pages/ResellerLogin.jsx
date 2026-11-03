import React from 'react'

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from 'react-hot-toast'

export default function ResellerLogin({ onLogin }) {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const directLogin = async () => {

        const mobile = searchParams.get("mobile");
        const userid = searchParams.get("userid");
        const apiKey = searchParams.get("apiKey");

        // Immediately remove parameters from URL
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

        console.log(mobile, userid);
        

        if (!mobile || !userid) {

            navigate("/login", {
                replace: true
            });

            return;
        }

        try {

            const res = await fetch("http://localhost:5002/api/grpclaimportal/resellerDirectLogin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userid, mobile, apiKey }),
                credentials: "include",
            })

            const secretData = await res.json()     
            
            console.log(secretData);
            

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

                        const authenticated = await onLogin();

                        if (authenticated) {
                            navigate("/dashboard", { replace: true });
                        } else {
                            toast.error("Unable to start your session. Please sign in again.");
                            navigate("/login", { replace: true });
                        }

                        return;
                    }

                    toast.error(data?.message || "Try Again");

                } catch (err) {
                    toast.error(err?.message || "Something went wrong.");
                    // navigate("/login", {
                    //     replace: true
                    // });
                }
            } else {
                toast.error('User Not Found!')
                // navigate("/login", {
                //     replace: true
                // });
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
