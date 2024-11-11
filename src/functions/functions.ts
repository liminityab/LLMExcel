/* global  console, CustomFunctions  */
import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { MessageParam } from "@anthropic-ai/sdk/resources";

type Provider = "openai" | "anthropic";
type Message = { role: "user" | "system"; content: string };

interface AIClient {
  generateCompletion(messages: Message[], model: string): Promise<string>;
  generateStreamingCompletion(messages: Message[], model: string, onChunk: (chunk: string) => void): Promise<void>;
}

class OpenAIClient implements AIClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }

  async generateCompletion(messages: Message[], model: string): Promise<string> {
    const response = await this.client.chat.completions.create({ messages, model });
    return response.choices[0].message.content || "No content in response";
  }

  async generateStreamingCompletion(
    messages: Message[],
    model: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const stream = await this.client.chat.completions.create({ messages, model, stream: true });
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      onChunk(content);
    }
  }
}

class AnthropicClient implements AIClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  }

  async generateCompletion(messages: Message[], model: string): Promise<string> {
    const systemMessage = messages.find((msg) => msg.role === "system");
    const userMessages = messages.filter((msg) => msg.role === "user");

    const response = await this.client.messages.create({
      messages: userMessages as MessageParam[],
      model,
      max_tokens: 1000,
      system: systemMessage?.content,
    });
    return response.content[0].type === "text" ? response.content[0].text : "";
  }

  async generateStreamingCompletion(
    messages: Message[],
    model: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const systemMessage = messages.find((msg) => msg.role === "system");
    const userMessages = messages.filter((msg) => msg.role === "user");

    const stream = await this.client.messages.create({
      messages: userMessages as MessageParam[],
      model,
      max_tokens: 1000,
      stream: true,
      system: systemMessage?.content,
    });
    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        onChunk(chunk.delta.text);
      }
    }
  }
}

function createAIClient(provider: Provider, apiKey: string): AIClient {
  switch (provider) {
    case "openai":
      return new OpenAIClient(apiKey);
    case "anthropic":
      return new AnthropicClient(apiKey);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Generates a response based on the given prompt using the specified AI model and provider.
 * @customfunction PROMPT
 * @helpUrl https://llmexcel.liminity.se/help
 * @param message The prompt message to send to the AI. a
 * @param model The AI model to use for generating the response.
 * @param apiKey The API key for the AI service.
 * @param systemPrompt An optional system prompt to provide context for the AI.
 * @param provider The AI provider to use (either "openai" or "anthropic").
 * @returns A promise that resolves to the generated response.
 */
export async function prompt(
  message: string,
  model: string,
  apiKey: string,
  systemPrompt: string,
  provider: string
): Promise<string> {
  try {
    if (!message || !model || !apiKey || !provider) {
      throw new Error("Missing required parameters");
    }

    if (!["openai", "anthropic"].includes(provider.toLowerCase())) {
      throw new Error("Invalid provider. Must be 'openai' or 'anthropic'");
    }

    const client = createAIClient(provider.toLowerCase() as Provider, apiKey);
    const messages: Message[] = systemPrompt
      ? [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ]
      : [{ role: "user", content: message }];

    const response = await client.generateCompletion(messages, model);
    if (!response) {
      throw new Error("Empty response from AI provider");
    }
    return response;
  } catch (error) {
    console.error("Error in prompt function:", error);
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    } else {
      return "An unexpected error occurred";
    }
  }
}

/**
 * Generates a streaming response based on the given prompt using the specified AI model and provider.
 * @customfunction PROMPT_STREAM
 * @streaming
 * @helpUrl https://llmexcel.liminity.se/help
 * @param message The prompt message to send to the AI.
 * @param model The AI model to use for generating the response.
 * @param apiKey The API key for the AI service.
 * @param systemPrompt An optional system prompt to provide context for the AI.
 * @param provider The AI provider to use (either "openai" or "anthropic").
 * @param invocation The streaming invocation object
 */
export function promptStream(
  message: string,
  model: string,
  apiKey: string,
  systemPrompt: string,
  provider: string,
  invocation: CustomFunctions.StreamingInvocation<string>
): void {
  try {
    if (!message || !model || !apiKey || !provider) {
      throw new Error("Missing required parameters");
    }

    if (!["openai", "anthropic"].includes(provider.toLowerCase())) {
      throw new Error("Invalid provider. Must be 'openai' or 'anthropic'");
    }

    const client = createAIClient(provider.toLowerCase() as Provider, apiKey);
    let fullResponse = "";

    const messages: Message[] = systemPrompt
      ? [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ]
      : [{ role: "user", content: message }];

    client
      .generateStreamingCompletion(messages, model, (chunk) => {
        fullResponse += chunk;
        invocation.setResult(fullResponse);
      })
      .then(() => {
        if (!fullResponse) {
          throw new Error("Empty response from AI provider");
        }
      })
      .catch((error) => {
        console.error("Error in promptStream function:", error);
        if (error instanceof Error) {
          invocation.setResult(`Error: ${error.message}`);
        } else {
          invocation.setResult("An unexpected error occurred");
        }
      });

    invocation.onCanceled = () => {
      console.log("Stream cancelled by user");
    };
  } catch (error) {
    console.error("Error in promptStream function setup:", error);
    if (error instanceof Error) {
      invocation.setResult(`Error: ${error.message}`);
    } else {
      invocation.setResult("An unexpected error occurred");
    }
  }
}
