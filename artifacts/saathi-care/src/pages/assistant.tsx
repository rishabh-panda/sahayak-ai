import { useState, useRef, useEffect } from "react";
import { useSendAiMessage, useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, BrainCircuit, User } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "How do I take my medicines safely?",
  "Give me a health tip for today",
  "What should I eat to control blood pressure?",
];

export default function Assistant() {
  const { data: profile } = useGetProfile({ query: { queryKey: getGetProfileQueryKey() } });
  const sendMessage = useSendAiMessage();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your Sahayak AI assistant. I can help you with health guidance, medication reminders, wellness tips, and anything else you need. How may I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(QUICK_PROMPTS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    const messageText = text.trim();
    if (!messageText || sendMessage.isPending) return;

    const userMessage: Message = { role: "user", content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setSuggestions([]);

    const history = newMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));

    sendMessage.mutate(
      {
        data: {
          message: messageText,
          language: profile?.language ?? "en",
          conversationHistory: history,
        },
      },
      {
        onSuccess: (response) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: response.reply },
          ]);
          if (response.suggestions && response.suggestions.length > 0) {
            setSuggestions(response.suggestions.slice(0, 3));
          }
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "I apologize — I am unable to respond right now. Please try again in a moment.",
            },
          ]);
        },
      }
    );
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100svh - 136px)" }}>
      {/* Page Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border/50 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25">
          <BrainCircuit className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-[17px] font-semibold text-foreground">Sahayak AI</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse inline-block" />
            <span className="text-[12px] text-muted-foreground">Online · Here to help</span>
          </div>
        </div>
      </div>

      {/* Messages — scrollable area */}
      <div className="flex-1 overflow-y-auto min-h-0 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            data-testid={`message-${msg.role}-${i}`}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 self-end ${
                msg.role === "assistant"
                  ? "bg-primary shadow-sm shadow-primary/20"
                  : "bg-muted"
              }`}
            >
              {msg.role === "assistant" ? (
                <BrainCircuit className="w-4.5 h-4.5 text-white" strokeWidth={2} />
              ) : (
                <User className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={2} />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[78%] px-4 py-3 text-[15px] leading-relaxed rounded-2xl ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-br-sm shadow-md shadow-primary/20"
                  : "bg-card border border-border/60 text-foreground rounded-bl-sm shadow-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {sendMessage.isPending && (
          <div className="flex gap-3 flex-row">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 self-end shadow-sm">
              <BrainCircuit className="w-4.5 h-4.5 text-white" strokeWidth={2} />
            </div>
            <div className="bg-card border border-border/60 px-4 py-3.5 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom: suggestions + input */}
      <div className="flex-shrink-0 pt-3 space-y-3 border-t border-border/50">
        {/* Quick Suggestions */}
        {suggestions.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {suggestions.map((s, i) => (
              <button
                key={i}
                data-icon-only
                data-testid={`button-suggestion-${i}`}
                onClick={() => handleSend(s)}
                className="text-[13px] px-3.5 py-2 rounded-xl bg-accent text-accent-foreground font-medium hover:bg-primary hover:text-white transition-all duration-200 border border-accent-border/30"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Row */}
        <div className="flex gap-2.5 items-center">
          <Input
            ref={inputRef}
            data-testid="input-assistant-message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder="Type your message..."
            className="flex-1 h-[52px] text-[15px] rounded-xl bg-card border-border/70 focus:border-primary/50 focus:ring-primary/20"
            disabled={sendMessage.isPending}
          />
          <button
            data-icon-only
            data-testid="button-send-message"
            onClick={() => handleSend(input)}
            disabled={!input.trim() || sendMessage.isPending}
            className="w-[52px] h-[52px] rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all duration-200 shrink-0"
          >
            <Send className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
