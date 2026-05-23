import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/layout";
import Dashboard from "@/pages/dashboard";
import CRM from "@/pages/crm";
import HR from "@/pages/hr";
import Projects from "@/pages/projects";
import Chat from "@/pages/chat";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";

const queryClient = new QueryClient();

function ProtectedRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            AI
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/crm" component={CRM} />
        <Route path="/hr" component={HR} />
        <Route path="/projects" component={Projects} />
        <Route path="/chat" component={Chat} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ProtectedRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
