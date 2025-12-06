import React, { useState, useEffect } from "react";

const AnimateNumber = ({ value, duration = 1000 }) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let start = 0;
        const frameDuration = 1000 / 60; // ~60 FPS
        const totalFrames = Math.round(duration / frameDuration);
        const increment = value / totalFrames;
        let frame = 0;

        const animate = () => {
            frame++;
            const nextValue = Math.min(start + increment, value);
            setDisplay(nextValue);
            start += increment;
            if (frame < totalFrames) {
                requestAnimationFrame(animate);
            } else {
                setDisplay(value); // ensure exact final value
            }
        };

        requestAnimationFrame(animate);

        return () => setDisplay(0); // reset if value changes
    }, [value, duration]);

    return <span>{Math.floor(display).toLocaleString()}</span>;
};

export default AnimateNumber;
