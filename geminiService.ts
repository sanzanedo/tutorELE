import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-2.5-flash-image for image generation as per instructions for "nano banana" models
const IMAGE_MODEL = 'gemini-2.5-flash-image';
// Using gemini-2.5-flash for multimodal analysis (text + image) and audio transcription
const TUTOR_MODEL = 'gemini-2.5-flash';

export const generateImageForTopic = async (topic: string): Promise<string> => {
  try {
    const prompt = `Una fotografía realista, clara y educativa sobre el tema: "${topic}". La imagen debe ser rica en detalles, adecuada para que un estudiante de español nivel B2 la describa en un examen. Sin texto en la imagen.`;
    
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        // No responseMimeType for image models
      }
    });

    // Iterate through parts to find the image
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  try {
    const prompt = "Transcribe el siguiente audio exactamente como se habla en español. Si hay pausas o muletillas, inclúyelas para que el texto sea fiel al habla del estudiante.";

    const response = await ai.models.generateContent({
      model: TUTOR_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          { text: prompt }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
};

export const evaluateDescription = async (
  base64Image: string,
  studentText: string,
  topic: string
): Promise<FeedbackResponse> => {
  try {
    const prompt = `
      Actúa como un examinador oficial del examen DELE B2 de español.
      
      Tarea:
      El alumno debe describir la imagen adjunta relacionada con el tema "${topic}".
      Analiza su respuesta: "${studentText}"
      
      Devuelve un análisis detallado en formato JSON siguiendo estrictamente el esquema proporcionado.
      Sé constructivo pero riguroso con la gramática y la coherencia visual.
      
      IMPORTANTE: Desglosa la puntuación en Gramática, Vocabulario y Coherencia (0-10).
    `;

    const response = await ai.models.generateContent({
      model: TUTOR_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG from generation
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            grammarCorrections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  error: { type: Type.STRING, description: "La parte incorrecta del texto original" },
                  correction: { type: Type.STRING, description: "La versión corregida" },
                  explanation: { type: Type.STRING, description: "Breve explicación gramatical del error" }
                },
                required: ["error", "correction", "explanation"]
              },
              description: "Lista de errores gramaticales encontrados"
            },
            vocabularySuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 3-5 palabras o expresiones de nivel B2/C1 que mejorarían la descripción"
            },
            coherenceCheck: {
              type: Type.STRING,
              description: "Evaluación de si la descripción coincide con la imagen visualmente"
            },
            score: {
              type: Type.NUMBER,
              description: "Nota global numérica de 0 a 10"
            },
            scoreBreakdown: {
              type: Type.OBJECT,
              properties: {
                grammar: { type: Type.NUMBER, description: "Nota de gramática (0-10)" },
                vocabulary: { type: Type.NUMBER, description: "Nota de riqueza léxica (0-10)" },
                coherence: { type: Type.NUMBER, description: "Nota de coherencia y fluidez (0-10)" }
              },
              required: ["grammar", "vocabulary", "coherence"]
            },
            generalAdvice: {
              type: Type.STRING,
              description: "Consejo general alentador para el estudiante"
            }
          },
          required: ["grammarCorrections", "vocabularySuggestions", "coherenceCheck", "score", "scoreBreakdown", "generalAdvice"]
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as FeedbackResponse;
  } catch (error) {
    console.error("Error evaluating description:", error);
    // Return a fallback object in case of error to prevent app crash
    return {
      grammarCorrections: [],
      vocabularySuggestions: [],
      coherenceCheck: "No se pudo verificar la coherencia debido a un error.",
      score: 0,
      scoreBreakdown: { grammar: 0, vocabulary: 0, coherence: 0 },
      generalAdvice: "Hubo un error al procesar tu respuesta. Por favor, inténtalo de nuevo."
    };
  }
};