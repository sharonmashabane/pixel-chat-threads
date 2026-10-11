import { useEffect, useMemo, useRef } from "react";
import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowLeft, BrainCircuit } from "lucide-react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { AiNotice, ChatMessage, Thinking, aiErrorMessage } from "@/components/ai-output";
import { getSettings, getThread, saveThreadMessages, useThreads } from "@/lib/store";

export const Route = createFileRoute("/chat/$threadId")({
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  return (
    <ClientOnly fallback={<div className="flex-1" />}>
      <ChatWindow key={threadId} threadId={threadId} />
    </ClientOnly>
  );
}

const STARTERS = [
  "Draft a polite follow-up email to a client",
  "Brainstorm ideas for a team-building event",
  "How do I give constructive feedback?",
  "Help me prepare for a job interview",
];

function ChatWindow({ threadId }: { threadId: string }) {
  const thread = getThread(threadId);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/ai", body: { mode: "chat" } }), []);
  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: thread?.messages ?? [],
    transport,
    onError: (e) => toast.error(aiErrorMessage(e)),
  });
  const liveTitle = useThreads().find((t) => t.id === threadId)?.title;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "ready" || status === "error") {
      if (messages.length) saveThreadMessages(threadId, messages);
      inputRef.current?.focus();
    }
  }, [status, messages, threadId]);

  if (!thread)
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <p className="font-medium">Conversation not found</p>
        <Link to="/chat" className="mt-3 text-sm text-brand-purple hover:underline">Back to conversations</Link>
      </div>
    );

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text: text.trim() }, { body: { style: getSettings().style } });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Link to="/chat" className="md:hidden" aria-label="Back"><ArrowLeft className="size-5" /></Link>
        <span className="grid size-8 place-items-center rounded-lg bg-gradient-brand">
          <BrainCircuit className="size-4 text-primary-foreground" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{liveTitle ?? thread.title}</p>
          <p className="text-xs text-muted-foreground">MindFlow Assistant</p>
        </div>
      </div>
      <Conversation className="min-h-0 flex-1">
        <ConversationContent>
          {messages.length === 0 && (
            <div className="mx-auto max-w-lg py-10 text-center">
              <h3 className="text-lg font-semibold">How can I help you today?</h3>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {STARTERS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-xl border p-3 text-left text-sm hover:bg-highlight">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <ChatMessage key={m.id} message={m} streaming={busy && i === messages.length - 1} />
          ))}
          {status === "submitted" && <Thinking />}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="border-t p-3">
        <PromptInput onSubmit={(msg) => send(msg.text)}>
          <PromptInputTextarea ref={inputRef} autoFocus placeholder="Ask MindFlow anything about work…" />
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
        <div className="mt-2 text-center"><AiNotice /></div>
      </div>
    </div>
  );
}
