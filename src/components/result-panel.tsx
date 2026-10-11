import type { UIMessage } from "ai";
import { Copy, Download, Square, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AiNotice, MessageParts, Thinking } from "@/components/ai-output";
import { messageText } from "@/lib/store";

export function ResultPanel({
  answer,
  busy,
  status,
  stop,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyText,
  filename,
}: {
  answer?: UIMessage | undefined;
  busy: boolean;
  status: string;
  stop: () => void;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyText: string;
  filename: string;
}) {
  const text = answer ? messageText(answer) : "";
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-[420px] flex-col rounded-2xl border bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-semibold">AI result</h3>
        <div className="flex gap-2">
          {busy && (
            <Button size="sm" variant="outline" onClick={stop}>
              <Square className="size-3.5" /> Stop
            </Button>
          )}
          {!busy && text && (
            <>
              <Button size="sm" variant="outline" onClick={copy}>
                <Copy className="size-3.5" /> Copy
              </Button>
              <Button size="sm" variant="outline" onClick={download}>
                <Download className="size-3.5" /> Download
              </Button>
            </>
          )}
        </div>
      </div>
      {!answer && !busy && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-gradient-soft">
            <EmptyIcon className="size-6 text-brand-purple" />
          </span>
          <p className="mt-4 font-medium">{emptyTitle}</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{emptyText}</p>
        </div>
      )}
      {(status === "submitted" || (busy && !text)) && <Thinking />}
      {answer && (
        <div className="min-w-0 flex-1 text-sm leading-relaxed">
          <MessageParts message={answer} streaming={busy} />
        </div>
      )}
      <div className="mt-6 border-t pt-4">
        <AiNotice />
      </div>
    </div>
  );
}
