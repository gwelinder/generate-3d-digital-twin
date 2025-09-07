import React, { Suspense, useRef, useState } from 'react';
import { Download, RotateCcw, Settings, Sun, Moon, Package } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useFBX, Html, useProgress } from '@react-three/drei';
import { PrimaryButton, SecondaryButton } from './Buttons';
import { IndividualViews } from '../types';
import { downloadPackAsZip } from '../utils/zipUtils';

const Model = ({ url }: { url: string }) => {
    const isFbx = url.toLowerCase().endsWith('.fbx');
    // Conditionally load based on file type
    const model = isFbx ? useFBX(url) : useGLTF(url).scene;
    const ref = useRef(null);
    return <primitive object={model} ref={ref} scale={2.5} />;
};

const ViewerLoading: React.FC = () => {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="text-center">
                <div className="text-2xl font-bold text-[#1D1D1F]">{Math.round(progress)}%</div>
                <p className="text-xs text-[#86868B]">Loading Model</p>
            </div>
        </Html>
    );
};

export const ViewerState: React.FC<{ modelUrl: string; generatedViews: IndividualViews; onStartOver: () => void; onReconfigure: () => void }> = ({ modelUrl, generatedViews, onStartOver, onReconfigure }) => {
    const [ambientIntensity, setAmbientIntensity] = useState(0.5);
    const [directionalIntensity, setDirectionalIntensity] = useState(2);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPack = async () => {
        setIsDownloading(true);
        try {
            await downloadPackAsZip(generatedViews, modelUrl, 'product_pack.zip');
        } catch (error) {
            console.error("Failed to download package:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1D1D1F]">Your 3D Model is Ready</h1>
            <p className="mt-2 text-lg text-[#86868B]">Interact with your new digital twin.</p>
            <div className="mt-8 h-80 w-full rounded-lg border border-[#EAEAEA] bg-white shadow-sm cursor-grab active:cursor-grabbing relative">
                 <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                    <color attach="background" args={['#f5f5f7']} />
                    <ambientLight intensity={ambientIntensity} />
                    <directionalLight position={[10, 10, 5]} intensity={directionalIntensity} />
                    <Suspense fallback={<ViewerLoading />}>
                        <Model url={modelUrl} />
                    </Suspense>
                    <OrbitControls autoRotate enableZoom={true} />
                </Canvas>
                {/* Lighting Controls */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-md space-y-3">
                    <div className="flex items-center gap-3">
                        <Moon className="h-5 w-5 text-gray-600" />
                        <input
                            type="range"
                            min="0" max="3" step="0.1"
                            value={ambientIntensity}
                            onChange={(e) => setAmbientIntensity(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            aria-label="Ambient light intensity"
                        />
                    </div>
                     <div className="flex items-center gap-3">
                        <Sun className="h-5 w-5 text-gray-600" />
                        <input
                            type="range"
                            min="0" max="10" step="0.1"
                            value={directionalIntensity}
                            onChange={(e) => setDirectionalIntensity(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            aria-label="Directional light intensity"
                        />
                    </div>
                </div>
            </div>
            <div className="mt-8 space-y-3">
                <PrimaryButton onClick={handleDownloadPack} disabled={isDownloading}>
                    <Package className="h-5 w-5" />
                    {isDownloading ? 'Packaging...' : 'Download Full Pack'}
                </PrimaryButton>
                <div className="grid grid-cols-3 gap-3">
                    <SecondaryButton as="a" href={modelUrl} download={modelUrl.toLowerCase().endsWith('.fbx') ? "product_model.fbx" : "product_model.glb"}>
                        <Download className="h-5 w-5" />
                        Model Only
                    </SecondaryButton>
                    <SecondaryButton onClick={onReconfigure}>
                        <Settings className="h-5 w-5" />
                        Settings
                    </SecondaryButton>
                    <SecondaryButton onClick={onStartOver}>
                        <RotateCcw className="h-5 w-5" />
                        Another
                    </SecondaryButton>
                </div>
            </div>
        </div>
    );
};


export default ViewerState;