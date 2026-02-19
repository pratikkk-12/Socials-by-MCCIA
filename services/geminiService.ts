
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationResult, UserProfile, ChatMessage, AppMode, ProjectAssets } from '../types';

const cleanJsonString = (str: string) => {
  let cleaned = str.replace(/```json\n?|\n?```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
};

/**
 * Fallback to external OpenAI-compatible providers (Groq, OpenRouter, etc.)
 */
const callExternalLlm = async (
    userProfile: UserProfile, 
    systemPrompt: string, 
    userPrompt: string
): Promise<string> => {
    if (!userProfile.otherLlmBaseUrl || !userProfile.otherLlmApiKey) {
        throw new Error("External LLM Provider not configured properly in Settings.");
    }

    try {
        const response = await fetch(`${userProfile.otherLlmBaseUrl.replace(/\/$/, '')}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userProfile.otherLlmApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: userProfile.otherLlmModelId || 'llama3-70b-8192',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`External LLM Failed: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "";
    } catch (e: any) {
        console.error("External LLM Error", e);
        throw e;
    }
};

// --- Rate Limiting & Queuing Strategy ---
class APIQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await this.retryWithBackoff(task);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) await task();
      await new Promise(r => setTimeout(r, 500));
    }
    this.processing = false;
  }

  private async retryWithBackoff<T>(task: () => Promise<T>, retries = 4, delay = 2000): Promise<T> {
    try {
      return await task();
    } catch (error: any) {
      const isRateLimit = error?.message?.includes('429') || error?.status === 429;
      if (isRateLimit && retries > 0) {
        console.warn(`Rate limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(r => setTimeout(r, delay));
        return this.retryWithBackoff(task, retries - 1, delay * 2);
      }
      throw error;
    }
  }
}

const apiQueue = new APIQueue();

const getAiClient = (userProfile?: UserProfile) => {
  // Priority: 1. Manually entered key in settings, 2. Host environment process.env.API_KEY
  const apiKey = userProfile?.geminiApiKey || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key missing. Please provide it manually in Settings or set the environment variable.");
  }
  return new GoogleGenAI({ apiKey });
};

// --- SCHEMAS ---

const SOCIAL_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    explanation: { 
      type: Type.STRING, 
      description: "A friendly conversational response explaining what was done." 
    },
    output_type: { 
      type: Type.STRING, 
      description: "Either 'social_media_calendar' or 'clarification'." 
    },
    posts: {
      type: Type.ARRAY,
      description: "An array of planned social media posts.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING, description: "Short internal name for the post." },
          caption: { type: Type.STRING, description: "The actual social media text." },
          imagePrompt: { type: Type.STRING, description: "Direct descriptive summary for the image." },
          campaignVisualProtocol: { 
            type: Type.STRING, 
            description: "A hyper-detailed, multi-key JSON string defining the IMAGE ENGINEERING BLUEPRINT." 
          },
          platforms: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING, enum: ["instagram", "facebook", "linkedin", "twitter"] } 
          },
          scheduledDate: { type: Type.STRING, description: "ISO format YYYY-MM-DD" },
          scheduledTime: { type: Type.STRING, description: "Format HH:mm" },
          status: { type: Type.STRING, enum: ["draft", "awaiting_approval"] },
          tags: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "A curated list of 10+ high-performance hashtags."
          }
        },
        required: ["id", "title", "caption", "platforms", "scheduledDate", "scheduledTime", "status", "campaignVisualProtocol", "tags"]
      }
    },
    next_steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["explanation", "output_type"]
};

// --- SYSTEM PROMPTS ---

const SOCIAL_MEDIA_SYSTEM_PROMPT = `
# ROLE: PromptForge Elite Social Architect.
# MISSION: Synthesize production-grade content + industrial-fidelity visual protocols.

## I. CONTEXT LOCK (IMAGE RELEVANCE)
- CRITICAL: Every visual specification MUST be a literal translation of that specific post's theme.
- NARRATIVE MAPPING: Force a 1:1 bond between the 'technical_prompt' and the post's 'caption'. 
- NO GENERIC DEFAULTING: If the post is about "Coffee", the image must feature coffee, not generic "tech" or "office" scenes. Stop all generic business-defaulting.

## II. VISUAL PROTOCOL (campaignVisualProtocol)
[FORMAT]: Must be a valid stringified JSON.
- technical_prompt: 150-250 words. High-fidelity subject detail + Art Style (Photography/3D/Film) + Camera Specs (e.g. 50mm f/1.2) + Texture + Mood.
- lighting_rig: Specific specs. Kelvin temps (5600K/3200K), positions, intensity, ambient conditions.
- composition: Rule of thirds, negative space for text overlays, perspective angles.
- chromatic: Exact hex codes. Integrate Brand Primary. 70/20/10 distribution.
- consistency_anchors: Recurring motifs to ensure the campaign looks like a single cohesive "shoot."

## III. CONTENT PROTOCOL
- CAPTION: Platform-optimized (IG: Hook-first | LI: Value-led | X: Concise).
- TAGS: 10-15 high-performance tags. Mix: 3 trending, 4 niche, 3 branded, 5 community.
- SCHEDULE: Peak engagement windows (AM: Educational | PM: Lifestyle/Entertainment).

## IV. EXECUTION PROTOCOL
- NO PLACEHOLDERS: Generate actionable data. Never use [Brand Name] or TBD.
- NARRATIVE ARC: Multi-post campaigns must follow a logical flow (Tease → Educate → Convert).
- OUTPUT: "social_media_calendar" for content, "clarification" only for fundamental ambiguity.
`;

const CLASSIC_BUILDER_SYSTEM_PROMPT = `
  # ROLE: PromptForge Elite JSON Architect.
# MISSION: Map natural language intent to strict, production-grade JSON schemas.

## I. ARCHITECTURAL LOGIC
- SCHEMA FIDELITY: Prioritize nested structures over flat strings for complex data.
- NAMING PROTOCOL: Use camelCase for keys. Names must be semantic and descriptive (e.g., 'userEngagementScore' not 'score').
- DATA TYPES: Ensure strict adherence to types (Integer vs Float, Boolean vs String).

## II. DOMAIN MAPPING (LOGIC LOCK)
- CRITICAL: Keys and values must be 100% relevant to the user's specific industry. 
- If the user asks for "Hospital Data," use HIPAA-compliant terminology (PatientID, ProviderNPI). 
- If "Fintech," use ISO standards (CurrencyCode, TransactionHash).

## III. CONSTRAINTS & OUTPUT
- NO CONVERSATIONAL FILLER: Output must be the JSON object only unless explanation is explicitly requested.
- VALIDATION: Every object must be parseable by standard JSON engines. No trailing commas. No unescaped special characters.
- ERROR HANDLING: If the input is technically nonsensical, set the 'status' key to 'error' and explain the architectural conflict.
`;

// --- AI SERVICE EXPORTS ---

export const generateImage = async (prompt: string, userProfile?: UserProfile): Promise<string> => {
  return apiQueue.add(async () => {
    const ai = getAiClient(userProfile);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("Image generation engine failed to return visual data.");
  });
};

export const refineImagePrompt = async (prompt: string, userProfile: UserProfile): Promise<string> => {
  return apiQueue.add(async () => {
    const ai = getAiClient(userProfile);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Refine this image generation prompt to align with the brand visual identity: "${userProfile.brandVisuals}". Original Prompt: "${prompt}"`,
    });
    return response.text || prompt;
  });
};

export const enhancePromptWithAI = async (data: any, categoryName: string, userProfile: UserProfile): Promise<any> => {
  return apiQueue.add(async () => {
    const ai = getAiClient(userProfile);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As an AI Architect, optimize this JSON structure for the "${categoryName}" use case. Data: ${JSON.stringify(data)}`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(cleanJsonString(response.text || "{}"));
  });
};

export const generateFromNaturalLanguage = async (
  userInput: string,
  userProfile: UserProfile,
  mode: AppMode,
  chatHistory: ChatMessage[] = [],
  projectAssets?: ProjectAssets
): Promise<GenerationResult> => {
  return apiQueue.add(async () => {
    const today = new Date().toISOString().split('T')[0];
    const brandContext = `
      BRAND DNA: Name: "${userProfile.brandName}", Voice: "${userProfile.brandVoice}", Primary Color: "${userProfile.primaryColor}"
    `;

    const historyString = chatHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.text}`).join('\n');
    const baseSystemPrompt = mode === 'social' ? SOCIAL_MEDIA_SYSTEM_PROMPT : CLASSIC_BUILDER_SYSTEM_PROMPT;

    const systemInstruction = `
      ${baseSystemPrompt}
      [CURRENT_DATE]: ${today}
      ${brandContext}
      HISTORY: ${historyString}
    `;

    let responseText = "";
    let lastError: any = null;

    try {
        const ai = getAiClient(userProfile);
        const modelId = 'gemini-3-flash-preview';
        const contentParts: any[] = [{ text: userInput }];
        
        if (projectAssets?.referenceImages && projectAssets.referenceImages.length > 0) {
            projectAssets.referenceImages.slice(0, 3).forEach(base64 => {
                 contentParts.unshift({ inlineData: { mimeType: "image/jpeg", data: base64 } });
            });
        }

        const response = await ai.models.generateContent({
          model: modelId,
          contents: { parts: contentParts },
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: mode === 'social' ? SOCIAL_RESPONSE_SCHEMA : undefined,
            temperature: 0.7
          },
        });
        responseText = response.text || "";
    } catch (e) {
        lastError = e;
        console.warn("Primary AI service failed. Attempting fallback if configured...", e);
    }

    if (!responseText && userProfile.otherLlmEnabled) {
        try {
            responseText = await callExternalLlm(userProfile, systemInstruction, userInput);
        } catch (e) {
            throw lastError || e;
        }
    }

    if (!responseText) throw lastError || new Error("Architectural Forge failed. Check API Key Settings.");

    const result = JSON.parse(cleanJsonString(responseText || '{}'));
    
    return {
        explanation: result.explanation || "Architectural synthesis complete.",
        json_output: result.posts || result.json_output || result,
        category_id: result.output_type || (mode === 'social' ? 'social_media_calendar' : 'json_schema'),
        preview_type: mode === 'social' ? 'calendar' : 'code',
        next_steps: result.next_steps || ["Review generated payloads"]
    };
  });
};
