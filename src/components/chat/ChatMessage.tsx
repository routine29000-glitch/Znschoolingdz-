"use client";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { Bot, User as UserIcon, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Message } from "@/types";
import { ThemeColors } from "@/types";
import toast from "react-hot-toast";

interface Props {
  message: Message;
  userName: string;
  theme: ThemeColors;
  isStreaming?: boolean;
}

export function ChatMessage({ message, userName, theme, isStreaming }: Props) {
  const isAssistant = message.role === "assistant";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("تم النسخ!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isAssistant ? "flex-row" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm mt-1"
        style={{
          background: isAssistant ? theme.accent : theme.accentLight,
          color: isAssistant ? "white" : theme.accent,
        }}
      >
        {isAssistant ? <Bot size={18} /> : <UserIcon size={18} />}
      </div>

      {/* Bubble */}
      <div className={`flex-1 max-w-[80%] ${isAssistant ? "" : "flex flex-col items-end"}`}>
        <p className="text-xs text-muted mb-1 font-medium">
          {isAssistant ? "زن المعلم" : userName}
        </p>

        {/* Image if exists */}
        {message.image_url && (
          <img
            src={message.image_url}
            alt="uploaded"
            className="max-h-48 w-auto rounded-xl mb-2 border border-olive/20 object-contain"
          />
        )}

        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed relative group ${
            isAssistant
              ? "bg-white border border-olive/10 shadow-sm rounded-tr-sm"
              : "rounded-tl-sm text-white"
          }`}
          style={!isAssistant ? { background: theme.accent } : {}}
        >
          {isAssistant ? (
            <div className="message-content">
              {message.content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex, rehypeRaw]}
                >
                  {message.content}
                </ReactMarkdown>
              ) : isStreaming ? (
                <div className="flex items-center gap-1.5 py-1">
                  <div className="w-2 h-2 bg-olive/40 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-olive/40 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-olive/40 rounded-full typing-dot" />
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-white leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Copy button for assistant messages */}
          {isAssistant && message.content && (
            <button
              onClick={handleCopy}
              className="absolute top-2 left-2 p-1.5 rounded-lg bg-olive/5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-olive/10"
            >
              {copied ? <Check size={12} className="text-olive" /> : <Copy size={12} className="text-muted" />}
            </button>
          )}
        </div>

        {/* Streaming indicator */}
        {isStreaming && isAssistant && message.content && (
          <div className="flex items-center gap-1.5 mt-1.5 pr-1">
            <div className="w-1.5 h-1.5 bg-olive rounded-full animate-pulse" />
            <span className="text-xs text-muted">يكتب...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
