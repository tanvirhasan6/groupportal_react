import { useCallback, useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiChevronDown, FiEye, FiFilter, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import toast from "react-hot-toast";

const ALL_YEARS = "Select";
const ALL_BENEFITS = "All Type";
const ALL_DEPARTMENTS = "All Department";
const ALL_STATUSES = "All Status";

const formatAmount = (amount) => Number(amount || 0).toLocaleString("en-US");

const getYear = (value) => String(value ?? "").match(/\d{4}/)?.[0] ?? "";

const formatDate = (value) => {
    if (!value) return "—";
    const rawValue = String(value);
    const backendDate = rawValue.match(/^(\d{2})-([A-Z]{3})-(\d{4})$/i);
    const date = backendDate
        ? new Date(`${backendDate[2]} ${backendDate[1]}, ${backendDate[3]}`)
        : new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    return rawValue;
};

const getStatusClass = (status) => {
    const value = String(status ?? "").toUpperCase();
    if (value.includes("PAYMENT COMPLETED")) return "text-[#00d5b5] bg-[#00d5b5]/10 border-[#00d5b5]/20";
    if (value.includes("WORKING")) return "text-[#00c4d9] bg-[#00c4d9]/10 border-[#00c4d9]/20";
    if (value.includes("DECLINED")) return "text-red-400 bg-red-400/10 border-red-400/20";
    if (value.includes("APPROVED")) return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    if (value.includes("DOCUMENT")) return "text-orange-400 bg-orange-400/10 border-orange-400/20";
    return "text-slate-400 bg-slate-400/10 border-slate-400/20";
};

const SelectBox = ({ label, value, options, onChange }) => (
    <div className="w-full min-w-0">
        <label className="mb-2 block text-[11px] font-semibold text-slate-400">
            {label}
        </label>
        <div className="relative">
            <select value={value} onChange={(event) => onChange(event.target.value)} className="h-[42px] w-full appearance-none rounded-lg border border-[#34465c] bg-[#162235] px-3 pr-10 text-[12px] text-slate-200 outline-none transition focus:border-[#00bfd3] focus:ring-2 focus:ring-[#00bfd3]/10">
                {options.map((option) => (
                    <option key={option} value={option} className="bg-[#162235] text-slate-200">
                        {option}
                    </option>
                ))}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#00bfd3]" size={15} />
        </div>
    </div>
);

const StatusBadge = ({ status }) => (
    <span className={`inline-flex rounded-md border px-2 py-1 text-[9px] font-bold leading-tight ${getStatusClass(status)}`}>
        {status || "Unknown"}
    </span>
);

const getBeneficiaryName = (claim) => claim.BENEFICIARY_NAME ?? claim.NAME ?? claim.STUDENT_NAME ?? claim.USERNAME ?? "Claimant";
const getBeneficiaryId = (claim) => claim.BENEFICIARY ?? "—";
const getBeneficiaryMobile = (claim) => claim.MOBILE ?? "—";
const getIntNo = (claim) => claim.INTNO ?? "—";

const ClaimCard = ({ claim, index, onView }) => (
<article key={getIntNo(claim) ?? index} className="rounded-xl border border-[#2d3d52] bg-[#182538] p-4 shadow-lg shadow-black/10">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-100">{getBeneficiaryName(claim)}</p>
                <p className="mt-1 break-all text-[10px] text-slate-500">ID: {getBeneficiaryId(claim)}</p>
                <p className="mt-1 text-[10px] text-slate-500">Mobile: {getBeneficiaryMobile(claim)}</p>
                <p className="mt-1 break-all text-[10px] text-slate-500">Int. No: {getIntNo(claim)}</p>
            </div>
            <StatusBadge status={claim.STATUS_NAME} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#293a50] pt-4">
            <div className="col-span-2 min-w-0">
                <dt className="text-[10px] text-slate-500">Benefit</dt>
                <dd className="mt-1 text-xs leading-5 text-slate-300">{claim.BENEFIT_HEAD || "—"}</dd>
            </div>
            <div className="min-w-0">
                <dt className="text-[10px] text-slate-500">Department</dt>
                <dd className="mt-1 truncate text-xs text-slate-300">{claim.DEPT_NAME || "—"}</dd>
            </div>
            <div className="min-w-0">
                <dt className="text-[10px] text-slate-500">Applied</dt>
                <dd className="mt-1 text-xs text-slate-300">{formatDate(claim.INTNO_DATE)}</dd>
            </div>
            <div className="min-w-0">
                <dt className="text-[10px] text-slate-500">Last Uploaded</dt>
                <dd className="mt-1 text-xs text-slate-300">{claim.LAST_UPLOADED || "—"}</dd>
            </div>
            <div className="min-w-0">
                <dt className="text-[10px] text-slate-500">Claimed</dt>
                <dd className="mt-1 text-xs font-semibold text-slate-200">৳ {formatAmount(claim.CLAIM_AMOUNT)}</dd>
            </div>
            <div className="min-w-0">
                <dt className="text-[10px] text-slate-500">Approvable</dt>
                <dd className="mt-1 text-xs font-semibold text-[#00d0b3]">৳ {formatAmount(claim.APPROVEABLE_AMOUNT)}</dd>
            </div>
        </dl>
        {claim.ADDITIONAL_DOCUMENT_LIST && (
            <p className="mt-4 rounded-lg border border-orange-400/20 bg-orange-400/5 p-3 text-[11px] leading-5 text-orange-200">
                {claim.ADDITIONAL_DOCUMENT_LIST}
            </p>
        )}
        <button type="button" onClick={() => onView(claim)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#34475c] bg-[#172438] px-3 py-2 text-[11px] text-[#00bfd3] transition hover:border-[#00bfd3] hover:bg-[#00aabd] hover:text-[#07131d]">
            <FiEye size={14} />
            View claim
        </button>
    </article>
);

const AllClaims = () => {
    const user = useUser();
    const navigate = useNavigate();
    const [year, setYear] = useState(ALL_YEARS);
    const [benefit, setBenefit] = useState(ALL_BENEFITS);
    const [department, setDepartment] = useState(ALL_DEPARTMENTS);
    const [status, setStatus] = useState(ALL_STATUSES);
    const [studentSearch, setStudentSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [claimData, setClaimData] = useState([]);

    const getClaimData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5002/api/grpclaimportal/allClaimList", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    policyno: user?.POLICY_NO,
                    userid: user?.GROUP_CODE === "100" ? studentSearch : user?.USERNAME,
                    groupCode: user?.GROUP_CODE === "100" ? "" : user?.GROUP_CODE,
                    status: null,
                }),
            });
            if (!response.ok) throw new Error(`Unable to load claims (${response.status})`);
            const result = await response.json();

            console.log(result);
            
            const rows = Array.isArray(result) ? result : result?.data ?? result?.result ?? result?.claims ?? [];
            setClaimData(Array.isArray(rows) ? rows : []);
        } catch (error) {
            setClaimData([]);
            toast.error(error.message || "Unable to load claims");
        } finally {
            setLoading(false);
        }
    }, [user?.POLICY_NO, user?.USERNAME, user?.GROUP_CODE, studentSearch]);

    useEffect(() => {
        getClaimData();
    }, [getClaimData]);

    const benefitOptions = useMemo(() => [ALL_BENEFITS, ...new Set(claimData.map((item) => item.BENEFIT_HEAD).filter(Boolean))], [claimData]);
    const departmentOptions = useMemo(() => [ALL_DEPARTMENTS, ...new Set(claimData.map((item) => item.DEPT_NAME).filter(Boolean))], [claimData]);
    const statusOptions = useMemo(() => [ALL_STATUSES, ...new Set(claimData.map((item) => item.STATUS_NAME).filter(Boolean))], [claimData]);
    const yearOptions = useMemo(() => {
        const years = claimData.map((item) => getYear(item.INTNO_DATE)).filter(Boolean);
        return [ALL_YEARS, ...Array.from(new Set(years)).sort((a, b) => Number(b) - Number(a))];
    }, [claimData]);

    const filteredClaims = useMemo(() => {
        const search = studentSearch.trim().toLowerCase();
        return claimData.filter((claim) => {
            const searchableText = `${getBeneficiaryName(claim)} ${getIntNo(claim)}`.toLowerCase();
            return (year === ALL_YEARS || getYear(claim.INTNO_DATE) === year)
                && (benefit === ALL_BENEFITS || claim.BENEFIT_HEAD === benefit)
                && (department === ALL_DEPARTMENTS || claim.DEPT_NAME === department)
                && (status === ALL_STATUSES || claim.STATUS_NAME === status)
                && (!search || searchableText.includes(search));
        });
    }, [claimData, year, benefit, department, status, studentSearch]);

    const clearFilters = () => {
        setYear(ALL_YEARS);
        setBenefit(ALL_BENEFITS);
        setDepartment(ALL_DEPARTMENTS);
        setStatus(ALL_STATUSES);
        setStudentSearch("");
    };

    const handleViewClaim = (claim) => {
        sessionStorage.setItem("intno", claim.INTNO);
        navigate("/dashboard/claimDetails", { state: { intno: claim.INTNO } });
    };

    return (
        <div className="min-h-screen bg-[#101828] text-slate-200">
            <div className="mx-auto max-w-[1900px] px-4 py-6 sm:px-6 lg:px-8">
                <section className="rounded-xl border border-[#2d3d52] bg-[#1b283a] p-5 shadow-xl shadow-black/10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#00bfd3]/10 bg-[#00bfd3]/10 text-[#00c4d9]">
                            <FiFilter size={17} />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-slate-100">Filter Claims</h2>
                            <p className="mt-0.5 text-[10px] text-slate-500">Use the filters below to find a specific claim.</p>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <SelectBox label="Year" value={year} options={yearOptions} onChange={setYear} />
                        <SelectBox label="Benefit Type" value={benefit} options={benefitOptions} onChange={setBenefit} />
                        <SelectBox label="Department" value={department} options={departmentOptions} onChange={setDepartment} />
                        <SelectBox label="Status" value={status} options={statusOptions} onChange={setStatus} />
                        <div className="min-w-0">
                            <label className="mb-2 block text-[11px] font-semibold text-slate-400">
                                Beneficiary Id
                            </label>
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={15} />
                                <input type="text" value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Search student ID or name..." className="h-[42px] w-full rounded-lg border border-[#34465c] bg-[#162235] pl-10 pr-3 text-[12px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-[#00bfd3] focus:ring-2 focus:ring-[#00bfd3]/10" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 flex flex-col justify-between gap-3 border-t border-[#293a50] pt-4 sm:flex-row sm:items-center">
                        <span className="text-[11px] text-slate-500">
                            {filteredClaims.length} result{filteredClaims.length !== 1 ? "s" : ""} found
                        </span>
                        <button type="button" onClick={clearFilters} className="rounded-lg border border-[#34465b] bg-[#172438] px-3 py-2 text-[11px] text-slate-400 transition hover:border-[#00aabd] hover:text-[#00c6d8]">
                            Clear Filters
                        </button>
                    </div>
                </section>

                <section className="mt-5 overflow-hidden rounded-xl border border-[#2d3d52] bg-[#1b283a] shadow-xl shadow-black/10">
                    <div className="border-b border-[#29394d] p-5">
                        <h2 className="text-sm font-semibold text-slate-100">Claims List</h2>
                        <p className="mt-1 text-[10px] text-slate-500">Submitted applications and current processing status.</p>
                    </div>
                    {loading ? (
                        <div className="p-10 text-center text-xs text-slate-500">Loading claims...</div>
                    ) : filteredClaims.length === 0 ? (
                        <div className="p-10 text-center text-xs text-slate-500">
                            <FiAlertCircle className="mr-2 inline" size={15} />
                            No claims found for the selected filters.
                        </div>
                    ) : (
                        <>
                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full min-w-[1200px] border-collapse">
                                    <thead>
                                        <tr className="bg-[#142033]">
                                            {["SL", "Beneficiary / ID / Mobile", "Int. No", "Department", "Benefit", "Applied Date", "Uploaded", "Claimed", "Approvable", "Status", "View"].map((heading) => (
                                                <th key={heading} className="whitespace-nowrap border-b border-[#29394d] px-3 py-3 text-left text-[9px] font-bold uppercase tracking-wide text-slate-500">
                                                    {heading}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredClaims.map((claim, index) => (
                                            <tr key={`${getIntNo(claim)}-${index}`} className="border-b border-[#29384b] transition hover:bg-[#202e42]">
                                                <td className="px-3 py-3 text-[10px] font-bold text-slate-600">
                                                    {index + 1}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex min-w-[200px] items-center gap-2">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#24364b] text-xs font-bold text-[#00bfd3]">
                                                            {String(getBeneficiaryName(claim)).charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-semibold text-slate-200">{getBeneficiaryName(claim)}</p>
                                                            <p className="mt-0.5 break-all text-[10px] text-slate-500">ID: {getBeneficiaryId(claim)}</p>
                                                            <p className="mt-0.5 text-[10px] text-slate-500">Mobile: {getBeneficiaryMobile(claim)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-3 text-[10px] text-slate-400">{getIntNo(claim)}</td>
                                                <td className="px-3 py-3 text-[10px] text-slate-400">{claim.DEPT_NAME || "—"}</td>
                                                <td className="max-w-[220px] px-3 py-3 text-[10px] leading-4 text-slate-400">{claim.BENEFIT_HEAD || "—"}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-[10px] text-slate-400">{formatDate(claim.INTNO_DATE)}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-[10px] text-slate-400">{claim.LAST_UPLOADED || "—"}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-right text-[10px] font-bold text-slate-300">{formatAmount(claim.CLAIM_AMOUNT)}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-right text-[10px] font-bold text-[#00d0b3]">{formatAmount(claim.APPROVEABLE_AMOUNT)}</td>
                                                <td className="px-3 py-3">
                                                    <div className="min-w-[190px]">
                                                        <StatusBadge status={claim.STATUS_NAME} />
                                                        {claim.ADDITIONAL_DOCUMENT_LIST && (
                                                            <p className="mt-2 text-[9px] leading-4 text-orange-200">
                                                                {claim.ADDITIONAL_DOCUMENT_LIST}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <button type="button" onClick={() => handleViewClaim(claim)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#34475c] bg-[#172438] text-[#00bfd3] transition hover:border-[#00bfd3] hover:bg-[#00aabd] hover:text-[#07131d]">
                                                        <FiEye size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="grid grid-cols-1 gap-3 p-3 lg:hidden">
                                {filteredClaims.map((claim, index) => (
                                    <ClaimCard key={`${getIntNo(claim)}-${index}`} claim={claim} index={index} onView={handleViewClaim} />
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AllClaims;
