
export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'select' 
  | 'number' 
  | 'boolean' 
  | 'range' 
  | 'json_editor'
  | 'array'
  | 'dynamic_fields';

export interface FormOption {
  label: string;
  value: string | number;
}

export interface FormField {
  name: string;
  label?: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[] | number[];
  default?: string | number | boolean | string[] | number[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  fields: FormField[];
  description: string;
}

export interface Template {
  id: string;
  name: string;
  category_id: string;
  description: string;
  data: Record<string, any>;
}

export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'whatsapp';

export type PostStatus = 'draft' | 'awaiting_approval' | 'scheduled' | 'posted' | 'failed';

export interface SocialPost {
  id: string;
  title: string;
  caption: string;
  imagePrompt?: string;
  campaignVisualProtocol?: string; 
  imageUrl?: string;
  platforms: SocialPlatform[];
  scheduledDate: string;
  scheduledTime: string;
  status: PostStatus;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
  tags?: string[];
}

export interface Campaign {
  id: string;
  name: string;
  posts: SocialPost[];
}

export interface PlatformCredentials {
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  pageId?: string;
  isConnected: boolean;
}

export interface SocialCredentials {
  instagram?: PlatformCredentials;
  facebook?: PlatformCredentials;
  linkedin?: PlatformCredentials;
  twitter?: PlatformCredentials;
}

export interface UserProfile {
  brandName: string;
  tagline: string;
  website: string;
  logoUrl: string;
  targetAudience: string;
  brandVoice: string;
  brandVisuals: string;
  primaryColor: string;
  secondaryColor: string;
  socialCredentials?: SocialCredentials;
  geminiApiKey?: string;
  firebaseConfig?: any; // New: Firestore credentials
  otherLlmEnabled?: boolean;
  otherLlmBaseUrl?: string;
  otherLlmModelId?: string;
  otherLlmApiKey?: string;
}

export type AppMode = 'classic' | 'social';

export interface GenerationResult {
  explanation: string;
  json_output: any;
  category_id: string;
  preview_type: 'calendar' | 'image' | 'video' | 'workflow' | 'text' | 'code' | 'chat';
  next_steps: string[];
  suggested_tool?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface ProjectAssets {
  styleInstructions: string;
  referenceImages: string[];
}

export interface Project {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: number;
  assets?: ProjectAssets;
  posts: SocialPost[]; 
  schemas: Record<string, any>[]; 
}

export interface ClarificationQuestion {
  id: string;
  text: string;
  options?: string[];
}

export interface ClarificationResult {
  requires_clarification: boolean;
  questions?: ClarificationQuestion[];
}
