import { useState, useEffect, useRef } from "react";

export default function DatePickerPopup({
    open,
    onClose,
    onSelect,
    minDate,
    maxDate,
}) {
    const ref = useRef(null);
    const today = new Date();

    const sysYear = today.getFullYear();
    const sysMonth = today.getMonth();

    const normalize = (d) => {
        if (!d) return null;
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    const min = normalize(minDate);
    const max = normalize(maxDate) || normalize(today);

    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());

    useEffect(() => {
        if (open) {
            setMonth(today.getMonth());
            setYear(today.getFullYear());
        }
    }, [open]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        };
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    if (!open) return null;

    // Calendar days
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = [];

    for (let i = 0; i < firstDayOfMonth; i++) daysArray.push(null);
    for (let i = 1; i <= totalDaysInMonth; i++) daysArray.push(i);

    // Month navigation
    const prevMonth = () => {
        if (month === 0) {
            setYear(year - 1);
            setMonth(11);
        } else {
            setMonth(month - 1);
        }
    };

    const nextMonth = () => {
        if (year === sysYear && month === sysMonth) return; // block future
        if (month === 11) {
            setYear(year + 1);
            setMonth(0);
        } else {
            setMonth(month + 1);
        }
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const isDisabled = (day) => {
        if (!day) return true;
        const date = new Date(year, month, day);
        if (min && date < min) return true;
        if (max && date > max) return true;
        return false;
    };

    const handleSelect = (day) => {
        if (!day || isDisabled(day)) return;
        const selectedDate = new Date(year, month, day);
        onSelect(selectedDate);
        onClose();
    };

    // Generate Year Range (1950 → current year)
    const years = [];
    for (let y = 1950; y <= sysYear; y++) years.push(y);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
            <div
                ref={ref}
                className="bg-gray-900/80 border border-cyan-500/40 p-6 rounded-2xl shadow-2xl w-80 h-96 sm:w-96 animate-scale-in"
            >

                {/* Header */}
                <div className="flex justify-between items-center mb-4 gap-2">

                    {/* Prev Button */}
                    <button
                        type="button"
                        onClick={prevMonth}
                        className="text-cyan-400 text-xl"
                    >
                        ←
                    </button>

                    {/* Month + Year Dropdown */}
                    <div className="flex items-center gap-2">

                        {/* Month Select */}
                        <select
                            value={month}
                            onChange={(e) => {
                                const m = parseInt(e.target.value);
                                if (year === sysYear && m > sysMonth) return; // prevent future month
                                setMonth(m);
                            }}
                            className="bg-gray-800 text-cyan-300 px-2 py-1 rounded-md border border-cyan-600/40"
                        >
                            {monthNames.map((m, i) => (
                                <option
                                    key={i}
                                    value={i}
                                    disabled={year === sysYear && i > sysMonth}
                                >
                                    {m}
                                </option>
                            ))}
                        </select>

                        {/* Year Select */}
                        <select
                            value={year}
                            onChange={(e) => {
                                const newYear = parseInt(e.target.value);
                                setYear(newYear);

                                // Auto-fix month if going to current year
                                if (newYear === sysYear && month > sysMonth) {
                                    setMonth(sysMonth);
                                }
                            }}
                            className="bg-gray-800 text-cyan-300 px-2 py-1 rounded-md border border-cyan-600/40"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Next Button */}
                    <button
                        type="button"
                        onClick={nextMonth}
                        disabled={year === sysYear && month === sysMonth}
                        className={`text-xl ${year === sysYear && month === sysMonth
                                ? "text-gray-600 cursor-not-allowed"
                                : "text-cyan-400"
                            }`}
                    >
                        →
                    </button>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 text-center text-cyan-300 text-sm mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d}>{d}</div>)}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1 text-center">
                    {daysArray.map((day, idx) => {
                        if (!day) return <div key={idx} className="w-10 h-10"></div>;

                        const disabled = isDisabled(day);

                        return (
                            <button
                                type="button"
                                key={idx}
                                disabled={disabled}
                                onClick={() => handleSelect(day)}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all
                                ${disabled
                                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                        : "bg-gray-800 hover:bg-cyan-600 hover:text-black shadow-md hover:scale-110"
                                    }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
