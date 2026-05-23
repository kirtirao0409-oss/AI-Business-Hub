import { useAuth } from "@/hooks/use-auth";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md px-8 py-12 flex flex-col items-center text-center space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            AI
          </div>
          <span className="font-bold text-2xl tracking-tight">Mission Control</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to access your business automation dashboard.
          </p>
        </div>

        <div className="w-full p-8 rounded-2xl border border-border bg-card/40 backdrop-blur-sm space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">AI-powered operations hub</p>
            <p className="text-xs text-muted-foreground">
              CRM · HR · Project Management · AI Chat
            </p>
          </div>
          <Button
            data-testid="button-login"
            onClick={login}
            disabled={isLoading}
            className="w-full h-11 text-sm font-semibold"
            size="lg"
          >
            {isLoading ? "Loading..." : "Log in"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Your session is secured with industry-standard authentication.
        </p>
      </div>
    </div>
  );
}
