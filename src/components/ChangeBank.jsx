import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";   // <-- update path if needed
import toast, { Toaster } from "react-hot-toast";
import SearchableSelect from "./SearchableSelect"; // <-- update path

const ChangeBank = () => {
    const user = useUser();

    const [bankType, setBankType] = useState("");
    const [bankList, setBankList] = useState([]);
    const [bank, setBank] = useState("");
    const [branchList, setBranchList] = useState([]);
    const [branch, setBranch] = useState("");
    const [accno, setAccno] = useState("");
    const [loading, setLoading] = useState(false);

    // ============================
    // HANDLE BANK TYPE CHANGE
    // ============================
    const handleBankTypeChange = async (val) => {
        setBank("");
        setBranch("");
        setBankList([]);
        setBranchList([]);

        if (!val) return;

        setBankType(val);

        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/profile/getBanks?banktype=${val}`,
                { method: "GET", credentials: "include" }
            );

            const data = await res.json();

            if (data.status === 200) {
                const formatted = (data.result || []).map((item) => ({
                    value: item.BANKCODE,
                    label: item.BANKNAME,
                }));
                setBankList(formatted);
            } else {
                setBankList([]);
                toast.error(data.message || "No banks found.");
            }
        } catch (error) {
            toast.error("Failed to load bank list.");
        }
    };

    // ============================
    // HANDLE BANK CHANGE
    // ============================
    const handleBankChange = async (val) => {
        setBranchList([]);
        setBranch("");

        if (!val || !bankType) return;

        setBank(val);

        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/profile/getBankBranch?banktype=${bankType}&bankcode=${val}`,
                { method: "GET", credentials: "include" }
            );

            const data = await res.json();

            if (data.status === 200) {
                const formatted = (data.result || []).map((item) => ({
                    value: item.ROUTINGNO,
                    label: item.BRANCHNAME + ', Routing: ' + item.ROUTINGNO,
                }));
                setBranchList(formatted);
            } else {
                setBranchList([]);
                toast.error(data.message || "No branches found.");
            }
        } catch (error) {
            toast.error("Failed to load branch list.");
        }
    };

    // ============================
    // SUBMIT BANK UPDATE
    // ============================
    const handleBankUpdate = async () => {
        if (!bankType || !bank || !branch || !accno) {
            toast.error("Please fill all fields.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(
                `http://localhost:5001/api/grpclaimportal/profile/bankUpdate`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        policyno: user?.POLICY_NO,
                        userid: user?.USERNAME,
                        bankid: bank,
                        routingno: branch,
                        accno,
                    }),
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (data.status === 200) {
                toast.success("Bank information updated successfully.");
                window.location.reload();
            } else {
                toast.error(data.message || "Failed to update bank info.");
            }
        } catch (error) {
            toast.error("Error updating bank information.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center gap-3">
            <Toaster position="top-center" />

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">

                <SearchableSelect
                    label="Bank Type"
                    options={[
                        { value: "G", label: "General Banking" },
                        { value: "A", label: "Agent Banking" },
                        { value: "M", label: "Mobile Banking" },
                    ]}
                    value={bankType}
                    onChange={handleBankTypeChange}
                    placeholder="Select Bank Type"
                />

                <SearchableSelect
                    label="Bank Name"
                    options={bankList}
                    value={bank}
                    onChange={handleBankChange}
                    placeholder="Select Bank"
                    disabled={!bankType || bankList.length === 0}
                />

                <SearchableSelect
                    label="Branch Name"
                    options={branchList}
                    value={branch}
                    onChange={setBranch}
                    placeholder="Select Branch"
                    disabled={!bank || branchList.length === 0}
                />

                <div>
                    <label className="block text-sm font-medium mb-1">Account Number</label>
                    <input
                        type="text"
                        value={accno}
                        onChange={(e) => setAccno(e.target.value)}
                        placeholder="Enter your account number"
                        className="w-full border-0 border-b border-gray-500 bg-transparent 
                                   focus:border-cyan-200 focus:ring-0 text-white"
                    />
                </div>

            </div>

            <button
                type="button"
                disabled={loading}
                onClick={handleBankUpdate}
                className="px-4 py-3 rounded-xl font-medium bg-linear-to-r 
                           from-amber-400/60 to-red-500/60 hover:from-amber-400/80 
                           hover:to-red-500/80 text-slate-900 disabled:opacity-50"
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <svg
                            className="animate-spin h-5 w-5 text-white"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                        </svg>
                        <span>Updating...</span>
                    </div>
                ) : (
                    "Submit"
                )}
            </button>
        </div>
    );
};

export default ChangeBank;
