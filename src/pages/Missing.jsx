import React, { useEffect, useRef, useState } from 'react'
import toast, { Toaster } from "react-hot-toast"
import SearchableSelect from "../components/SearchableSelect"
import { useUser } from "../context/UserContext"

export default function Missing() {

    const user = useUser()

    const [loading, setLoading] = useState(false)

    const handleTypeChange = async (e) => {
        const type = e.target.value
        
        if(type){

            setLoading(true)

            try 
            {
                const res = await fetch(
                    `http://localhost:5001/api/grpclaimportal/missing?policyno=${user.POLICY_NO}&type=${type}`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                )

                const data = await res.json()

                console.log(data);
                
                
            } catch (error) {
                toast.error(`Cannot get Data: ${error}`)
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <div className='w-full flex flex-col gap-6 items-center'>

            <Toaster />

            <div className='w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-3 sm:p-8 space-y-8'>

                <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className="w-full max-w-sm">
                        <label className="block mb-2 text-xs font-medium tracking-wider text-gray-400 uppercase">
                            Type
                        </label>

                        <div className="relative">
                            <select
                                className="
                                    w-full appearance-none rounded-xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900
                                    text-gray-200 text-sm px-4 py-3 border border-slate-700  backdrop-blur-md
                                    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50
                                    focus:border-cyan-500 hover:border-cyan-400/60
                                "
                                onChange={handleTypeChange}
                                disabled={loading}
                            >
                                <option value="" className="bg-slate-900 text-gray-400">
                                    Select Missing Type
                                </option>
                                <option value="DEPARTMENT" className="bg-slate-900">
                                    Department Missing
                                </option>
                                <option value="MAIL" className="bg-slate-900">
                                    Email Missing
                                </option>
                                <option value="MOBILE" className="bg-slate-900">
                                    Mobile Missing
                                </option>
                                <option value="PICTURE" className="bg-slate-900">
                                    Picture Missing
                                </option>
                            </select>

                            {/* Custom dropdown icon */}
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-cyan-400">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    )
}
