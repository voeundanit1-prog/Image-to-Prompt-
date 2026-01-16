
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeImageForVideoPrompt = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this image carefully. Understand its subject, mood, lighting, and artistic style.
    Then, create a highly detailed cinematic video generation prompt that would bring this specific image to life.
    
    Technical Details to Identify:
    - lensType: Identify what kind of lens was likely used or should be used for this shot (e.g., "Wide Angle 24mm", "Cinematic Anamorphic", "Telephoto 85mm", "Macro Lens", "Fish-eye").
    - cinematographicStyle: The physical camera setup (e.g., "Handheld Shaky-cam", "Smooth Steadicam", "Static Tripod", "Drone Overhead", "GoPro POV").
    - concept: A brief summary.
    - videoPrompt: The full motion prompt.
    - styleKeywords: 5 keywords.
    - suggestedMotion: Recommended movement type (e.g., Dolly Zoom, Orbit, Pan).

    Return the result in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concept: { type: Type.STRING },
            videoPrompt: { type: Type.STRING },
            styleKeywords: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            suggestedMotion: { type: Type.STRING },
            lensType: { type: Type.STRING },
            cinematographicStyle: { type: Type.STRING }
          },
          required: ["concept", "videoPrompt", "styleKeywords", "suggestedMotion", "lensType", "cinematographicStyle"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
