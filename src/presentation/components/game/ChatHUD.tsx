"use client";

import { peerManager } from "@/src/infrastructure/p2p/peerManager";
import { useSound } from "@/src/presentation/stores/soundStore";
import { useUserStore } from "@/src/presentation/stores/userStore";
import { ChevronDown, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Chat Message Type
 */
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
  isMe: boolean;
}

/**
 * Chat HUD Component
 * Floating chat panel that can be toggled open/close
 */
export function ChatHUD() {
  const { user } = useUserStore();
  const { playChat, playClick } = useSound();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  // Register chat message handler
  useEffect(() => {
    const unsubscribe = peerManager.onMessage("chat", (message) => {
      const payload = message.payload as {
        text: string;
        senderName: string;
        senderAvatar: string;
      };

      const newMessage: ChatMessage = {
        id: `${message.timestamp}_${message.senderId}`,
        senderId: message.senderId,
        senderName: payload.senderName,
        senderAvatar: payload.senderAvatar,
        text: payload.text,
        timestamp: message.timestamp,
        isMe: false,
      };

      setMessages((prev) => [...prev, newMessage]);

      // Increment unread if chat is closed
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
        playChat();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, playChat]);

  const handleSend = () => {
    if (!inputValue.trim() || !user) return;

    playClick();
    const text = inputValue.trim();
    setInputValue("");

    // Add to local messages
    const newMessage: ChatMessage = {
      id: `${Date.now()}_${user.id}`,
      senderId: user.id,
      senderName: user.nickname,
      senderAvatar: user.avatar,
      text,
      timestamp: Date.now(),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMessage]);

    // Broadcast to other players
    peerManager.broadcast("chat", {
      text,
      senderName: user.nickname,
      senderAvatar: user.avatar,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 lg:bottom-4 flex flex-col items-end gap-2">
      {/* Chat Panel */}
      {isOpen && (
        <div className="w-80 max-w-[calc(100vw-2rem)] bg-background dark:bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface dark:bg-muted-dark">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-info" />
              <span className="font-medium text-sm">แชท</span>
              <span className="text-xs text-muted">({messages.length})</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-surface transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-3 space-y-3 bg-background dark:bg-background">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted text-sm">
                ยังไม่มีข้อความ
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.isMe ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className="shrink-0 w-8 h-8 rounded-full bg-muted-light dark:bg-muted-dark flex items-center justify-center text-lg">
                    {msg.senderAvatar}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[70%] ${
                      msg.isMe
                        ? "bg-info text-white rounded-2xl rounded-tr-sm"
                        : "bg-surface border border-border rounded-2xl rounded-tl-sm"
                    } px-3 py-2`}
                  >
                    {!msg.isMe && (
                      <p className="text-xs text-muted mb-1">
                        {msg.senderName}
                      </p>
                    )}
                    <p className="text-sm break-all">{msg.text}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.isMe ? "text-white/70" : "text-muted"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-surface dark:bg-surface">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="พิมพ์ข้อความ..."
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-info/50 focus:border-info"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="shrink-0 p-2 rounded-lg bg-info text-white hover:bg-info-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3 rounded-full shadow-lg transition-all ${
          isOpen
            ? "bg-muted-light dark:bg-muted-dark text-foreground"
            : "bg-info text-white hover:bg-info-dark"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}

        {/* Unread Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-error text-white rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
