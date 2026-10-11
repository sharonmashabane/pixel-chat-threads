<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- All AI calls go through the single server route `/api/ai` (mode: chat|planner|research) so the API key and system prompts stay server-side.
- System prompts live in `src/server/ai/prompts.ts`; edit prompt engineering there, not in UI code.
- User data (threads, activity, settings) is stored in browser localStorage via `src/lib/store.ts`, per the user's choice of no login.
