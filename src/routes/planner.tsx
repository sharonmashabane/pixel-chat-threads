import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, CalendarClock, Plus, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app-shell";
import { ResultPanel } from "@/components/result-panel";
import { useAiRun } from "@/components/use-ai-run";
import { getSettings, uid } from "@/lib/store";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — MindFlow AI" },
      { name: "description", content: "Prioritise tasks and generate realistic daily or weekly schedules with AI." },
      { property: "og:title", content: "AI Task Planner — MindFlow AI" },
      { property: "og:description", content: "Turn your to-do list into a prioritised, realistic schedule in seconds." },
    ],
  }),
  component: PlannerPage,
});

type Priority = "High" | "Medium" | "Low";
type Task = { id: string; title: string; description: string; priority: Priority; deadline: string; duration: string };

const emptyTask = (): Task => ({ id: uid(), title: "", description: "", priority: "Medium", deadline: "", duration: "1 hour" });
const PRIORITY_STYLE: Record<Priority, string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-warning/15 text-foreground",
  Low: "bg-success/15 text-foreground",
};

function PlannerPage() {
  const [draft, setDraft] = useState<Task>(emptyTask);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hours, setHours] = useState("09:00 – 17:00, Monday to Friday");
  const [schedule, setSchedule] = useState<"Daily" | "Weekly">(() => getSettings().defaultSchedule);
  const ai = useAiRun("planner", "plan");

  const set = <K extends keyof Task>(k: K, v: Task[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const addTask = () => {
    if (!draft.title.trim()) return toast.error("Please enter a task title.");
    if (!draft.duration.trim()) return toast.error("Please enter an estimated duration.");
    setTasks((t) => [...t, { ...draft, title: draft.title.trim() }]);
    setDraft(emptyTask());
  };

  const generate = () => {
    if (tasks.length === 0) return toast.error("Add at least one task first.");
    if (!hours.trim()) return toast.error("Please enter your available working hours.");
    const list = tasks
      .map(
        (t, i) =>
          `${i + 1}. ${t.title}\n   - Description: ${t.description || "n/a"}\n   - Priority: ${t.priority}\n   - Deadline: ${t.deadline || "none"}\n   - Estimated duration: ${t.duration}`,
      )
      .join("\n");
    const prompt = `Create a ${schedule} schedule.\n\nAvailable working hours: ${hours}\n\nTasks:\n${list}`;
    ai.run(`${schedule} schedule · ${tasks.length} task${tasks.length > 1 ? "s" : ""}`, prompt);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={CalendarCheck}
        title="AI Task Planner"
        subtitle="Add your tasks, set your hours, and let AI build a prioritised schedule."
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold">Add a task</h3>
            <div className="space-y-1.5">
              <Label htmlFor="t-title">Task title</Label>
              <Input id="t-title" value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Prepare Q3 report" maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-desc">Task description</Label>
              <Textarea id="t-desc" value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional details" rows={2} maxLength={500} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={draft.priority} onValueChange={(v) => set("priority", v as Priority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="t-deadline">Deadline</Label>
                <Input id="t-deadline" type="date" value={draft.deadline} onChange={(e) => set("deadline", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-dur">Estimated duration</Label>
              <Input id="t-dur" value={draft.duration} onChange={(e) => set("duration", e.target.value)} placeholder="e.g. 2 hours" maxLength={40} />
            </div>
            <Button variant="outline" className="w-full rounded-xl" onClick={addTask}>
              <Plus className="size-4" /> Add task
            </Button>
          </div>

          <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Your tasks</h3>
              <span className="text-xs text-muted-foreground">{tasks.length} added</span>
            </div>
            {tasks.length === 0 ? (
              <p className="rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground">No tasks yet. Add your first task above.</p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-start gap-3 rounded-xl border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className={PRIORITY_STYLE[t.priority]}>{t.priority}</Badge>
                        <span>{t.duration}</span>
                        {t.deadline && <span>· due {t.deadline}</span>}
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" aria-label="Remove task" onClick={() => setTasks((l) => l.filter((x) => x.id !== t.id))}>
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="hours">Available working hours</Label>
              <Input id="hours" value={hours} onChange={(e) => setHours(e.target.value)} maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label>Schedule type</Label>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
                {(["Daily", "Weekly"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSchedule(s)}
                    className={`rounded-lg py-2 text-sm font-medium transition ${schedule === s ? "bg-card shadow-sm" : "text-muted-foreground"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="brand" className="flex-1 rounded-xl" onClick={generate} disabled={ai.busy}>
                <Wand2 className="size-4" /> {ai.busy ? "Generating…" : "Generate schedule"}
              </Button>
              {tasks.length > 0 && (
                <Button variant="ghost" onClick={() => setTasks([])} disabled={ai.busy}>Clear</Button>
              )}
            </div>
          </div>
        </div>

        <ResultPanel
          answer={ai.answer}
          busy={ai.busy}
          status={ai.status}
          stop={ai.stop}
          emptyIcon={CalendarClock}
          emptyTitle="Your schedule will appear here"
          emptyText="Add tasks with priorities and deadlines, then generate a smart, realistic plan."
          filename="mindflow-schedule.md"
        />
      </div>
    </div>
  );
}
