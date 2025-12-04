export enum AppState {
  TOPIC_SELECTION = 'TOPIC_SELECTION',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  DESCRIBING = 'DESCRIBING',
  ANALYZING = 'ANALYZING',
  FEEDBACK = 'FEEDBACK',
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string;
  vocabulary: string[];
}

export interface GrammarCorrection {
  error: string;
  correction: string;
  explanation: string;
}

export interface ScoreBreakdown {
  grammar: number;
  vocabulary: number;
  coherence: number;
}

export interface FeedbackResponse {
  grammarCorrections: GrammarCorrection[];
  vocabularySuggestions: string[];
  coherenceCheck: string;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  generalAdvice: string;
}