import React, { useMemo } from "react";

/**
 * CircleProgress (Tailwind + SVG)
 *
 * Props:
 *  - title: string
 *  - limit: number | string
 *  - used: number | string
 *  - balance: number | string
 *  - percent: number (0 - 100)
 *  - size: "sm" | "md" | "lg" (optional, default "md")
 *  - strokeWidth: number (optional, default 10)
 *  - className: string (optional)
 *  - color: string | null (optional)  // tailwind color class or hex (e.g. "text-teal-400" or "#10b981")
 */
export default function CircleProgress({
    title = "",
    limit = "",
    used = "",
    balance = "",
    percent = 0,
    size = "md",
    strokeWidth = 10,
    className = "",
    color = null,
}) {
    // clamp percent
    const pct = Math.max(0, Math.min(100, Number(percent || 0)));

    // SVG sizing presets (Tailwind-friendly)
    const sizeMap = {
        sm: 80,
        md: 112,
        lg: 160,
    };
    const dimension = sizeMap[size] || sizeMap.md;
    const viewBoxSize = 120; // keep internal coordinate system same for easy math

    const radius = useMemo(() => {
        // radius in svg user units (account for stroke width)
        // Use a radius that fits comfortably inside viewBox
        return (viewBoxSize - strokeWidth) / 2 - 1;
    }, [strokeWidth]);

    const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

    const dashOffset = useMemo(() => {
        return circumference * (1 - pct / 100);
    }, [circumference, pct]);

    // simple color logic (can be overridden by `color` prop)
    const strokeColor =
        color ||
        (pct >= 75
            ? "#16a34a" // green
            : pct >= 40
                ? "#f59e0b" // amber
                : "#ef4444"); // red

    // accessible label
    const ariaLabel = `${title} progress ${pct}%`;

    return (
        <div
            className={`flex flex-col items-center text-center ${className}`}
            role="group"
            aria-label={ariaLabel}
        >
            {title && (
                <div className="w-full mb-2 text-xs text-slate-500 px-2">
                    <div className="w-full ">{title}</div>
                </div>
            )}
            {/* SVG wrapper scaled to requested size */}
            <div
                className="w-full relative"
                style={{
                    width: `${dimension}px`,
                    height: `${dimension}px`,
                }}
            >
                <svg
                    viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                    className="block"
                    style={{ width: "100%", height: "100%" }}
                    aria-hidden="true"
                >
                    <defs>
                        {/* optional subtle background circle gradient */}
                        <linearGradient id="bgGrad" x1="0" x2="1">
                            <stop offset="0%" stopColor="#91138f" />
                            <stop offset="100%" stopColor="#d91899" />
                        </linearGradient>
                    </defs>

                    {/* background track */}
                    <circle
                        cx={viewBoxSize / 2}
                        cy={viewBoxSize / 2}
                        r={radius}
                        stroke="url(#bgGrad)"
                        strokeWidth={strokeWidth}
                        fill="none"
                        className="opacity-70"
                    />

                    {/* progress circle */}
                    <circle
                        cx={viewBoxSize / 2}
                        cy={viewBoxSize / 2}
                        r={radius}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{
                            transition: "stroke-dashoffset 450ms cubic-bezier(.2,.8,.2,1), stroke 300ms",
                            transform: "rotate(-90deg)",
                            transformOrigin: "50% 50%",
                        }}
                    />
                </svg>

                {/* CENTER LABELS */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                    aria-hidden="true"
                >
                    <div className="text-lg font-semibold leading-none">
                        <span className="text-xl sm:text-2xl md:text-3xl">
                            {/* {Math.round(pct)} */}
                            {pct === 100 ? "100" : pct.toFixed(1)}
                            <span className="text-sm align-super ml-0.5">%</span>
                        </span>
                    </div>

                </div>
            </div>

            {/* Below: stats row */}
            <div className="mt-3 w-full text-xs sm:text-sm">
                <div className="flex justify-between items-center text-slate-400 px-2">
                    <div className="flex flex-col items-start">
                        <span className="text-[11px] sm:text-xs text-slate-400">Limit</span>
                        <span className="font-medium text-slate-300">{limit}</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <span className="text-[11px] sm:text-xs text-indigo-400">Used</span>
                        <span className="font-medium text-indigo-300">{used}</span>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-[11px] sm:text-xs text-cyan-600">Balance</span>
                        <span className="font-medium text-cyan-400">{balance}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
