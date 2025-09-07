import React, { useState, useMemo } from 'react';
import { PrimaryButton, SecondaryButton } from './Buttons';
import { KeyRound, Wand2, ArrowLeft } from 'lucide-react';
import { GenerationSettings, IndividualViews } from '../types';

interface Settings3DStateProps {
    onStartGeneration: (settings: Omit<GenerationSettings, 'viewMethod' | 'style'>) => void;
    onBack: () => void;
    generatedViews: IndividualViews;
    initialSettings: Partial<GenerationSettings>;
}

type SettingKey = 'texture' | 'engine' | 'tripoTexture';

const options = {
    texture: [
        { id: 'non-textured', label: 'No Texture', description: 'A clean, white model.' },
        { id: 'textured', label: 'Textured', description: 'A full-color, realistic model.' },
    ],
    tripoTexture: [
        { id: 'no', label: 'No Texture', description: 'A clean, white model.' },
        { id: 'standard', label: 'Standard', description: 'Standard quality texture map.' },
        { id: 'HD', label: 'HD', description: 'High-definition 2k texture map.' },
    ],
    engine: [
        { id: 'turbo', label: 'Hunyuan Turbo', description: 'Faster generation speed.' },
        { id: 'standard', label: 'Hunyuan Standard', description: 'Highest quality generation.' },
        { id: 'tripo3d', label: 'Tripo3D', description: 'Premium quality, uses 4 views.' },
    ],
};

const Settings3DState: React.FC<Settings3DStateProps> = ({ onStartGeneration, onBack, generatedViews, initialSettings }) => {
    const [settings, setSettings] = useState({
        texture: initialSettings?.texture || 'textured',
        engine: initialSettings?.engine || 'turbo',
        tripoTexture: initialSettings?.tripoTexture || 'standard',
        enablePbr: initialSettings?.enablePbr || false,
        quadMeshing: initialSettings?.quadMeshing || false,
    });
    const [apiKey, setApiKey] = useState(initialSettings?.falApiKey || '');

    const handleSettingChange = (key: SettingKey, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value as any }));
    };

    const handleToggleChange = (key: 'enablePbr' | 'quadMeshing') => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleGenerateClick = () => {
        if (!apiKey.trim()) {
            alert('Please enter your Fal.ai API Key.');
            return;
        }
        onStartGeneration({ ...settings, falApiKey: apiKey });
    };
    
    const cost = useMemo(() => {
        if (settings.engine === 'tripo3d') {
            let baseCost = 0.10; // Base Tripo cost assumption
            if(settings.tripoTexture === 'standard') baseCost += 0.05;
            if(settings.tripoTexture === 'HD') baseCost += 0.10;
            if (settings.quadMeshing) baseCost += 0.05;
            return baseCost;
        } else { // Hunyuan
            const isTextured = settings.texture === 'textured';
            const isStandard = settings.engine === 'standard';
            if (isStandard) return isTextured ? 0.051 : 0.017;
            return isTextured ? 0.045 : 0.015; // Turbo
        }
    }, [settings]);

    const OptionGroup = ({ title, settingKey, selectedValue }: { title: string, settingKey: SettingKey, selectedValue: string }) => (
        <div>
            <h3 className="text-lg font-semibold text-[#1D1D1F]">{title}</h3>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options[settingKey].map(option => (
                    <button
                        key={option.id}
                        onClick={() => handleSettingChange(settingKey, option.id)}
                        className={`text-left rounded-lg border p-3 transition-all ${
                            selectedValue === option.id
                                ? 'border-[#007AFF] bg-blue-50 ring-2 ring-[#007AFF]'
                                : 'border-[#EAEAEA] bg-white hover:border-gray-400'
                        }`}
                    >
                        <p className="font-semibold text-[#1D1D1F]">{option.label}</p>
                        <p className="text-sm text-[#86868B]">{option.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
    
    const ToggleOption = ({ title, description, checked, onChange }: { title: string, description: string, checked: boolean, onChange: () => void }) => (
         <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
            <div>
                <h4 className="font-semibold text-[#1D1D1F]">{title}</h4>
                <p className="text-sm text-[#86868B]">{description}</p>
            </div>
            <button
                role="switch"
                aria-checked={checked}
                onClick={onChange}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-2 ${
                    checked ? 'bg-[#007AFF]' : 'bg-gray-200'
                }`}
            >
                <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
            </button>
        </div>
    );

    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1D1D1F]">3D Model Settings</h1>
            <p className="mt-2 text-lg text-[#86868B]">Configure the final 3D asset.</p>
            
            <div className="my-6 grid grid-cols-4 gap-2">
                {generatedViews.front && <img src={generatedViews.front} alt="Front View" className="aspect-square w-full rounded-md object-cover shadow-sm" />}
                {generatedViews.back && <img src={generatedViews.back} alt="Back View" className="aspect-square w-full rounded-md object-cover shadow-sm" />}
                {generatedViews.left && <img src={generatedViews.left} alt="Left View" className="aspect-square w-full rounded-md object-cover shadow-sm" />}
                {generatedViews.right && <img src={generatedViews.right} alt="Right View" className="aspect-square w-full rounded-md object-cover shadow-sm" />}
            </div>

            <div className="space-y-6 text-left">
                <OptionGroup title="3D Model Engine" settingKey="engine" selectedValue={settings.engine} />
                
                {settings.engine === 'tripo3d' ? (
                    <div className="space-y-4">
                        <OptionGroup title="Texture Quality" settingKey="tripoTexture" selectedValue={settings.tripoTexture} />
                        <ToggleOption title="Enable PBR" description="Generate Physically-Based Rendering maps." checked={settings.enablePbr} onChange={() => handleToggleChange('enablePbr')} />
                        <ToggleOption title="Quad Meshing" description="Enable quad mesh output (results in .fbx file)." checked={settings.quadMeshing} onChange={() => handleToggleChange('quadMeshing')} />
                    </div>
                ) : (
                    <OptionGroup title="3D Model Texture" settingKey="texture" selectedValue={settings.texture} />
                )}
            </div>

            <div className="mt-6 text-left">
                <h3 className="text-lg font-semibold text-[#1D1D1F]">API Key</h3>
                <div className="relative mt-2">
                    <KeyRound className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Fal.ai Key..."
                        className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-[#1D1D1F] focus:border-[#007AFF] focus:ring-[#007AFF]"
                    />
                </div>
            </div>

            <div className="mt-8 rounded-lg bg-gray-50 border border-gray-200 p-4 flex justify-between items-center">
                 <p className="text-base text-[#86868B]">Estimated Cost:</p>
                 <p className="text-2xl font-bold text-[#1D1D1F]">${cost.toFixed(3)}</p>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SecondaryButton onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                    Back to Views
                </SecondaryButton>
                <PrimaryButton onClick={handleGenerateClick} disabled={!apiKey.trim()}>
                    <Wand2 className="h-5 w-5" />
                    Create 3D Model
                </PrimaryButton>
            </div>
        </div>
    );
};

export default Settings3DState;