import { Sidebar } from "./sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
