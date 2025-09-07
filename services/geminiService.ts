import { GoogleGenAI, Modality, Part } from "@google/genai";
import {
    FRONT_VIEW_PROMPT,
    FRONT_VIEW_CLAY_PROMPT,
    BACK_VIEW_PROMPT,
    LEFT_VIEW_PROMPT,
    RIGHT_VIEW_PROMPT,
    RIGHT_VIEW_PROMPT_WITH_LEFT_CONTEXT,
    getRegenerateGridPrompt
} from '../constants';

// IMPORTANT: For security, it's best to manage API keys on a server.
// This key is accessed from environment variables for this example.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });


// === Helper Functions ===

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return { inlineData: { data: base64EncodedData, mimeType: file.type } };
};

const dataUrlToGenerativePart = (dataUrl: string): Part => {
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    return { inlineData: { data: base64Data, mimeType } };
};

// Generic function to call the Gemini API and extract the image result
const generateImageFromApi = async (prompt: string, imageParts: Part[]): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [{ text: prompt }, ...imageParts] },
            // Config ensures we get an image back.
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
        });

        const parts = response.candidates?.[0]?.content?.parts;

        if (!parts) {
            throw new Error("Invalid API response: No content parts found.");
        }

        // Find the first image part in the response
        for (const part of parts) {
            if (part && 'inlineData' in part && part.inlineData) {
                const { mimeType, data } = part.inlineData;
                return `data:${mimeType};base64,${data}`;
            }
        }
        
        // If no image part is found, construct an error message from any text parts.
        const textResponse = parts.map(part => part.text).filter(Boolean).join(' ') || "No text response.";
        console.error("API Response did not contain an image:", textResponse);
        throw new Error(`No image found in API response. Model said: "${textResponse}"`);

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
};


// === Exported Service Functions ===

/**
 * "Fast & Simple" mode: Generates the 2x2 grid in a single call.
 */
export const generateOrthographicViews = async (userImageFile: File, prompt: string): Promise<string> => {
    try {
        const userImagePart = await fileToGenerativePart(userImageFile);
        return await generateImageFromApi(prompt, [userImagePart]);
    } catch (error) {
        throw new Error(`Failed to generate grid view: ${error instanceof Error ? error.message : String(error)}`);
    }
};

/**
 * "High Quality" mode, Step 1: Generate only the front view.
 */
export const generateFrontView = async (userImageFile: File, style: 'realistic' | 'clay'): Promise<string> => {
    try {
        const userImagePart = await fileToGenerativePart(userImageFile);
        const prompt = style === 'clay' ? FRONT_VIEW_CLAY_PROMPT : FRONT_VIEW_PROMPT;
        return await generateImageFromApi(prompt, [userImagePart]);
    } catch (error) {
        throw new Error(`Failed to generate front view: ${error instanceof Error ? error.message : String(error)}`);
    }
};

/**
 * "High Quality" mode, Step 2: Generate remaining views using the front view for consistency.
 */
export const generateRemainingViews = async (userImageFile: File, frontViewDataUrl: string): Promise<{ back: string; left: string; right: string; }> => {
    try {
        const userImagePart = await fileToGenerativePart(userImageFile);
        const frontViewPart = dataUrlToGenerativePart(frontViewDataUrl);
        
        // Pass both the original image and the clean front view for maximum context
        const imagePartsForConsistency = [userImagePart, frontViewPart];

        // Generate back and left views in parallel
        const [back, left] = await Promise.all([
            generateImageFromApi(BACK_VIEW_PROMPT, imagePartsForConsistency),
            generateImageFromApi(LEFT_VIEW_PROMPT, imagePartsForConsistency),
        ]);

        // Now generate the right view, providing the left view for context
        const leftViewPart = dataUrlToGenerativePart(left);
        const imagePartsForRightView = [...imagePartsForConsistency, leftViewPart];
        const right = await generateImageFromApi(RIGHT_VIEW_PROMPT_WITH_LEFT_CONTEXT, imagePartsForRightView);

        return { back, left, right };
    } catch (error) {
        throw new Error(`Failed to generate remaining views: ${error instanceof Error ? error.message : String(error)}`);
    }
};

/**
 * "High Quality" mode: Regenerate a single view.
 */
export const generateSingleView = async (
    viewToGenerate: 'back' | 'left' | 'right',
    userImageFile: File,
    frontViewDataUrl: string,
    leftViewDataUrl?: string
): Promise<string> => {
    try {
        const userImagePart = await fileToGenerativePart(userImageFile);
        const frontViewPart = dataUrlToGenerativePart(frontViewDataUrl);
        const baseImageParts = [userImagePart, frontViewPart];

        let prompt: string;
        let finalImageParts: Part[];

        if (viewToGenerate === 'right' && leftViewDataUrl) {
            prompt = RIGHT_VIEW_PROMPT_WITH_LEFT_CONTEXT;
            const leftViewPart = dataUrlToGenerativePart(leftViewDataUrl);
            finalImageParts = [...baseImageParts, leftViewPart];
        } else {
            finalImageParts = baseImageParts;
            switch (viewToGenerate) {
                case 'back': prompt = BACK_VIEW_PROMPT; break;
                case 'left': prompt = LEFT_VIEW_PROMPT; break;
                case 'right': prompt = RIGHT_VIEW_PROMPT; break; // Fallback if no left view
            }
        }

        return await generateImageFromApi(prompt, finalImageParts);
    } catch (error) {
        throw new Error(`Failed to generate ${viewToGenerate} view: ${error instanceof Error ? error.message : String(error)}`);
    }
};

/**
 * "Fast & Simple" mode: Regenerate a single quadrant of the grid view.
 */
export const regenerateGridViewQuadrant = async (
    userImageFile: File,
    currentGridViewDataUrl: string,
    viewToRegenerate: 'back' | 'left' | 'right'
): Promise<string> => {
    try {
        const userImagePart = await fileToGenerativePart(userImageFile);
        const currentGridPart = dataUrlToGenerativePart(currentGridViewDataUrl);
        const prompt = getRegenerateGridPrompt(viewToRegenerate);

        return await generateImageFromApi(prompt, [userImagePart, currentGridPart]);
    } catch (error) {
        throw new Error(`Failed to regenerate ${viewToRegenerate} view in grid: ${error instanceof Error ? error.message : String(error)}`);
    }
};