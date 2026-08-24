// Conversation state machine.
// Explicit state transitions prevent impossible states.

export type ConversationState =
  | "idle"
  | "connecting"
  | "connected"
  | "listening"
  | "processing"
  | "ai_thinking"
  | "ai_speaking"
  | "interrupted"
  | "reconnecting"
  | "paused"
  | "ending"
  | "completed"
  | "failed"
  | "expired";

export type ConversationEvent =
  | "connect"
  | "connected"
  | "user_started_speaking"
  | "user_stopped_speaking"
  | "audio_received"
  | "transcription_complete"
  | "ai_thinking_start"
  | "ai_response_start"
  | "ai_response_token"
  | "ai_response_complete"
  | "ai_audio_start"
  | "ai_audio_complete"
  | "user_interrupt"
  | "ai_interrupt"
  | "pause"
  | "resume"
  | "end_session"
  | "timeout"
  | "error"
  | "reconnect"
  | "disconnect";

// Valid state transitions
const TRANSITIONS: Record<ConversationState, ConversationEvent[]> = {
  idle: ["connect"],
  connecting: ["connected", "error", "timeout"],
  connected: ["user_started_speaking", "pause", "end_session", "disconnect", "error"],
  listening: ["user_stopped_speaking", "user_interrupt", "ai_interrupt", "pause", "end_session", "error"],
  processing: ["ai_thinking_start", "error", "timeout"],
  ai_thinking: ["ai_response_start", "error", "timeout"],
  ai_speaking: ["ai_response_complete", "user_interrupt", "ai_interrupt", "pause", "end_session", "error"],
  interrupted: ["user_started_speaking", "ai_thinking_start", "end_session", "error"],
  reconnecting: ["connected", "error", "timeout"],
  paused: ["resume", "end_session", "error"],
  ending: ["end_session", "error"],
  completed: [],
  failed: [],
  expired: [],
};

export class ConversationStateMachine {
  private state: ConversationState = "idle";
  private history: Array<{ state: ConversationState; event: ConversationEvent; timestamp: number }> = [];
  private listeners: Map<ConversationState, Array<(ctx: TransitionContext) => void>> = new Map();

  getState(): ConversationState {
    return this.state;
  }

  canTransition(event: ConversationEvent): boolean {
    return TRANSITIONS[this.state]?.includes(event) ?? false;
  }

  transition(event: ConversationEvent, data?: Record<string, unknown>): TransitionContext {
    if (!this.canTransition(event)) {
      throw new Error(`Invalid transition: ${this.state} + ${event}`);
    }

    const previousState = this.state;
    // Determine next state based on event
    this.state = this.getNextState(event);

    const ctx: TransitionContext = {
      from: previousState,
      to: this.state,
      event,
      timestamp: Date.now(),
      data,
    };

    this.history.push({ state: this.state, event, timestamp: ctx.timestamp });

    // Notify listeners
    const handlers = this.listeners.get(this.state) ?? [];
    for (const handler of handlers) {
      handler(ctx);
    }

    return ctx;
  }

  onEnter(state: ConversationState, handler: (ctx: TransitionContext) => void) {
    const handlers = this.listeners.get(state) ?? [];
    handlers.push(handler);
    this.listeners.set(state, handlers);
  }

  getHistory() {
    return [...this.history];
  }

  reset() {
    this.state = "idle";
    this.history = [];
  }

  private getNextState(event: ConversationEvent): ConversationState {
    const map: Record<ConversationEvent, ConversationState> = {
      connect: "connecting",
      connected: "connected",
      user_started_speaking: "listening",
      user_stopped_speaking: "processing",
      audio_received: "processing",
      transcription_complete: "ai_thinking",
      ai_thinking_start: "ai_thinking",
      ai_response_start: "ai_speaking",
      ai_response_token: "ai_speaking",
      ai_response_complete: "connected",
      ai_audio_start: "ai_speaking",
      ai_audio_complete: "connected",
      user_interrupt: "interrupted",
      ai_interrupt: "interrupted",
      pause: "paused",
      resume: "connected",
      end_session: "ending",
      timeout: "expired",
      error: "failed",
      reconnect: "reconnecting",
      disconnect: "idle",
    };
    return map[event] ?? this.state;
  }
}

export interface TransitionContext {
  from: ConversationState;
  to: ConversationState;
  event: ConversationEvent;
  timestamp: number;
  data?: Record<string, unknown>;
}
