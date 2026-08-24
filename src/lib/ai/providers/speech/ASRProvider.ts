// Provider-agnostic speech-to-text interface.

export interface TranscriptionResult {
  text: string;
  language: string;
  confidence?: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence?: number;
  }>;
  durationMs: number;
  provider: string;
  model: string;
}

export interface SpeechToTextProvider {
  readonly provider: string;
  readonly modelId: string;

  /** Transcribe audio bytes to text */
  transcribe(audio: Buffer, opts?: {
    language?: string;
    prompt?: string;
  }): Promise<TranscriptionResult>;

  /** Check if provider is available */
  isAvailable(): Promise<boolean>;
}
