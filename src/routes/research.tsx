import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpenText, FileText, Lightbulb, Search, Telescope } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/app-shell";
import { ResultPanel } from "@/components/result-panel";
import { useAiRun } from "@/components/use-ai-run";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — MindFlow AI" },
      { name: "description", content: "Research topics, summarise articles and extract key insights with AI." },
      { property: "og:title", content: "AI Research Assistant — MindFlow AI" },
      { property: "og:description", content: "Understand any topic faster with structured AI research summaries." },
    ],
  }),
  component: ResearchPage,
});

const TYPES = [
  { id: "topic", label: "Research a topic", icon: Telescope },
  { id: "summarise", label: "Summarise text", icon: FileText },
  { id: "insights", label: "Key insights", icon: Lightbulb },
] as const;
type RType = (typeof TYPES)[number]["id"];

const EXAMPLES = ["Remote work productivity trends", "How to run effective one-on-one meetings", "Basics of prompt engineering"];

function ResearchPage() {
  const [type, setType] = useState<RType>("topic");
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [audience, setAudience] = useState("Working professional");
  const [depth, setDepth] = useState("Standard");
  const ai = useAiRun("research", "research");
  const needsText = type !== "topic";

  const submit = () => {
    if (!topic.trim() && !needsText) { toast.error("Please enter a topic or question."); return; }
    if (needsText && text.trim().length < 50) { toast.error("Please paste at least a short paragraph of text (50+ characters)."); return; }
    const task =
      type === "topic"
        ? `Research this topic: "${topic.trim()}".`
        : type === "summarise"
          ? `Summarise the following text${topic.trim() ? ` (focus: ${topic.trim()})` : ""}.`
          : `Extract the key insights and actionable takeaways from the following text${topic.trim() ? ` (focus: ${topic.trim()})` : ""}.`;
    const prompt = `${task}\nTarget audience: ${audience}.\nDepth: ${depth}.${needsText ? `\n\n--- TEXT START ---\n${text.trim()}\n--- TEXT END ---` : ""}`;
    const label = TYPES.find((t) => t.id === type)!.label;
    ai.run(`${label}: ${(topic.trim() || text.trim()).slice(0, 60)}`, prompt);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader icon={Search} title="AI Research Assistant" subtitle="Research topics, summarise articles, and discover valuable insights." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="space-y-5 rounded-2xl border bg-card p-6 shadow-card">
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setType(id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-3 text-center text-xs font-medium transition",
                  type === id ? "border-brand-purple bg-highlight text-highlight-foreground" : "hover:bg-muted",
                )}
              >
                <Icon className="size-5" />
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="topic">{needsText ? "Focus (optional)" : "Topic or question"}</Label>
            <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={needsText ? "e.g. implications for small teams" : "e.g. Benefits of AI in customer service"} maxLength={200} />
            {!needsText && (
              <div className="flex flex-wrap gap-2 pt-1">
                {EXAMPLES.map((ex) => (
                  <button key={ex} onClick={() => setTopic(ex)} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-highlight">
                    {ex}
                  </button>
                ))}
              </div>
            )}
          </div>
          {needsText && (
            <div className="space-y-1.5">
              <Label htmlFor="text">Article or text</Label>
              <Textarea id="text" value={text} onChange={(e) => setText(e.target.value)} rows={9} placeholder="Paste the article, report or notes here…" maxLength={30000} />
              <p className="text-right text-xs text-muted-foreground">{text.length.toLocaleString()} / 30,000</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Working professional", "Student", "Entrepreneur", "Executive", "Beginner"].map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Depth</Label>
              <Select value={depth} onValueChange={setDepth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Quick overview", "Standard", "In-depth"].map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button variant="brand" className="w-full rounded-xl" onClick={submit} disabled={ai.busy}>
            <Search className="size-4" /> {ai.busy ? "Researching…" : "Start research"}
          </Button>
        </div>
        <ResultPanel
          answer={ai.answer}
          busy={ai.busy}
          status={ai.status}
          stop={ai.stop}
          emptyIcon={BookOpenText}
          emptyTitle="Your research report will appear here"
          emptyText="Pick a research type, enter a topic or paste text, and get a structured summary with insights."
          filename="mindflow-research.md"
        />
      </div>
    </div>
  );
}
