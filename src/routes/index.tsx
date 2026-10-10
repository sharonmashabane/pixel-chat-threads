import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, History, MessagesSquare, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityList } from "@/components/activity-list";
import { useActivity, useSettings, useThreads } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — MindFlow AI" },
      { name: "description", content: "Your intelligent workspace for planning smarter, researching faster, and getting more done." },
      { property: "og:title", content: "MindFlow AI — AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Plan tasks, research topics and chat with an AI workplace assistant in one place." },
    ],
  }),
  component: Dashboard,
});

const FEATURES = [
  {
    to: "/planner",
    icon: CalendarCheck,
    title: "AI Task Planner",
    desc: "Plan your day, prioritise important tasks, and generate practical schedules.",
    cta: "Plan My Tasks",
  },
  {
    to: "/research",
    icon: Search,
    title: "AI Research Assistant",
    desc: "Research topics, summarise articles, and discover valuable insights.",
    cta: "Start Research",
  },
  {
    to: "/chat",
    icon: MessagesSquare,
    title: "AI Chat Assistant",
    desc: "Ask questions, brainstorm ideas, and receive intelligent workplace assistance.",
    cta: "Chat with AI",
  },
] as const;

function Dashboard() {
  const activity = useActivity();
  const threads = useThreads();
  const settings = useSettings();
  const plans = activity.filter((a) => a.type === "plan").length;
  const research = activity.filter((a) => a.type === "research").length;
  const chats = threads.filter((t) => t.messages.length > 0).length;
  const hasStats = plans + research + chats > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-brand p-8 shadow-brand animate-rise md:p-10">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-brand-blue/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-medium text-primary-foreground/70">
            {settings.name ? `Hello, ${settings.name}` : "Think Smarter. Plan Better. Achieve More."}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-primary-foreground md:text-4xl">Welcome to MindFlow AI</h1>
          <p className="mt-3 text-primary-foreground/80 md:text-lg">
            Your intelligent workspace for planning smarter, researching faster, and getting more done.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {FEATURES.map(({ to, icon: Icon, title, desc, cta }, i) => (
          <div
            key={to}
            style={{ animationDelay: `${80 * (i + 1)}ms` }}
            className="group flex flex-col rounded-2xl border bg-card p-6 shadow-card transition-all animate-rise hover:-translate-y-1"
          >
            <span className="grid size-12 place-items-center rounded-xl bg-highlight">
              <Icon className="size-6 text-brand-purple" />
            </span>
            <h3 className="mt-5 text-lg font-semibold">{title}</h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{desc}</p>
            <Button asChild variant="brand" className="mt-6 w-full rounded-xl">
              <Link to={to}>
                {cta} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        ))}
      </section>

      {hasStats && (
        <section className="grid grid-cols-3 gap-4">
          {[
            ["Schedules created", plans],
            ["Research reports", research],
            ["Conversations", chats],
          ].map(([label, n]) => (
            <div key={label} className="rounded-2xl border bg-card p-5 shadow-card">
              <p className="font-display text-3xl font-semibold text-primary">{n}</p>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">{label}</p>
            </div>
          ))}
        </section>
      )}

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              <History className="size-4 text-brand-purple" /> Recent activity
            </h3>
            <Link to="/history" className="text-sm font-medium text-brand-purple hover:underline">
              View all
            </Link>
          </div>
          <ActivityList items={activity.slice(0, 5)} />
        </div>
        <div className="rounded-2xl bg-gradient-soft p-6">
          <ShieldCheck className="size-6 text-brand-purple" />
          <h3 className="mt-3 font-semibold">Responsible AI</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• AI can make mistakes — verify important facts.</li>
            <li>• Avoid sharing confidential or personal data.</li>
            <li>• Your history stays in this browser only.</li>
            <li>• You stay in control of every decision.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
