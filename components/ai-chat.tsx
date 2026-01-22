/**
 * AI Chat Component - Example usage of useAI hook
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useAI } from "@/lib/hooks/useAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  intent?: { intent: string; confidence: number };
  sentiment?: { sentiment: string; score: number };
}

export function AIChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    loading,
    error,
    chat,
    classifyIntent,
    analyzeSentiment,
    healthCheck,
  } = useAI();

  // Check health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const health = await healthCheck();
      setIsHealthy(health?.healthy ?? false);
    };
    checkHealth();
  }, [healthCheck]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    try {
      // Classify intent and analyze sentiment in parallel
      const [intentResult, sentimentResult] = await Promise.all([
        classifyIntent(inputValue),
        analyzeSentiment(inputValue),
      ]);

      // Build enhanced user message
      const enhancedUserMessage: Message = {
        ...userMessage,
        intent: intentResult,
        sentiment: sentimentResult,
      };

      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? enhancedUserMessage : m)),
      );

      // Call ChatGLM3 for response
      const chatResponse = await chat(
        [
          {
            role: "user",
            content: inputValue,
          },
        ],
        {
          temperature: 0.6,
          max_tokens: 512,
        },
      );

      const assistantContent =
        chatResponse.choices?.[0]?.message?.content || "No response";

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      // Optionally add error message to chat
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">YYC³ AI Chat</h1>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                isHealthy ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-600">
              {isHealthy ? "Connected" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Start a conversation...</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <Card
              className={`max-w-xs lg:max-w-md px-4 py-2 ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              <p className="text-sm">{msg.content}</p>

              {/* Show metadata for user messages */}
              {msg.role === "user" && (msg.intent || msg.sentiment) && (
                <div className="mt-2 pt-2 border-t border-current border-opacity-20 text-xs space-y-1">
                  {msg.intent && (
                    <p>
                      Intent: {msg.intent.intent} (
                      {(msg.intent.confidence * 100).toFixed(0)}%)
                    </p>
                  )}
                  {msg.sentiment && (
                    <p>
                      Sentiment: {msg.sentiment.sentiment} (
                      {(msg.sentiment.score * 100).toFixed(0)}%)
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </Card>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <Card className="bg-gray-200 px-4 py-2">
              <p className="text-sm text-gray-900">Thinking...</p>
            </Card>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <Card className="bg-red-100 px-4 py-2">
              <p className="text-sm text-red-900">Error: {error.message}</p>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4 shadow-lg">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            disabled={loading || !isHealthy}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !inputValue.trim() || !isHealthy}
            className="px-6"
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
