import React, { useEffect, useState } from 'react'
import { useUser } from "../context/UserContext"
import { useLocation, useNavigate } from 'react-router-dom'
import toast, { Toaster } from "react-hot-toast"

export default function ClaimDetails() {

    const user = useUser()
    
    const { state } = useLocation()
    const navigate = useNavigate()
    const [intno, setIntno] = useState()
    const [detailData, setDetailData] = useState({})
    const [loading, setLoading] = useState(false)

    const [basicData, setBasicData] = useState({})
    const [additionalData, setadditionalData] = useState([])
    const [coverageData, setCoverageData] = useState([])

    const [documentData, setDocumentData] = useState([])
    const [selectedDoc, setSelectedDoc] = useState(null)
    const [showAll, setShowAll] = useState(false)
    const [showFullImage, setShowFullImage] = useState(false)

    const [prescriptionFiles, setPrescriptionFiles] = useState([]);
    const [testFiles, setTestFiles] = useState([]);
    const [receiptFiles, setReceiptFiles] = useState([]);
    const [dischargeFiles, setDischargeFiles] = useState([]);
    const [otherFiles, setOtherFiles] = useState([]);

    const baseURL = "https://app.zenithlifebd.com/web_docs/"

    const getDetails = async (i) => {

        setLoading(true)

        try {

            const res = await fetch(
                `https://app.zenithlifebd.com:5001/api/grpclaimportal/claimDetails?intno=${i}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            )

            const data = await res.json()

            if (data.status === 200) {
                setDetailData(data.result)
                setBasicData(data.result?.basicData[0])
                setadditionalData(data.result?.additionalData)
                setCoverageData(data.result?.coverageDetails)
                setDocumentData(data.result?.documentList)

            } else {
                toast.error(`${data.message}`)
            }

        } catch (error) {
            toast.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        const getIntno = sessionStorage.getItem("intno")

        if (getIntno) {
            setIntno(getIntno)
            getDetails(getIntno)
        }

    }, [])

    const FileInput = ({ label, files, setFiles }) => {

        const existingFiles = documentData?.map(doc => doc.ORIGINAL_FILENAME?.trim()) || []

        const handleFileChange = (e) => {

            if (!e.target.files) return;

            const selectedFiles = Array.from(e.target.files);

            const filtered = selectedFiles.filter((file) => {

                // console.log(existingFiles);


                const name = file.name.trim();

                // Check 1: Already uploaded before?
                if (existingFiles.includes(name)) {
                    toast.error(`"${name}" is already uploaded earlier.`);
                    return false;
                }

                // Check 2: Already selected now?
                if (files.some((f) => f.name.trim() === name)) {
                    toast.error(`"${name}" is already selected.`);
                    return false;
                }

                return true;
            });

            setFiles([...files, ...filtered]);
            e.target.value = "";
        };

        const removeFile = (fileName) => {
            setFiles(files.filter((f) => f.name !== fileName));
        };

        return (
            <div className="border border-white/20 rounded-xl p-4 bg-gray-900/40 hover:bg-gray-900/60 transition">
                <label className="block text-sm mb-2 text-gray-300">{label}</label>

                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="file:bg-cyan-600 file:hover:bg-cyan-700 file:border-0 file:rounded-md file:px-4 file:py-1 file:text-white text-gray-400 text-sm"
                />

                <ul className="mt-2">
                    {files.map((file) => (
                        <li
                            key={file.name}
                            className="flex justify-between items-center mt-1 bg-gray-800 p-2 rounded"
                        >
                            <span>{file.name}</span>
                            <button
                                type="button"
                                onClick={() => removeFile(file.name)}
                                className="text-red-500 hover:text-red-700 font-bold"
                            >
                                ✕
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    const allSelectedFiles = [
        ...prescriptionFiles,
        ...testFiles,
        ...receiptFiles,
        ...dischargeFiles,
        ...otherFiles,
    ]

    const FullImageModal = () => {
        if (!showFullImage || !selectedDoc) return null;

        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                <div className="relative max-w-4xl max-h-[90vh]">

                    {/* Close Button */}
                    <button
                        className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"
                        onClick={() => setShowFullImage(false)}
                    >
                        ✕
                    </button>

                    {/* Full Image */}
                    <img
                        src={baseURL + selectedDoc.FILNAME}
                        alt="Full Document"
                        className="rounded-lg max-h-[90vh] object-contain shadow-xl"
                    />

                    {/* Description Under Image */}
                    <div className="mt-3 text-center text-gray-300">
                        <p className="font-semibold">{selectedDoc.DOC_DESCRIPTION}</p>
                        <p className="text-xs">Sl: {selectedDoc.SL}</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {

        setLoading(true)
        e.preventDefault()

        if (allSelectedFiles.length === 0) {
            toast.error("Please attach at least one document before submitting.")
            setLoading(false)
            return
        }

        const submissionData = new FormData()

        submissionData.set("intno", intno)

        prescriptionFiles.forEach(file => submissionData.append("prescriptionFiles", file))
        dischargeFiles.forEach(file => submissionData.append("dischargeFiles", file))
        testFiles.forEach(file => submissionData.append("testFiles", file))
        receiptFiles.forEach(file => submissionData.append("receiptFiles", file))
        otherFiles.forEach(file => submissionData.append("otherFiles", file))

        try {
            const res = await fetch(
                `https://app.zenithlifebd.com:5001/api/grpclaimportal/claim/reUploadDocuments`,
                {
                    method: "POST",
                    body: submissionData,
                    credentials: "include",
                    headers: {
                        "x-claim-type": basicData.BENEFIT_CODE,
                    },
                }
            )

            const text = await res.text()
            let data

            try {

                data = JSON.parse(text)
                console.log(data);
                toast.success('Re-Upload Successfull')

                setTimeout(() => {
                    navigate("/dashboard", { replace: true });
                    return;
                }, 1000);


            } catch {
                console.error("Invalid JSON:", text)
                setLoading(false)
                return
            }

        } catch (err) {
            toast.error(`Upload failed: ${err}`)
            setLoading(false)
        }
    }


    return (
        <div className="w-full text-white flex justify-center items-start p-2">
            <Toaster />
            <FullImageModal />

            {loading && <div>....</div>}

            {!loading &&

                <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-3 sm:p-8 space-y-8">

                    <h1 className="text-center text-lg sm:text-3xl font-semibold text-cyan-400">Claim Details</h1>

                    <div className='w-full'>

                        { user?.GROUP_CODE === '0' && basicData.STATUS === 8 && (
                            <div className='w-full mb-5'>

                                {/* Additional Document Description */}
                                <div className="mb-4">
                                    <p className="text-orange-400 text-base font-semibold">
                                        Additional Document Description:
                                    </p>
                                    <p className="text-orange-500 text-sm mt-2">
                                        {basicData.ADDITIONAL_DOCUMENT_LIST}
                                    </p>
                                </div>

                                <form id="additionalform" onSubmit={handleSubmit}>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {basicData.BENEFIT_CODE === '102' && (
                                            <FileInput label="Discharge Files" files={dischargeFiles} setFiles={setDischargeFiles} />
                                        )}
                                        <FileInput label="Prescription Files" files={prescriptionFiles} setFiles={setPrescriptionFiles} />
                                        <FileInput label="Medical Test Files" files={testFiles} setFiles={setTestFiles} />
                                        <FileInput label="Money Receipt/ Bill Files" files={receiptFiles} setFiles={setReceiptFiles} />
                                        <FileInput label="Other Files" files={otherFiles} setFiles={setOtherFiles} />
                                    </div>

                                    <div className="flex justify-center mt-5">
                                        <button
                                            type="submit"
                                            className="px-8 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm rounded-md shadow-md transition-all hover:scale-105"
                                            disabled={loading}
                                        >
                                            {
                                                loading ? (
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
                                                        <span>Uploading...</span>
                                                    </div>
                                                ) : (
                                                    'Re-Upload'
                                                )
                                            }
                                        </button>
                                    </div>

                                </form>
                            </div>
                        )}

                        <p className="text-indigo-300 mt-1">
                            Consult Date:{" "}
                            <span className="font-semibold">{basicData.CONSULT_DT}</span>
                        </p>

                        <div className="p-2 sm:p-6 space-y-2 sm:space-y-6">
                            <h2 className="text-lg font-semibold text-teal-400">General</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <DetailRow label="Plan" value={basicData.PLANNAME} />
                                <DetailRow label="Benefit" value={basicData.BENEFIT_HEAD} />
                                <DetailRow label="Status" value={basicData.STATUS_NAME} />
                                <DetailRow label="Status Date" value={basicData.STATUS_DATE} />
                                {
                                    basicData.BENEFIT_CODE === '102' &&
                                    <>
                                        <DetailRow label="Admission Date" value={basicData.ADMISSION_DATE} />
                                        <DetailRow label="Discharge Date" value={basicData.DISCHARGE_DATE} />
                                    </>
                                }
                                <DetailRow label="Diagnosis" value={basicData.DIAGNOSIS} />
                                <DetailRow label="Place" value={basicData.N_LOCATION} />
                                <DetailRow label="Claim Amount" value={basicData.CLAIM_AMOUNT} />
                                <DetailRow
                                    label="Approved Amount"
                                    value={basicData.APPROVEABLE_AMOUNT}
                                />
                                <DetailRow label="Remarks" value={basicData.REMARKS} />
                            </div>
                        </div>

                        {
                            coverageData?.length > 0 &&

                            <div className="p-2 sm:p-6 space-y-2 sm:space-y-6">
                                <h2 className="text-lg font-semibold text-teal-400 mb-4">
                                    Coverage Breakdown
                                </h2>

                                <table className="w-full border-collapse overflow-x rounded-xl backdrop-blur-lg bg-slate-900/50">
                                    <thead>
                                        <tr className="text-cyan-300 text-sm bg-slate-800/60">
                                            <th className="p-2">Particulars</th>
                                            <th className="p-2">Description</th>
                                            <th className="p-2">Applied</th>
                                            <th className="p-2">Approvable</th>
                                        </tr>
                                    </thead>

                                    <tbody >
                                        {coverageData.map((item, i) => (
                                            <tr
                                                key={i}
                                                className="text-slate-300 text-sm border-b border-slate-700/50 transition cursor-pointer text-center"
                                            >
                                                <td className="p-2">{item.BILL_TYPE_DESCRIPTION}</td>
                                                <td className="p-2">{item.BILL_DESCRIPTION}</td>
                                                <td className="p-2">{item.SUBMITTED_BILL}</td>
                                                <td className="p-2">{item.APPROVEABLE_AMOUNT}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        }

                        <div className="p-2 sm:p-6 space-y-2 sm:space-y-6">
                            <h2 className="text-lg font-semibold text-teal-400">
                                Benefit Calculation
                            </h2>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <DetailRow label="Claimed" value={basicData.CLAIM_AMOUNT} />
                                <DetailRow label="Stamp" value={basicData.REV_STAMP} />
                                <DetailRow label="Gross" value={basicData.APPROVEABLE_AMOUNT} />
                                <DetailRow label="Net Payable" value={basicData.NET_AMOUNT} />
                            </div>
                        </div>

                        {
                            documentData?.length > 0 &&
                            <div className="p-2 sm:p-6 space-y-2 sm:space-y-6">
                                <h2 className="text-lg font-semibold text-teal-400">Documents</h2>

                                <div className='flex gap-2'>
                                    <span
                                        onClick={() => {
                                            setShowAll(true);
                                            setSelectedDoc(null);
                                        }}
                                        className="text-sm cursor-pointer hover:underline text-sky-500"
                                    >
                                        View All Images
                                    </span>

                                    <span
                                        onClick={() => {
                                            setShowAll(false);
                                            setSelectedDoc(null);
                                        }}
                                        className="text-sm cursor-pointer hover:underline text-pink-400"
                                    >
                                        Hide All Images
                                    </span>
                                </div>

                                {/* IMAGE PREVIEW SECTION */}
                                {(selectedDoc || showAll) && (
                                    <div className="mt-4 p-4 border border-teal-700 rounded-lg bg-gray-900 space-y-4">


                                        {/* VIEW ALL IMAGES */}
                                        {showAll && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {documentData.map((doc, i) => (
                                                    <div
                                                        key={i}
                                                        className="border border-gray-700 rounded-lg p-3 bg-gray-800 space-y-2"
                                                    >
                                                        {/* Description inside image box */}
                                                        <div>
                                                            <p className="font-medium text-gray-300">{doc.DOC_DESCRIPTION}</p>
                                                            <p className="text-xs text-gray-400">Sl: {doc.SL}</p>
                                                        </div>

                                                        <img
                                                            src={baseURL + doc.FILNAME}
                                                            alt="Document"
                                                            className="rounded max-h-60 w-full object-cover"
                                                            onClick={() => {
                                                                setSelectedDoc(doc);
                                                                setShowFullImage(true);
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                        }


                    </div>

                </div>
            }
        </div>
    )
}

function DetailRow({ label, value }) {
    return (
        <div className="flex flex-col">
            <span className="text-gray-300 text-xs">{label}:</span>
            <span className="font-medium text-slate-400">{value || "-"}</span>
        </div>
    );
}