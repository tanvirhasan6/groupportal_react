import React, { useEffect, useState } from 'react'
import { useUser } from "../../context/UserContext"
import toast from "react-hot-toast";
import { FcDecision } from 'react-icons/fc';
import Pagination from "../../components/Pagination"
import { useNavigate } from 'react-router-dom';

// function AnimatedProgress({ value }) {
//     const [displayValue, setDisplayValue] = useState(0);

//     useEffect(() => {
//         let start = 0;
//         let end = value;
//         let duration = 1200;
//         let startTime = null;

//         const animate = (timestamp) => {
//             if (!startTime) startTime = timestamp;
//             const progress = timestamp - startTime;
//             const val = Math.min(Math.round((progress / duration) * end), end);
//             setDisplayValue(val);

//             if (progress < duration) requestAnimationFrame(animate);
//         };

//         requestAnimationFrame(animate);
//     }, [value]);

//     return (
//         <div className="w-full mt-2">
//             <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden relative">
//                 <div
//                     className="
//                         h-full 
//                         bg-linear-to-r from-cyan-400 to-emerald-400 
//                         shadow-[0_0_12px_rgba(0,255,255,0.9)]
//                         relative overflow-hidden
//                         transition-all duration-700 ease-out
//                     "
//                     style={{ width: `${displayValue}%` }}
//                 >
//                     <div
//                         className="
//                             absolute inset-0 
//                             bg-[linear-gradient(135deg,rgba(255,255,255,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,transparent_75%,transparent)]
//                             bg-size-[20px_20px]
//                             animate-[moveStripes_1.2s_linear_infinite]
//                             opacity-60
//                         "
//                     ></div>
//                 </div>
//             </div>

//             <div className="text-xs text-cyan-300 mt-1 font-semibold tracking-wider">
//                 {displayValue}%
//             </div>
//         </div>
//     );
// }


function StageProgress({ currentStep, totalSteps, stepLabels }) {
    return (
        <div className="w-full py-1">
            <div className="flex items-center">
                {Array.from({ length: totalSteps }).map((_, index) => {
                    const step = index + 1;
                    const isLast = step === totalSteps;
                    const completed = step < currentStep;
                    const active = step === currentStep;
                    const label = stepLabels?.[index] || `Step ${step}`;

                    return (
                        <div
                            key={step}
                            className={`flex items-center ${isLast ? "flex-none" : "flex-1"}`}
                        >
                            {/* Step */}
                            <div className="flex flex-col items-center shrink-0">
                                <div
                                    className={`
                                        relative w-6 h-6 rounded-full
                                        flex items-center justify-center
                                        text-[11px] font-medium
                                        transition-all duration-300
                                        ${completed
                                            ? "bg-indigo-500/15 border border-indigo-400 text-indigo-300"
                                            : active
                                                ? "bg-indigo-500 border border-indigo-400 text-white ring-4 ring-indigo-500/15"
                                                : "bg-slate-800 border border-slate-700 text-slate-500"
                                        }
                                    `}
                                >
                                    {completed ? (
                                        "✓"
                                    ) : (
                                        step
                                    )}
                                </div>

                                <span
                                    className={`
                                        mt-2 text-[11px] font-medium tracking-wide text-center leading-tight whitespace-nowrap
                                        ${completed
                                            ? "text-slate-300"
                                            : active
                                                ? "text-indigo-300"
                                                : "text-slate-500"
                                        }
                                    `}
                                >
                                    {label}
                                </span>
                            </div>

                            {/* Connector */}
                            {!isLast && (
                                <div className="flex-1 h-px mx-1.5 -mt-5 bg-slate-700/70 overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-400/70 transition-all duration-500"
                                        style={{ width: completed ? "100%" : "0%" }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function ClaimSummary() {

    const user = useUser()
    const navigate = useNavigate()

    const [allClaimSummaryData, setAllClaimSummaryData] = useState([]);
    const [claimSummaryData, setClaimSummaryData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const [totalPages, setTotalPages] = useState(0);

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

            if (data?.status === 200) {
                const finalData = data.result;

                setAllClaimSummaryData(finalData); // store all data
                setTotalPages(Math.ceil(finalData.length / itemsPerPage));

                // Set first page initially
                setClaimSummaryData(finalData.slice(0, itemsPerPage));
            }
            else {
                toast.error(data?.message)
            }

        } catch (error) {
            toast.error(error)
        }
    }

    useEffect(() => {

        if (user.POLICY_NO) usagelist()

    }, [user?.POLICY_NO], currentPage)

    useEffect(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = currentPage * itemsPerPage;
        setClaimSummaryData(allClaimSummaryData.slice(start, end));
    }, [currentPage, allClaimSummaryData])

    const handleClaimView = (intno) => {
        sessionStorage.setItem("intno", intno)
        if (intno) navigate(`/dashboard/claimDetails`)
    }

    return (
        <div className='w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-6 shadow-lg mt-6'>
            {/* <Toaster /> */}

            <div className='w-full flex flex-col items-center gap-3 lg:hidden'>
                {
                    claimSummaryData && claimSummaryData.map((summary) => (
                        <React.Fragment key={summary.INTNO}>
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

                                <div className='w-full flex flex-col justify-start gap-1'>
                                    {summary.STATUS !== 2 && (<p className='flex justify-start items-start gap-2 text-pink-300'><FcDecision /> {summary.STATUS_NAME}</p>)}
                                    
                                    {summary.STATUS === 8 && (
                                        <p className="text-red-400 text-xs mt-1">
                                            {summary.ADDITIONAL_DOCUMENT_LIST}
                                        </p>
                                    )}

                                    {(summary.STATUS === 2 || summary.STATUS === 8) && (
                                        <StageProgress currentStep={summary.MIN_SEQUENCE} totalSteps={summary.MAX_SEQUENCE} />
                                    )}
                                </div>

                                <p className='w-full text-teal-400 hover:underline cursor-pointer text-center mt-3' onClick={() => handleClaimView(summary.INTNO)}>View Details {`->`}</p>

                            </div>
                        </React.Fragment>
                    ))

                }
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />

            </div>

            <div className='hidden w-full lg:block'>
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
                        {claimSummaryData?.map((summary) => (
                            <tr
                                key={summary.INTNO}
                                className="text-slate-300 text-sm border-b border-slate-700/50 hover:bg-slate-800/40 hover:shadow-[0_0_25px_rgba(0,255,255,0.25)] transition cursor-pointer text-center"
                            >
                                <td className="py-3 px-4">{summary.SL}</td>
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
                                        // <AnimatedProgress value={summary.PERCANTAGE} />
                                        <StageProgress currentStep={summary.MIN_SEQUENCE} totalSteps={summary.MAX_SEQUENCE} />
                                    )}
                                </td>
                                <td className="py-3 px-4 text-teal-300 hover:underline" onClick={() => handleClaimView(summary.INTNO)}>
                                    View →
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />

            </div>


        </div>
    )
}
