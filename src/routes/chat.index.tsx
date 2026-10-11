import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createThread } from "@/lib/store";

export const Route = createFileRoute("/chat/")({
  component: ChatHome,
});

function ChatHome() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-gradient-brand shadow-brand">
        <MessagesSquare className="size-7 text-primary-foreground" />
      </span>
      <h2 className="mt-5 text-xl font-semibold">AI Chat Assistant</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Ask questions, brainstorm ideas, and receive intelligent workplace assistance.
      </p>
      <Button
        variant="brand"
        className="mt-6 rounded-xl"
        onClick={() => navigate({ to: "/chat/$threadId", params: { threadId: createThread().id } })}
      >
        Start a conversation
      </Button>
    </div>
  );
}
