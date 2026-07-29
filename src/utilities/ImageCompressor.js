const compressImage = async (file, maxSizeKB = 500) => {

    // Skip non-images
    if (!file.type.startsWith("image/")) {
        return file;
    }

    // Already small enough
    if (file.size <= maxSizeKB * 1024) {
        return file;
    }

    return new Promise((resolve, reject) => {

        const img = new Image();

        img.onload = () => {

            let width = img.width;
            let height = img.height;

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            let quality = 0.9;

            const mimeType =
                file.type === "image/png"
                    ? "image/jpeg" // PNG compresses poorly; convert to JPEG
                    : file.type;

            const compress = () => {

                canvas.width = width;
                canvas.height = height;

                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {

                        if (!blob) {
                            reject(new Error("Image compression failed."));
                            return;
                        }

                        // Success
                        if (blob.size <= maxSizeKB * 1024) {

                            const compressedFile = new File(
                                [blob],
                                file.name.replace(/\.\w+$/, ".jpg"),
                                {
                                    type: mimeType,
                                    lastModified: Date.now(),
                                }
                            );

                            resolve(compressedFile);
                            return;
                        }

                        // Reduce quality first
                        if (quality > 0.3) {
                            quality -= 0.1;
                            compress();
                            return;
                        }

                        // Then reduce dimensions
                        if (width > 800 || height > 800) {

                            width = Math.floor(width * 0.9);
                            height = Math.floor(height * 0.9);

                            quality = 0.9;

                            compress();
                            return;
                        }

                        // Couldn't reach target
                        const compressedFile = new File(
                            [blob],
                            file.name.replace(/\.\w+$/, ".jpg"),
                            {
                                type: mimeType,
                                lastModified: Date.now(),
                            }
                        );

                        resolve(compressedFile);

                    },
                    mimeType,
                    quality
                );
            };

            compress();
        };

        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

export default compressImage;