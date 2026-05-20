"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, CheckCircle2, Loader2, User, Bot } from "lucide-react";
import { chatWithResume } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedSection?: string;
  suggestedContent?: string;
  applied?: boolean;
}

interface Props {
  tailoredId: string;
  sections: Record<string, string>;
  onApplySuggestion: (key: string, content: string) => void;
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I can help you improve your resume. Try asking me to:\n\n• \"Make the summary more concise\"\n• \"Add stronger action verbs to experience\"\n• \"Rewrite skills for a DevOps role\"\n• \"Make the tone more senior\"",
};

const SECTION_LABELS: Record<string, string> = {
  summary: "Professional Summary",
  experience: "Work Experience",
  skills: "Skills",
  education: "Education",
  projects: "Projects",
};

export default function AIChatPanel({ tailoredId, sections, onApplySuggestion }: Props) {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const result = await chatWithResume(tailoredId, {
        message: text,
        sections,
      });
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.reply,
        suggestedSection: result.suggestedSection,
        suggestedContent: result.suggestedContent,
        applied: false,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I couldn't process that. Please check your connection and try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (msg: Message) => {
    if (!msg.suggestedSection || !msg.suggestedContent) return;
    onApplySuggestion(msg.suggestedSection, msg.suggestedContent);
    setMessages(prev =>
      prev.map(m => m.id === msg.id ? { ...m, applied: true } : m)
    );
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden"
      style={{ background: "#0F0F12", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <Sparkles className="h-3.5 w-3.5" style={{ color: "#10B981" }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#FAFAFA]" style={{ fontFamily: "var(--font-heading)" }}>
            AI Assistant
          </p>
          <p className="text-[10px] text-[#52525B]">Ask me to improve any section</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ minHeight: 0 }}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: msg.role === "assistant"
                    ? "rgba(16,185,129,0.1)"
                    : "rgba(255,255,255,0.07)",
                }}
              >
                {msg.role === "assistant"
                  ? <Bot className="h-3 w-3" style={{ color: "#10B981" }} />
                  : <User className="h-3 w-3" style={{ color: "#71717A" }} />
                }
              </div>

              {/* Bubble */}
              <div className={`flex flex-col gap-1.5 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className="px-3 py-2 rounded-xl text-sm leading-relaxed"
                  style={{
                    background: msg.role === "user" ? "rgba(16,185,129,0.1)" : "#1C1C1F",
                    color: "#E4E4E7",
                    border: msg.role === "user"
                      ? "1px solid rgba(16,185,129,0.2)"
                      : "1px solid rgba(255,255,255,0.07)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>

                {/* Apply suggestion button */}
                {msg.suggestedSection && msg.suggestedContent && !msg.applied && (
                  <button
                    onClick={() => handleApply(msg)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 hover:opacity-80"
                    style={{
                      background: "rgba(16,185,129,0.1)",
                      color: "#10B981",
                      border: "1px solid rgba(16,185,129,0.2)",
                    }}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Apply to {SECTION_LABELS[msg.suggestedSection] ?? msg.suggestedSection}
                  </button>
                )}
                {msg.applied && (
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: "#10B981" }}>
                    <CheckCircle2 className="h-3 w-3" /> Applied
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2.5"
          >
            <div
              className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(16,185,129,0.1)" }}
            >
              <Bot className="h-3 w-3" style={{ color: "#10B981" }} />
            </div>
            <div
              className="px-3 py-2.5 rounded-xl"
              style={{ background: "#1C1C1F", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "#52525B" }} />
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0 p-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="flex items-end gap-2 rounded-lg p-2"
          style={{ background: "#1C1C1F", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              // Auto-resize
              const el = e.target;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKey}
            placeholder="Ask me to improve a section… (Enter to send, Shift+Enter for new line)"
            rows={2}
            disabled={loading}
            className="flex-1 bg-transparent text-sm outline-none resize-none placeholder:text-[#3F3F46] disabled:opacity-50"
            style={{
              color: "#E4E4E7",
              lineHeight: 1.5,
              minHeight: 40,
              maxHeight: 120,
              overflowY: "auto",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-150 disabled:opacity-30 hover:opacity-80 active:scale-95"
            style={{ background: "#10B981" }}
          >
            <Send className="h-3.5 w-3.5" style={{ color: "#0C0C0E" }} strokeWidth={2.5} />
          </button>
        </div>
        {/* Quick-prompt chips */}
        {!input && !loading && (
          <div className="flex gap-1.5 flex-wrap mt-2">
            {["Stronger verbs", "More concise", "Senior tone", "ATS keywords"].map(chip => (
              <button
                key={chip}
                onClick={() => setInput(chip)}
                className="text-[10px] px-2 py-0.5 rounded-md transition-colors duration-100 hover:border-[rgba(255,255,255,0.15)]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  color: "#52525B",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
