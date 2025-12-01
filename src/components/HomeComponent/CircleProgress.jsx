import React, { useMemo, useEffect, useState } from "react";

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
    // animate percent (0 -> percent)
    const [animatedPct, setAnimatedPct] = useState(0);
    const targetPct = Math.max(0, Math.min(100, Number(percent || 0)));

    useEffect(() => {
        let start = 0;
        const duration = 1000; // animation time in ms
        const step = 16; // ~60fps
        const increment = (targetPct / duration) * step;

        const interval = setInterval(() => {
            start += increment;
            if (start >= targetPct) {
                start = targetPct;
                clearInterval(interval);
            }
            setAnimatedPct(start);
        }, step);

        return () => clearInterval(interval);
    }, [targetPct]);

    // sizes
    const sizeMap = { sm: 80, md: 112, lg: 160 };
    const dimension = sizeMap[size] || sizeMap.md;
    const viewBoxSize = 120;

    const radius = useMemo(() => (viewBoxSize - strokeWidth) / 2 - 1, [strokeWidth]);
    const circumference = 2 * Math.PI * radius;

    const dashOffset = useMemo(() => {
        return circumference * (1 - animatedPct / 100);
    }, [circumference, animatedPct]);

    const strokeColor =
        color ||
        (targetPct >= 75
            ? "#16a34a"
            : targetPct >= 40
            ? "#f59e0b"
            : "#ef4444");

    const ariaLabel = `${title} progress ${targetPct}%`;

    return (
        <div className={`flex flex-col items-center text-center ${className}`} role="group" aria-label={ariaLabel}>
            {title && (
                <div className="w-full mb-2 text-xs text-slate-500 px-2">
                    <div className="w-full">{title}</div>
                </div>
            )}

            <div
                className="w-full relative"
                style={{ width: `${dimension}px`, height: `${dimension}px` }}
            >
                <svg
                    viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                    className="block"
                    style={{ width: "100%", height: "100%" }}
                >
                    <defs>
                        <linearGradient id="bgGrad" x1="0" x2="1">
                            <stop offset="0%" stopColor="#91138f" />
                            <stop offset="100%" stopColor="#d91899" />
                        </linearGradient>
                    </defs>

                    {/* background */}
                    <circle
                        cx={60}
                        cy={60}
                        r={radius}
                        stroke="url(#bgGrad)"
                        strokeWidth={strokeWidth}
                        fill="none"
                        className="opacity-50"
                    />

                    {/* animated progress */}
                    <circle
                        cx={60}
                        cy={60}
                        r={radius}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{
                            transition: "stroke-dashoffset 300ms ease-out, stroke 300ms",
                            transform: "rotate(-90deg)",
                            transformOrigin: "50% 50%",
                        }}
                    />
                </svg>

                {/* center number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-lg font-semibold leading-none">
                        <span className="text-xl sm:text-2xl md:text-3xl">
                            {animatedPct.toFixed(0)}
                            <span className="text-sm align-super ml-0.5">%</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* stats row */}
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
