import { Link } from "@tanstack/react-router";
import { CalendarCheck, Inbox, MessagesSquare, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Activity } from "@/lib/store";

const ICONS = { plan: CalendarCheck, research: Search, chat: MessagesSquare };

export function ActivityList({ items, onSelect }: { items: Activity[]; onSelect?: (a: Activity) => void }) {
  if (items.length === 0)
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-muted">
          <Inbox className="size-5 text-muted-foreground" />
        </span>
        <p className="mt-3 text-sm font-medium">No activity yet</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Create a schedule, run some research, or start a chat — your work will appear here.
        </p>
      </div>
    );
  return (
    <ul className="divide-y">
      {items.map((a) => {
        const Icon = ICONS[a.type];
        const inner = (
          <>
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-highlight">
              <Icon className="size-4 text-highlight-foreground" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{a.title}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(a.createdAt, { addSuffix: true })}
              </span>
            </span>
          </>
        );
        return (
          <li key={a.id}>
            {a.type === "chat" && a.threadId ? (
              <Link to="/chat/$threadId" params={{ threadId: a.threadId }} className="flex items-center gap-3 py-3 hover:opacity-80">
                {inner}
              </Link>
            ) : (
              <button onClick={() => onSelect?.(a)} className="flex w-full items-center gap-3 py-3 text-left hover:opacity-80">
                {inner}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
