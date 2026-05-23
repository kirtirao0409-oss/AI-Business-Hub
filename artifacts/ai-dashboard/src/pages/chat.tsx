import { useState, useRef, useEffect } from "react";
import { 
  useGetChatMessages, 
  useSendChatMessage,
  getGetChatMessagesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Send, Bot, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Chat() {
  const [input, setInput] = useState("");
  const { data: messages, isLoading } = useGetChatMessages();
  const sendMutation = useSendChatMessage();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || sendMutation.isPending) return;
    
    sendMutation.mutate(
      { data: { content: input } },
      {
        onSuccess: () => {
          setInput("");
          queryClient.invalidateQueries({ queryKey: getGetChatMessagesQueryKey() });
        }
      }
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-[100dvh] flex flex-col">
      <h1 className="text-3xl font-bold">AI Assistant</h1>
      <p className="text-muted-foreground mt-2 mb-6">Chat with your business data.</p>
      
      <div className="flex-1 border border-border rounded-lg bg-card/30 flex flex-col overflow-hidden backdrop-blur-sm">
        <div 
          className="flex-1 p-6 overflow-y-auto space-y-6"
          ref={scrollRef}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading history...
            </div>
          ) : messages?.length ? (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'assistant' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-muted text-foreground rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">How can I help you today?</h3>
                <p className="text-muted-foreground max-w-md">
                  I can analyze your pipeline, summarize recent activity, or help draft emails to prospects.
                </p>
              </div>
            </div>
          )}
          
          {sendMutation.isPending && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm p-4 flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-border bg-card/50">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Ask anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-background border border-input rounded-full pl-6 pr-14 py-4 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm"
              disabled={sendMutation.isPending}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || sendMutation.isPending}
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
