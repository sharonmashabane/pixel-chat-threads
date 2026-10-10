import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BrainCircuit,
  CalendarCheck,
  ChevronsLeft,
  ChevronsRight,
  History,
  LayoutDashboard,
  Menu,
  MessagesSquare,
  Search,
  Settings,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/planner", label: "AI Task Planner", icon: CalendarCheck },
  { to: "/research", label: "AI Research Assistant", icon: Search },
  { to: "/chat", label: "AI Chat Assistant", icon: MessagesSquare },
  { to: "/history", label: "Activity History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/planner": "AI Task Planner",
  "/research": "AI Research Assistant",
  "/chat": "AI Chat Assistant",
  "/history": "Activity History",
  "/settings": "Settings",
};

function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3 px-1">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-brand shadow-brand">
        <BrainCircuit className="size-5 text-primary-foreground" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-base font-semibold text-sidebar-accent-foreground">
            MindFlow AI
          </span>
          <span className="block text-[11px] text-sidebar-foreground/70">Think Smarter.</span>
        </span>
      )}
    </Link>
  );
}

function NavList({ compact, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? path === "/" : path.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            title={compact ? label : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              compact && "justify-center px-0",
            )}
          >
            <Icon className={cn("size-[18px] shrink-0", active && "text-sidebar-primary")} />
            {!compact && <span className="truncate">{label}</span>}
            {active && !compact && <span className="ml-auto size-1.5 rounded-full bg-sidebar-primary" />}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const settings = useSettings();
  const base = "/" + (path.split("/")[1] ?? "");
  const title = TITLES[base] ?? "MindFlow AI";
  const initials = (settings.name || "You").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 transition-[width] duration-300 md:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <Logo compact={collapsed} />
        <div className="mt-8 flex-1">
          <NavList compact={collapsed} />
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs text-sidebar-foreground hover:bg-sidebar-accent"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <><ChevronsLeft className="size-4" /> Collapse</>}
        </button>
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-4">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Logo />
          <div className="mt-8">
            <NavList onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur md:px-8">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
          <h2 className="truncate text-base font-semibold">{title}</h2>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:block">Think Smarter. Plan Better. Achieve More.</span>
            <Link
              to="/settings"
              className="grid size-9 place-items-center rounded-full bg-highlight text-xs font-semibold text-highlight-foreground"
              aria-label="Profile settings"
            >
              {initials}
            </Link>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ icon: Icon, title, subtitle }: { icon: typeof Search; title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex items-start gap-4 animate-rise">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-brand shadow-brand">
        <Icon className="size-6 text-primary-foreground" />
      </span>
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">{subtitle}</p>
      </div>
    </div>
  );
}
