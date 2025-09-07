import React, { useState } from 'react';
import { Wand2, RotateCcw, RefreshCw, Download } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './Buttons';
import { ViewKey, IndividualViews } from '../types';
import { downloadViewsAsZip } from '../utils/zipUtils';


const ViewLoader = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-transparent border-t-[#007AFF]"></div>
    </div>
);

const ViewBox: React.FC<{
    viewKey: ViewKey;
    imgSrc: string | null;
    altText: string;
    isRegenerating: boolean;
    canRegenerate: boolean;
    onRegenerate: () => void;
    className?: string;
}> = ({ viewKey, imgSrc, altText, isRegenerating, canRegenerate, onRegenerate, className = '' }) => (
    <div className={`relative group overflow-hidden rounded-lg border border-[#EAEAEA] bg-white shadow-sm aspect-square ${className}`}>
        {imgSrc ? (
            <img
                src={imgSrc}
                alt={altText}
                className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
        ) : (
            <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">Loading...</div>
        )}
        {isRegenerating && <ViewLoader />}
        {canRegenerate && (
            <button
                onClick={onRegenerate}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white z-20"
                aria-label={`Regenerate ${altText}`}
            >
                <RefreshCw className="h-4 w-4" />
            </button>
        )}
    </div>
);

export const ConfirmViewsState: React.FC<{
    generatedViews: IndividualViews;
    onConfirm: () => void;
    onStartOver: () => void;
    onRegenerateSingleView: (view: Exclude<ViewKey, 'front'>) => Promise<void>;
}> = ({ generatedViews, onConfirm, onStartOver, onRegenerateSingleView }) => {
    const [regeneratingView, setRegeneratingView] = useState<Exclude<ViewKey, 'front'> | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleRegenerate = async (view: Exclude<ViewKey, 'front'>) => {
        setRegeneratingView(view);
        try {
            await onRegenerateSingleView(view);
        } catch (error) {
            console.error(`Failed to regenerate ${view} view:`, error);
        } finally {
            setRegeneratingView(null);
        }
    };
    
    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await downloadViewsAsZip(generatedViews, 'product_views.zip');
        } catch (error) {
            console.error("Failed to download views:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    const canConfirm = generatedViews.front && generatedViews.back && generatedViews.left && generatedViews.right;
    const isBusy = !!regeneratingView || isDownloading;

    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1D1D1F]">Views Generated</h1>
            <p className="mt-2 text-lg text-[#86868B]">Review the views before creating the 3D model. Regenerate any view if needed.</p>
            <div className="mt-8 text-left">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                        <p className="mb-1 text-sm font-semibold text-gray-600">Front</p>
                        <ViewBox viewKey="front" imgSrc={generatedViews.front} altText="Front View" isRegenerating={false} canRegenerate={false} onRegenerate={() => {}} />
                    </div>
                     <div>
                        <p className="mb-1 text-sm font-semibold text-gray-600">Back</p>
                        <ViewBox viewKey="back" imgSrc={generatedViews.back} altText="Back View" isRegenerating={regeneratingView === 'back'} canRegenerate={!regeneratingView} onRegenerate={() => handleRegenerate('back')} />
                    </div>
                     <div>
                        <p className="mb-1 text-sm font-semibold text-gray-600">Left</p>
                        <ViewBox viewKey="left" imgSrc={generatedViews.left} altText="Left View" isRegenerating={regeneratingView === 'left'} canRegenerate={!regeneratingView} onRegenerate={() => handleRegenerate('left')} />
                    </div>
                     <div>
                        <p className="mb-1 text-sm font-semibold text-gray-600">Right</p>
                        <ViewBox viewKey="right" imgSrc={generatedViews.right} altText="Right View" isRegenerating={regeneratingView === 'right'} canRegenerate={!regeneratingView} onRegenerate={() => handleRegenerate('right')} />
                    </div>
                </div>
            </div>
            <div className="mt-6 space-y-3">
                <PrimaryButton onClick={onConfirm} disabled={isBusy || !canConfirm}>
                    <Wand2 className="h-5 w-5" />
                    {regeneratingView ? 'Regenerating...' : 'Configure 3D Model'}
                </PrimaryButton>
                <div className="grid grid-cols-2 gap-3">
                    <SecondaryButton onClick={handleDownload} disabled={isBusy || !canConfirm}>
                        <Download className="h-5 w-5" />
                        {isDownloading ? 'Downloading...' : 'Download Views'}
                    </SecondaryButton>
                    <SecondaryButton onClick={onStartOver} disabled={isBusy}>
                        <RotateCcw className="h-5 w-5" />
                        Start Over
                    </SecondaryButton>
                </div>
            </div>
        </div>
    );
};

export default ConfirmViewsState;