import { GoogleGenAI } from "@google/genai";
import { RateData } from "../types";

// Initialize the Gemini API client
// API Key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches the latest SGD to MYR rate for CIMB using Gemini Search Grounding.
 * 
 * Note: Direct client-side scraping of CIMB website would fail due to CORS policies 
 * in a browser environment. Gemini Search Grounding acts as a robust proxy 
 * to retrieve this real-time information.
 */
export const fetchCimbRate = async (): Promise<RateData> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Find the current "SGD to MYR" exchange rate for CIMB Clicks Singapore (Business or Consumer).
      I need the specific numeric rate that represents 1 SGD = X MYR.
      
      Look for the "Selling" rate (Bank Sells MYR) or the direct conversion rate displayed on their page.
      
      Return the response in this specific format:
      "Rate: [NUMBER]"
      "Time: [CURRENT_TIME]"
      
      If you find multiple rates, prefer the "Business" rate if available, otherwise the standard consumer rate.
      Only provide the numeric value for the rate.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType is NOT allowed with googleSearch
      },
    });

    const text = response.text || "";
    const groundings = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Extract Rate using Regex
    // Matches: "Rate: 3.1234" or "1 SGD = 3.1234 MYR" variations
    const rateMatch = text.match(/Rate:\s*(\d+(\.\d+)?)/i) || text.match(/(\d\.\d{2,5})/);
    
    // Extract Time or use current time
    const timeMatch = text.match(/Time:\s*(.+)/i);
    
    if (!rateMatch) {
        throw new Error("Could not parse rate from AI response");
    }

    const rate = parseFloat(rateMatch[1]);
    const timestamp = timeMatch ? timeMatch[1].trim() : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Find a relevant source URL if available
    let sourceUrl = "https://www.cimbclicks.com.sg/sgd-to-myr-business"; // Default
    if (groundings.length > 0) {
        // Try to find a URL that looks like CIMB
        const cimbChunk = groundings.find((chunk: any) => chunk.web?.uri?.includes('cimb'));
        if (cimbChunk?.web?.uri) {
            sourceUrl = cimbChunk.web.uri;
        }
    }

    return {
      rate,
      lastUpdated: timestamp,
      sourceUrl
    };

  } catch (error) {
    console.error("Error fetching rate via Gemini:", error);
    throw error;
  }
};
