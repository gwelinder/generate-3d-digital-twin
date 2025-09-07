import { fal } from '@fal-ai/client';
import { GenerationSettings } from '../types';

// Helper to convert a data URL to a Blob, required for file uploads to fal.
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


interface HunyuanInput {
    front_image_url: string | Blob;
    back_image_url: string | Blob;
    left_image_url: string | Blob;
    textured_mesh: boolean;
}

interface Tripo3DInput {
    front_image_url: string | Blob;
    back_image_url: string | Blob;
    left_image_url: string | Blob;
    right_image_url: string | Blob;
    texture: 'no' | 'standard' | 'HD';
    pbr: boolean;
    quad: boolean;
}


export const generate3DModel = async (
    viewImages: { front: string; back: string; left: string; right: string; },
    settings: GenerationSettings
): Promise<string> => {
    // Re-configure the client with the user's key for this specific request.
    if (!settings.falApiKey) {
        throw new Error("Fal.ai API Key is missing.");
    }
    fal.config({
        credentials: settings.falApiKey,
    });

    try {
        let endpoint: string;
        let modelInput: HunyuanInput | Tripo3DInput;

        if (settings.engine === 'tripo3d') {
            endpoint = 'tripo3d/tripo/v2.5/multiview-to-3d'; 

            const frontBlob = dataURLtoBlob(viewImages.front);
            const backBlob = dataURLtoBlob(viewImages.back);
            const leftBlob = dataURLtoBlob(viewImages.left);
            const rightBlob = dataURLtoBlob(viewImages.right);

            if (!frontBlob || !backBlob || !leftBlob || !rightBlob) {
                throw new Error("Failed to convert one or more view images for upload.");
            }
            
            modelInput = {
                front_image_url: frontBlob,
                back_image_url: backBlob,
                left_image_url: leftBlob,
                right_image_url: rightBlob,
                texture: settings.tripoTexture,
                pbr: settings.enablePbr,
                quad: settings.quadMeshing,
            };
        } else { // Hunyuan engines
            endpoint = `fal-ai/hunyuan3d/v2/multi-view${settings.engine === 'turbo' ? '/turbo' : ''}`;
            modelInput = {
                front_image_url: viewImages.front,
                back_image_url: viewImages.back,
                left_image_url: viewImages.left,
                textured_mesh: settings.texture === 'textured',
            };
        }
        
        const result: any = await fal.subscribe(endpoint, { input: modelInput, logs: true });

        // FIX: Check all possible locations for the model URL, including `base_model` for Tripo3D
        const modelUrl = result?.data?.pbr_model?.url || result?.data?.model_mesh?.url || result?.data?.base_model?.url;

        if (modelUrl) {
            return modelUrl;
        } else {
            console.error("Unexpected API response structure:", result);
            throw new Error("API response did not contain a valid model URL.");
        }
    } catch (error) {
        console.error("Error generating 3D model:", error);
        throw new Error(error instanceof Error ? `Failed to generate 3D model: ${error.message}` : "An unknown error occurred.");
    }
};
