import { GoogleGenAI, Type } from "@google/genai";
import { DiseaseTrend, Village, WaterStatus } from '../types';


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
 * Generates a streaming response from the Gemini model.
 * @param prompt - The user's question or message.
 * @returns An async iterator that yields response chunks.
 */
export async function* streamGeminiResponse(prompt: string): AsyncGenerator<string> {
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
      // Ensure chunk and its text property exist before yielding
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
 * @returns An object with the status and an explanation.
 */
export async function analyzeWaterImage(imageDataBase64: string, mimeType: string): Promise<{ status: WaterStatus; explanation: string }> {
  try {
    const imagePart = {
      inlineData: {
        mimeType,
        data: imageDataBase64,
      },
    };
    const textPart = {
      text: "Analyze this water sample image. Classify its quality as 'safe', 'caution', or 'unsafe' based on visual indicators like clarity, color, and visible particles. Provide a concise, one-sentence explanation for a villager that includes the observation and a likely cause. For example: 'This water appears clear and safe for consumption.', 'This water is slightly cloudy, likely from recent rainfall, so boiling is recommended.', 'This water is discolored and has particles, suggesting contamination from runoff; do not drink.'",
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
          },
          required: ["status", "explanation"],
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

    return result;

  } catch (error) {
    console.error("Error analyzing water image:", error);
    return {
      status: 'caution',
      explanation: 'Could not analyze image. Please try again with a clearer picture.',
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

/**
 * Generates an outbreak forecast summary from Gemini.
 * @param trends - The current disease trend data.
 * @returns A structured forecast object.
 * @throws {ForecastError} If the API call fails or returns an invalid response.
 */
export async function generateOutbreakForecast(trends: DiseaseTrend[]): Promise<{ summary: string; dailyForecast: { day: string; disease: string; riskLevel: string }[] }> {
    const prompt = `
        You are an AI epidemiologist for a public health app.
        Based on this data for Northeast India, generate an outbreak forecast.
        Data: ${JSON.stringify(trends)}
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

/**
 * Translates text to a target language using Gemini.
 * @param text The text to translate.
 * @param targetLang The language code (e.g., 'hi-IN').
 * @returns The translated text.
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
    const languageMap: { [key: string]: string } = {
        'hi-IN': 'Hindi',
        'ta-IN': 'Tamil',
    };
    const targetLanguageName = languageMap[targetLang];
    if (!targetLanguageName) return text; // If language not supported, return original text.

    const prompt = `Translate the following English text to ${targetLanguageName}. Provide only the translation, without any additional comments or labels.\n\nText: "${text}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.3,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error(`Error translating text to ${targetLanguageName}:`, error);
        return text; // Return original text on error
    }
}

/**
 * Generates a geographical analysis of village water quality.
 * @param villages - The current village water status data.
 * @returns A string containing the AI-generated analysis.
 */
export async function generateMapAnalysis(villages: Village[]): Promise<string> {
    const prompt = `
        As a public health AI analyst, review the following water quality data for several villages in a region.
        Provide a brief, 2-3 sentence summary highlighting key geographical patterns, risk clusters, and urgent areas of concern.
        Infer potential relationships based on village names if possible (e.g., proximity).
        Your tone should be analytical and decisive, for a health worker.

        Data: ${JSON.stringify(villages)}
    `.trim();

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating map analysis:", error);
        return "Could not generate analysis. The AI service may be temporarily unavailable.";
    }
}

/**
 * Interprets sensor data into a human-readable summary.
 * @param latestData The latest sensor reading.
 * @returns An object containing the summary.
 */
export async function interpretSensorData(latestData: { ph: number; turbidity: number; temperature: number }): Promise<{ summary: string } | null> {
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
