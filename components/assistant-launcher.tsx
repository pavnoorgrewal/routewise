import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function AssistantLauncher() {
  return (
    <Link
      href="/chat"
      className="fixed bottom-5 right-5 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-foreground bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
      aria-label="Open Routewise AI trip planner"
    >
      <Sparkles aria-hidden="true" className="h-4 w-4" />
      Ask Routewise AI
    </Link>
  )
}
