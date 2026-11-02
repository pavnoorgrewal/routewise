import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

export function AssistantLauncher() {
  return (
    <Link
      href="/chat"
      className="assistant-launcher button-dark fixed bottom-5 right-5 z-40 inline-flex min-h-12 items-center gap-2.5 border border-white/15 px-5 py-3 text-xs font-medium shadow-[0_6px_24px_#00000020]"
      aria-label="Open Routewise AI trip planner"
    >
      <Sparkles aria-hidden="true" className="h-4 w-4 text-[#e9b59b]" />
      Ask Routewise AI
      <ArrowUpRight
        aria-hidden="true"
        className="ml-1 h-3.5 w-3.5 text-white/50"
      />
    </Link>
  );
}
