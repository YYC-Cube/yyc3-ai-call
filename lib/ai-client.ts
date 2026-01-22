/**
 * AI Client SDK - Zhipu AI vLLM OpenAI-compatible wrapper
 * Supports ChatGLM3-6B, CodeGeeX4-ALL-9B, CogAgent
 */

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatCompletionRequest {
  model?: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class AIClient {
  private baseUrl: string;
  private model: string;
  private timeout: number;
  private defaultTemperature: number;
  private defaultMaxTokens: number;

  constructor(
    baseUrl?: string,
    model?: string,
    timeout?: number,
    temperature?: number,
    maxTokens?: number,
  ) {
    this.baseUrl =
      baseUrl || process.env.AI_BASE_URL || "http://127.0.0.1:10086/v1";
    this.model = model || process.env.AI_MODEL || "chatglm3-6b";
    this.timeout =
      timeout ||
      (process.env.AI_TIMEOUT_MS
        ? parseInt(process.env.AI_TIMEOUT_MS, 10)
        : 20000);
    this.defaultTemperature =
      temperature ||
      (process.env.AI_TEMPERATURE
        ? parseFloat(process.env.AI_TEMPERATURE)
        : 0.6);
    this.defaultMaxTokens =
      maxTokens ||
      (process.env.AI_MAX_TOKENS
        ? parseInt(process.env.AI_MAX_TOKENS, 10)
        : 1024);
  }

  async chat(
    messages: ChatMessage[],
    options?: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
    },
  ): Promise<ChatCompletionResponse> {
    const payload: ChatCompletionRequest = {
      model: options?.model || this.model,
      messages,
      max_tokens: options?.max_tokens ?? this.defaultMaxTokens,
      temperature: options?.temperature ?? this.defaultTemperature,
      top_p: options?.top_p,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(
          `AI API error: ${response.status} ${response.statusText} - ${error}`,
        );
      }

      const data: ChatCompletionResponse = await response.json();
      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async chatStream(
    messages: ChatMessage[],
    options?: {
      model?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
    },
  ): Promise<ReadableStream<Uint8Array>> {
    const payload: ChatCompletionRequest = {
      model: options?.model || this.model,
      messages,
      max_tokens: options?.max_tokens ?? this.defaultMaxTokens,
      temperature: options?.temperature ?? this.defaultTemperature,
      top_p: options?.top_p,
      stream: true,
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `AI API error: ${response.status} ${response.statusText}`,
      );
    }

    if (!response.body) {
      throw new Error("No response body for streaming");
    }

    return response.body;
  }

  /**
   * Extract text content from a completion response
   */
  extractText(response: ChatCompletionResponse): string {
    if (
      response.choices &&
      response.choices.length > 0 &&
      response.choices[0].message
    ) {
      return response.choices[0].message.content;
    }
    return "";
  }

  /**
   * Simple intent classification using few-shot prompt
   */
  async classifyIntent(
    userMessage: string,
    intents: string[] = ["sales", "support", "billing", "feedback", "other"],
  ): Promise<{ intent: string; confidence: number }> {
    const systemPrompt = `You are an intent classifier. Classify the user's message into one of these categories: ${intents.join(", ")}.
    
Reply with JSON: {"intent": "<category>", "confidence": <0-1>}`;

    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      { temperature: 0.1, max_tokens: 100 },
    );

    const text = this.extractText(response);
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch {
      return { intent: "other", confidence: 0.5 };
    }
  }

  /**
   * Sentiment analysis
   */
  async analyzeSentiment(text: string): Promise<{
    sentiment: "positive" | "negative" | "neutral";
    score: number;
  }> {
    const systemPrompt =
      'Analyze the sentiment of the user input. Reply with JSON: {"sentiment": "positive|negative|neutral", "score": <-1 to 1>}';

    const response = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      { temperature: 0.1, max_tokens: 100 },
    );

    const responseText = this.extractText(response);
    try {
      const parsed = JSON.parse(responseText);
      return parsed;
    } catch {
      return { sentiment: "neutral", score: 0 };
    }
  }

  /**
   * Get model info
   */
  async getModels(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/models`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data?.map((m: any) => m.id) || [];
  }

  /**
   * Ping health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const models = await this.getModels();
      return models.length > 0;
    } catch {
      return false;
    }
  }
}

// Default singleton instance (use for server-side)
let defaultClient: AIClient | null = null;

export function getAIClient(): AIClient {
  if (!defaultClient) {
    defaultClient = new AIClient();
  }
  return defaultClient;
}

// For custom instances
export function createAIClient(
  baseUrl?: string,
  model?: string,
  timeout?: number,
  temperature?: number,
  maxTokens?: number,
): AIClient {
  return new AIClient(baseUrl, model, timeout, temperature, maxTokens);
}
