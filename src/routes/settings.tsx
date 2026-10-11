import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/app-shell";
import { clearAll, saveSettings, useSettings, type Settings } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MindFlow AI" },
      { name: "description", content: "Personalise MindFlow AI: your name, AI response style and defaults." },
      { property: "og:title", content: "Settings — MindFlow AI" },
      { property: "og:description", content: "Personalise how MindFlow AI works for you." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const stored = useSettings();
  const [form, setForm] = useState<Settings>(stored);
  useEffect(() => setForm(stored), [stored]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader icon={SettingsIcon} title="Settings" subtitle="Personalise how MindFlow AI works for you." />
      <div className="space-y-5 rounded-2xl border bg-card p-6 shadow-card">
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" value={form.name} maxLength={40} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Phumla" />
        </div>
        <div className="space-y-1.5">
          <Label>AI response style</Label>
          <Select value={form.style} onValueChange={(v) => setForm({ ...form, style: v as Settings["style"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="concise">Concise</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Default schedule type</Label>
          <Select value={form.defaultSchedule} onValueChange={(v) => setForm({ ...form, defaultSchedule: v as Settings["defaultSchedule"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="brand" className="rounded-xl" onClick={() => { saveSettings({ ...form, name: form.name.trim() }); toast.success("Settings saved"); }}>
          Save settings
        </Button>
      </div>
      <div className="space-y-3 rounded-2xl border bg-card p-6 shadow-card">
        <h3 className="flex items-center gap-2 font-semibold"><ShieldCheck className="size-4 text-brand-purple" /> Privacy & data</h3>
        <p className="text-sm text-muted-foreground">
          Your conversations and history are stored only in this browser. Messages are sent securely to the AI service to
          generate responses and are not used to identify you.
        </p>
        <Button
          variant="outline"
          className="text-destructive"
          onClick={() => {
            if (confirm("Delete all conversations and activity history?")) {
              clearAll();
              toast.success("All data cleared");
            }
          }}
        >
          Clear all data
        </Button>
      </div>
    </div>
  );
}
