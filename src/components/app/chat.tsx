"use client";

import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/client";
import type { Feedback, Message } from "@/lib/types";

const META_MARKER = "__FLUENTAI_META__";

export function Chat({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<{ conversation: { messages: Message[]; status: string } }>(`/api/conversations/${conversationId}`)
      .then((res) => {
        setMessages(res.conversation.messages);
        if (res.conversation.status !== "active") setFinished(true);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load."));
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(finish: boolean) {
    const content = input.trim() || (finish ? "That's all for today, thank you!" : "");
    if (!content || busy) return;
    setInput("");
    setBusy(true);
    setError(null);
    setFeedback(null);
    setMessages((m) => [...m, { id: `tmp-${Date.now()}`, role: "user", content, createdAt: new Date().toISOString() }]);

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content, completeConversation: finish }),
      });
      if (!res.ok) {
        let detail = "Failed to send.";
        try {
          detail = (await res.json()).detail ?? detail;
        } catch {
          // ignore
        }
        throw new ApiError(detail, res.status);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let streamText = "";
      const assistantId = `tmp-assist-${Date.now()}`;
      setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "", createdAt: new Date().toISOString() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        streamText += decoder.decode(value, { stream: true });
        const idx = streamText.indexOf(META_MARKER);
        let text = streamText;
        if (idx !== -1) {
          text = streamText.slice(0, idx);
          const metaRaw = streamText.slice(idx + META_MARKER.length).trim();
          try {
            const meta = JSON.parse(metaRaw);
            if (meta.feedback) setFeedback(meta.feedback as Feedback);
          } catch {
            // ignore trailing parse error
          }
        }
        const clean = text.replace(/\n+$/, "");
        if (clean) {
          setMessages((m) => m.map((msg) =>
            msg.id === assistantId ? { ...msg, content: clean } : msg,
          ));
        }
      }
      if (finish) setFinished(true);
      setBusy(false);
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground">
            Say hello to start the conversation. 🙂
          </p>
        )}
        {messages.map((m) => (
          <Bubble key={m.id} message={m} />
        ))}
        {busy && <p className="text-sm text-muted-foreground">…</p>}
        <div ref={bottomRef} />
      </div>

      {feedback && <FeedbackPanel feedback={feedback} />}

      <div className="border-t p-4">
        {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
        {finished && (
          <p className="mb-2 text-sm font-medium text-green-600">
            Conversation complete — you earned completion XP. 🎉
          </p>
        )}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(false);
              }
            }}
            rows={2}
            disabled={busy || finished}
            placeholder={finished ? "Conversation finished" : "Type or practice your answer…"}
            className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            onClick={() => void send(false)}
            disabled={busy || finished || !input.trim()}
            className="rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            Send
          </button>
          <button
            onClick={() => void send(true)}
            disabled={busy || finished}
            className="rounded-md border px-4 text-sm font-medium disabled:opacity-40"
            title="Send your message and end the conversation to earn completion XP"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

function FeedbackPanel({ feedback }: { feedback: Feedback }) {
  return (
    <div className="mx-4 mb-2 rounded-2xl border p-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold">Coach feedback</span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold">
          {feedback.score}/100
        </span>
      </div>
      <p className="mt-2">{feedback.overall}</p>
      {feedback.grammarIssues.length > 0 && (
        <ul className="mt-2 space-y-1 text-muted-foreground">
          {feedback.grammarIssues.map((g, i) => (
            <li key={i}>
              “{g.original}” → {g.suggestion}
            </li>
          ))}
        </ul>
      )}
      {feedback.fluencyTips.map((t, i) => (
        <p key={i} className="mt-1 text-muted-foreground">
          💡 {t}
        </p>
      ))}
    </div>
  );
}
