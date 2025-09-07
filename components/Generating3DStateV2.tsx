import React from 'react';
import { motion, Variants } from 'framer-motion';
import { IndividualViews } from '../types';

const containerVariants: Variants = {
    initial: { rotate: 0, scale: 0.8 },
    animate: {
        rotate: 360,
        scale: 0.8,
        transition: {
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
        },
    },
};

const viewVariants: Variants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: (i: number) => ({
        opacity: 1,
        scale: 1,
        transition: {
            delay: i * 0.2,
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
            repeatDelay: 1.2,
            ease: 'easeInOut',
        },
    }),
};

export const Generating3DStateV2: React.FC<{
    generatedViews: IndividualViews;
    statusText: string;
    isTripo3D: boolean;
}> = ({ generatedViews, statusText, isTripo3D }) => {
    
    const viewsToAnimate = [
        generatedViews.front,
        generatedViews.back,
        generatedViews.left,
    ];

    if (isTripo3D) {
        viewsToAnimate.push(generatedViews.right);
    }

    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold text-[#1D1D1F]">Building 3D Model</h1>
            <p className="mt-2 text-base text-[#86868B]">Assembling views into a 3D mesh...</p>
            <div className="mt-8 flex items-center justify-center aspect-square w-full max-w-sm mx-auto">
                <motion.div
                    className="grid grid-cols-2 gap-4 w-full"
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                >
                    {viewsToAnimate.map((view, index) => (
                         <motion.div
                            key={index}
                            custom={index}
                            variants={viewVariants}
                            className="aspect-square overflow-hidden rounded-lg bg-white shadow-lg"
                         >
                            {view && <img src={view} alt={`View ${index + 1}`} className="w-full h-full object-cover" />}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
             <p className="mt-8 text-lg font-semibold text-[#1D1D1F] transition-all duration-300">{statusText}</p>
        </div>
    );
};

export default Generating3DStateV2;