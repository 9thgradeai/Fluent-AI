// Provider-agnostic text-to-speech interface.

export interface SynthesisResult {
  audio: Buffer;
  contentType: string;
  durationMs: number;
  provider: string;
  model: string;
}

export interface TextToSpeechProvider {
  readonly provider: string;
  readonly modelId: string;

  /** Synthesize text to audio */
  synthesize(text: string, opts?: {
    voice?: string;
    speed?: number;
    language?: string;
  }): Promise<SynthesisResult>;

  /** Check if provider is available */
  isAvailable(): Promise<boolean>;
}
