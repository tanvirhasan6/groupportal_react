import React, { useEffect, useState } from 'react'
import { useUser } from "../../context/UserContext"
import toast from "react-hot-toast";
import { FaImage } from 'react-icons/fa';

export default function InfoDoc() {

    const user = useUser()
    const [docdata, setDocData] = useState([])

    const [openModal, setOpenModal] = useState(false)
    const [selectedDoc, setSelectedDoc] = useState(null)

    const doclist = async () => {

        try {
            const res = await fetch(
                `http://localhost:5002/api/grpclaimportal/infoDocList?policyno=${user?.POLICY_NO}`,
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
                {/* <Toaster /> */}
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
                    className="fixed inset-0 z-50 bg-black/60 overflow-y-auto"
                    onClick={() => setOpenModal(false)}
                >
                    <div className="min-h-screen flex items-start justify-center p-4 py-8">
                        <div
                            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* HEADER */}
                            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-lg font-semibold">
                                    {selectedDoc.DOC_NAME}
                                </h2>
                                <button
                                    className="text-red-500 font-bold text-xl"
                                    onClick={() => setOpenModal(false)}
                                >
                                    ×
                                </button>
                            </div>

                            {/* BODY */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="flex justify-center">
                                    <img
                                        src={`http://localhost/zilil_group/file/${selectedDoc.PIC_NAME_ID}.jpg`}
                                        alt={selectedDoc.DOC_NAME}
                                        className="w-full h-auto"
                                        style={{
                                            width: "900px",   // or 1000px depending on your document
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    )
}
