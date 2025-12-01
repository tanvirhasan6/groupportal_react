export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="w-full flex items-center justify-center gap-3 py-6 mt-6">

            {/* Prev Button */}
            <button
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`
                    px-4 py-2 text-sm rounded-lg 
                    border border-cyan-400/40 text-cyan-300
                    backdrop-blur-lg
                    hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]
                    transition-all duration-300
                    disabled:opacity-30 disabled:cursor-not-allowed
                `}
            >
                ← Prev
            </button>

            {/* Page Index */}
            <div className="flex items-center gap-2">
                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`
                            w-10 h-10 rounded-md flex items-center justify-center 
                            text-sm font-semibold transition-all duration-300 
                            ${
                                currentPage === page
                                    ? `
                                        bg-cyan-400 text-slate-900 
                                        shadow-[0_0_20px_rgba(0,255,255,0.7)]
                                        scale-110
                                      `
                                    : `
                                        border border-cyan-400/40 text-cyan-300
                                        hover:bg-cyan-500/20 
                                        hover:shadow-[0_0_15px_rgba(0,255,255,0.5)]
                                        hover:scale-110
                                      `
                            }
                        `}
                    >
                        {page}
                    </button>
                ))}
            </div>

            {/* Next Button */}
            <button
                onClick={() =>
                    currentPage < totalPages && onPageChange(currentPage + 1)
                }
                disabled={currentPage === totalPages}
                className={`
                    px-4 py-2 text-sm rounded-lg 
                    border border-cyan-400/40 text-cyan-300
                    backdrop-blur-lg
                    hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]
                    transition-all duration-300
                    disabled:opacity-30 disabled:cursor-not-allowed
                `}
            >
                Next →
            </button>
        </div>
    );
}
