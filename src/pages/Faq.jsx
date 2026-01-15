import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../context/UserContext"

function decodeUnicode(str) {
    try {
        return str.replace(/\\u[\dA-F]{4}/gi,
            (match) => String.fromCharCode(parseInt(match.replace("\\u", ""), 16))
        );
    } catch {
        return str;
    }
}

function AccordionItem({ title, children }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-800 rounded-xl overflow-hidden shadow-lg bg-gray-900 hover:shadow-2xl transition-shadow duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center px-6 py-4 text-left text-white font-bold text-lg bg-linear-to-r from-cyan-500 to-purple-500 hover:from-purple-500 hover:to-cyan-500 transition-colors rounded-xl focus:outline-none"
            >
                {title}
                <span className={`transform transition-transform duration-300 ${isOpen ? "rotate-45" : "rotate-0"}`}>
                    +
                </span>
            </button>
            <div
                className={`overflow-hidden transition-max-height duration-500 ease-in-out bg-gray-800 text-gray-200 px-6 ${isOpen ? "max-h-96 py-4" : "max-h-0"
                    }`}
            >
                {children}
            </div>
        </div>
    );
}

export default function Faq() {

    const user = useUser()
    const [loading, setLoading] = useState(false)

    const [faqdata, setFaqData] = useState([])

    const faqlist = async () => {

        try {
            const res = await fetch(
                `https://app.zenithlifebd.com:5001/api/grpclaimportal/faqList?policyno=${user.POLICY_NO}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            )

            const data = await res.json()

            if (data?.status === 404) toast.error("No Faq data Found");
            else if (data?.status === 200) setFaqData(data.result);
            else toast.error(`Faq Data Error: ${data?.message}`)

        } catch (error) {
            toast.error(`${error}`)
        }
    }

    useEffect(() => {
        if (user?.USERNAME) {
            faqlist()
        }
    }, [user?.USERNAME])

    return (
        <div className="space-y-4 p-4 min-h-screen">
            <Toaster />
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-600 mb-6 text-center">
                FAQ
            </h1>

            {faqdata.length === 0 && <p className="text-gray-400 text-center">Loading FAQs...</p>}

            {faqdata.map((faq) => (
                <AccordionItem key={faq.SL} title={decodeUnicode(faq.DOC_NAME)}>
                    <div className="space-y-2 text-gray-200">
                        {decodeUnicode(faq.DOC_DESCRIPTION).split(/\\n/).map((line, idx) => (
                            <span key={idx}>
                                {line}
                                <br />
                            </span>
                        ))}
                    </div>
                </AccordionItem>
            ))}
        </div>
    )
}
