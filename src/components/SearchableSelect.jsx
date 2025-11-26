import React, { useState, useRef, useEffect } from "react";

export default function SearchableSelect({
    label,
    options = [],
    value,
    onChange,
    placeholder = "Select...",
    disabled = false,
}) {
    const [query, setQuery] = useState("");
    const [showOptions, setShowOptions] = useState(false);

    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    // Filtered list
    const filteredOptions = options.filter((opt) =>
        opt?.label?.toLowerCase().includes(query.toLowerCase())
    );

    // Sync query when value changes
    useEffect(() => {
        if (!value) {
            setQuery("");
            return;
        }
        const selected = options.find((opt) => opt.value === value);
        if (selected) setQuery(selected.label);
    }, [value, options]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Select option
    const handleSelect = (opt) => {
        onChange(opt.value);
        setQuery(opt.label);
        setShowOptions(false);
    };

    // Clear value
    const handleClear = () => {
        setQuery("");
        onChange("");
        setShowOptions(false);
        inputRef.current?.focus();
    };

    // Auto-select text when input focused
    const handleFocus = () => {
        if (disabled) return;
        setShowOptions(true);
        setTimeout(() => inputRef.current?.select(), 0);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            {label && <label className="block text-sm text-gray-300 mb-1">{label}</label>}

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onFocus={handleFocus}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full border-b border-gray-600 bg-gray-700 text-white px-2 py-1 rounded-t-md focus:outline-none ${disabled ? "opacity-50 cursor-not-allowed" : "focus:border-cyan-400"
                        }`}
                />

                {!disabled && query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400"
                    >
                        ×
                    </button>
                )}
            </div>

            {!disabled && showOptions && (
                <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-b-md mt-1 max-h-48 overflow-y-auto">
                    {filteredOptions.length === 0 ? (
                        <li className="px-2 py-1 text-gray-400">No results found</li>
                    ) : (
                        filteredOptions.map((opt) => (
                            <li
                                key={opt.value}
                                onClick={() => handleSelect(opt)}
                                className={`px-2 py-1 cursor-pointer hover:bg-cyan-600 ${value === opt.value ? "bg-cyan-800" : ""
                                    }`}
                            >
                                {opt.label}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}