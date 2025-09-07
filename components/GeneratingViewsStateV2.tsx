import React from 'react';
import { motion } from 'framer-motion';

export const GeneratingViewsStateV2: React.FC<{ imageSrc: string; statusText: string }> = ({ imageSrc, statusText }) => {
    if (!imageSrc) return null;

    return (
        <div className="text-center">
            <motion.div
                className="relative mx-auto mb-6 w-full max-w-sm aspect-square overflow-hidden rounded-xl shadow-lg"
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            >
                <img src={imageSrc} alt="Generating views from" className="w-full h-full object-contain" />
                <div className="absolute top-0 left-0 h-full w-full">
                    {/* The scanning line effect */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-white/40 shadow-[0_0_15px_5px_rgba(255,255,255,0.7)] animate-[scan-effect_2s_ease-in-out_infinite]"></div>
                </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-[#1D1D1F]">Generating Views</h1>
            <p className="mt-2 text-base text-[#86868B] transition-all duration-300">{statusText}</p>
        </div>
    );
};

export default GeneratingViewsStateV2;