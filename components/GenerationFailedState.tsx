import React from 'react';
import { AlertTriangle, RotateCcw, Upload } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './Buttons';

export const GenerationFailedState: React.FC<{ onRetry: () => void; onStartOver: () => void; message?: string; }> = ({ onRetry, onStartOver, message }) => {
    
    const defaultMessage = "We couldn't complete the operation. Please try again with the same settings, or start over with a new image.";

    return (
        <div className="text-center">
            <div className="mx-auto w-fit rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-[#1D1D1F]">Generation Failed</h1>
            <p className="mt-2 text-base text-[#86868B]">
                {message || defaultMessage}
            </p>
            <div className="mt-8 space-y-3">
                <PrimaryButton onClick={onRetry}>
                    <RotateCcw className="h-5 w-5" />
                    Retry
                </PrimaryButton>
                <SecondaryButton onClick={onStartOver}>
                    <Upload className="h-5 w-5" />
                    Start Over
                </SecondaryButton>
            </div>
        </div>
    );
};

export default GenerationFailedState