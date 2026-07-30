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

        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {

            let width = img.width;
            let height = img.height;

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            let quality = 0.9;

            const mimeType =
                file.type === "image/png"
                    ? "image/jpeg"
                    : file.type;

            const compress = () => {

                canvas.width = width;
                canvas.height = height;

                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {

                        if (!blob) {
                            URL.revokeObjectURL(objectUrl);   // <-- Release memory
                            reject(new Error("Image compression failed."));
                            return;
                        }

                        if (blob.size <= maxSizeKB * 1024) {

                            URL.revokeObjectURL(objectUrl);   // <-- Release memory

                            resolve(
                                new File(
                                    [blob],
                                    file.name.replace(/\.\w+$/, ".jpg"),
                                    {
                                        type: mimeType,
                                        lastModified: Date.now(),
                                    }
                                )
                            );

                            return;
                        }

                        if (quality > 0.3) {
                            quality -= 0.1;
                            compress();
                            return;
                        }

                        if (width > 800 || height > 800) {
                            width = Math.floor(width * 0.9);
                            height = Math.floor(height * 0.9);
                            quality = 0.9;
                            compress();
                            return;
                        }

                        URL.revokeObjectURL(objectUrl);   // <-- Release memory

                        resolve(
                            new File(
                                [blob],
                                file.name.replace(/\.\w+$/, ".jpg"),
                                {
                                    type: mimeType,
                                    lastModified: Date.now(),
                                }
                            )
                        );

                    },
                    mimeType,
                    quality
                );
            };

            compress();
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(objectUrl);   // <-- Release memory
            reject(err);
        };

        img.src = objectUrl;
    });
}

export default compressImage;