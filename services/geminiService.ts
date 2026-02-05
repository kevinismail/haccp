
import { GoogleGenAI, Type } from "@google/genai";
import { DailyLog } from "../types";

// Note: Always use process.env.API_KEY directly in initialization as per guidelines.
// Assume it is pre-configured and accessible.

export const analyzeHaccpLogs = async (log: DailyLog) => {
  // Initialize AI client right before use with direct process.env.API_KEY access
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    En tant qu'expert en sécurité alimentaire (HACCP), analyse le relevé journalier suivant d'un restaurant :
    Date: ${log.date}
    Contrôles effectués:
    ${log.items.map(i => `- ${i.label}: ${i.completed ? 'VALIDE' : 'NON FAIT'} ${i.value ? `(Valeur: ${i.value})` : ''}`).join('\n')}
    
    Donne un résumé rapide de la conformité, identifie les risques critiques s'il y en a, et suggère une action corrective immédiate si nécessaire. Réponds en français de manière concise et professionnelle.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Aucune analyse générée.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Désolé, l'analyse IA est temporairement indisponible.";
  }
};

export const getSafetyAdvice = async (query: string) => {
  // Initialize AI client right before use with direct process.env.API_KEY access
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Question sur la sécurité alimentaire en restauration : ${query}. Réponds selon les normes d'hygiène françaises (HACCP).`,
    });

    return response.text || "Désolé, je ne peux pas répondre à cette question pour le moment.";
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return "Désolé, le service d'assistance est momentanément hors ligne.";
  }
};
