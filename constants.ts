export const GRID_VIEW_PROMPT = `You are a precise product visualization assistant. Your task is to generate a single, composite 2x2 grid image containing four orthographic views of the main product from the user's uploaded image.

Step 1: Isolate the Product
First, identify the single, primary product in the user's image. If multiple variants (e.g., colors) are present, choose only ONE to use consistently. Completely isolate this product from any models, people, backgrounds, or other distracting elements.

Step 2: Generate and Place Views
Using the isolated product, generate realistic, high-quality images to fill the four quadrants of a 2x2 grid. The product should be on a solid white background within each quadrant. The final output must be a single image file with the grid layout.

- Top-Left Quadrant: The product seen directly from the front.
- Top-Right Quadrant: The product seen directly from the back.
- Bottom-Left Quadrant: The product's left side, seen directly from the left.
- Bottom-Right Quadrant: The product's right side, seen directly from the right.

Crucial Instructions:
- Perfect Alignment & Scale: The product must be perfectly centered and be the exact same size in all four views.
- Studio Lighting: Apply neutral, omnidirectional studio lighting to eliminate all shadows.`;

export const CLAY_GRID_VIEW_PROMPT = `First, identify the main product in the uploaded image. Isolate it from any models, backgrounds, or other objects.

Then, create a single, composite 2x2 grid image containing four reference views for a 3D digital twin of ONLY the isolated product. Render the product as a 3D-scannable model made of non-reflective, matte gray clay. The camera for all views must use an orthographic projection with no pitch or roll. The final output must be a single image file with the grid layout.

- Top-left: The product seen directly from the front.
- Top-right: The product seen directly from the back.
- Bottom-left: The product's left side, seen directly from the left.
- Bottom-right: The product's right side, seen directly from the right.

The product's scale, position, and lighting must be identical in all four views. The scene must have diffused, omnidirectional lighting to eliminate all shadows. The background must be a seamless, solid white.`;

// Base prompt for generating a single, isolated product view
const INDIVIDUAL_VIEW_BASE_PROMPT = `You are a precise product visualization assistant. From the user's uploaded image, identify the single, primary product. If multiple variants (e.g., colors) are present, choose only ONE. Completely isolate this product from any models, people, backgrounds, or other distracting elements. The final output must be a high-resolution image of ONLY the isolated product, perfectly centered, on a seamless, solid white background. Apply neutral, omnidirectional studio lighting to eliminate all shadows.`;

// NEW CLAY VARIANT of the base prompt
const INDIVIDUAL_VIEW_CLAY_BASE_PROMPT = `You are a precise product visualization assistant. From the user's uploaded image, identify the single, primary product. If multiple variants (e.g., colors) are present, choose only ONE. Completely isolate this product from any models, people, backgrounds, or other distracting elements.
Your task is to render the isolated product as a 3D-scannable model made of non-reflective, matte gray clay.
The final output must be a high-resolution image of ONLY this clay model, perfectly centered, on a seamless, solid white background. Apply neutral, omnidirectional studio lighting to eliminate all shadows.`;


// Prompt for the initial front view
export const FRONT_VIEW_PROMPT = `${INDIVIDUAL_VIEW_BASE_PROMPT} Your task is to generate a direct front view of the isolated product.`;

// NEW: Clay prompt for the initial front view
export const FRONT_VIEW_CLAY_PROMPT = `${INDIVIDUAL_VIEW_CLAY_BASE_PROMPT} Your task is to generate a direct front view of the isolated clay model.`;


// NEW: Base prompt for generating subsequent views using the front view as a reference
const CONSISTENT_VIEW_BASE_PROMPT = `You are a precise product visualization assistant. You will be given two images: a user's original upload and a generated 'Front View' reference image. Your task is to generate a new view of the product shown in the 'Front View' reference.

Crucially, the new image must be perfectly consistent with the 'Front View' reference in style, scale, lighting, and texture. The product should be perfectly centered on a seamless, solid white background with neutral, omnidirectional lighting to eliminate shadows.

The specific view to generate is:`;

// NEW: Updated prompts that will be used with the front-view reference image
export const BACK_VIEW_PROMPT = `${CONSISTENT_VIEW_BASE_PROMPT} A direct back view.`;
export const LEFT_VIEW_PROMPT = `${CONSISTENT_VIEW_BASE_PROMPT} The product's left side, seen directly from the left.`;
export const RIGHT_VIEW_PROMPT = `${CONSISTENT_VIEW_BASE_PROMPT} The product's right side, seen directly from the right. This view should be the mirror opposite of the left view, showing the features on the product's other side.`;

// NEW: More explicit prompt for generating the right view using the left view as context.
export const RIGHT_VIEW_PROMPT_WITH_LEFT_CONTEXT = `You are a precise product visualization assistant. You will be given three images: the user's original product, a clean 'Front View' reference, and a clean 'Left View' reference.
Your task is to generate the product's right side view.

Crucial Instructions:
- The right view MUST be the mirror opposite of the provided 'Left View'.
- The new image must be perfectly consistent with the 'Front View' in style, scale, lighting, and texture.
- The product must be perfectly centered on a seamless, solid white background.
- Use neutral, omnidirectional lighting to eliminate all shadows.`;


// NEW: Prompt for regenerating a single quadrant of the grid view
export const getRegenerateGridPrompt = (view: 'back' | 'left' | 'right'): string => {
    const quadrantMap = {
        back: 'top-right',
        left: 'bottom-left',
        right: 'bottom-right'
    };
    const viewMap = {
        back: 'back view',
        left: 'left side view',
        right: 'right side view'
    };

    const quadrant = quadrantMap[view];
    const viewName = viewMap[view];

    return `You are a precise product visualization assistant. You will be given a user's original product image and a 2x2 grid image that contains four views of that product.

Your task is to regenerate ONLY the ${quadrant} quadrant of the grid to show a new ${viewName}.

Crucial Instructions:
- Only modify the specified ${quadrant} quadrant. The other three quadrants must remain completely untouched.
- The new view must be perfectly consistent with the other views in terms of the product's scale, position, lighting, and style.
- The final output must be the complete grid image with only the designated quadrant updated.`;
};