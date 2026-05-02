import { useState, useRef, useEffect } from "react";
import { useSendAiMessage, useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Mic, Bot } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "How do I take my medicines safely?",
  "Give me a health tip for today",
  "I'm feeling lonely today",
  "What should I eat to keep my blood pressure low?",
];

export default function Assistant() {
  const { data: profile } = useGetProfile({ query: { queryKey: getGetProfileQueryKey() } });
  const sendMessage = useSendAiMessage();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Namaste! I'm your Saathi, your personal care companion. I'm here to help you with health tips, reminders, medicines, and anything else you need. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(QUICK_PROMPTS);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    const messageText = text.trim();
    if (!messageText) return;

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
          setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
          if (response.suggestions && response.suggestions.length > 0) {
            setSuggestions(response.suggestions);
          }
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "I'm sorry, I couldn't respond right now. Please try again in a moment." },
          ]);
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-foreground">Your Saathi</h1>
        <p className="text-lg text-muted-foreground mt-1">Your personal care companion</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            data-testid={`message-${msg.role}-${i}`}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-2xl">
                🧑‍⚕️
              </div>
            )}
            <div
              className={`max-w-[80%] px-5 py-4 rounded-3xl text-lg leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-card border border-border/50 text-foreground rounded-tl-sm shadow-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {sendMessage.isPending && (
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">🧑‍⚕️</div>
            <div className="bg-card border border-border/50 px-5 py-4 rounded-3xl rounded-tl-sm shadow-sm">
              <div className="flex gap-2 items-center">
                <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {suggestions.slice(0, 3).map((s, i) => (
            <button
              key={i}
              data-testid={`button-suggestion-${i}`}
              onClick={() => handleSend(s)}
              className="text-sm px-4 py-2 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors border border-primary/20"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 items-center">
        <Input
          data-testid="input-assistant-message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend(input)}
          placeholder="Type your question here..."
          className="h-14 text-lg rounded-2xl flex-1"
          disabled={sendMessage.isPending}
        />
        <Button
          data-testid="button-send-message"
          size="lg"
          onClick={() => handleSend(input)}
          disabled={!input.trim() || sendMessage.isPending}
          className="h-14 w-14 rounded-full shrink-0"
        >
          <Send className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
