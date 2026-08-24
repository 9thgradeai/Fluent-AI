// Mock TTS provider for development.

import type { TextToSpeechProvider, SynthesisResult } from "./TTSProvider";

export class MockTTSProvider implements TextToSpeechProvider {
  readonly provider = "mock";
  readonly modelId = "mock-tts";

  async synthesize(text: string, _opts?: { voice?: string }): Promise<SynthesisResult> {
    // Return silence buffer (1 second of empty PCM)
    const sampleRate = 16000;
    const durationMs = Math.max(1000, text.split(/\s+/).length * 500);
    const bufferSize = Math.floor((sampleRate * durationMs) / 1000) * 2; // 16-bit mono
    const audio = Buffer.alloc(bufferSize, 0);

    return {
      audio,
      contentType: "audio/pcm",
      durationMs,
      provider: this.provider,
      model: this.modelId,
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}
