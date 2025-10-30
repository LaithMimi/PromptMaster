import { GoogleGenAI, Type } from "@google/genai";

// Ensure the API key is available in the environment variables
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image was generated.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};

export const scorePrompts = async (userPrompt: string, groundTruthPrompt: string): Promise<{ score: number; feedback: string }> => {
  const scoringPrompt = `
    Analyze the user's prompt in comparison to the ground-truth prompt.
    Ground-Truth Prompt: "${groundTruthPrompt}"
    User's Prompt: "${userPrompt}"
    
    Evaluate based on:
    1.  **Semantic Similarity:** Does the user's prompt capture the core subject and concept?
    2.  **Detail & Specificity:** Does it include key details and descriptors from the ground-truth?
    3.  **Style & Mood:** Does it match the artistic style, lighting, and mood?
    
    Provide a score from 0 to 100 representing the similarity. 100 is a perfect match.
    Also, provide a brief, constructive feedback string (max 20 words) on how the user could improve.
    
    Respond ONLY with a valid JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: scoringPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "A similarity score from 0 to 100.",
            },
            feedback: {
              type: Type.STRING,
              description: "Brief, constructive feedback for the user.",
            },
          },
          required: ["score", "feedback"],
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (typeof result.score === 'number' && typeof result.feedback === 'string') {
        return result;
    } else {
        throw new Error("Invalid JSON structure received from scoring API.");
    }

  } catch (error) {
    console.error("Error scoring prompts:", error);
    // Fallback in case of parsing or API error
    return { score: Math.floor(Math.random() * 30) + 40, feedback: "Could not automatically score prompt." };
  }
};

export const getPromptSuggestions = async (groundTruthPrompt: string): Promise<string[]> => {
    const suggestionPrompt = `
    Based on the following detailed image prompt, generate exactly three alternative prompt suggestions.
    These suggestions should be creative and capture the essence of the original, but be slightly less detailed or offer a different stylistic angle. They are meant as starting points for a user, not perfect answers.
    
    Original Prompt: "${groundTruthPrompt}"
    
    Respond ONLY with a valid JSON object containing a "suggestions" array of three strings.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: suggestionPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            },
                            description: "An array of three creative prompt suggestions.",
                        },
                    },
                    required: ["suggestions"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        if (Array.isArray(result.suggestions) && result.suggestions.length > 0) {
            return result.suggestions.slice(0, 3); // Ensure we only return 3
        } else {
            throw new Error("Invalid JSON structure for suggestions.");
        }
    } catch (error) {
        console.error("Error getting prompt suggestions:", error);
        throw new Error("Failed to generate suggestions.");
    }
};

export const generateRandomTarget = async (): Promise<{ title: string; groundTruthPrompt: string }> => {
    const creationPrompt = `
    You are a creative assistant for a game called "Prompt Perfect".
    Your task is to generate a single, unique, and imaginative concept for an image.
    The concept should be something visually interesting and specific.
    
    Based on this concept, provide two things:
    1. A short, catchy "title" (max 5 words).
    2. A detailed "groundTruthPrompt" that could be used with a powerful text-to-image model (like Imagen) to generate a high-quality, artistic image. This prompt should be descriptive, including details about the subject, setting, style, lighting, and composition. It should be at least 30 words long.

    Example themes: futuristic cities, mythical creatures, surreal landscapes, steampunk inventions, abstract art. Do not use the word 'photorealistic'.

    Respond ONLY with a valid JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: creationPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            description: "A short, catchy title (max 5 words).",
                        },
                        groundTruthPrompt: {
                            type: Type.STRING,
                            description: "A detailed prompt for a text-to-image model, at least 30 words long.",
                        },
                    },
                    required: ["title", "groundTruthPrompt"],
                },
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        if (typeof result.title === 'string' && typeof result.groundTruthPrompt === 'string') {
            return result;
        } else {
            throw new Error("Invalid JSON structure received from target generation API.");
        }

    } catch (error) {
        console.error("Error generating random target:", error);
        throw new Error("Failed to generate a random target idea.");
    }
};