import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createThread, deleteThread, useThreads } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat Assistant — MindFlow AI" },
      { name: "description", content: "Ask questions, brainstorm ideas and get intelligent workplace assistance." },
      { property: "og:title", content: "AI Chat Assistant — MindFlow AI" },
      { property: "og:description", content: "Your AI workplace assistant for emails, ideas and problem-solving." },
    ],
  }),
  component: ChatLayout,
});

function ChatLayout() {
  const threads = useThreads();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };

  const newChat = () => {
    const t = createThread();
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-6xl gap-5">
      <aside className={cn("w-full shrink-0 flex-col rounded-2xl border bg-card p-3 shadow-card md:flex md:w-64", params.threadId ? "hidden" : "flex")}>
        <Button variant="brand" className="w-full rounded-xl" onClick={newChat}>
          <MessageSquarePlus className="size-4" /> New conversation
        </Button>
        <p className="mt-4 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Conversations</p>
        <div className="mt-2 flex-1 space-y-1 overflow-y-auto">
          {threads.length === 0 && <p className="px-2 py-4 text-sm text-muted-foreground">No conversations yet.</p>}
          {threads.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group flex items-center rounded-lg pr-1 text-sm",
                params.threadId === t.id ? "bg-highlight text-highlight-foreground" : "hover:bg-muted",
              )}
            >
              <Link to="/chat/$threadId" params={{ threadId: t.id }} className="min-w-0 flex-1 truncate px-3 py-2">
                {t.title}
              </Link>
              <button
                aria-label="Delete conversation"
                className="rounded p-1 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100 focus:opacity-100"
                onClick={() => {
                  deleteThread(t.id);
                  if (params.threadId === t.id) navigate({ to: "/chat" });
                }}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>
      <section className={cn("min-w-0 flex-1 flex-col rounded-2xl border bg-card shadow-card md:flex", params.threadId ? "flex" : "hidden")}>
        <Outlet />
      </section>
    </div>
  );
}
