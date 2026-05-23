import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Briefcase, MessageSquare, BriefcaseBusiness, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/crm", icon: Users, label: "CRM" },
  { href: "/hr", icon: Briefcase, label: "HR" },
  { href: "/projects", icon: BriefcaseBusiness, label: "Projects" },
  { href: "/chat", icon: MessageSquare, label: "AI Chat" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "User"
    : "Kirti Rao";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-64 border-r border-border bg-sidebar flex flex-col h-full h-[100dvh]">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
          AI
        </div>
        <span className="font-bold text-lg text-sidebar-foreground tracking-tight">Mission Control</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 group ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar>
            <AvatarImage src={user?.profileImageUrl ?? ""} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium truncate">{displayName}</span>
            <span className="text-xs text-muted-foreground">Operations Lead</span>
          </div>
          <button
            data-testid="button-logout"
            onClick={logout}
            title="Log out"
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
