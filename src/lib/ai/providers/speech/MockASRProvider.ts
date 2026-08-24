// Mock ASR provider for development.

import type { SpeechToTextProvider, TranscriptionResult } from "./ASRProvider";

export class MockASRProvider implements SpeechToTextProvider {
  readonly provider = "mock";
  readonly modelId = "mock-asr";

  async transcribe(audio: Buffer, opts?: { language?: string }): Promise<TranscriptionResult> {
    return {
      text: "[Mock transcription — configure a real ASR provider for actual speech recognition]",
      language: opts?.language ?? "en",
      confidence: 0.95,
      words: [],
      durationMs: Math.max(1000, audio.length / 16), // rough estimate
      provider: this.provider,
      model: this.modelId,
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}
