import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { History, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageResponse } from "@/components/ai-elements/message";
import { PageHeader } from "@/components/app-shell";
import { ActivityList } from "@/components/activity-list";
import { deleteActivity, useActivity, type Activity, type ActivityType } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Activity History — MindFlow AI" },
      { name: "description", content: "Review your past AI schedules, research reports and conversations." },
      { property: "og:title", content: "Activity History — MindFlow AI" },
      { property: "og:description", content: "Everything you've created with MindFlow AI in one timeline." },
    ],
  }),
  component: HistoryPage,
});

const FILTERS: { id: "all" | ActivityType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "plan", label: "Schedules" },
  { id: "research", label: "Research" },
  { id: "chat", label: "Chats" },
];

function HistoryPage() {
  const activity = useActivity();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [open, setOpen] = useState<Activity | null>(null);
  const items = filter === "all" ? activity : activity.filter((a) => a.type === filter);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader icon={History} title="Activity History" subtitle="Review everything you've created with MindFlow AI." />
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                filter === f.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-highlight",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <ActivityList items={items} onSelect={setOpen} />
      </div>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{open?.title}</DialogTitle>
          </DialogHeader>
          <div className="text-sm">
            <MessageResponse>{open?.content ?? ""}</MessageResponse>
          </div>
          <Button
            variant="outline"
            className="mt-2 self-start text-destructive"
            onClick={() => {
              if (open) deleteActivity(open.id);
              setOpen(null);
            }}
          >
            <Trash2 className="size-4" /> Delete
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
