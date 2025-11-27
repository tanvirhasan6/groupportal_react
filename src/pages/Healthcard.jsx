import React, { useRef } from 'react';
import { useUser } from "../context/UserContext"

import backgroundImg from '../assets/images/healthcardbg_100_2.jpg';
import logoImg from '../assets/images/zenithlogo.png';
import signatureImg from '../assets/images/ceosign.png';


export default function HealthCard() {

    const user = useUser()
    const canvasRef = useRef(null);

    const generateCard = async () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas size (match background)
        canvas.width = 800; // replace with your background width
        canvas.height = 500; // replace with your background height

        // Load images
        const loadImage = (src) =>
            new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous'; // if images from another domain
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });

        const background = await loadImage(backgroundImg);
        const logo = await loadImage(logoImg);
        const signature = await loadImage(signatureImg);

        let companyLogo, photo;
        try {
            companyLogo = await loadImage(`https://app.zenithlifebd.com/admin/img/${user?.POLICY_NO}.png`);
        } catch { companyLogo = null; }

        try {
            photo = await loadImage(`https://app.zenithlifebd.com/web_docs/${user?.USERNAME}.jpg`);
        } catch { photo = null; }

        // Draw background
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Draw logos
        ctx.drawImage(logo, canvas.width * 0.09, canvas.height * 0.095, canvas.width * 0.25, canvas.height * 0.18);
        ctx.drawImage(companyLogo, canvas.width * 0.66, canvas.height * 0.095, canvas.width * 0.25, canvas.height * 0.16);
        ctx.drawImage(photo, canvas.width * 0.09, canvas.height * 0.34, canvas.width * 0.18, canvas.height * 0.335);
        ctx.drawImage(signature, canvas.width * 0.15, canvas.height * 0.72, canvas.width * 0.08, canvas.height * 0.08);

        // Draw text
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText('BENEFICIARY: John Doe', canvas.width * 0.50, canvas.height * 0.37);
        ctx.fillText('ID NO: 12345', canvas.width * 0.50, canvas.height * 0.42);
        ctx.fillText('DEPARTMENT: IT', canvas.width * 0.50, canvas.height * 0.47);
        ctx.fillText('MOBILE: 0123456789', canvas.width * 0.50, canvas.height * 0.52);
        ctx.fillText('ISSUE DATE: 01-JAN-2025', canvas.width * 0.50, canvas.height * 0.57);
        ctx.fillText('EXPIRY DATE: 31-DEC-2025', canvas.width * 0.50, canvas.height * 0.62);
        ctx.fillText('POLICY HOLDER: Zenith Life', canvas.width * 0.50, canvas.height * 0.67);
    };

    const downloadCard = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = 'healthcard.jpg';
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
    };

    return (
        <div>
            <canvas ref={canvasRef}></canvas>
            <button onClick={generateCard}>Generate Card</button>
            <button onClick={downloadCard}>Download Card</button>
        </div>
    );
}
