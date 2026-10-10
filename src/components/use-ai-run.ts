import { useMemo, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { aiErrorMessage } from "@/components/ai-output";
import { getSettings, logActivity, messageText, type ActivityType } from "@/lib/store";

/** One-shot AI generation (planner / research) that streams and logs to history when finished. */
export function useAiRun(mode: "planner" | "research", type: ActivityType) {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/ai", body: { mode } }), [mode]);
  const titleRef = useRef("");
  const chat = useChat({
    transport,
    onError: (e) => toast.error(aiErrorMessage(e)),
    onFinish: ({ message, isAbort, isError }) => {
      const content = messageText(message);
      if (!isAbort && !isError && content) logActivity({ type, title: titleRef.current, content });
    },
  });

  const run = (title: string, prompt: string) => {
    titleRef.current = title;
    chat.setMessages([]);
    chat.sendMessage({ text: prompt }, { body: { style: getSettings().style } });
  };

  const answer = [...chat.messages].reverse().find((m) => m.role === "assistant");
  const busy = chat.status === "submitted" || chat.status === "streaming";
  return { ...chat, run, answer, busy };
}
