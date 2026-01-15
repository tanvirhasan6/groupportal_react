import React, { useState } from 'react'
import toast, { Toaster } from "react-hot-toast"
import SearchableSelect from "../components/SearchableSelect"
import { useUser } from "../context/UserContext"

export default function Missing() {

    const user = useUser()

    const [loading, setLoading] = useState(false)

    const [missingData, setMissingData] = useState([])
    const [filteredData, setFilteredData] = useState([])

    const [searchTxt, setSearchTxt] = useState('')

    const handleTypeChange = async (e) => {
        const type = e.target.value
        setMissingData([])

        if (type) {

            setLoading(true)

            try {
                const res = await fetch(
                    `https://app.zenithlifebd.com:5001/api/grpclaimportal/missing?policyno=${user.POLICY_NO}&type=${type}`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                )

                const data = await res.json()

                // console.log(data);

                if (data?.status === 200) {
                    if (data?.result.length < 1) toast.error(`${type} has no missing data`)
                    else {
                        setMissingData(data?.result)
                        setFilteredData(data?.result)
                    }
                }


            } catch (error) {
                toast.error(`Cannot get Data: ${error}`)
            } finally {
                setLoading(false)
            }
        }

    }

    const handleSearch = (e) => {
        const search = e.target.value.toLowerCase();
        setSearchTxt(search);

        if (!search) {
            setFilteredData(missingData); // show all
            return;
        }

        const filtered = missingData.filter(item =>
            item.NAME.toLowerCase().includes(search) ||
            item.USERNAME.toLowerCase().includes(search) || 
            item.EMAIL.toLowerCase().includes(search) || 
            item.MOBILE.toLowerCase().includes(search)
        );

        setFilteredData(filtered);
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

                {
                    missingData.length > 0 &&
                    <div className='w-full flex items-center justify-center my-5'>
                        <input
                            id="search"
                            name="search"
                            type="text"
                            placeholder="Search by Name/Username/Moible/Email"
                            value={searchTxt}
                            inputMode="none"
                            onChange={handleSearch}
                            autoComplete='off'
                            className="
                                    w-96 appearance-none rounded-xl bg-linear-to-br from-teal-900 via-teal-800 to-teal-900
                                    text-gray-200 text-sm px-4 py-3 border border-teal-700  backdrop-blur-md
                                    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50
                                    focus:border-cyan-500 hover:border-cyan-400/60
                                "
                        />
                    </div>
                }

                {
                    filteredData.length > 0 &&
                    <div className='w-full p-2 sm:p-4'>                        

                        <div className='relative w-full h-[75vh] overflow-auto futuristic-scrollbar'>
                            <table className="w-full min-w-max border-collapse rounded-xl backdrop-blur-lg bg-slate-900/50 shadow-[0_0_20px_rgba(0,255,255,0.15)]">
                                <thead className='sticky top-0'>
                                    <tr className=" text-cyan-300 text-sm bg-slate-800/95">
                                        <th className="py-3 px-4 w-8">Sl</th>
                                        <th className="py-3 px-4">Username</th>
                                        <th className="py-3 px-4">Name</th>
                                        <th className="py-3 px-4">Faculty</th>
                                        <th className="py-3 px-4">Department</th>
                                        <th className="py-3 px-4">Mobile</th>
                                        <th className="py-3 px-4">Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        filteredData.map( (a, idx) => (
                                            <tr
                                                key={idx}
                                                className="text-slate-300 text-sm border-b border-slate-700/50 hover:bg-slate-800/40 hover:shadow-[0_0_25px_rgba(0,255,255,0.25)] transition text-center"
                                            >
                                                <td className="py-3 px-4">{idx + 1}</td>
                                                <td className="py-3 px-4 text-emerald-400">{a.USERNAME}</td>
                                                <td className="py-3 px-4">{a.NAME}</td>
                                                <td className="py-3 px-4">{a.FACULTY_NAME}</td>
                                                <td className="py-3 px-4">{a.DEPT_NAME}</td>
                                                <td className="py-3 px-4">{a.MOBILE}</td>
                                                <td className="py-3 px-4">{a.EMAIL}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                }
            </div>

        </div>
    )
}
