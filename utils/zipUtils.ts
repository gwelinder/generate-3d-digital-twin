import JSZip from 'jszip';
import { IndividualViews, ViewKey } from '../types';

// Helper to convert a data URL to a Blob
const dataURLtoBlob = (dataurl: string): Blob | null => {
    try {
        const arr = dataurl.split(',');
        if (arr.length < 2) return null;

        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) return null;
        const mime = mimeMatch[1];
        
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    } catch (e) {
        console.error("Error converting data URL to blob:", e);
        return null;
    }
};

// Helper to trigger a download
const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Creates a zip file from the generated views and triggers a download.
 */
export const downloadViewsAsZip = async (views: IndividualViews, filename: string) => {
    const zip = new JSZip();
    const imagesFolder = zip.folder('product_views');
    if (!imagesFolder) return;

    for (const key in views) {
        const viewKey = key as ViewKey;
        const dataUrl = views[viewKey];
        if (dataUrl) {
            const blob = dataURLtoBlob(dataUrl);
            if (blob) {
                imagesFolder.file(`${viewKey}.png`, blob);
            }
        }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(zipBlob, filename);
};


/**
 * Creates a zip file with views and a 3D model, then triggers a download.
 */
export const downloadPackAsZip = async (views: IndividualViews, modelUrl: string, filename: string) => {
    const zip = new JSZip();

    // Add images to a subfolder
    const imagesFolder = zip.folder('product_views');
    if (!imagesFolder) return;
    for (const key in views) {
        const viewKey = key as ViewKey;
        const dataUrl = views[viewKey];
        if (dataUrl) {
            const blob = dataURLtoBlob(dataUrl);
            if (blob) {
                imagesFolder.file(`${viewKey}.png`, blob);
            }
        }
    }

    // Fetch and add the 3D model
    try {
        const response = await fetch(modelUrl);
        if (!response.ok) throw new Error(`Failed to fetch model: ${response.statusText}`);
        const modelBlob = await response.blob();
        const modelFilename = modelUrl.toLowerCase().endsWith('.fbx') ? 'product_model.fbx' : 'product_model.fbx';
        zip.file(modelFilename, modelBlob);
    } catch (e) {
        console.error("Error fetching 3D model for zipping:", e);
        // Optionally alert the user
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(zipBlob, filename);
};