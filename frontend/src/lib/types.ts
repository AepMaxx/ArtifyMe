// Existing types
export interface Point {
  x: number;
  y: number;
}

export interface Path {
  points: Point[];
  color: string;
  size: number;
}

// New types for prompt mutation
export enum MutationStyle {
  Artistic = 'Artistic',
  Technical = 'Technical',
  Emotional = 'Emotional',
  Descriptive = 'Descriptive',
  Abstract = 'Abstract',
  Realistic = 'Realistic',
  Fantasy = 'Fantasy',
  Minimalist = 'Minimalist'
}

export interface PromptMutationRequest {
  originalPrompt: string;
  style: MutationStyle;
  creativityLevel: number;
  additionalContext?: string;
}

export interface PromptMutationResponse {
  originalPrompt: string;
  mutatedPrompt: string;
  appliedStyle: MutationStyle;
  creativityLevel: number;
  mutationExplanation: string;
  addedElements: string[];
  createdAt: string;
}

export interface MutationSuggestions {
  suggestions: string[];
  style: MutationStyle;
}

// Artwork interface matching backend model
export interface Artwork {
  id?: string;
  userEmail: string;
  sketchedImage?: string;
  aiImage?: string;
  title: string;
  description?: string;
  mutatedPrompt?: string;
  appliedStyle?: MutationStyle;
  creationDateTime: string;
  paths: PathData[];
}

export interface PathData {
  color: string;
  path: string;
  size: number;
}