import imageCompression from 'browser-image-compression';
import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface UploadOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    onProgress?: (progress: number) => void;
}

/**
 * Compresses an image to WebP format and uploads it to Firebase Storage.
 * @param file The original image file from input
 * @param folder The folder path in storage (e.g., 'artworks', 'magazine', 'profiles')
 * @param options Compression and progress options
 * @returns Object containing the download URL and the storage path
 */
export async function uploadImageAsWebP(
    file: File,
    folder: string,
    options: UploadOptions = {}
) {
    const {
        maxSizeMB = 1,
        maxWidthOrHeight = 1920,
        onProgress
    } = options;

    try {
        // 1. Image Compression & WebP Conversion
        const compressionOptions = {
            maxSizeMB,
            maxWidthOrHeight,
            useWebWorker: true,
            fileType: 'image/webp' as const,
        };

        const compressedFile = await imageCompression(file, compressionOptions);

        // 2. Prepare Storage Path
        const fileName = file.name.split('.')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const storagePath = `${folder}/${Date.now()}_${fileName}.webp`;
        const storageRef = ref(storage, storagePath);

        // 3. Upload to Firebase
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);

        return new Promise<{ downloadURL: string; storagePath: string }>((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) onProgress(progress);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve({ downloadURL, storagePath });
                }
            );
        });
    } catch (error) {
        console.error("WebP conversion or upload error:", error);
        throw error;
    }
}
