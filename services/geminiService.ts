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
      Perform a live search for the current "SGD to MYR" exchange rate on CIMB Clicks Singapore.
      Target URL context: cimbclicks.com.sg/sgd-to-myr-business or similar official CIMB pages.

      I need the exact "Selling" rate (Bank Sells MYR / Customer Buys MYR) for 1 SGD.
      
      Strictly follow these steps:
      1. Find the numeric rate (e.g., 3.1950).
      2. Identify the timestamp of the page or rate if available.
      
      Output Format:
      "Rate: [NUMBER]"
      "Time: [TIME string found or 'Now']"
      "Source: [URL]"
      
      If the site is unreachable or data is missing, respond with "Error: Unable to fetch".
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

    if (text.includes("Error: Unable to fetch")) {
        throw new Error("CIMB site unreachable or rate not found.");
    }

    // Extract Rate using Regex
    // Matches: "Rate: 3.1234"
    const rateMatch = text.match(/Rate:\s*(\d+(\.\d+)?)/i) || text.match(/(\d\.\d{3,5})/);
    
    // Extract Time
    const timeMatch = text.match(/Time:\s*(.+)/i);
    
    if (!rateMatch) {
        throw new Error("Could not parse rate from AI response");
    }

    const rate = parseFloat(rateMatch[1]);
    // Use current local time if AI doesn't find a specific page timestamp, to indicate "Check time"
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Find a relevant source URL if available
    let sourceUrl = "https://www.cimbclicks.com.sg/sgd-to-myr-business"; // Default fallback
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