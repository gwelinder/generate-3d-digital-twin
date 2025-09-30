import React, { useState, useCallback, useEffect } from 'react';
import { AppState, GenerationSettings, ViewKey, IndividualViews } from './types';
import { generateFrontView, generateRemainingViews, generateOrthographicViews, generateSingleView, regenerateGridViewQuadrant } from './services/geminiService';
import { generate3DModel } from './services/falService';

import UploadState from './components/UploadState';
import SettingsState from './components/SettingsState';
import GeneratingViewsStateV2 from './components/GeneratingViewsStateV2';
import ConfirmFrontViewState from './components/ConfirmFrontViewState';
import ConfirmViewsState from './components/ConfirmViewsState';
import GenerationFailedState from './components/GenerationFailedState';
import Generating3DStateV2 from './components/Generating3DStateV2';
import ViewerState from './components/ViewerState';
import Settings3DState from './components/Settings3DState';
import { GRID_VIEW_PROMPT, CLAY_GRID_VIEW_PROMPT } from './constants';

// Helper to split the grid into 4 images
const cropGridToIndividualViews = async (gridImageUrl: string): Promise<IndividualViews> => {
    const img = new Image();
    img.src = gridImageUrl;
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });

    const cropQuadrant = (index: number): string => {
        const canvas = document.createElement('canvas');
        const quadWidth = img.width / 2;
        const quadHeight = img.height / 2;
        canvas.width = quadWidth;
        canvas.height = quadHeight;
        const ctx = canvas.getContext('2d')!;
        const sx = (index % 2) * quadWidth;
        const sy = Math.floor(index / 2) * quadHeight;
        ctx.drawImage(img, sx, sy, quadWidth, quadHeight, 0, 0, quadWidth, quadHeight);
        return canvas.toDataURL('image/png');
    };

    return {
        front: cropQuadrant(0),
        back: cropQuadrant(1),
        left: cropQuadrant(2),
        right: cropQuadrant(3),
    };
};

// === Main App Component ===
export default function App() {
    const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [generatedViewImages, setGeneratedViewImages] = useState<IndividualViews | null>(null);
    const [gridImageUrl, setGridImageUrl] = useState<string | null>(null); // For grid regeneration
    const [modelUrl, setModelUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [statusText, setStatusText] = useState('');
    const [settings, setSettings] = useState<Partial<GenerationSettings>>({});
    const [lastFailedStep, setLastFailedStep] = useState<'views' | '3d' | null>(null);


    // Create a blob URL for the uploaded image
    useEffect(() => {
        if (!uploadedImage) {
            setUploadedImageUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(uploadedImage);
        setUploadedImageUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [uploadedImage]);
    
    const startOver = useCallback(() => {
        setAppState(AppState.UPLOAD);
        setUploadedImage(null);
        setGeneratedViewImages(null);
        setGridImageUrl(null);
        setModelUrl(null);
        setError(null);
        setStatusText('');
        setSettings({});
        setLastFailedStep(null);
    }, []);

    const handleImageUpload = useCallback((file: File) => {
        setUploadedImage(file);
        setAppState(AppState.SETTINGS);
        setError(null);
    }, []);

    const handleStartViewGeneration = useCallback(async (viewSettings: Pick<GenerationSettings, 'viewMethod' | 'style'>) => {
        if (!uploadedImage) return;
        
        const newSettings = { ...settings, ...viewSettings };
        setSettings(newSettings);
        setError(null);
        setGeneratedViewImages(null);
        setGridImageUrl(null);

        if (newSettings.viewMethod === 'grid') {
            setAppState(AppState.GENERATING_GRID_VIEW);
            setStatusText("Generating 2x2 grid...");
            try {
                const prompt = newSettings.style === 'clay' ? CLAY_GRID_VIEW_PROMPT : GRID_VIEW_PROMPT;
                const resultImage = await generateOrthographicViews(uploadedImage, prompt);
                setGridImageUrl(resultImage); // Save the master grid image
                const individualViews = await cropGridToIndividualViews(resultImage);
                setGeneratedViewImages(individualViews);
                setAppState(AppState.CONFIRM_VIEWS);
            } catch (e) {
                setLastFailedStep('views');
                setError(e instanceof Error ? e.message : "Failed to generate grid view.");
                setAppState(AppState.GENERATION_FAILED);
            }
        } else {
            setAppState(AppState.GENERATING_FRONT_VIEW);
            setStatusText("Generating front view...");
            try {
                const frontView = await generateFrontView(uploadedImage, newSettings.style!);
                setGeneratedViewImages({ front: frontView, back: null, left: null, right: null });
                setAppState(AppState.CONFIRM_FRONT_VIEW);
            } catch (e) {
                setLastFailedStep('views');
                setError(e instanceof Error ? e.message : "Failed to generate front view.");
                setAppState(AppState.GENERATION_FAILED);
            }
        }
    }, [uploadedImage, settings]);
    
    const handleConfirmFrontView = useCallback(async () => {
        if (!uploadedImage || !generatedViewImages?.front) return;
        
        setAppState(AppState.GENERATING_REMAINING_VIEWS);
        setStatusText("Generating remaining views...");
        try {
            const remaining = await generateRemainingViews(uploadedImage, generatedViewImages.front);
            setGeneratedViewImages(prev => ({ ...(prev as IndividualViews), ...remaining }));
            setAppState(AppState.CONFIRM_VIEWS);
        } catch (e) {
            setLastFailedStep('views');
            setError(e instanceof Error ? e.message : "Failed to generate remaining views.");
            setAppState(AppState.GENERATION_FAILED);
        }
    }, [uploadedImage, generatedViewImages]);

    const handleRegenerateSingleView = useCallback(async (view: Exclude<ViewKey, 'front'>) => {
        if (!uploadedImage) {
            throw new Error("Cannot regenerate view without the original uploaded image.");
        }

        if (settings.viewMethod === 'grid') {
            if (!gridImageUrl) {
                throw new Error("Cannot regenerate grid view without the current grid image.");
            }
            try {
                const newGridUrl = await regenerateGridViewQuadrant(uploadedImage, gridImageUrl, view);
                setGridImageUrl(newGridUrl);
                const newIndividualViews = await cropGridToIndividualViews(newGridUrl);
                setGeneratedViewImages(newIndividualViews);
            } catch (e) {
                console.error(`Error regenerating ${view} view in grid:`, e);
                throw e;
            }
        } else { // 'individual' mode
            if (!generatedViewImages?.front) {
                throw new Error("Cannot regenerate view without a valid front view.");
            }
            try {
                 const newViewUrl = await generateSingleView(
                    view,
                    uploadedImage,
                    generatedViewImages.front,
                    // Provide the left view as context when regenerating the right view
                    view === 'right' ? generatedViewImages.left ?? undefined : undefined
                );
                setGeneratedViewImages(prev => ({
                    ...(prev as IndividualViews),
                    [view]: newViewUrl,
                }));
            } catch (e) {
                console.error(`Error regenerating ${view} view:`, e);
                throw e;
            }
        }
    }, [uploadedImage, generatedViewImages, settings.viewMethod, gridImageUrl]);

    const handleProceedTo3DSettings = useCallback(async () => {
        if (!generatedViewImages) return;
        setAppState(AppState.SETTINGS_3D);
    }, [generatedViewImages]);

    const handleStart3DGeneration = useCallback(async (settings3d: Omit<GenerationSettings, 'viewMethod' | 'style'>) => {
        if (!generatedViewImages || !generatedViewImages.front || !generatedViewImages.back || !generatedViewImages.left || !generatedViewImages.right) {
            setError("All four views are required to generate a 3D model.");
            return;
        };

        const fullSettings = { ...settings, ...settings3d } as GenerationSettings;
        setSettings(fullSettings);

        setAppState(AppState.GENERATING_3D);
        setStatusText("Building 3D mesh...");
        try {
            const newModelUrl = await generate3DModel({
                front: generatedViewImages.front,
                back: generatedViewImages.back,
                left: generatedViewImages.left,
                right: generatedViewImages.right,
            }, fullSettings);
            setModelUrl(newModelUrl);
            setAppState(AppState.VIEWER);
        } catch (e) {
            setLastFailedStep('3d');
            setError(e instanceof Error ? e.message : "An unknown error occurred during 3D generation.");
            setAppState(AppState.GENERATION_FAILED);
        }
    }, [generatedViewImages, settings]);

    const handleRetryGeneration = useCallback(() => {
        if (settings.viewMethod && settings.style) {
            setError(null);
            handleStartViewGeneration({ viewMethod: settings.viewMethod, style: settings.style });
        }
    }, [settings, handleStartViewGeneration]);
    
    const handleReconfigure = useCallback(() => {
        setAppState(AppState.SETTINGS_3D);
        setModelUrl(null); 
        setError(null);
    }, []);

    const handleRetry3D = useCallback(() => {
        setError(null);
        setAppState(AppState.SETTINGS_3D);
    }, []);
    
    const handleBackToViews = useCallback(() => {
        setAppState(AppState.CONFIRM_VIEWS);
    }, []);

    const renderContent = () => {
        switch (appState) {
            case AppState.UPLOAD:
                return <UploadState onImageUpload={handleImageUpload} />;
            case AppState.SETTINGS:
                return uploadedImage && <SettingsState uploadedImage={uploadedImage} onStartGeneration={handleStartViewGeneration} initialSettings={settings} />;
            case AppState.GENERATING_GRID_VIEW:
                 return uploadedImageUrl && <GeneratingViewsStateV2 imageSrc={uploadedImageUrl} statusText={statusText} />;
            case AppState.GENERATING_FRONT_VIEW:
                return uploadedImageUrl && <GeneratingViewsStateV2 imageSrc={uploadedImageUrl} statusText={statusText} />;
            case AppState.GENERATING_REMAINING_VIEWS:
                return generatedViewImages?.front && <GeneratingViewsStateV2 imageSrc={generatedViewImages.front} statusText={statusText} />;
            case AppState.CONFIRM_FRONT_VIEW:
                return generatedViewImages?.front && (
                    <ConfirmFrontViewState frontViewImage={generatedViewImages.front} onConfirm={handleConfirmFrontView} onRetry={handleRetryGeneration} />
                );
            case AppState.GENERATION_FAILED:
                const retryAction = lastFailedStep === '3d' ? handleRetry3D : handleRetryGeneration;
                return <GenerationFailedState onRetry={retryAction} onStartOver={startOver} message={error ?? undefined} />;
            case AppState.CONFIRM_VIEWS:
                return generatedViewImages && settings.viewMethod && (
                    <ConfirmViewsState 
                        generatedViews={generatedViewImages} 
                        onConfirm={handleProceedTo3DSettings} 
                        onStartOver={startOver} 
                        onRegenerateSingleView={handleRegenerateSingleView} 
                    />
                );
            case AppState.SETTINGS_3D:
                 return generatedViewImages && (
                    <Settings3DState
                        generatedViews={generatedViewImages}
                        onStartGeneration={handleStart3DGeneration}
                        onBack={handleBackToViews}
                        initialSettings={settings}
                    />
                );
            case AppState.GENERATING_3D:
                return generatedViewImages && <Generating3DStateV2 generatedViews={generatedViewImages} statusText={statusText} isTripo3D={settings?.engine === 'tripo3d'} />;
            case AppState.VIEWER:
                return modelUrl && generatedViewImages && <ViewerState modelUrl={modelUrl} generatedViews={generatedViewImages} onStartOver={startOver} onReconfigure={handleReconfigure} />;
            default:
                return <UploadState onImageUpload={handleImageUpload} />;
        }
    };
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] p-4 sm:p-6 lg:p-8">
            <main className="w-full max-w-2xl">
                 {error && appState !== AppState.GENERATION_FAILED && (
                    <div className="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700" role="alert">
                        <span className="font-medium">Error:</span> {error}
                    </div>
                )}
                <div className="rounded-2xl bg-white p-6 sm:p-10 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
