import { GoogleGenAI } from "@google/genai";

export const gemini = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
