import React, { useEffect, useState } from "react"
import { useUser } from "../../context/UserContext"
import DatePickerInput from "../MyDatePicker/DatePickerInput"
import toast from "react-hot-toast"

import * as XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts.vfs

export default function AdminReporting() {

    const user = useUser()
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const [stDate, setStDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [minEndDate, setMinEndDate] = useState(null)

    const [reportData, setReportData] = useState([])
    const [format, setFormat] = useState("")

    useEffect(() => {
        if (stDate) {
            const [day, month, year] = stDate.split("/").map(Number);
            const dateObj = new Date(year, month - 1, day)
            setMinEndDate(dateObj)
        }
    }, [stDate])

    const handleReportData = async () => {

        if (stDate && endDate) {

            setLoading(true)

            try {
                const res = await fetch(
                    `http://localhost:5001/api/grpclaimportal/adminReportSummary?policyno=${user.POLICY_NO}&stDate=${stDate}&endDate=${endDate}`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                )

                const data = await res.json()

                if (data?.status === 200) setReportData(data?.result)
                else toast.error(data?.message)

                setLoading(false)

            } catch (error) {
                toast.error(error)
                setLoading(false)
            }

        } else {
            toast.error('Please provide Start Date and End Date first!')
        }

    }

    const downloadExcel = () => {
        const ws = XLSX.utils.json_to_sheet(reportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Summary");
        XLSX.writeFile(wb, "summary.xlsx");
    }

    const downloadPDF = () => {
        if (reportData.length === 0) return;

        const headers = Object.keys(reportData[0]);

        const body = [
            headers,
            ...reportData.map(row => headers.map(h => row[h] ?? ""))
        ];

        const doc = {
            pageOrientation: "landscape",
            content: [
                { text: "Summary Report", style: "header" },
                {
                    table: {
                        headerRows: 1,
                        body: body
                    }
                }
            ],
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
            }
        };

        pdfMake.createPdf(doc).download("summary.pdf");
    }

    const handleDownload = (value) => {
        setFormat(value);
        if (value === "pdf") downloadPDF();
        if (value === "excel") downloadExcel();
    }

    return (
        <div className="mt-6 w-full">
            <div className="border border-gray-700 rounded-xl overflow-hidden shadow-sm shadow-gray-700/50">
                {/* Accordion Header */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex justify-between items-center px-6 py-4 
                     bg-linear-to-r from-gray-900 to-gray-800 
                     hover:from-gray-800 hover:to-gray-700 text-white 
                     font-semibold text-lg transition-all duration-300 focus:outline-none"
                >
                    <span>Reporting</span>
                    <span
                        className={`transform transition-transform duration-300 ${isOpen ? "rotate-45" : "rotate-0"
                            }`}
                    >
                        +
                    </span>
                </button>

                {/* Accordion Content */}
                <div
                    className={`px-6 transition-all duration-500 ease-in-out ${isOpen ? "min-h-96 py-4" : "max-h-0"
                        }`}
                >
                    <div className="w-full flex flex-col gap-3 items-center text-gray-300">

                        <div className='flex flex-col sm:flex-row gap-2'>

                            <DatePickerInput
                                name="stDate"
                                label="Start Date"
                                value={stDate}
                                onChange={(val) => setStDate(val)}
                                maxDate={new Date()}
                                minDate={null}
                            />

                            <DatePickerInput
                                name="endDate"
                                label="End Date"
                                value={endDate}
                                onChange={(val) => setEndDate(val)}
                                maxDate={new Date()}
                                minDate={minEndDate}
                            />

                            <div className="w-full flex items-end justify-center">

                                <button
                                    type="button"
                                    className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md shadow-md transition-all hover:scale-105"
                                    disabled={loading}
                                    onClick={handleReportData}
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
                                                <span>Loading...</span>
                                            </div>
                                        ) : (
                                            'Show Data'
                                        )
                                    }
                                </button>
                            </div>

                        </div>

                        <div className="w-full py-5">

                            {/* Only show dropdown when data is loaded */}
                            {reportData.length > 0 && (
                                <div className="mt-3">
                                    <select
                                        value={format}
                                        onChange={(e) => handleDownload(e.target.value)}
                                        className="bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600"
                                    >
                                        <option value="">Download Format</option>
                                        <option value="pdf">PDF</option>
                                        <option value="excel">Excel</option>
                                    </select>
                                </div>
                            )}

                            {/* Scrollable table */}
                            {reportData.length > 0 && (
                                <div className="my-4 overflow-auto border border-gray-700 rounded-lg">

                                    <table className="w-full text-sm text-gray-300">
                                        <thead>
                                            <tr>
                                                <th rowSpan="3">Claim Type</th>

                                                <th colSpan="8" style={{ background: "#0c0e5714" }}>Administration</th>
                                                <th colSpan="6" style={{ background: "#1c543a14" }}>Zenith Life</th>
                                                <th colSpan="4" style={{ background: "#ffe6f8ba" }}>Approved Payment Info</th>

                                                <th rowSpan="4">Non Payable</th>
                                            </tr>

                                            <tr>
                                                {/* ADMIN */}
                                                <th colSpan="2" style={{ background: "#0c0e5714" }}>Pending</th>
                                                <th colSpan="2" style={{ background: "#0c0e5714" }}>Forwarded</th>
                                                <th colSpan="2" style={{ background: "#0c0e5714" }}>Declined</th>
                                                <th colSpan="2" style={{ background: "#0c0e5714" }}>Requirement</th>

                                                {/* ZENITH */}
                                                <th colSpan="2" style={{ background: "#1c543a14" }}>Assessing</th>
                                                <th colSpan="2" style={{ background: "#1c543a14" }}>Requirement</th>
                                                <th colSpan="2" style={{ background: "#1c543a14" }}>Declined</th>

                                                {/* PAYMENT */}
                                                <th colSpan="2" style={{ background: "#ffe6f8ba" }}>Processing</th>
                                                <th colSpan="2" style={{ background: "#ffe6f8ba" }}>Completed</th>
                                            </tr>

                                            <tr>
                                                {/* ADMIN columns */}
                                                <th style={{ background: "#0c0e5714" }}>Count</th>
                                                <th style={{ background: "#0c0e5714" }}>Amount</th>
                                                <th style={{ background: "#0c0e5714" }}>Count</th>
                                                <th style={{ background: "#0c0e5714" }}>Amount</th>
                                                <th style={{ background: "#0c0e5714" }}>Count</th>
                                                <th style={{ background: "#0c0e5714" }}>Amount</th>
                                                <th style={{ background: "#0c0e5714" }}>Count</th>
                                                <th style={{ background: "#0c0e5714" }}>Amount</th>

                                                {/* ZENITH columns */}
                                                <th style={{ background: "#1c543a14" }}>Count</th>
                                                <th style={{ background: "#1c543a14" }}>Amount</th>
                                                <th style={{ background: "#1c543a14" }}>Count</th>
                                                <th style={{ background: "#1c543a14" }}>Amount</th>
                                                <th style={{ background: "#1c543a14" }}>Count</th>
                                                <th style={{ background: "#1c543a14" }}>Amount</th>

                                                {/* PAYMENT columns */}
                                                <th style={{ background: "#ffe6f8ba" }}>Count</th>
                                                <th style={{ background: "#ffe6f8ba" }}>Amount</th>
                                                <th style={{ background: "#ffe6f8ba" }}>Count</th>
                                                <th style={{ background: "#ffe6f8ba" }}>Amount</th>

                                            </tr>
                                        </thead>

                                        <tbody>
                                            {reportData.map((row, i) => {

                                                const adminReqCnt = row.ADMIN_REQUIRED + row.ADMIN_ADDITIONAL;
                                                const adminReqAmt = row.ADMIN_REQUIRED_AMT + row.ADMIN_ADDITIONAL_AMT;
                                                const zenithReqCnt = row.ZENITH_REQUIRED + row.ZENITH_ADDITIONAL;
                                                const zenithReqAmt = row.ZENITH_REQUIRED_AMT + row.ZENITH_ADDITIONAL_AMT;

                                                return (
                                                    <tr key={i}>
                                                        <td>{row.BENEFIT_HEAD}</td>

                                                        {/* ADMIN */}
                                                        <td>{row.ADMIN_PENDING}</td>
                                                        <td>{row.ADMIN_PENDING_AMT.toLocaleString()}</td>
                                                        <td>{row.ADMIN_APPROVED}</td>
                                                        <td>{row.ADMIN_APPROVED_AMT.toLocaleString()}</td>
                                                        <td>{row.ADMIN_DECLINED}</td>
                                                        <td>{row.ADMIN_DECLINED_AMT.toLocaleString()}</td>
                                                        <td>{adminReqCnt}</td>
                                                        <td>{adminReqAmt.toLocaleString()}</td>

                                                        {/* ZENITH */}
                                                        <td>{row.ADMIN_APPROVED}</td>
                                                        <td>{row.ADMIN_APPROVED_AMT.toLocaleString()}</td>
                                                        <td>{zenithReqCnt}</td>
                                                        <td>{zenithReqAmt.toLocaleString()}</td>
                                                        <td>{row.ZENITH_DECLINED}</td>
                                                        <td>{row.ZENITH_DECLINED_AMT.toLocaleString()}</td>

                                                        {/* PAYMENT */}
                                                        <td>{row.PAYMENT_PROCESSING}</td>
                                                        <td>{row.PAYMENT_PROCESSING_AMT.toLocaleString()}</td>
                                                        <td>{row.PAYMENT_COMPLETED}</td>
                                                        <td>{row.PAYMENT_COMPLETED_AMT.toLocaleString()}</td>

                                                        <td>{row.NON_PAYABLE_AMT.toLocaleString()}</td>
                                                    </tr>
                                                );
                                            })}

                                            <tr className="font-bold bg-gray-100">
                                                {(() => {
                                                    const totals = reportData.reduce(
                                                        (acc, row) => {
                                                            acc.adminPendingCnt += row.ADMIN_PENDING;
                                                            acc.adminPendingAmt += row.ADMIN_PENDING_AMT;
                                                            acc.adminApprovedCnt += row.ADMIN_APPROVED;
                                                            acc.adminApprovedAmt += row.ADMIN_APPROVED_AMT;
                                                            acc.adminDeclinedCnt += row.ADMIN_DECLINED;
                                                            acc.adminDeclinedAmt += row.ADMIN_DECLINED_AMT;
                                                            acc.adminReqCnt += row.ADMIN_REQUIRED + row.ADMIN_ADDITIONAL;
                                                            acc.adminReqAmt += row.ADMIN_REQUIRED_AMT + row.ADMIN_ADDITIONAL_AMT;

                                                            acc.zenithAssessCnt += row.ADMIN_APPROVED;
                                                            acc.zenithAssessAmt += row.ADMIN_APPROVED_AMT;
                                                            acc.zenithReqCnt += row.ZENITH_REQUIRED + row.ZENITH_ADDITIONAL;
                                                            acc.zenithReqAmt += row.ZENITH_REQUIRED_AMT + row.ZENITH_ADDITIONAL_AMT;
                                                            acc.zenithDeclCnt += row.ZENITH_DECLINED;
                                                            acc.zenithDeclAmt += row.ZENITH_DECLINED_AMT;

                                                            acc.procCnt += row.PAYMENT_PROCESSING;
                                                            acc.procAmt += row.PAYMENT_PROCESSING_AMT;
                                                            acc.compCnt += row.PAYMENT_COMPLETED;
                                                            acc.compAmt += row.PAYMENT_COMPLETED_AMT;

                                                            acc.nonPayableAmt += row.NON_PAYABLE_AMT;

                                                            return acc;
                                                        },
                                                        {
                                                            adminPendingCnt: 0,
                                                            adminPendingAmt: 0,
                                                            adminApprovedCnt: 0,
                                                            adminApprovedAmt: 0,
                                                            adminDeclinedCnt: 0,
                                                            adminDeclinedAmt: 0,
                                                            adminReqCnt: 0,
                                                            adminReqAmt: 0,
                                                            zenithAssessCnt: 0,
                                                            zenithAssessAmt: 0,
                                                            zenithReqCnt: 0,
                                                            zenithReqAmt: 0,
                                                            zenithDeclCnt: 0,
                                                            zenithDeclAmt: 0,
                                                            procCnt: 0,
                                                            procAmt: 0,
                                                            compCnt: 0,
                                                            compAmt: 0,
                                                            nonPayableAmt: 0,
                                                        }
                                                    );

                                                    return (
                                                        <>
                                                            <td>Total =</td>
                                                            <td>{totals.adminPendingCnt}</td>
                                                            <td>{totals.adminPendingAmt.toLocaleString()}</td>
                                                            <td>{totals.adminApprovedCnt}</td>
                                                            <td>{totals.adminApprovedAmt.toLocaleString()}</td>
                                                            <td>{totals.adminDeclinedCnt}</td>
                                                            <td>{totals.adminDeclinedAmt.toLocaleString()}</td>
                                                            <td>{totals.adminReqCnt}</td>
                                                            <td>{totals.adminReqAmt.toLocaleString()}</td>

                                                            <td>{totals.zenithAssessCnt}</td>
                                                            <td>{totals.zenithAssessAmt.toLocaleString()}</td>
                                                            <td>{totals.zenithReqCnt}</td>
                                                            <td>{totals.zenithReqAmt.toLocaleString()}</td>
                                                            <td>{totals.zenithDeclCnt}</td>
                                                            <td>{totals.zenithDeclAmt.toLocaleString()}</td>

                                                            <td>{totals.procCnt}</td>
                                                            <td>{totals.procAmt.toLocaleString()}</td>
                                                            <td>{totals.compCnt}</td>
                                                            <td>{totals.compAmt.toLocaleString()}</td>

                                                            <td>{totals.nonPayableAmt.toLocaleString()}</td>
                                                        </>
                                                    );
                                                })()}
                                            </tr>
                                        </tbody>
                                    </table>

                                </div>
                            )}

                        </div>

                    </div>

                </div>
            </div>
        </div>
    )
}
