import React, { useEffect, useRef, useState } from "react"
import { useUser } from "../../context/UserContext"
import DatePickerInput from "../MyDatePicker/DatePickerInput"
import toast from "react-hot-toast"

import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function AdminReporting() {

    const user = useUser()
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const [stDate, setStDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [minEndDate, setMinEndDate] = useState(null)

    const [reportData, setReportData] = useState([])
    const [totalData, setTotalData] = useState({})
    const [format, setFormat] = useState("")
    const tableRef = useRef(null)

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

                if (data?.status === 200) {
                    setReportData(data?.result?.benefitSummary)
                    setTotalData(data?.result?.totalClaims)
                }
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

    const handleDownload = (value) => {
        setFormat(value);
        if (value === "pdf") generatePDF();
        if (value === "excel") generateExcel();
    }

    const generateExcel = () => {
        const wb = XLSX.utils.book_new();
        const sheetData = [];

        // =============================
        // ADD TOP HEADER LINES
        // =============================
        sheetData.push([`Zenith Islami Life Insurance Ltd`]);
        sheetData.push([`Summary Report From ${stDate} To ${endDate}`]);
        sheetData.push([`Policy Holder: ${user?.ORGANIZATION} (${user?.POLICY_NO})`]);

        // Empty row for spacing
        sheetData.push([]);

        // =============================
        // TABLE HEADER ROW
        // =============================
        sheetData.push([
            "Claim Type",

            // Administration
            "Admin Pending Count", "Admin Pending Amount",
            "Admin Approved Count", "Admin Approved Amount",
            "Admin Declined Count", "Admin Declined Amount",
            "Admin Requirement Count", "Admin Requirement Amount",

            // Zenith
            "Zenith Assess Count", "Zenith Assess Amount",
            "Zenith Requirement Count", "Zenith Requirement Amount",
            "Zenith Declined Count", "Zenith Declined Amount",

            // Payment
            "Processing Count", "Processing Amount",
            "Completed Count", "Completed Amount",

            // Non-payable
            "Non Payable",
        ]);

        // =============================
        // DATA ROWS
        // =============================
        reportData.forEach((row) => {
            const adminReqCnt = row.ADMIN_REQUIRED + row.ADMIN_ADDITIONAL;
            const adminReqAmt = row.ADMIN_REQUIRED_AMT + row.ADMIN_ADDITIONAL_AMT;
            const zenithReqCnt = row.ZENITH_REQUIRED + row.ZENITH_ADDITIONAL;
            const zenithReqAmt = row.ZENITH_REQUIRED_AMT + row.ZENITH_ADDITIONAL_AMT;

            sheetData.push([
                row.BENEFIT_HEAD,

                row.ADMIN_PENDING, row.ADMIN_PENDING_AMT,
                row.ADMIN_APPROVED, row.ADMIN_APPROVED_AMT,
                row.ADMIN_DECLINED, row.ADMIN_DECLINED_AMT,
                adminReqCnt, adminReqAmt,

                row.ADMIN_APPROVED, row.ADMIN_APPROVED_AMT,
                zenithReqCnt, zenithReqAmt,
                row.ZENITH_DECLINED, row.ZENITH_DECLINED_AMT,

                row.PAYMENT_PROCESSING, row.PAYMENT_PROCESSING_AMT,
                row.PAYMENT_COMPLETED, row.PAYMENT_COMPLETED_AMT,

                row.NON_PAYABLE_AMT,
            ]);
        });

        // =============================
        // TOTAL CALCULATION
        // =============================
        const total = reportData.reduce(
            (a, r) => {
                a.adminPendingCnt += r.ADMIN_PENDING;
                a.adminPendingAmt += r.ADMIN_PENDING_AMT;
                a.adminApprovedCnt += r.ADMIN_APPROVED;
                a.adminApprovedAmt += r.ADMIN_APPROVED_AMT;
                a.adminDeclinedCnt += r.ADMIN_DECLINED;
                a.adminDeclinedAmt += r.ADMIN_DECLINED_AMT;

                a.adminReqCnt += r.ADMIN_REQUIRED + r.ADMIN_ADDITIONAL;
                a.adminReqAmt += r.ADMIN_REQUIRED_AMT + r.ADMIN_ADDITIONAL_AMT;

                a.zenithAssessCnt += r.ADMIN_APPROVED;
                a.zenithAssessAmt += r.ADMIN_APPROVED_AMT;
                a.zenithReqCnt += r.ZENITH_REQUIRED + r.ZENITH_ADDITIONAL;
                a.zenithReqAmt += r.ZENITH_REQUIRED_AMT + r.ZENITH_ADDITIONAL_AMT;
                a.zenithDeclCnt += r.ZENITH_DECLINED;
                a.zenithDeclAmt += r.ZENITH_DECLINED_AMT;

                a.procCnt += r.PAYMENT_PROCESSING;
                a.procAmt += r.PAYMENT_PROCESSING_AMT;
                a.compCnt += r.PAYMENT_COMPLETED;
                a.compAmt += r.PAYMENT_COMPLETED_AMT;

                a.nonPayableAmt += r.NON_PAYABLE_AMT;

                return a;
            },
            {
                adminPendingCnt: 0, adminPendingAmt: 0,
                adminApprovedCnt: 0, adminApprovedAmt: 0,
                adminDeclinedCnt: 0, adminDeclinedAmt: 0,
                adminReqCnt: 0, adminReqAmt: 0,
                zenithAssessCnt: 0, zenithAssessAmt: 0,
                zenithReqCnt: 0, zenithReqAmt: 0,
                zenithDeclCnt: 0, zenithDeclAmt: 0,
                procCnt: 0, procAmt: 0,
                compCnt: 0, compAmt: 0,
                nonPayableAmt: 0,
            }
        );

        // Spacing before total
        sheetData.push([]);

        // =============================
        // TOTAL ROW
        // =============================
        sheetData.push([
            "TOTAL",

            total.adminPendingCnt, total.adminPendingAmt,
            total.adminApprovedCnt, total.adminApprovedAmt,
            total.adminDeclinedCnt, total.adminDeclinedAmt,
            total.adminReqCnt, total.adminReqAmt,

            total.zenithAssessCnt, total.zenithAssessAmt,
            total.zenithReqCnt, total.zenithReqAmt,
            total.zenithDeclCnt, total.zenithDeclAmt,

            total.procCnt, total.procAmt,
            total.compCnt, total.compAmt,

            total.nonPayableAmt,
        ]);

        // Spacing before total
        sheetData.push([]);

        sheetData.push(["Total Claim-", `Count: ${totalData.CNTCLAIM}`, `Amount: ${totalData.CLAIMED.toLocaleString()}`])

        // =============================
        // WRITE SHEET
        // =============================
        const ws = XLSX.utils.aoa_to_sheet(sheetData);

        // OPTIONAL: SET WIDE COLUMNS FOR LANDSCAPE FEEL
        const colWidths = new Array(20).fill({ wch: 20 });
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, "Summary Report");

        XLSX.writeFile(wb, "claim-summary.xlsx");
    }

    const generatePDF = async () => {
        if (!tableRef.current) {
            console.error("Table not found!");
            return;
        }

        // LEGAL page, landscape
        const pdf = new jsPDF("landscape", "pt", "legal");

        const pageWidth = pdf.internal.pageSize.getWidth();

        // -------------------
        //     HEADER
        // -------------------
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.text(
            "Zenith Islami Life Insurance Ltd",
            pageWidth / 2,
            50,
            { align: "center" }
        );

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.text(
            `Summary Report From ${stDate} To ${endDate}`,
            pageWidth / 2,
            70,
            { align: "center" }
        );

        pdf.text(
            `Policy Holder: ${user?.ORGANIZATION} (${user?.POLICY_NO})`,
            pageWidth / 2,
            90,
            { align: "center" }
        );

        pdf.text(
            `Total Claim - Count: ${totalData.CNTCLAIM}, Amount: ${totalData.CLAIMED.toLocaleString()}`,
            40,
            120,
            { align: "left" }
        );

        // -------------------
        //     TABLE
        // -------------------

        let tableFinalY = 0;

        autoTable(pdf, {
            html: tableRef.current,
            startY: 130,
            didDrawPage: function (data) {
                tableFinalY = data.cursor.y;  // This always gives the last Y of the table
            },
            theme: "grid",
            styles: {
                fontSize: 10,
                halign: "center",     // center all text
                textColor: "black",
                lineColor: "black",
                lineWidth: 0.3,
                fillColor: false,
            },
            headStyles: {
                halign: "center",
                fillColor: false,
                textColor: "black",
                lineColor: "black",
            },
            bodyStyles: {
                halign: "center",
                fillColor: false,
                textColor: "black",
            },
            tableWidth: "auto",
            margin: { left: 40, right: 40, bottom: 20, },
        });

        // const marginTop = 10; // desired space between table and total line
        // const textY = tableFinalY + marginTop;

        // pdf.setFontSize(12);
        // pdf.setFont("helvetica", "normal");

        // pdf.text(
        //     " ",
        //     pageWidth / 2,
        //     50,
        //     { align: "center" }
        // )
        
        // pdf.text(
        //     `Total Claim - Count: ${totalData.CNTCLAIM}, Amount: ${totalData.CLAIMED}`,
        //     pdf.internal.pageSize.getWidth() / 2,
        //     textY,
        //     { align: "center" }
        // );

        pdf.save("claim-report-summary.pdf");
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
                                <div className="my-6 overflow-auto rounded-xl bg-black/60 backdrop-blur-xl border-0">

                                    <table ref={tableRef} className="w-full text-sm text-gray-300">

                                        {/* HEADER */}
                                        <thead className="uppercase text-xs tracking-wider">

                                            {/* TOP HEADER */}
                                            <tr className="text-center bg-slate-800">
                                                <th
                                                    rowSpan="3"
                                                    className="px-4 py-3 border border-white/10"
                                                >
                                                    Claim Type
                                                </th>

                                                <th colSpan="8" className="px-4 py-3 border border-white/10">
                                                    Administration
                                                </th>

                                                <th colSpan="6" className="px-4 py-3 border border-white/10">
                                                    Zenith Life
                                                </th>

                                                <th colSpan="4" className="px-4 py-3 border border-white/10">
                                                    Approved Payment Info
                                                </th>

                                                <th
                                                    rowSpan="3"
                                                    className="px-4 py-3 border border-white/10"
                                                >
                                                    Non-Payable
                                                </th>
                                            </tr>

                                            {/* SUBGROUP TITLES */}
                                            <tr className="text-center bg-slate-800">
                                                <th colSpan="2" className="py-3 border border-white/10 ">Pending</th>
                                                <th colSpan="2" className="py-3 border border-white/10 ">Forwarded</th>
                                                <th colSpan="2" className="py-3 border border-white/10 ">Declined</th>
                                                <th colSpan="2" className="py-3 border border-white/10 ">Requirement</th>
                                                <th colSpan="2" className="py-3 border border-white/10 ">Assessing</th>
                                                <th colSpan="2" className="py-3 border border-white/10 ">Requirement</th>
                                                <th colSpan="2" className="py-3 border border-white/10 ">Declined</th>
                                                <th colSpan="2" className="py-3 border border-white/10 ">Processing</th>
                                                <th colSpan="2" className="py-3 border border-white/10 ">Completed</th>
                                            </tr>

                                            {/* FINAL HEADER ROW */}
                                            <tr className="text-center bg-slate-800">
                                                {[
                                                    // Administration
                                                    "Count", "Amount", "Count", "Amount", "Count", "Amount", "Count", "Amount",
                                                    // Zenith
                                                    "Count", "Amount", "Count", "Amount", "Count", "Amount",
                                                    // Payment
                                                    "Count", "Amount", "Count", "Amount"
                                                ].map((h, i) => (
                                                    <th
                                                        key={i}
                                                        className="px-2 py-2 border border-white/10"
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        {/* BODY */}
                                        <tbody>
                                            {reportData.map((row, i) => {
                                                const adminReqCnt = row.ADMIN_REQUIRED + row.ADMIN_ADDITIONAL;
                                                const adminReqAmt = row.ADMIN_REQUIRED_AMT + row.ADMIN_ADDITIONAL_AMT;
                                                const zenithReqCnt = row.ZENITH_REQUIRED + row.ZENITH_ADDITIONAL;
                                                const zenithReqAmt = row.ZENITH_REQUIRED_AMT + row.ZENITH_ADDITIONAL_AMT;

                                                return (
                                                    <tr
                                                        key={i}
                                                        className="text-center border-b bg-slate-900 border-white/5 hover:bg-white/5 transition"
                                                    >
                                                        <td className="px-4 py-3 text-left">{row.BENEFIT_HEAD}</td>

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

                                                        {/* NON-PAYABLE */}
                                                        <td>{row.NON_PAYABLE_AMT.toLocaleString()}</td>
                                                    </tr>
                                                );
                                            })}

                                            {/* TOTAL ROW */}
                                            <tr className="font-semibold bg-neutral-900/80 text-white border-t border-white/20 text-center">
                                                <td className="px-4 py-3 text-left">Total =</td>

                                                {(() => {
                                                    const t = reportData.reduce(
                                                        (a, r) => {
                                                            a.adminPendingCnt += r.ADMIN_PENDING;
                                                            a.adminPendingAmt += r.ADMIN_PENDING_AMT;
                                                            a.adminApprovedCnt += r.ADMIN_APPROVED;
                                                            a.adminApprovedAmt += r.ADMIN_APPROVED_AMT;
                                                            a.adminDeclinedCnt += r.ADMIN_DECLINED;
                                                            a.adminDeclinedAmt += r.ADMIN_DECLINED_AMT;
                                                            a.adminReqCnt += r.ADMIN_REQUIRED + r.ADMIN_ADDITIONAL;
                                                            a.adminReqAmt += r.ADMIN_REQUIRED_AMT + r.ADMIN_ADDITIONAL_AMT;

                                                            a.zenithAssessCnt += r.ADMIN_APPROVED;
                                                            a.zenithAssessAmt += r.ADMIN_APPROVED_AMT;
                                                            a.zenithReqCnt += r.ZENITH_REQUIRED + r.ZENITH_ADDITIONAL;
                                                            a.zenithReqAmt += r.ZENITH_REQUIRED_AMT + r.ZENITH_ADDITIONAL_AMT;
                                                            a.zenithDeclCnt += r.ZENITH_DECLINED;
                                                            a.zenithDeclAmt += r.ZENITH_DECLINED_AMT;

                                                            a.procCnt += r.PAYMENT_PROCESSING;
                                                            a.procAmt += r.PAYMENT_PROCESSING_AMT;
                                                            a.compCnt += r.PAYMENT_COMPLETED;
                                                            a.compAmt += r.PAYMENT_COMPLETED_AMT;

                                                            a.nonPayableAmt += r.NON_PAYABLE_AMT;

                                                            return a;
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
                                                            <td>{t.adminPendingCnt}</td>
                                                            <td>{t.adminPendingAmt.toLocaleString()}</td>
                                                            <td>{t.adminApprovedCnt}</td>
                                                            <td>{t.adminApprovedAmt.toLocaleString()}</td>
                                                            <td>{t.adminDeclinedCnt}</td>
                                                            <td>{t.adminDeclinedAmt.toLocaleString()}</td>
                                                            <td>{t.adminReqCnt}</td>
                                                            <td>{t.adminReqAmt.toLocaleString()}</td>

                                                            <td>{t.zenithAssessCnt}</td>
                                                            <td>{t.zenithAssessAmt.toLocaleString()}</td>
                                                            <td>{t.zenithReqCnt}</td>
                                                            <td>{t.zenithReqAmt.toLocaleString()}</td>
                                                            <td>{t.zenithDeclCnt}</td>
                                                            <td>{t.zenithDeclAmt.toLocaleString()}</td>

                                                            <td>{t.procCnt}</td>
                                                            <td>{t.procAmt.toLocaleString()}</td>
                                                            <td>{t.compCnt}</td>
                                                            <td>{t.compAmt.toLocaleString()}</td>

                                                            <td>{t.nonPayableAmt.toLocaleString()}</td>
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
