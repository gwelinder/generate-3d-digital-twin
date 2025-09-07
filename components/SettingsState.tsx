import React, { useState, useMemo } from 'react';
import { PrimaryButton } from './Buttons';
import { Wand2 } from 'lucide-react';
import { GenerationSettings } from '../types';

interface SettingsStateProps {
    onStartGeneration: (settings: Pick<GenerationSettings, 'viewMethod' | 'style'>) => void;
    uploadedImage: File;
    initialSettings: Partial<GenerationSettings>;
}

type SettingKey = 'viewMethod' | 'style';

const options = {
    viewMethod: [
        { id: 'grid', label: 'Fast & Simple', description: 'Generates a 2x2 grid in one step. Faster, good results.' },
        { id: 'individual', label: 'High Quality', description: 'Generates 4 separate views. Slower, best quality.' },
    ],
    style: [
        { id: 'realistic', label: 'Realistic', description: 'A full-color, realistic image generation.' },
        { id: 'clay', label: 'Matte Clay', description: 'A 3D-scannable, non-reflective gray model.' },
    ],
};

const SettingsState: React.FC<SettingsStateProps> = ({ onStartGeneration, uploadedImage, initialSettings }) => {
    const [settings, setSettings] = useState({
        viewMethod: initialSettings?.viewMethod || 'grid',
        style: initialSettings?.style || 'realistic',
    });

    const imageUrl = useMemo(() => URL.createObjectURL(uploadedImage), [uploadedImage]);

    const handleSettingChange = (key: SettingKey, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value as any }));
    };

    const handleGenerateClick = () => {
        onStartGeneration(settings);
    };

    const OptionGroup = ({ title, settingKey, selectedValue, disabled = false }: { title: string, settingKey: SettingKey, selectedValue: string, disabled?: boolean }) => (
        <div className={disabled ? 'opacity-50' : ''}>
            <h3 className="text-lg font-semibold text-[#1D1D1F]">{title}</h3>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options[settingKey].map(option => (
                    <button
                        key={option.id}
                        onClick={() => !disabled && handleSettingChange(settingKey, option.id)}
                        disabled={disabled}
                        className={`text-left rounded-lg border p-3 transition-all ${
                            selectedValue === option.id
                                ? 'border-[#007AFF] bg-blue-50 ring-2 ring-[#007AFF]'
                                : 'border-[#EAEAEA] bg-white hover:border-gray-400'
                        } ${disabled ? 'cursor-not-allowed bg-gray-50' : ''}`}
                    >
                        <p className="font-semibold text-[#1D1D1F]">{option.label}</p>
                        <p className="text-sm text-[#86868B]">{option.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1D1D1F]">Generation Options</h1>
            <p className="mt-2 text-lg text-[#86868B]">Choose your settings for the 2D views.</p>
            <img src={imageUrl} alt="Uploaded product" className="mx-auto my-6 max-h-40 w-auto rounded-lg shadow-md" />

            <div className="space-y-6 text-left">
                <OptionGroup title="View Generation" settingKey="viewMethod" selectedValue={settings.viewMethod} />
                <OptionGroup title="Image Style" settingKey="style" selectedValue={settings.style} />
            </div>

            <div className="mt-8">
                <PrimaryButton onClick={handleGenerateClick}>
                    <Wand2 className="h-5 w-5" />
                    Generate Views
                </PrimaryButton>
            </div>
        </div>
    );
};

export default SettingsState;