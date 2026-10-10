import type { UIMessage } from "ai";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { Spinner } from "@/components/ui/spinner";

export function MessageParts({
  message,
  streaming,
}: {
  message: UIMessage;
  streaming?: boolean;
}) {
  return (
    <>
      {message.parts.map((part, i) => {
        if (part.type === "text")
          return <MessageResponse key={i}>{part.text}</MessageResponse>;
        if (part.type === "reasoning" && part.text)
          return (
            <Reasoning key={i} isStreaming={streaming && i === message.parts.length - 1}>
              <ReasoningTrigger />
              <ReasoningContent>{part.text}</ReasoningContent>
            </Reasoning>
          );
        return null;
      })}
    </>
  );
}

export function ChatMessage({ message, streaming }: { message: UIMessage; streaming?: boolean }) {
  return (
    <Message from={message.role}>
      <MessageContent>
        <MessageParts message={message} streaming={streaming} />
      </MessageContent>
    </Message>
  );
}

export function Thinking({ label = "MindFlow is thinking…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner className="size-4 text-brand-purple" />
      {label}
    </div>
  );
}

export function aiErrorMessage(err: Error) {
  const m = err.message || "";
  if (m.includes("429")) return "Too many requests right now. Please wait a moment and try again.";
  if (m.includes("402")) return "AI credits have run out. Please add credits to your workspace to continue.";
  if (m.includes("403")) return "Access to the AI service was denied.";
  try {
    const parsed = JSON.parse(m);
    if (parsed?.error) return String(parsed.error);
  } catch {
    /* not json */
  }
  return m || "Something went wrong while contacting the AI. Please try again.";
}

export function AiNotice() {
  return (
    <p className="text-xs text-muted-foreground">
      AI-generated content can be inaccurate. Review important information before relying on it, and avoid sharing
      confidential data.
    </p>
  );
}
