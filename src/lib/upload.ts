import imageCompression from 'browser-image-compression';
import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import UTIF from 'utif';

interface UploadOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    onProgress?: (progress: number) => void;
}

/**
 * Converts a TIFF File to a standard PNG File using UTIF.
 * @param tiffFile The original TIFF File
 * @returns A Promise that resolves to a new PNG File
 */
async function convertTiffToPngFile(tiffFile: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const buffer = reader.result as ArrayBuffer;
                const ifds = UTIF.decode(buffer);
                UTIF.decodeImage(buffer, ifds[0]);

                const rgba = UTIF.toRGBA8(ifds[0]);

                // Create a canvas to draw the image
                const canvas = document.createElement('canvas');
                canvas.width = ifds[0].width;
                canvas.height = ifds[0].height;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Failed to get 2d context');

                const imageData = ctx.createImageData(canvas.width, canvas.height);
                imageData.data.set(new Uint8ClampedArray(rgba.buffer));
                ctx.putImageData(imageData, 0, 0);

                // Convert canvas to Blob then File
                canvas.toBlob((blob) => {
                    if (!blob) throw new Error('Canvas to Blob conversion failed');
                    // Create a new File object with a .png extension
                    const originalNameWithoutExt = tiffFile.name.substring(0, tiffFile.name.lastIndexOf('.'));
                    const nameBase = originalNameWithoutExt.length > 0 ? originalNameWithoutExt : tiffFile.name;
                    const newFile = new File([blob], `${nameBase}.png`, { type: 'image/png' });
                    resolve(newFile);
                }, 'image/png');
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(tiffFile);
    });
}

/**
 * Compresses an image to WebP format and uploads it to Firebase Storage.
 * Includes automatic conversion of TIFF files before compression.
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
        let fileToCompress = file;
        const isTiff = file.type === 'image/tiff' || file.name.toLowerCase().endsWith('.tif') || file.name.toLowerCase().endsWith('.tiff');

        if (isTiff) {
            console.log("Converting TIFF file to PNG before compression...");
            fileToCompress = await convertTiffToPngFile(file);
        }

        // 1. Image Compression & WebP Conversion
        const compressionOptions = {
            maxSizeMB,
            maxWidthOrHeight,
            useWebWorker: true,
            fileType: 'image/webp' as const,
        };

        const compressedFile = await imageCompression(fileToCompress, compressionOptions);

        // 2. Prepare Storage Path
        const fileName = fileToCompress.name.split('.')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase();
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
