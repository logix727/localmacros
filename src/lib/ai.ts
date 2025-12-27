import { z } from 'zod';

// Define strict schema for nutrition data
const NutritionSchema = z.object({
    foodName: z.string(),
    calories: z.number().int().nonnegative(),
    protein: z.number().nonnegative(),
    carbs: z.number().nonnegative(),
    fat: z.number().nonnegative(),
    portion: z.string(),
    confidence: z.number().min(0).max(1),
});

export type FoodAnalysis = z.infer<typeof NutritionSchema>;

// Extended Window interface for Chrome Built-in AI
declare global {
    interface Window {
        ai?: {
            languageModel?: {
                create: (options?: any) => Promise<any>;
                capabilities: () => Promise<any>;
            };
        };
    }
}

export async function analyzeFoodImage(imageBase64: string): Promise<FoodAnalysis> {
    const systemPrompt = `
  You are a nutritionist. Analyze the food in the image. 
  Identify the food name, portion size, and estimate calories, protein (g), carbs (g), and fat (g).
  Return ONLY valid JSON in this format:
  {
    "foodName": "Food Name",
    "portion": "e.g., 1 cup",
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "confidence": 0.9
  }
  `;

    try {
        // Check key prerequisites for Local AI
        if (!window.ai || !window.ai.languageModel) {
            console.warn("window.ai not found.");
            return mockFallback();
        }

        const capabilities = await window.ai.languageModel.capabilities();
        if (capabilities.available === 'no') {
            console.warn("Gemini Nano model not downloaded.");
            return mockFallback();
        }

        // Initialize Session
        const session = await window.ai.languageModel.create({
            systemPrompt: systemPrompt
        });

        console.log("Local AI Session Created. Prompting...");
        const result = await session.prompt("Analyze this food image: [Image Context Injected]");
        console.log("Raw Local AI Response:", result);

        // Attempt to parse and validate
        const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        // Validate with Zod
        const validated = NutritionSchema.safeParse(parsed);

        if (validated.success) {
            return validated.data;
        } else {
            console.error("AI Validation Error:", validated.error);
            throw new Error("Invalid structure returned by AI");
        }

    } catch (error) {
        console.error("Local AI Execution Failed:", error);
        return mockFallback();
    }
}

function mockFallback(): FoodAnalysis {
    return {
        foodName: "Local AI Error (Check Console)",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        portion: "Error",
        confidence: 0
    };
}
