
export enum CalcMode {
  STANDARD = 'STANDARD',
  SCIENTIFIC = 'SCIENTIFIC',
  AI_ASSISTANT = 'AI_ASSISTANT'
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface AIResponse {
  result: string;
  explanation: string;
  steps: string[];
}
