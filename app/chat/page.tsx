"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  UIMessage,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import {
  ArrowUp,
  RotateCcw,
  Pencil,
  Check,
  X,
  Square,
  Route,
  Sparkles,
  Mountain,
  Coffee,
  Compass,
} from "lucide-react";

import { Brand } from "@/components/brand";
import { MultipleChoice } from "@/components/chat/multiple-choice";
import { RouteStopList } from "@/components/chat/route-stop";
import { RouteSummary } from "@/components/chat/route-summary";
import { SuggestedStops } from "@/components/chat/suggested-stops";
import { ChargingStations } from "@/components/chat/charging-stations";
import { RouteOptions } from "@/components/chat/route-options";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from "@/components/prompt-kit/prompt-input";
import {
  ChatContainerRoot,
  ChatContainerContent,
  ChatContainerScrollAnchor,
} from "@/components/prompt-kit/chat-container";
import { ChatMessage } from "@/app/api/chat/route";

function getMessageText(message: UIMessage): string {
  return (
    message.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") || ""
  );
}

function displayAssistantText(text: string): string {
  return text
    .replace(/(^|\n)[ \t]{0,3}#{1,6}[ \t]*/g, "$1")
    .replace(/\*\*/g, "");
}

// ─── Tool Part Renderer ───────────────────────────────────────────────────────

function ToolPartRenderer({
  part,
  addToolOutput,
}: {
  part: NonNullable<ChatMessage["parts"]>[number];
  addToolOutput: ReturnType<typeof useChat>["addToolOutput"];
}) {
  if (part.type === "tool-publishPlan") {
    type PlanInput = {
      itinerary: string;
      places: Array<{
        name: string;
        location: string;
        category: "food" | "coffee" | "fuel" | "attraction" | "lodging" | "shopping" | "scenic" | "entertainment" | "default";
        description?: string | null;
      }>;
      chargingStations: Array<{
        name: string;
        location: string;
        network?: string | null;
        ports?: number | null;
        maxKw?: number | null;
        distanceFromRoute?: string | null;
        estimatedChargingTime?: string | null;
        amenitiesNearby?: string[] | null;
      }>;
      summary: {
        origin: string;
        destination: string;
        stops: Array<{
          name: string;
          location: string;
          category?: "food" | "coffee" | "fuel" | "attraction" | "lodging" | "shopping" | "scenic" | "entertainment" | "default" | null;
          durationFromPrev?: string | null;
        }>;
        totalDistance?: string | null;
        totalDuration?: string | null;
        approximateEta?: string | null;
        vehicleModel?: string | null;
        routeTag?: string | null;
      };
    };
    const p = part as {
      type: "tool-publishPlan";
      state: "input-streaming" | "input-available" | "output-available" | "output-error";
      input?: PlanInput;
      output?: { valid: boolean; errors?: string[]; plan?: PlanInput | null };
    };
    const plan = p.output?.valid ? p.output.plan : null;
    if (!plan) {
      return p.state === "output-available" || p.state === "output-error"
        ? null
        : <p className="text-sm text-muted-foreground">Checking place details…</p>;
    }
    return (
      <div className="flex w-full flex-col gap-4">
        <div className="max-w-[70ch] whitespace-pre-wrap text-[15px] leading-7 text-foreground">
          {displayAssistantText(plan.itinerary)}
        </div>
        {plan.places.length > 0 && <RouteStopList stops={plan.places} />}
        {plan.chargingStations.length > 0 && <ChargingStations stations={plan.chargingStations} />}
        <RouteSummary {...plan.summary} state="input-available" />
      </div>
    );
  }

  // askMultipleChoice
  if (part.type === "tool-askMultipleChoice") {
    const p = part as {
      type: "tool-askMultipleChoice";
      toolCallId: string;
      state:
        | "input-streaming"
        | "input-available"
        | "output-available"
        | "output-error";
      input?: { question: string; options: { id: string; label: string }[] };
      output?: { selectedId: string; selectedLabel: string };
    };
    return (
      <MultipleChoice
        question={p.input?.question ?? ""}
        options={p.input?.options ?? []}
        state={p.state}
        selectedId={p.output?.selectedId}
        onSelect={(option) => {
          addToolOutput({
            tool: "askMultipleChoice",
            toolCallId: p.toolCallId,
            output: { selectedId: option.id, selectedLabel: option.label },
          });
        }}
      />
    );
  }

  // showRouteStops
  if (part.type === "tool-showRouteStops") {
    const p = part as {
      type: "tool-showRouteStops";
      state:
        | "input-streaming"
        | "input-available"
        | "output-available"
        | "output-error";
      input?: {
        stops: Array<{
          name: string;
          location: string;
          category?:
            | "food"
            | "coffee"
            | "fuel"
            | "attraction"
            | "lodging"
            | "shopping"
            | "scenic"
            | "entertainment"
            | "default";
          description?: string | null;
        }>;
      };
    };
    return (
      <RouteStopList
        stops={p.input?.stops ?? []}
        state={p.state === "output-error" ? "input-available" : p.state}
      />
    );
  }

  // showRouteSummary
  if (part.type === "tool-showRouteSummary") {
    const p = part as {
      type: "tool-showRouteSummary";
      state:
        | "input-streaming"
        | "input-available"
        | "output-available"
        | "output-error";
      input?: {
        origin: string;
        destination: string;
        stops: Array<{
          name: string;
          location: string;
          category?:
            | "food"
            | "coffee"
            | "fuel"
            | "attraction"
            | "lodging"
            | "shopping"
            | "scenic"
            | "entertainment"
            | "default"
            | null;
          durationFromPrev?: string | null;
        }>;
        totalDistance?: string | null;
        totalDuration?: string | null;
        approximateEta?: string | null;
        vehicleModel?: string | null;
        routeTag?: string | null;
      };
    };
    return (
      <RouteSummary
        origin={p.input?.origin ?? ""}
        destination={p.input?.destination ?? ""}
        stops={p.input?.stops ?? []}
        totalDistance={p.input?.totalDistance}
        totalDuration={p.input?.totalDuration}
        approximateEta={p.input?.approximateEta}
        vehicleModel={p.input?.vehicleModel}
        routeTag={p.input?.routeTag}
        state={p.state === "output-error" ? "input-available" : p.state}
      />
    );
  }

  // showSuggestedStops
  if (part.type === "tool-showSuggestedStops") {
    const p = part as {
      type: "tool-showSuggestedStops";
      toolCallId: string;
      state:
        | "input-streaming"
        | "input-available"
        | "output-available"
        | "output-error";
      input?: {
        title: string;
        chips: Array<{
          id: string;
          label: string;
          sublabel?: string | null;
          category?:
            | "food"
            | "coffee"
            | "fuel"
            | "attraction"
            | "lodging"
            | "shopping"
            | "scenic"
            | "entertainment"
            | "default"
            | null;
        }>;
        multiSelect: boolean;
      };
      output?: Array<{ id: string; label: string }>;
    };
    return (
      <SuggestedStops
        title={p.input?.title}
        chips={p.input?.chips ?? []}
        multiSelect={p.input?.multiSelect ?? true}
        state={p.state === "output-error" ? "input-available" : p.state}
        selectedIds={p.output?.map((o) => o.id)}
        onSelect={(selected) => {
          addToolOutput({
            tool: "showSuggestedStops",
            toolCallId: p.toolCallId,
            output: selected.map((s) => ({ id: s.id, label: s.label })),
          });
        }}
      />
    );
  }

  // showChargingStations
  if (part.type === "tool-showChargingStations") {
    const p = part as {
      type: "tool-showChargingStations";
      state:
        | "input-streaming"
        | "input-available"
        | "output-available"
        | "output-error";
      input?: {
        title?: string | null;
        stations: Array<{
          name: string;
          location: string;
          network?: string | null;
          ports?: number | null;
          maxKw?: number | null;
          distanceFromRoute?: string | null;
          estimatedChargingTime?: string | null;
          amenitiesNearby?: string[] | null;
        }>;
      };
    };
    return (
      <ChargingStations
        stations={p.input?.stations ?? []}
        title={p.input?.title ?? undefined}
        state={p.state === "output-error" ? "input-available" : p.state}
      />
    );
  }

  // showRouteOptions
  if (part.type === "tool-showRouteOptions") {
    const p = part as {
      type: "tool-showRouteOptions";
      toolCallId: string;
      state:
        | "input-streaming"
        | "input-available"
        | "output-available"
        | "output-error";
      input?: {
        question: string;
        options: Array<{
          id: string;
          name: string;
          description?: string | null;
          distance?: string | null;
          duration?: string | null;
          highlights?: string[] | null;
          tags?: Array<"scenic" | "fast" | "eco" | "popular"> | null;
        }>;
      };
      output?: { selectedId: string; selectedName: string };
    };
    return (
      <RouteOptions
        question={p.input?.question}
        options={p.input?.options ?? []}
        state={p.state === "output-error" ? "input-available" : p.state}
        selectedId={p.output?.selectedId}
        onSelect={(option) => {
          addToolOutput({
            tool: "showRouteOptions",
            toolCallId: p.toolCallId,
            output: { selectedId: option.id, selectedName: option.name },
          });
        }}
      />
    );
  }

  return null;
}

// ─────────────────────────────────────────────────���───────────────────────────

function ChatPageInner() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const didSendStarterRef = useRef(false);

  const {
    messages,
    sendMessage,
    status,
    error,
    regenerate: retryResponse,
    setMessages,
    stop,
    addToolOutput,
  } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  useEffect(() => {
    if (didSendStarterRef.current) return;
    const message = searchParams.get("message");
    if (message) {
      didSendStarterRef.current = true;
      sendMessage({ text: message });
    }
  }, [searchParams, sendMessage]);

  const isLoading = status === "streaming" || status === "submitted";
  const isEmpty = messages.length === 0;

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleEdit = (message: UIMessage) => {
    setEditingId(message.id);
    setEditText(getMessageText(message));
  };

  const submitEdit = () => {
    if (!editingId || !editText.trim()) return;
    const messageIndex = messages.findIndex((m) => m.id === editingId);
    if (messageIndex === -1) return;
    setMessages(messages.slice(0, messageIndex));
    setEditingId(null);
    sendMessage({ text: editText });
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const regenerate = (messageIndex: number) => {
    const userMessage = messages
      .slice(0, messageIndex)
      .reverse()
      .find((m) => m.role === "user");
    if (!userMessage) return;
    const userText = getMessageText(userMessage);
    const userIndex = messages.findIndex((m) => m.id === userMessage.id);
    setMessages(messages.slice(0, userIndex));
    sendMessage({ text: userText });
  };

  return (
    <div className="chat-shell flex h-dvh flex-col bg-background font-sans">
      <header className="shrink-0 border-b border-black/[0.06] bg-background/80 backdrop-blur-xl">
        <nav
          aria-label="Chat navigation"
          className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5 md:px-8"
        >
          <Brand />
          <div className="flex items-center gap-5">
            <span className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:flex">
              <Sparkles className="h-3 w-3 text-brand" /> Your travel companion
            </span>
            <Link
              href="/proposal"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              The Story
            </Link>
          </div>
        </nav>
      </header>
      <ChatContainerRoot className="flex-1 min-h-0">
        <ChatContainerContent className="max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
          {isEmpty && (
            <div className="entrance flex min-h-[min(60vh,600px)] flex-col items-center justify-center pb-4 pt-10 text-center">
              <span className="mb-7 flex h-14 w-14 items-center justify-center rounded-[20px] border border-black/[0.06] bg-white shadow-[0_5px_20px_-10px_#46342130]">
                <Route className="h-6 w-6 text-brand" strokeWidth={1.5} />
              </span>
              <p className="eyebrow mb-4">Good trips start here</p>
              <h1 className="text-5xl font-medium tracking-[-0.06em] sm:text-6xl">
                Where to{" "}
                <span className="font-serif font-normal italic text-brand">
                  next?
                </span>
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
                A destination, a rough idea, or a change of scenery.
                <br className="hidden sm:block" /> Let’s make a little room for
                adventure.
              </p>
              <div className="mt-10 grid w-full max-w-2xl gap-2.5 text-left sm:grid-cols-3">
                {[
                  {
                    icon: Mountain,
                    title: "Take the scenic route",
                    detail: "Find a different point of view",
                    prompt: "Help me plan a scenic EV road trip.",
                  },
                  {
                    icon: Coffee,
                    title: "Make a weekend of it",
                    detail: "Good stops. A slower pace.",
                    prompt:
                      "Help me plan a weekend EV trip with coffee and scenic stops.",
                  },
                  {
                    icon: Compass,
                    title: "I have somewhere in mind",
                    detail: "Let’s connect the dots",
                    prompt:
                      "I have a destination in mind. Can you help me plan an EV trip?",
                  },
                ].map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => {
                      setInput(item.prompt);
                      requestAnimationFrame(() =>
                        document.getElementById("trip-message")?.focus(),
                      );
                    }}
                    className="chat-starter rounded-[18px] text-left border border-border bg-white/70 p-4"
                  >
                    <item.icon
                      className="mb-4 h-[18px] w-[18px] text-brand"
                      strokeWidth={1.5}
                    />
                    <span className="block text-xs font-medium">
                      {item.title}
                    </span>
                    <span className="mt-1.5 block text-[10px] leading-4 text-muted-foreground">
                      {item.detail}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => {
            const isUser = message.role === "user";
            const isLastMessage = index === messages.length - 1;
            const isStreaming = isLoading && isLastMessage && !isUser;

            return (
              <div
                key={message.id}
                className={`chat-message flex ${isUser ? "justify-end" : "justify-start"} group`}
              >
                {isUser ? (
                  <div className="max-w-[80%] flex flex-col items-end gap-1">
                    {editingId === message.id ? (
                      <div className="flex flex-col gap-2 w-full min-w-64">
                        <PromptInput
                          value={editText}
                          onValueChange={setEditText}
                          onSubmit={submitEdit}
                          className="bg-muted border-border"
                        >
                          <PromptInputTextarea
                            placeholder="Edit message..."
                            autoFocus
                          />
                          <PromptInputActions className="justify-end pt-1">
                            <PromptInputAction tooltip="Cancel">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={cancelEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </PromptInputAction>
                            <PromptInputAction tooltip="Send">
                              <Button
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={submitEdit}
                                disabled={!editText.trim()}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </PromptInputAction>
                          </PromptInputActions>
                        </PromptInput>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-[22px] rounded-br-md border border-black/[0.04] bg-[#ece9e2] px-5 py-3.5 text-sm leading-relaxed">
                          <p className="whitespace-pre-wrap">
                            {getMessageText(message)}
                          </p>
                        </div>
                        <div className="chat-actions flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            aria-label="Edit message"
                            onClick={() => handleEdit(message)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="chat-assistant w-full flex flex-col gap-4">
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                      <Sparkles
                        className="h-3.5 w-3.5 text-brand"
                        aria-hidden="true"
                      />
                      Routewise
                    </div>
                    {message.parts
                      ?.map((part, partIndex) => ({ part, partIndex }))
                      .map(({ part, partIndex }) => {
                        if (part.type === "text") {
                          // A published plan already includes its itinerary text.
                          // Hide model text around the tool call so the answer
                          // appears once, with the map at the end.
                          if (message.parts?.some((candidate) =>
                            candidate.type === "tool-publishPlan" &&
                            candidate.state === "output-available" &&
                            (candidate.output as { valid?: boolean } | undefined)?.valid
                          )) return null;
                          return (
                            <div
                              key={partIndex}
                              className="max-w-[70ch] text-[15px] leading-7 text-foreground"
                            >
                              <span className="whitespace-pre-wrap">
                                {displayAssistantText(part.text)}
                              </span>
                            </div>
                          );
                        }

                        // Preserve the order in which the AI sent text and cards.
                        if (part.type.startsWith("tool-")) {
                          return (
                            <ToolPartRenderer
                              key={partIndex}
                              part={
                                part as NonNullable<
                                  ChatMessage["parts"]
                                >[number]
                              }
                              addToolOutput={addToolOutput}
                            />
                          );
                        }

                        return null;
                      })}

                    {/* Streaming indicator */}
                    {isStreaming && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
                      </div>
                    )}

                    {!isLoading && (
                      <div className="chat-actions flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full"
                          aria-label="Regenerate response"
                          onClick={() => regenerate(index)}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-border bg-muted/50 p-4 text-sm space-y-3"
            >
              <p>
                {error.message ||
                  "Trip planning is temporarily unavailable. Please try again."}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() => void retryResponse()}
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          )}
        </ChatContainerContent>
        <ChatContainerScrollAnchor />
      </ChatContainerRoot>

      {/* Input area */}
      <div className="shrink-0 px-4 pb-4 pt-3 max-w-3xl mx-auto w-full">
        <PromptInput
          value={input}
          onValueChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          className="chat-composer"
        >
          <PromptInputTextarea
            id="trip-message"
            aria-label="Message Routewise"
            placeholder="Tell me about the trip you have in mind…"
          />
          <PromptInputActions className="justify-between pt-3">
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Sparkles aria-hidden="true" className="h-3 w-3 text-brand" /> A
              little help for the open road
            </span>
            {isLoading ? (
              <PromptInputAction tooltip="Stop">
                <Button
                  size="icon"
                  className="button-brand h-9 w-9 rounded-full"
                  aria-label={isLoading ? "Stop response" : "Send message"}
                  onClick={() => stop()}
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </Button>
              </PromptInputAction>
            ) : (
              <PromptInputAction tooltip="Send" disabled={!input.trim()}>
                <Button
                  size="icon"
                  className="button-brand h-9 w-9 rounded-full"
                  aria-label={isLoading ? "Stop response" : "Send message"}
                  onClick={handleSubmit}
                  disabled={!input.trim()}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </PromptInputAction>
            )}
          </PromptInputActions>
        </PromptInput>
        <p className="mt-2.5 text-center text-[10px] text-muted-foreground">
          A plan to start with. Check road conditions and charger availability
          before you go.
        </p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageInner />
    </Suspense>
  );
}
