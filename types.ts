
export interface AnalysisResult {
  concept: string;
  videoPrompt: string;
  styleKeywords: string[];
  suggestedMotion: string;
  lensType: string;
  cinematographicStyle: string;
}

export interface HistoryItem {
  id: string;
  imageUrl: string;
  result: AnalysisResult;
  timestamp: number;
}
