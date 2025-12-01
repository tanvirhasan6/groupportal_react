import React, { useEffect, useState } from 'react'
import { useUser } from "../../context/UserContext"
import toast, { Toaster } from "react-hot-toast";
import { FaImage } from 'react-icons/fa';

export default function InfoDoc() {

    const user = useUser()
    const [docdata, setDocData] = useState([])

    const [openModal, setOpenModal] = useState(false)
    const [selectedDoc, setSelectedDoc] = useState(null)

    const doclist = async () => {

        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/infoDocList?policyno=${user?.POLICY_NO}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            )

            const data = await res.json()
            
            if (data?.status === 200) setDocData(data?.result)
            else toast.error(data?.message)

        } catch (error) {
            toast.error(error)
        }
    }

    useEffect(() => {

        if (user.POLICY_NO) doclist()

    }, [user?.POLICY_NO])

    return (
        <>
            <div className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-lg text-slate-400">
                <Toaster />
                <h3 className='font-bold text-left mb-2 text-teal-400 text-lg'>Info</h3>
                <div className='flex flex-col gap-2 text-sm'>
                    {
                        docdata && docdata.map(doc => (
                            <p
                                key={doc.PIC_NAME_ID}
                                className='flex items-center gap-2 cursor-pointer'
                                onClick={() => {
                                    setSelectedDoc(doc)
                                    setOpenModal(true)
                                }}
                            >
                                <FaImage className='fill-amber-600' />
                                {doc.DOC_NAME}
                            </p>
                        ))
                    }
                </div>
            </div>

            {/* MODAL */}
            {openModal && selectedDoc && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
                    onClick={() => setOpenModal(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-y-auto"
                        style={{ maxHeight: "90vh" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-lg font-semibold">{selectedDoc.DOC_NAME}</h2>
                            <button
                                className="text-red-500 font-bold text-xl"
                                onClick={() => setOpenModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="p-4 flex justify-center items-center">
                            <div className="relative overflow-hidden rounded-lg border border-gray-300"
                                style={{
                                    maxHeight: "80vh",
                                    maxWidth: "100%",
                                }}
                            >
                                <img
                                    src={`https://app.zenithlifebd.com/zilil_group/file/${selectedDoc.PIC_NAME_ID}.jpg`}
                                    alt={selectedDoc.DOC_NAME}
                                    className="transition-transform duration-300 ease-in-out"
                                    style={{
                                        width: "100%",
                                        height: "auto",
                                    }}
                                    onMouseMove={(e) => {
                                        const img = e.currentTarget;
                                        const rect = img.getBoundingClientRect();
                                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                                        const y = ((e.clientY - rect.top) / rect.height) * 100;

                                        // zoom scale with 10% margin
                                        img.style.transformOrigin = `${x}% ${y}%`;
                                        img.style.transform = "scale(1.5)";
                                    }}
                                    onMouseLeave={(e) => {
                                        const img = e.currentTarget;
                                        img.style.transform = "scale(1)";
                                        img.style.transformOrigin = "center";
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    )
}
