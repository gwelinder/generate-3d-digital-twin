export enum AppState {
    UPLOAD,
    SETTINGS, // This will now be for 2D settings
    GENERATING_FRONT_VIEW,
    CONFIRM_FRONT_VIEW,
    GENERATING_REMAINING_VIEWS,
    GENERATING_GRID_VIEW,
    GENERATION_FAILED,
    CONFIRM_VIEWS,
    SETTINGS_3D, // New state for 3D settings
    GENERATING_3D,
    VIEWER
}

export interface GenerationSettings {
    // 2D Settings
    viewMethod: 'grid' | 'individual';
    style: 'realistic' | 'clay';
    
    // 3D Settings
    falApiKey: string;
    engine: 'turbo' | 'standard' | 'tripo3d';
    // Hunyuan specific
    texture: 'textured' | 'non-textured';
    // Tripo3D specific
    tripoTexture: 'no' | 'standard' | 'HD';
    enablePbr: boolean;
    quadMeshing: boolean;
}

export type ViewKey = 'front' | 'back' | 'left' | 'right';

export type IndividualViews = {
    front: string | null;
    back: string | null;
    left: string | null;
    right: string | null;
};