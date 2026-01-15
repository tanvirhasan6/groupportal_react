import React, { useState } from "react";
import { useUser } from "../context/UserContext";

import backgroundImg from "../assets/images/healthcardbg_100_2.jpg";
import backside from "../assets/images/healthcardback.jpg";
import logoImg from "../assets/images/zenithlogo.png";
import signatureImg from "../assets/images/ceosign.png";

export default function HealthCard() {
    const user = useUser();
    // const canvasRef = useRef(null);

    const [backSideShow,setBackSideShow] = useState(false)
    const [frontPreview, setFrontPreview] = useState(null);
    const [frontDownload, setFrontDownload] = useState(null)
    const [loading, setLoading] = useState(false)
    const [downloadLoading, setDownloadLoading] = useState(false)

    const loadImage = (src, isRemote = false) => {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise( async (resolve, reject) => {
        try {
            let finalSrc = src;
            if (isRemote) {
            const res = await fetch(src);
            if (!res.ok) throw new Error("Failed to fetch remote image");
            const blob = await res.blob();
            finalSrc = URL.createObjectURL(blob);
            }

            const img = new Image();
            img.crossOrigin = "anonymous";
            img.decoding = "sync";
            img.src = finalSrc;
            img.onload = () => resolve(img);
            img.onerror = reject;
        } catch (err) {
            reject(err);
        }
        });
    };

    const generateCard = async () => {
        setLoading(true);

        const SCALE = 2; 
        const W = 800;
        const H = 500;

        const offCanvas = document.createElement("canvas");
        const ctx = offCanvas.getContext("2d");
        offCanvas.width = W * SCALE;
        offCanvas.height = H * SCALE;
        ctx.scale(SCALE, SCALE);

        try {
            // Load local images
            const background = await loadImage(backgroundImg);
            const logo = await loadImage(logoImg);
            const signature = await loadImage(signatureImg);

            // Load remote images
            let companyLogo = null;
            let photo = null;

            try {
                companyLogo = await loadImage(
                    `https://app.zenithlifebd.com:5001/image-proxy?url=https://app.zenithlifebd.com/admin/img/${user.POLICY_NO}.png`,
                    true
                );
            } catch {
                photo = null
            }

            try {
                photo = await loadImage(
                    `https://app.zenithlifebd.com:5001/image-proxy?url=https://app.zenithlifebd.com/web_docs/${user.USERNAME}.jpg`,
                    true
                );
            } catch {
                photo = null
            }

            // Draw background
            ctx.drawImage(background, 0, 0, W, H);

            // Draw logos
            ctx.drawImage(logo, W * 0.05, H * 0.05, W * 0.23, H * 0.15);
            if (companyLogo) ctx.drawImage(companyLogo, W * 0.70, H * 0.05, W * 0.22, H * 0.15);

            // Draw heading "Health Care Card"
            ctx.fillStyle = "#006400";
            ctx.font = "bold 26px Arial";
            ctx.fillText("Health Care Card", W * 0.34, H * 0.13);

            // PHOTO (left)
            if (photo)
                ctx.drawImage(photo, W * 0.06, H * 0.28, W * 0.18, H * 0.36);

            ctx.fillStyle = "black";
            ctx.font = "20px Arial";

            const startX = W * 0.26;      // label start
            const valueX = startX + 180;  // value start (adjust if needed)
            let y = H * 0.31;
            const lineGap = 27;

            const fields = [
                ["POLICY HOLDER", user.ORGANIZATION],
                ["BENEFICIARY", user.NAME],
                ["ID NO/REG NO", user.USERNAME],
                ["DEPARTMENT", user.DEPT_NAME],
                ["MOBILE NO", user.MOBILE],
                ["ISSUE DATE", user.ISSUE_DATE],
                ["EXPIRY DATE", user.EXP_DATE],
            ];

            fields.forEach(([label, value]) => {
                ctx.fillText(`${label}`, startX, y);
                ctx.fillText(': ' + value || "undefined", valueX, y);
                y += lineGap;
            });

            // Signature
            // Signature max size
            const maxSigWidth = W * 0.15;     
            const maxSigHeight = H * 0.07;    

            let sigW = signature.width;
            let sigH = signature.height;

            // Maintain aspect ratio
            const scale = Math.min(maxSigWidth / sigW, maxSigHeight / sigH);
            sigW *= scale;
            sigH *= scale;


            // ⭐ Correct position BELOW zigzag and ABOVE green bar
            const sigX = W * 0.12;
            const sigY = H * 0.72;   // PERFECT Y position for signature area

            ctx.drawImage(signature, sigX, sigY, sigW, sigH);


            // ==========================
            //   TEXTS BELOW THE SIGNATURE
            // ==========================

            // Set common font
            ctx.fillStyle = "#000";
            ctx.font = `18px Arial`;

            // Authorized Signature text
            const sigTextY = H * 0.82;   // Slightly above green bar

            ctx.textAlign = "left";
            ctx.fillText("Authorized Signature", W * 0.06, sigTextY);

            // Website text (right aligned)
            ctx.textAlign = "right";
            ctx.fillText("www.zenithlifebd.com", W * 0.94, sigTextY);

            // Reset align
            ctx.textAlign = "left";

            // Bottom green caution text
            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.fillText(
                "This card to be used for medical discount facilities only",
                W * 0.18,
                H * 0.93
            );

            const finalDataURL = offCanvas.toDataURL("image/png", 1.0);

            setFrontPreview(finalDataURL);
            setFrontDownload(finalDataURL);

            setBackSideShow(true);
            setLoading(false);

        } catch (err) {
            console.error("Error generating card:", err);
            setLoading(false);
            setBackSideShow(false);
        }
    };


    // Download BOTH front + back
    const downloadBoth = async() => {
        setDownloadLoading(true)
        if (frontDownload) {
            const linkFront = document.createElement("a");
            linkFront.href = frontDownload;
            linkFront.download = "HealthCardFrontSide.png";
            linkFront.click();
        }

        const linkBack = document.createElement("a");
        linkBack.href = backside;
        linkBack.download = "HealthCardBackSide.png";
        linkBack.click();
        setDownloadLoading(false)
    };

    return (
        <div className="w-full flex flex-col gap-4">
        {/* CARD PREVIEW */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* FRONT */}
            <div className="w-full sm:w-1/2 flex justify-center">
                {
                    frontPreview &&
                    <img
                        src={frontPreview}
                        alt="Front Preview"
                        className="w-full max-w-[600px] h-auto rounded shadow-md"
                    />
                }
            </div>

            {/* BACK */}
            <div className="w-full sm:w-1/2 flex justify-center">
                {
                    backSideShow && 
                    <img
                        src={backside}
                        alt="Backside Preview"
                        className="w-full max-w-[600px] h-auto rounded shadow-md"
                    />
                }
            </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 justify-center">
            <button
            onClick={generateCard}
            className="px-5 py-2 bg-blue-600 text-white rounded"
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
                        <span>Generating...</span>
                    </div>
                ) : (
                    'Generate Card'
                )
            }
            </button>

            <button
            onClick={downloadBoth}
            className="px-5 py-2 bg-green-600 text-white rounded"
            disabled={!frontDownload}
            >
            {
                downloadLoading ? (
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
                        <span>Downloading...</span>
                    </div>
                ) : (
                    'Download Card'
                )
            }
            </button>
        </div>
        </div>
    );
}
