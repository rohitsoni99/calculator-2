
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const solveMathProblem = async (problem: string): Promise<AIResponse> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Solve this mathematical problem or answer the calculation request: "${problem}". Provide a structured response.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          result: {
            type: Type.STRING,
            description: "The final numerical or concise answer.",
          },
          explanation: {
            type: Type.STRING,
            description: "A brief explanation of how the answer was reached.",
          },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Step-by-step breakdown of the calculation.",
          },
        },
        required: ["result", "explanation", "steps"],
      },
    },
  });

  try {
    return JSON.parse(response.text || '{}') as AIResponse;
  } catch (error) {
    console.error("Failed to parse AI response", error);
    return {
      result: "Error",
      explanation: "Could not process the request.",
      steps: []
    };
  }
};
