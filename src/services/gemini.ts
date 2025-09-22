import { GoogleGenAI, Type } from "@google/genai";
import { DiseaseTrend, Village, WaterStatus, WaterScanResult } from '../types';


// Ensure the API key is available in the environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

// System instruction to guide the AI's behavior
const systemInstruction = `
You are "Aqua", an AI assistant for the 'Smart Health Water Alert' app. 
Your role is to provide clear, helpful, and reassuring advice to villagers in rural Northeast India about water quality and health.
Your tone should be friendly, supportive, easy to understand, and empathetic.

**Your Capabilities:**
- You can answer general questions about water safety.
- You can provide information on common water-borne diseases like Cholera, Typhoid, and Diarrhea, including common symptoms and preventative measures.
- You can offer practical tips for keeping water safe, such as methods for purification (boiling, filtering), safe storage practices, and general household hygiene.

**Important Rules:**
- Keep your answers concise and to the point, aiming for 2-4 sentences.
- When asked about the *current* water quality of a specific place, use this placeholder response: "The latest report shows a 'caution' status due to slight turbidity. It's recommended to boil water before drinking."
- You must NEVER provide a medical diagnosis. If a user describes personal symptoms, your primary response should be to advise them to report these symptoms through the app and consult a local health worker immediately. This is for their safety.

**Handling Symptom Queries:**
This is a critical safety rule. When a user mentions symptoms (e.g., 'fever', 'stomach cramps', 'diarrhea'), you MUST follow this protocol:
1. Acknowledge their feeling with empathy (e.g., "I'm sorry to hear you're feeling unwell.").
2. DO NOT provide a diagnosis or suggest any medication.
3. Provide ONE piece of relevant, safe, general preventative advice related to the symptom. For example, for diarrhea, advise about hydration with safe water. For fever, suggest resting.
4. Your primary and final instruction MUST be to use the app's 'Report Symptoms' feature and to consult a local health worker immediately for proper medical advice.

Example for 'diarrhea': "I'm sorry to hear you're feeling unwell. When experiencing diarrhea, it's very important to stay hydrated by drinking plenty of boiled or safe water. Please report your symptoms through the app right away and consult with a health worker for medical advice."
Example for 'fever': "It sounds difficult to have a fever. Resting is important. Please make sure to log your symptoms in the app and speak with a health worker to get the care you need."

Keep your answers helpful and safe.
`.trim();

/**
 * Provides canned responses for offline use based on keywords.
 * @param prompt - The user's question.
 * @returns A string response if a keyword is matched, otherwise null.
 */
const getOfflineResponse = (prompt: string): string | null => {
    const lowerCasePrompt = prompt.toLowerCase();
    const responses: { [key: string]: string } = {
        "boil water": "To boil water safely, bring it to a rolling boil for at least one minute. Let it cool before drinking.",
        "symptoms": "I'm sorry you're not feeling well. It is important to report your symptoms using the app's 'Report Symptoms' feature and see a health worker. I cannot give medical advice.",
        "diarrhea": "It is very important to stay hydrated by drinking plenty of boiled or safe water. Please report your symptoms through the app right away and consult with a health worker for medical advice.",
        "fever": "Resting is important when you have a fever. Please make sure to log your symptoms in the app and speak with a health worker to get the care you need.",
        "vomiting": "Try to sip small amounts of clear, safe water to stay hydrated. It is very important to report your symptoms in the app and see a health worker.",
        "headache": "Resting in a quiet, dark room may help. If you feel unwell, please report all your symptoms in the app and consult a health worker.",
        "cramps": "Gentle rest may help with stomach cramps. If it continues, please report your symptoms in the app and see a health worker for advice.",
        "safe": "I can only analyze water quality with an internet connection. Please try the AI Water Scanner with a photo. As a general rule, always boil water if you are unsure.",
        "unsafe": "I can only analyze water quality with an internet connection. Please try the AI Water Scanner with a photo. As a general rule, always boil water if you are unsure.",
        "clean": "I can only analyze water quality with an internet connection. Please try the AI Water Scanner with a photo. As a general rule, always boil water if you are unsure.",
        "smell": "Water should not have a strong smell. If it smells like rotten eggs, chemicals, or sewage, do not drink it. It may be contaminated. Boil it first or use another source.",
        "color": "Safe drinking water should be clear. If the water is brown, yellow, or cloudy, it may be unsafe. It is best to boil it before using.",
        "cloudy": "Cloudy water can contain dirt or germs. It's safest to let the dirt settle and then boil the clear water on top before you drink it.",
        "taste": "Water should not have a metallic or chemical taste. If it tastes strange, it could be contaminated. Avoid drinking it and try to find a safer source.",
        "filter": "Filtering water through a clean cloth can remove dirt, but it does not remove all germs. You should still boil the water after filtering to make it safe.",
        "storage": "Store clean water in a container with a narrow mouth and a lid to keep it safe from contamination. Clean the container with soap and water regularly.",
        "container": "Always use a clean, covered container for storing drinking water. This prevents dust, insects, and hands from touching the water.",
        "monsoon": "During the monsoon, well and river water can get contaminated easily. It is very important to boil all drinking water during this time.",
        "flood": "Floodwater is very dangerous and is not safe to drink or use for cooking. Always use bottled water or boil water from a safe source after a flood.",
        "dehydration": "Signs of dehydration include a very dry mouth, feeling very tired, and not passing much urine. Sip small amounts of safe, clean water throughout the day. See a health worker if you feel very sick.",
        "cholera": "Cholera is a serious disease often spread through contaminated water. Key prevention is drinking safe, boiled water and washing hands with soap. Please consult a health worker for more information.",
        "typhoid": "Typhoid is a serious disease often spread through contaminated water. Key prevention is drinking safe, boiled water and washing hands with soap. Please consult a health worker for more information.",
    };

    for (const keyword in responses) {
        if (lowerCasePrompt.includes(keyword)) {
            return responses[keyword];
        }
    }
    return null; // No match found
};


/**
 * Generates a streaming response from the Gemini model.
 * @param prompt - The user's question or message.
 * @returns An async iterator that yields response chunks.
 */
export async function* streamGeminiResponse(prompt: string): AsyncGenerator<string> {
  if (!navigator.onLine) {
    const offlineResponse = getOfflineResponse(prompt);
    if (offlineResponse) {
        yield offlineResponse;
    } else {
        yield "I can only answer basic questions about water safety when you are offline. Please connect to the internet for more detailed assistance.";
    }
    return;
  }
  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.5,
        topP: 1,
        topK: 32,
      },
    });

    for await (const chunk of response) {
      if (chunk && chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Error in streamGeminiResponse:", error);
    yield "Sorry, I encountered an issue while processing your request. Please check your connection and try again.";
  }
}


/**
 * Analyzes an image of a water sample using Gemini.
 * @param imageDataBase64 - The base64 encoded image data.
 * @param mimeType - The MIME type of the image.
 * @returns An object with the status, an explanation, and actionable recommendations.
 */
export async function analyzeWaterImage(
    imageDataBase64: string,
    mimeType: string
): Promise<Omit<WaterScanResult, 'image' | 'userName' | 'timestamp'>> {
  if (!navigator.onLine) {
    console.warn("Offline: Returning default water analysis.");
    return {
      status: 'caution',
      explanation: 'You are offline. Unable to analyze image. Assume caution and boil water before use.',
      recommendations: ['Boil water before use.', 'Try again when you have an internet connection.'],
      confidence: 0,
      imageQualityFeedback: 'Device is offline. AI analysis cannot be performed.'
    };
  }
  try {
    const imagePart = {
      inlineData: {
        mimeType,
        data: imageDataBase64,
      },
    };
    const textPart = {
      text: "First, analyze the quality of this water sample image. Note any issues like blurriness, poor lighting, or if the water is not clearly visible. Provide specific feedback as 'imageQualityFeedback' if the quality is poor. Then, based on visual indicators (clarity, color, particles), classify the water quality as 'safe', 'caution', or 'unsafe'. Provide a 'confidence' score from 0 to 100 on your analysis. Finally, give a concise, one-sentence 'explanation' for a villager and a short 'recommendations' list (2-3 simple actions as a string array).",
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: "The water quality status, one of: 'safe', 'caution', or 'unsafe'."
            },
            explanation: {
              type: Type.STRING,
              description: "A brief, one-sentence explanation for the classification."
            },
            recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A short list of 2-3 actionable recommendations for the user."
            },
            confidence: {
                type: Type.NUMBER,
                description: "A confidence score from 0 to 100 for the analysis."
            },
            imageQualityFeedback: {
                type: Type.STRING,
                description: "Optional feedback on image quality if it is suboptimal."
            }
          },
          required: ["status", "explanation", "recommendations", "confidence"],
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    // Validate status value
    const validStatuses: WaterStatus[] = ['safe', 'caution', 'unsafe'];
    if (!validStatuses.includes(result.status)) {
        console.warn(`Gemini returned invalid status: ${result.status}. Defaulting to 'caution'.`);
        result.status = 'caution';
    }

    if (!result.recommendations || !Array.isArray(result.recommendations)) {
        console.warn(`Gemini returned invalid recommendations. Defaulting.`);
        result.recommendations = ['Check with a health worker for next steps.'];
    }

    return result;

  } catch (error) {
    console.error("Error analyzing water image:", error);
    return {
      status: 'caution',
      explanation: 'Could not analyze image. Please try again with a clearer picture.',
      recommendations: ['Ensure water is boiled before use.', 'Try taking another photo in better light.'],
      confidence: 50,
      imageQualityFeedback: 'AI analysis could not be completed. The result is an estimate.'
    };
  }
}

/**
 * A custom error class for forecast generation failures.
 */
export class ForecastError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ForecastError';
    }
}

const FORECAST_CACHE_KEY = 'aquaForecastCache';
const CACHE_TTL = 3600 * 1000; // 1 hour

/**
 * Generates an outbreak forecast summary from Gemini.
 * @param trends - The current disease trend data.
 * @returns A structured forecast object.
 * @throws {ForecastError} If the API call fails or returns an invalid response.
 */
export async function generateOutbreakForecast(trends: DiseaseTrend[]): Promise<{ summary: string; dailyForecast: { day: string; disease: string; riskLevel: string }[]; stale?: boolean }> {
    try {
        const cachedItem = localStorage.getItem(FORECAST_CACHE_KEY);
        if (cachedItem) {
            const { forecast, timestamp } = JSON.parse(cachedItem);
            if (!navigator.onLine || (Date.now() - timestamp < CACHE_TTL)) {
                console.log('Returning forecast from cache.');
                return { ...forecast, stale: !navigator.onLine };
            }
        } else if (!navigator.onLine) {
            throw new ForecastError("You are offline and no forecast data is cached. Please connect to the internet.");
        }
    } catch (e) {
        console.error("Error reading forecast cache", e);
        if (!navigator.onLine) {
             throw new ForecastError("You are offline and no forecast data is cached.");
        }
    }
    
    const prompt = `
        You are an AI epidemiologist for a public health app.
        Based on this data for Northeast India, generate an outbreak forecast.
        Respond with a JSON object containing:
        1. A "summary" (string): a 2-sentence forecast focusing on the highest risk.
        2. A "dailyForecast" (array of objects): a 3-day forecast, where each object has "day" (string, e.g., 'Tomorrow', '+2 Days', '+3 Days'), "disease" (string, the name of the highest risk disease), and "riskLevel" (string, one of 'Low', 'Moderate', 'High', 'Very High').
        Be concise and direct.
    `.trim();

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.6,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        dailyForecast: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    day: { type: Type.STRING },
                                    disease: { type: Type.STRING },
                                    riskLevel: { type: Type.STRING }
                                },
                                required: ["day", "disease", "riskLevel"]
                            }
                        }
                    },
                    required: ["summary", "dailyForecast"]
                }
            }
        });
        
        if (!response.text?.trim()) {
            throw new ForecastError("The AI returned an empty forecast. Please try again.");
        }
        
        const result = JSON.parse(response.text);

        if (!result.summary || !Array.isArray(result.dailyForecast) || result.dailyForecast.length < 3) {
            throw new ForecastError("The AI returned an invalid forecast structure.");
        }
        
        try {
            const cachePayload = { forecast: result, timestamp: Date.now() };
            localStorage.setItem(FORECAST_CACHE_KEY, JSON.stringify(cachePayload));
        } catch(e) {
            console.error("Failed to save forecast to cache", e);
        }
        
        return result;
        
    } catch (error) {
        console.error("Error generating outbreak forecast:", error);

        if (error instanceof ForecastError) {
            throw error;
        }
        
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        
        if (errorMessage.includes("429") || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            throw new ForecastError("AI forecast is temporarily unavailable due to high demand. Please try again later.");
        }
        
        throw new ForecastError("Could not generate forecast. The AI service may be unreachable.");
    }
}

const languageMap: { [key: string]: string } = {
    'hi-IN': 'Hindi',
    'as-IN': 'Assamese',
    'bn-IN': 'Bengali',
    'mni-IN': 'Manipuri',
};

/**
 * Translates text from English to a target language using Gemini.
 * @param text The English text to translate.
 * @param targetLang The language code (e.g., 'hi-IN').
 * @returns The translated text, or null if translation fails.
 */
export async function translateText(text: string, targetLang: string): Promise<string | null> {
    const targetLanguageName = languageMap[targetLang];
    if (!targetLanguageName || targetLang === 'en-US') return text;
    if (!navigator.onLine) {
        console.warn(`Offline: Cannot translate text to ${targetLanguageName}.`);
        return null;
    }

    const prompt = `Translate the following English text to ${targetLanguageName}. Provide only the translation, without any additional comments or labels.\n\nText: "${text}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { 
                temperature: 0.3,
                thinkingConfig: { thinkingBudget: 0 },
            }
        });
        
        const translatedText = response.text?.trim();
        if (translatedText) {
            return translatedText;
        }
        console.warn(`Translation to ${targetLanguageName} resulted in an empty response.`);
        return null;
    } catch (error) {
        console.error(`Error translating text to ${targetLanguageName}:`, error);
        return null;
    }
}

/**
 * Translates text from a source language to English using Gemini.
 * @param text The text to translate.
 * @param sourceLang The language code of the source text (e.g., 'hi-IN').
 * @returns The translated English text.
 */
export async function translateToEnglish(text: string, sourceLang: string): Promise<string> {
    const sourceLanguageName = languageMap[sourceLang];
    if (!sourceLanguageName || sourceLang === 'en-US') return text;
    if (!navigator.onLine) {
        console.warn(`Offline: Cannot translate text from ${sourceLanguageName}. Returning original text.`);
        return text;
    }

    const prompt = `Translate the following ${sourceLanguageName} text to English. Provide only the translation, without any additional comments or labels.\n\nText: "${text}"`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { 
                temperature: 0.3,
                thinkingConfig: { thinkingBudget: 0 },
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error(`Error translating text from ${sourceLanguageName} to English:`, error);
        return text; // Return original text on error
    }
}

/**
 * Interprets sensor data into a human-readable summary.
 * @param latestData The latest sensor reading.
 * @returns An object containing the summary.
 */
export async function interpretSensorData(latestData: { ph: number; turbidity: number; temperature: number }): Promise<{ summary: string } | null> {
    if (!navigator.onLine) {
        return { summary: "Offline: AI interpretation unavailable. Monitor raw values." };
    }
    const prompt = `You are an AI water quality analyst for a health worker. Based on these sensor readings (pH: ${latestData.ph.toFixed(2)}, Turbidity: ${latestData.turbidity.toFixed(2)} NTU, Temp: ${latestData.temperature.toFixed(2)}°C), provide a one-sentence, actionable insight. This should include the key observation and a direct recommendation. Example: 'Caution: High turbidity detected. Advise villagers to boil water and inspect the source for runoff.'`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { summary: { type: Type.STRING } },
                    required: ["summary"]
                },
                temperature: 0.4,
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error interpreting sensor data:", error);
        return null;
    }
}

/**
 * Analyzes a stream of sensor data to check for hardware health.
 * @param dataStream A recent history of sensor readings.
 * @returns An object with the sensor's health status and a message.
 */
export async function analyzeSensorHealth(dataStream: { ph: number; turbidity: number; temperature: number }[]): Promise<{ status: 'good' | 'warning' | 'error'; message: string } | null> {
    if (!navigator.onLine) {
        return { status: 'warning', message: 'Offline: AI diagnostics unavailable. Check for obvious sensor issues.' };
    }
    const prompt = `You are an AI sensor diagnostic tool. Analyze this recent stream of sensor data: ${JSON.stringify(dataStream)}. Identify specific signs of malfunction (e.g., erratic spikes, flatlining values, out-of-range data). Respond in JSON with "status" ('good', 'warning', or 'error') and a "message" that includes a description of the issue and a specific troubleshooting step. Example: {"status": "warning", "message": "Turbidity readings are erratic, showing sudden spikes. Suggestion: Check the sensor probe for debris and consider recalibrating."}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        status: { type: Type.STRING },
                        message: { type: Type.STRING }
                    },
                    required: ["status", "message"]
                },
                temperature: 0.2,
            }
        });
        const result = JSON.parse(response.text);
        if (['good', 'warning', 'error'].includes(result.status)) {
            return result;
        }
        return { status: 'warning', message: 'Received an invalid health status from AI.' };
    } catch (error) {
        console.error("Error analyzing sensor health:", error);
        return null;
    }
}

const MAP_ANALYSIS_CACHE_KEY = 'aquaMapAnalysisCache';

// FIX: Added missing generateMapAnalysis function to be used by the AIMapAnalysis component.
/**
 * Generates a geographical analysis of village data.
 * @param villages - An array of village data.
 * @returns A string containing the analysis.
 */
export async function generateMapAnalysis(villages: Village[]): Promise<string> {
    const CACHE_TTL = 3600 * 1000; // 1 hour

    try {
        const cachedItem = localStorage.getItem(MAP_ANALYSIS_CACHE_KEY);
        if (cachedItem) {
            const { analysis, timestamp } = JSON.parse(cachedItem);
            if (!navigator.onLine || (Date.now() - timestamp < CACHE_TTL)) {
                const stalePrefix = !navigator.onLine ? "(Offline - Cached) " : "";
                console.log('Returning map analysis from cache.');
                return stalePrefix + analysis;
            }
        } else if (!navigator.onLine) {
            return "Could not generate analysis. You are offline and no data is cached.";
        }
    } catch (e) {
        console.error("Error reading map analysis cache", e);
        if (!navigator.onLine) {
             return "Could not generate analysis. You are offline and no data is cached.";
        }
    }
    
    const prompt = `
        You are an AI public health analyst for the 'Smart Health Water Alert' app.
        Analyze the following geographical and water quality data for several villages in Northeast India.
        Provide a concise, 1-2 sentence summary of the current situation, highlighting the most at-risk areas.
        Focus on villages with 'unsafe' or 'caution' status.
        
        Data: ${JSON.stringify(villages, null, 2)}
    `.trim();

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
                topP: 1,
                topK: 32,
            }
        });
        const analysis = response.text.trim();
        try {
            localStorage.setItem(MAP_ANALYSIS_CACHE_KEY, JSON.stringify({ analysis, timestamp: Date.now() }));
        } catch (e) {
            console.error("Failed to save map analysis to cache", e);
        }
        return analysis;
    } catch (error) {
        console.error("Error generating map analysis:", error);
        return "Could not generate analysis due to an AI service error. Please try again later.";
    }
}
