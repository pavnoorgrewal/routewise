import { lastAssistantMessageIsCompleteWithToolCalls, type UIMessage } from 'ai'

// Only a traveler answering an interactive card needs another browser request.
// Server tools already continue inside the current streamed response.
export function shouldContinueAfterChoice({ messages }: { messages: UIMessage[] }): boolean {
  if (!lastAssistantMessageIsCompleteWithToolCalls({ messages })) return false
  const parts = messages.at(-1)?.parts ?? []
  const lastStep = parts.reduce((index, part, current) => part.type === 'step-start' ? current : index, -1)
  return parts.slice(lastStep + 1).some((part) =>
    ['tool-askMultipleChoice', 'tool-showSuggestedStops', 'tool-showRouteOptions'].includes(part.type) &&
    'state' in part && part.state === 'output-available',
  )
}
