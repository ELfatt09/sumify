import { GoogleGenAI } from "@google/genai";

export const gemini = new GoogleGenAI({ apiKey: import.meta.env.GEMINI_API_KEY });
