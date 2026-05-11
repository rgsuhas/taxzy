"use client";
import { useCallback } from "react";
import { getToken } from "@/lib/auth";
import { useTaxStore } from "@/store/taxStore";
import type { Message, StructuredUpdate } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useChat() {
  const {
    messages,
    isStreaming,
    streamingContent,
    currentConversationId,
    appendMessage,
    setStreaming,
    setStreamingContent,
    appendStreamingChunk,
    setConversationId,
    updateProfileFromChat,
  } = useTaxStore();

  const sendMessage = useCallback(async (text: string) => {
    if (isStreaming || !text.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    appendMessage(userMsg);
    setStreaming(true);
    setStreamingContent("");

    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          conversation_id: currentConversationId,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              // structured_update event
              if (parsed.type === "structured_update") {
                updateProfileFromChat(parsed.data as StructuredUpdate);
                if (parsed.conversation_id) setConversationId(parsed.conversation_id);
                continue;
              }
              // text chunk
              if (parsed.chunk !== undefined) {
                fullContent += parsed.chunk;
                appendStreamingChunk(parsed.chunk);
              } else if (typeof parsed === "string") {
                fullContent += parsed;
                appendStreamingChunk(parsed);
              }
            } catch {
              // plain text chunk
              if (data && data !== "[DONE]") {
                fullContent += data;
                appendStreamingChunk(data);
              }
            }
          }
        }
      }

      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: fullContent,
        created_at: new Date().toISOString(),
      };
      appendMessage(aiMsg);
    } catch (err) {
      const errMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        created_at: new Date().toISOString(),
      };
      appendMessage(errMsg);
    } finally {
      setStreaming(false);
      setStreamingContent("");
    }
  }, [isStreaming, currentConversationId, appendMessage, setStreaming, setStreamingContent, appendStreamingChunk, setConversationId, updateProfileFromChat]);

  return { messages, isStreaming, streamingContent, sendMessage };
}
