import React, { useState } from 'react';
import { UploadCloud, Image, Grid, Box } from 'lucide-react';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-[#007AFF]">
            {icon}
        </div>
        <h3 className="mt-5 text-lg font-semibold text-[#1D1D1F]">{title}</h3>
        <p className="mt-2 text-base text-gray-600">{children}</p>
    </div>
);


export const UploadState: React.FC<{ onImageUpload: (file: File) => void }> = ({ onImageUpload }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageUpload(e.dataTransfer.files[0]);
        }
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageUpload(e.target.files[0]);
        }
    };

    return (
        <div className="space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-[#1D1D1F] tracking-tight sm:text-5xl">SingleShot3D</h1>
                <p className="mt-3 text-lg text-[#86868B] max-w-2xl mx-auto">An intelligent tool that transforms a product photo into a 3D model, powered by a novel single-call generation pipeline.</p>
            </div>
            
            <div className="text-center">
                 <label
                    className={`group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-16 transition-all duration-300 ${
                        isDragging ? 'border-[#007AFF] bg-blue-50 scale-105' : 'hover:border-gray-400'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <UploadCloud
                        className={`h-12 w-12 text-gray-400 transition-colors group-hover:text-[#007AFF] ${isDragging ? 'text-[#007AFF]' : ''}`}
                        strokeWidth={1.5}
                    />
                    <p className="mt-4 text-lg text-[#1D1D1F]">
                        <span className="font-semibold text-[#007AFF]">Click to upload</span> or drag and drop an image
                    </p>
                    <p className="text-sm text-[#86868B]">PNG, JPG, or WEBP</p>
                    <input type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                </label>
            </div>

            <div className="pt-8 border-t border-gray-200">
                <h2 className="text-center text-2xl font-bold text-[#1D1D1F] mb-10">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
                     <FeatureCard icon={<Image size={24} />} title="1. Upload an Image">
                        The model isolates your product from any background, props, or people.
                    </FeatureCard>
                     <FeatureCard icon={<Grid size={24} />} title="2. Generate Views">
                        Nano Banana creates a consistent 2x2 grid from a single prompt.
                    </FeatureCard>
                     <FeatureCard icon={<Box size={24} />} title="3. Create 3D Model">
                        The app splits the grid and feeds the views into your choice of advanced 3D engines.
                    </FeatureCard>
                </div>
            </div>
        </div>
    );
};

export default UploadState;

