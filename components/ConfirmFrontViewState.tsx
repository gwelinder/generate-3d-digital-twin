import React from 'react';
import { PrimaryButton, SecondaryButton } from './Buttons'
import { Check, RefreshCw } from 'lucide-react';

interface ConfirmFrontViewStateProps {
    frontViewImage: string;
    onConfirm: () => void;
    onRetry: () => void;
}

const ConfirmFrontViewState: React.FC<ConfirmFrontViewStateProps> = ({ frontViewImage, onConfirm, onRetry }) => {
    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1D1D1F]">Confirm Front View</h1>
            <p className="mt-2 text-lg text-[#86868B]">Does this look right? We'll use this view to generate the others consistently.</p>
            <div className="mt-8 aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg border border-[#EAEAEA] bg-white shadow-sm">
                <img src={frontViewImage} alt="Generated front view" className="w-full h-full object-cover" />
            </div>
            <div className="mt-8 space-y-3">
                <PrimaryButton onClick={onConfirm}>
                    <Check className="h-5 w-5" />
                    Looks Good, Generate Others
                </PrimaryButton>
                <SecondaryButton onClick={onRetry}>
                    <RefreshCw className="h-5 w-5" />
                    Retry Front View
                </SecondaryButton>
            </div>
        </div>
    );
};

export default ConfirmFrontViewState;
