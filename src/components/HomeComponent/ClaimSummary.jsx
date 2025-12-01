import React, { useEffect, useState } from 'react'
import { useUser } from "../../context/UserContext"
import toast, { Toaster } from "react-hot-toast";
import { FcDecision } from 'react-icons/fc';

function AnimatedProgress({ value }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        let end = value;
        let duration = 1200;
        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const val = Math.min(Math.round((progress / duration) * end), end);
            setDisplayValue(val);

            if (progress < duration) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [value]);

    return (
        <div className="w-full mt-2">
            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden relative">
                <div
                    className="
                        h-full 
                        bg-linear-to-r from-cyan-400 to-emerald-400 
                        shadow-[0_0_12px_rgba(0,255,255,0.9)]
                        relative overflow-hidden
                        transition-all duration-700 ease-out
                    "
                    style={{ width: `${displayValue}%` }}
                >
                    <div
                        className="
                            absolute inset-0 
                            bg-[linear-gradient(135deg,rgba(255,255,255,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,transparent_75%,transparent)]
                            bg-size-[20px_20px]
                            animate-[moveStripes_1.2s_linear_infinite]
                            opacity-60
                        "
                    ></div>
                </div>
            </div>

            <div className="text-xs text-cyan-300 mt-1 font-semibold tracking-wider">
                {displayValue}%
            </div>
        </div>
    );
}

export default function ClaimSummary() {

    const user = useUser()
    const [claimSummaryData, setClaimSummaryData] = useState([])

    const usagelist = async () => {

        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/claimSummaryListData?userid=${user?.USERNAME}&policyno=${user?.POLICY_NO}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            )

            const data = await res.json()
            console.log(data);

            if (data?.status === 200) setClaimSummaryData(data?.result)
            else toast.error(data?.message)

        } catch (error) {
            toast.error(error)
        }
    }

    useEffect(() => {

        if (user.POLICY_NO) usagelist()

    }, [user?.POLICY_NO])

    return (
        <div className='w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-6 shadow-lg mt-6'>
            <Toaster />

            <div className='w-full flex flex-col items-center gap-3 md:hidden'>
                {
                    claimSummaryData && claimSummaryData.map((summary, idx) => (
                        <>
                            <div key={summary.INTNO} className='w-full flex flex-col items-start gap-2 text-xs sm:text-sm border border-slate-600 rounded-sm px-2 py-6 text-slate-300'>

                                <h2>Type: {summary.SHORT_BENEFIT_HEAD}</h2>
                                <div className='w-full flex flex-row items-center justify-between gap-2'>
                                    <p>Applied at: {summary.INTNO_DATE}</p>
                                    <p className='text-emerald-600'>Last Uploaded at: {summary.LAST_UPLOADED}</p>
                                </div>

                                <div className='w-full flex flex-row items-center justify-between gap-2'>
                                    <p className=''>Claimed: {summary.CLAIM_AMOUNT}</p>
                                    <p className='text-cyan-400'>Approved: {summary.APPROVEABLE_AMOUNT}</p>
                                </div>
                                <p className='flex items-center gap-2 text-pink-300'><FcDecision /> {summary.STATUS_NAME}</p>

                                <p className='w-full text-teal-400 hover:underline cursor-pointer text-center mt-3'>View Details {`->`}</p>

                            </div>
                        </>
                    ))

                }
            </div>

            <div className='hidden w-full md:block'>
                <table className="w-full border-collapse overflow-hidden rounded-xl backdrop-blur-lg bg-slate-900/50 shadow-[0_0_20px_rgba(0,255,255,0.15)]">
                    <thead>
                        <tr className="text-cyan-300 text-sm bg-slate-800/60">

                            <th className="py-3 px-4">Sl</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Applied</th>
                            <th className="py-3 px-4">Uploaded</th>
                            <th className="py-3 px-4">Claimed</th>
                            <th className="py-3 px-4">Approved</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {claimSummaryData?.map((summary, idx) => (
                            <tr
                                key={summary.INTNO}
                                className="text-slate-300 text-sm border-b border-slate-700/50 hover:bg-slate-800/40 hover:shadow-[0_0_25px_rgba(0,255,255,0.25)] transition cursor-pointer text-center"
                            >
                                <td className="py-3 px-4">{idx + 1}</td>
                                <td className="py-3 px-4">{summary.SHORT_BENEFIT_HEAD}</td>
                                <td className="py-3 px-4">{summary.INTNO_DATE}</td>
                                <td className="py-3 px-4 text-emerald-400">{summary.LAST_UPLOADED}</td>
                                <td className="py-3 px-4">{summary.CLAIM_AMOUNT}</td>
                                <td className="py-3 px-4 text-cyan-300">{summary.APPROVEABLE_AMOUNT}</td>
                                <td className="py-3 px-4 text-pink-300 text-left">

                                    <p className="text-pink-300 font-medium">{summary.STATUS_NAME}</p>
                                    {summary.STATUS === 8 && (
                                        <p className="text-red-400 text-xs mt-1">
                                            {summary.ADDITIONAL_DOCUMENT_LIST}
                                        </p>
                                    )}

                                    {(summary.STATUS === 2 || summary.STATUS === 8) && (
                                        <AnimatedProgress value={summary.PERCANTAGE} />
                                    )}
                                </td>
                                <td className="py-3 px-4 text-teal-300 hover:underline">
                                    View →
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


        </div>
    )
}
