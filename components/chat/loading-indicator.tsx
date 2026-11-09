export function LoadingIndicator() {
  return (
    <div role="status" className="flex items-center gap-2.5 py-2 text-sm text-muted-foreground">
      <svg viewBox="0 0 32 32" className="h-5 w-5 animate-spin motion-reduce:animate-none [animation-duration:1.1s]" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <rect key={index} x="14.5" y="1" width="3" height="8" rx="1.5"
            fill="currentColor" opacity={(index + 1) / 8}
            transform={`rotate(${index * 45} 16 16)`} />
        ))}
      </svg>
      <span>Routewise is working…</span>
    </div>
  )
}
