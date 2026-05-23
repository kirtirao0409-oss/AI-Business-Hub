import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: userMessage.content,
          history: updatedMessages.slice(0, -1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: data.id || Date.now().toString(),
          role: "assistant",
          content: data.content || "No response from AI",
          createdAt: data.createdAt || new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-[100dvh] flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">AI Assistant</h1>
          <p className="text-muted-foreground mt-1">Chat with your business data.</p>
        </div>
        {messages.length > 0 && (
          <button
            data-testid="button-clear-chat"
            onClick={() => setMessages([])}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear chat
          </button>
        )}
      </div>

      <div className="flex-1 border border-border rounded-lg bg-card/30 flex flex-col overflow-hidden backdrop-blur-sm">
        <div className="flex-1 p-6 overflow-y-auto space-y-6" ref={scrollRef}>
          {messages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">How can I help you today?</h3>
                <p className="text-muted-foreground max-w-md text-sm">
                  I can analyze your pipeline, summarize recent activity, draft outreach emails, or answer questions about your team and projects.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                {[
                  "Summarize my CRM pipeline",
                  "Which candidates need follow-up?",
                  "What projects are behind schedule?",
                  "Draft an outreach email for a warm lead",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-xs text-left px-4 py-3 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                data-testid={`message-${msg.role}-${msg.id}`}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "assistant"
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm p-4 flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-card/50">
          <div className="relative flex items-center">
            <input
              data-testid="input-chat-message"
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="w-full bg-background border border-input rounded-full pl-6 pr-14 py-4 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm"
              disabled={loading}
            />
            <button
              data-testid="button-send-message"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-2 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-50 transition-opacity hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
