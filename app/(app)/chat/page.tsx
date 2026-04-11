"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { getChatGeneral, addChatMessage, getGuards } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import type { ChatMessage } from "@/lib/types";

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function refresh() {
    setMessages(getChatGeneral());
  }

  useEffect(() => {
    setMounted(true);
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  if (!mounted || !user) return null;

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    addChatMessage({
      senderId: user!.id,
      senderName: user!.name,
      senderRole: user!.role,
      receiverId: null,
      channel: "general",
      content: input.trim(),
    });
    setInput("");
    refresh();
  }

  function formatTime(ts: string) {
    const d = new Date(ts);
    const today = new Date().toISOString().split("T")[0];
    const msgDate = ts.split("T")[0];
    const time = d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
    if (msgDate === today) return time;
    return `${d.getMonth() + 1}/${d.getDate()} ${time}`;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h1 className="text-2xl font-bold">{user.role === "admin" ? "管制チャット" : "チャット"}</h1>
        <span className="text-xs text-text-secondary px-2 py-1 rounded bg-sub-bg">全体連絡</span>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <p>メッセージはまだありません</p>
            <p className="text-xs mt-1">最初のメッセージを送信してください</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user.id;
            const isAdmin = msg.senderRole === "admin";
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${isMe ? "order-1" : ""}`}>
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-xs font-medium ${isAdmin ? "text-accent" : "text-text-primary"}`}>
                        {msg.senderName}
                      </span>
                      {isAdmin && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-accent/10 text-accent">管制</span>
                      )}
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? "bg-accent text-white rounded-br-md"
                      : isAdmin
                        ? "bg-accent/10 border border-accent/20 text-text-primary rounded-bl-md"
                        : "bg-card-bg border border-border text-text-primary rounded-bl-md"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <p className={`text-[10px] text-text-secondary mt-0.5 ${isMe ? "text-right" : ""}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 rounded-xl border border-border bg-sub-bg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-5 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark cursor-pointer transition-colors disabled:opacity-40 active:scale-95 shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
