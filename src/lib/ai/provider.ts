// Provider selection (refactored to use config system).

export type ProviderName = "mock" | "openai" | "anthropic";

export { getResolvedProvider as pickProvider, getModelForProvider as modelFor } from "../config/env";
