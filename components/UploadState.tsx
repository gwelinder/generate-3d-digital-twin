import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';

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
        <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1D1D1F]">Create a Digital Twin of Your Product</h1>
            <p className="mt-2 text-lg text-[#86868B]">Start by uploading a single, clear image.</p>
            <label
                className={`mt-8 group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#EAEAEA] bg-white p-12 transition-colors ${
                    isDragging ? 'border-[#007AFF] bg-blue-50' : 'hover:border-[#007AFF] hover:bg-blue-50'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <UploadCloud
                    className={`h-12 w-12 text-[#86868B] transition-colors group-hover:text-[#007AFF] ${isDragging ? 'text-[#007AFF]' : ''}`}
                    strokeWidth={1.5}
                />
                <p className="mt-4 text-[#1D1D1F]">
                    <span className="font-semibold text-[#007AFF]">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-[#86868B]">PNG, JPG, or WEBP</p>
                <input type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
            </label>
        </div>
    );
};

export default UploadState