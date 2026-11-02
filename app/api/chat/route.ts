import {
  convertToModelMessages,
  InferUITools,
  stepCountIs,
  streamText,
  tool,
  UIDataTypes,
  UIMessage,
  validateUIMessages,
} from 'ai'
import { z } from 'zod'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'

export const maxDuration = 60

const PLANNING_ERROR = 'Trip planning is temporarily unavailable. Please try again.'
const LOCAL_SETUP_ERROR =
  'AI trip planning is not configured. Add a free Gemini API key as GOOGLE_GENERATIVE_AI_API_KEY in .env.local (or your Vercel environment variables), then restart and retry.'

// ─── Tool Definitions ────────────────────────────────────────────────────────

const askMultipleChoiceTool = tool({
  description:
    'Ask the user a multiple choice question and wait for their selection. Use this when you need the user to pick from a set of options, for example trip pace, accommodation type, route preference, or activity interests.',
  inputSchema: z.object({
    question: z.string().describe('The question to ask the user'),
    options: z
      .array(
        z.object({
          id: z.string().describe('Unique identifier for the option'),
          label: z.string().describe('Display text for the option'),
        })
      )
      .min(2)
      .max(6)
      .describe('The options to present to the user (2-6 options)'),
  }),
  outputSchema: z.object({
    selectedId: z.string().describe('The id of the selected option'),
    selectedLabel: z.string().describe('The label of the selected option'),
  }),
})

const showRouteStopsTool = tool({
  description:
    'Display the named restaurants, parks, scenic overlooks, and other places the traveler will visit as visual cards. Include only stops on the chosen itinerary, with a specific name, location, and reason to visit.',
  inputSchema: z.object({
    stops: z.array(
      z.object({
        name: z.string().describe('Name of the stop (e.g. "Blue Bottle Coffee", "In-N-Out Burger")'),
        location: z.string().describe('City or address of the stop (e.g. "Santa Barbara, CA")'),
        category: z
          .enum(['food', 'coffee', 'fuel', 'attraction', 'lodging', 'shopping', 'scenic', 'entertainment', 'default'])
          .describe('Category for the stop icon'),
        description: z.string().nullable().optional().describe('Optional short description of why this stop is recommended'),
      })
    ).min(1).max(8),
  }),
  execute: async () => ({ displayed: true }),
})

const showRouteSummaryTool = tool({
  description:
    'Display the completed itinerary as a visual timeline and generate its Google Maps directions link. Include every planned charging, dining, park, and scenic stop in driving order, with a specific place name and location. Call this after the detailed route text and other stop cards so the map link ends the answer.',
  inputSchema: z.object({
    origin: z.string().describe('Starting location (e.g. "San Francisco, CA")'),
    destination: z.string().describe('End destination (e.g. "Los Angeles, CA")'),
    stops: z.array(
      z.object({
        name: z.string().describe('Name of the stop'),
        location: z.string().describe('City or address'),
        category: z
          .enum(['food', 'coffee', 'fuel', 'attraction', 'lodging', 'shopping', 'scenic', 'entertainment', 'default'])
          .nullable().optional(),
        durationFromPrev: z.string().nullable().optional().describe('Drive time from the previous stop (e.g. "1h 20min")'),
      })
    ).max(9).describe('Every planned intermediate stop in driving order, up to nine for one Google Maps directions link'),
    totalDistance: z.string().nullable().optional().describe('Total distance (e.g. "381 miles")'),
    totalDuration: z.string().nullable().optional().describe('Total drive time (e.g. "5h 45min")'),
    approximateEta: z.string().nullable().optional().describe('Estimated arrival time (e.g. "3:30 PM")'),
    vehicleModel: z.string().nullable().optional().describe('EV model if known (e.g. "Tesla Model 3", "Rivian R1T")'),
    routeTag: z.string().nullable().optional().describe('Short route descriptor badge (e.g. "Fastest Route", "Scenic Route", "EV-Optimized")'),
  }),
})

const showSuggestedStopsTool = tool({
  description:
    'Show selectable chip suggestions for types of stops or specific places. Use this early in the conversation to let users quickly pick what kinds of stops they want (e.g. coffee shops, viewpoints, local diners) or suggest a curated set of specific stops for them to choose from. Supports multi-select.',
  inputSchema: z.object({
    title: z.string().describe('Label above the chips (e.g. "What kind of stops do you want?")'),
    chips: z.array(
      z.object({
        id: z.string().describe('Unique identifier'),
        label: z.string().describe('Chip display text'),
        sublabel: z.string().nullable().optional().describe('Optional extra info shown on the chip'),
        category: z
          .enum(['food', 'coffee', 'fuel', 'attraction', 'lodging', 'shopping', 'scenic', 'entertainment', 'default'])
          .nullable().optional(),
      })
    ).min(2).max(10),
    multiSelect: z.boolean().describe('Whether the user can select multiple chips'),
  }),
  outputSchema: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
    })
  ).describe('The chips selected by the user'),
})

const showChargingStationsTool = tool({
  description:
    'Display the specific candidate EV charging stops on the chosen route, in driving order. Name the station and network only when reasonably confident they exist; otherwise name the charging area and leave unknown details null. Do not claim live availability.',
  inputSchema: z.object({
    title: z.string().nullable().optional().describe('Optional section title'),
    stations: z.array(
      z.object({
        name: z.string().describe('Station name (e.g. "Tesla Supercharger - Santa Barbara")'),
        location: z.string().describe('Address or city'),
        network: z.string().nullable().optional().describe('Charging network (e.g. "Tesla", "Electrify America", "ChargePoint")'),
        ports: z.number().int().nullable().optional().describe('Number of charging ports'),
        maxKw: z.number().nullable().optional().describe('Maximum charging speed in kW'),
        distanceFromRoute: z.string().nullable().optional().describe('How far off the main route (e.g. "0.3 mi off route")'),
        estimatedChargingTime: z.string().nullable().optional().describe('Estimated time to charge (e.g. "20-30 min")'),
        amenitiesNearby: z.array(z.string()).nullable().optional().describe('Nearby amenities (e.g. ["Starbucks", "Whole Foods"])'),
      })
    ).min(1).max(6),
  }),
  execute: async () => ({ displayed: true }),
})

const showRouteOptionsTool = tool({
  description:
    'Present the user with selectable route alternatives to choose between. Use this when multiple viable route options exist (e.g. highway vs scenic road, I-5 vs US-101, PCH vs inland), and the user should pick one before you finalize the plan.',
  inputSchema: z.object({
    question: z.string().describe('The prompt asking the user to choose (e.g. "Which route would you prefer?")'),
    options: z.array(
      z.object({
        id: z.string().describe('Unique identifier for the route option'),
        name: z.string().describe('Route name (e.g. "Pacific Coast Highway", "I-5 Express")'),
        description: z.string().nullable().describe('Brief description of the route and what makes it unique'),
        distance: z.string().nullable().describe('Total distance (e.g. "420 miles")'),
        duration: z.string().nullable().describe('Estimated drive time (e.g. "7h 30min")'),
        highlights: z.array(z.string()).nullable().describe('Key highlights along the route'),
        tags: z.array(z.enum(['scenic', 'fast', 'eco', 'popular'])).nullable().describe('Tags that describe the route'),
      })
    ).min(2).max(4),
  }),
  outputSchema: z.object({
    selectedId: z.string(),
    selectedName: z.string(),
  }),
})

// ─────────────────────────────────────────────────────────────────────────────

const tools = {
  askMultipleChoice: askMultipleChoiceTool,
  showRouteStops: showRouteStopsTool,
  showRouteSummary: showRouteSummaryTool,
  showSuggestedStops: showSuggestedStopsTool,
  showChargingStations: showChargingStationsTool,
  showRouteOptions: showRouteOptionsTool,
} as const

export type ChatMessage = UIMessage<never, UIDataTypes, InferUITools<typeof tools>>

const SYSTEM_PROMPT = `You are Routewise, a friendly and knowledgeable AI road trip planning assistant for ELECTRIC VEHICLE (EV) road trips ONLY. Every trip you plan is for an EV. Help users plan amazing EV road trips with personalized stop suggestions, scenic routes, and charging strategy.

## CRITICAL RULES
- This product is exclusively for EV trip planning. NEVER mention gas stations, fuel stops, gas breaks, gasoline, or anything related to internal combustion engines. The "fuel" category in our tools means EV charging.
- When suggesting stops along the route, plan around EV charging needs (typical EV range 200-300 miles between charges).
- You do not have access to live maps, road closures, charger status, or reservation systems. State that routes, drive times, and charging suggestions are estimates. Never claim a charger is available, operational, or compatible without verified data.
- If the traveler provides a street address or named business for the start or destination, preserve that full location in showRouteSummary so the map opens at the intended place, rather than reducing it to a city name.
- Do not invent exact charger port counts, power ratings, or real-time availability. Use null for unknown fields and invite the traveler to verify the route and charger details before departure.
- Give the traveler a COMPLETE, DETAILED itinerary in plain text before the visual cards: the chosen highways/roads, each leg in driving order with approximate distance and driving time, where and why to charge (including an estimated charging break only if the vehicle and charge assumptions support it), and the specific names and locations of restaurants, parks, scenic overlooks, or other places they will visit. Explain what they will do at each stop. Distinguish drive time from time spent charging or visiting. If no en-route charge is needed, say so and explain the starting-charge assumption.
- Include only places you are reasonably confident exist. Never fabricate a restaurant, park, charger, address, or precise schedule. Mark uncertain charging locations as candidate areas and ask the traveler to confirm them before departure. If the vehicle, starting state of charge, departure time, or connector is unknown, state the assumption instead of making up a precise charging duration or ETA.
- The final route summary must include EVERY stop the itinerary actually plans to visit, in exactly the same order as the detailed text and charging/place cards. Use the specific place name plus a location or address, not just a city. Keep the complete itinerary to at most nine intermediate stops so one Google Maps directions link can include them all. Treat extra suggestions as optional alternatives, not part of the mapped route.
- After collecting the user's preferences, IMMEDIATELY produce the final Route Summary. Do NOT ask the user to confirm the plan first. The user will follow up with changes if they want adjustments.

## Conversation Flow
1. Greet briefly and identify the trip (origin and destination).
2. If multiple viable routes exist, use showRouteOptions to let the user choose one.
3. Ask only for important missing preferences using askMultipleChoice (one at a time): trip pace, dining style, scenic vs. fast, etc. If the traveler already supplied enough detail, go straight to the itinerary.
4. Optionally use showSuggestedStops with multiSelect: true to gather stop-type preferences.
5. Once you have the route and preferences, write the detailed leg-by-leg itinerary in plain text. Then call showRouteStops for the named places and showChargingStations for needed charging stops.
6. Briefly invite changes, then call showRouteSummary LAST with every planned stop in driving order. The Google Maps link in that card must be the last part of your answer. Do not write more text or call more tools afterward.

## Tool Usage Guidelines

### askMultipleChoice
Use to collect structured preferences. ALWAYS provide 4 options when possible (they render in a 2-column grid). Examples: trip pace (Relaxed / Moderate / Fast / Flexible), dining style (Local gems / Fine dining / Quick bites / Roadside classics), scenic preference, time of departure. Limit to one question at a time.

### showSuggestedStops
Use to let the user pick categories or types of stops (e.g. coffee, scenic overlooks, local diners, national parks, viewpoints, photo spots). ALWAYS pass multiSelect: true unless there is a clear reason for single-select — users want to pick multiple stop types. Provide 5-8 chips with diverse categories.

### showRouteOptions
Use when there are 2+ viable route alternatives (e.g. coastal vs. inland, PCH vs. I-5). Offer route options early in the planning so the user can choose direction. Include distance, EV-aware drive time, highlights, and tags (scenic, fast, eco, popular).

### showRouteStops
Use to display the specific restaurants, parks, viewpoints, and attractions actually included in the chosen itinerary. Give each a useful description and location. NEVER use this for charging — use showChargingStations for charging.

### showChargingStations
Use proactively when the trip may exceed the vehicle's comfortable range. Give the station name, network, and location for each planned charging stop when reasonably confident they exist. Otherwise give a clearly labeled candidate charging area. Set unknown kW speeds, port counts, charging time, and amenities to null. The traveler must verify locations, connector compatibility, and availability before driving. Do not add an unnecessary charging stop to a short trip.

### showRouteSummary
The "final plan" view with origin → every planned stop → destination timeline and Google Maps directions link. Call this LAST, after the detailed text and other cards — do not wait for confirmation. Include all planned charging stops and points of interest, in driving order, with specific names and locations. Use no more than nine intermediate stops. Do not substitute a city center for a named place. Give totalDistance and totalDuration as estimates, and use null for approximateEta unless a departure time is known. If the user has mentioned their EV model, pass it as vehicleModel. Always pass a routeTag (e.g. "Fastest Route", "Scenic Route", "EV-Optimized"). For charging stops, use category 'fuel' (which renders as Charging in the UI).

## Style Tips
- Be conversational, warm, and enthusiastic.
- Be specific — use real place names, real charging networks, and real cities.
- Always include drive times between stops so the user can plan breaks.
- Keep preference questions brief, but make the final itinerary detailed enough to follow each leg and understand every planned stop. Use plain text lines rather than Markdown headings or tables so the current chat layout renders cleanly.
- Never say "gas", "fuel up", "fill up the tank", etc. Use "charge", "top up", "Supercharger stop".
`

export async function POST(req: Request) {
  let body: unknown
  try {
    const raw = await req.text()
    if (raw.length > 64_000) return new Response('Request too large', { status: 413 })
    body = JSON.parse(raw)
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  let messages: ChatMessage[]
  try {
    const submitted = (body as { messages?: ChatMessage[] }).messages
    if (!Array.isArray(submitted) || submitted.length < 1 || submitted.length > 40) {
      return new Response('Bad Request', { status: 400 })
    }
    messages = await validateUIMessages<ChatMessage>({
      messages: submitted,
      tools,
    })
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  let modelMessages: Awaited<ReturnType<typeof convertToModelMessages>>
  try {
    modelMessages = await convertToModelMessages(messages)
  } catch {
    return new Response(PLANNING_ERROR, { status: 500 })
  }

  if (
    !process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() &&
    !process.env.OPENAI_API_KEY?.trim() &&
    !process.env.VERCEL &&
    !process.env.AI_GATEWAY_API_KEY?.trim() &&
    !process.env.VERCEL_OIDC_TOKEN?.trim()
  ) {
    return new Response(LOCAL_SETUP_ERROR, { status: 503 })
  }

  try {
    const result = streamText({
      model: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
        ? google('gemini-3.1-flash-lite')
        : process.env.OPENAI_API_KEY?.trim()
          ? openai('gpt-5.4-mini')
          : 'openai/gpt-5.4-mini',
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(15),
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse({
      onError: () => PLANNING_ERROR,
    })
  } catch {
    return new Response(PLANNING_ERROR, { status: 500 })
  }
}
