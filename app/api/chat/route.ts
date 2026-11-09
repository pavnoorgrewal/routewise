import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
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
import { searchPlaces } from '@/lib/place-search'
import locations from '@/data/us-locations.json'

export const maxDuration = 60

const PLANNING_ERROR = 'Trip planning is temporarily unavailable. Please try again.'
const LOCAL_SETUP_ERROR =
  'AI trip planning is not configured. Add a free Gemini API key as GOOGLE_GENERATIVE_AI_API_KEY in .env.local (or your Vercel environment variables), then restart and retry.'
const EV_RANGE_QUESTION = 'About how many miles can your EV travel on a full charge? An estimate is fine.'
const UNKNOWN_RANGE_QUESTION = "No problem. What EV model and year do you drive? If you don't know, reply 'range 150 miles' to use a cautious planning estimate."

function textResponse(message: string): Response {
  const stream = createUIMessageStream<ChatMessage>({
    execute: ({ writer }) => {
      writer.write({ type: 'text-start', id: 'reply' })
      writer.write({ type: 'text-delta', id: 'reply', delta: message })
      writer.write({ type: 'text-end', id: 'reply' })
    },
  })
  return createUIMessageStreamResponse({ stream })
}

function getUserText(message: ChatMessage): string {
  return message.parts
    .filter((part): part is Extract<ChatMessage['parts'][number], { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join(' ')
}

function getEvRangeMiles(messages: ChatMessage[]): number | null {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index]
    if (message.role !== 'user') continue
    const text = getUserText(message)
    const explicit =
      text.match(/\b(?:ev|car|vehicle|battery)?\s*(?:full[- ]charge\s+)?range\s*(?:is|of|:|about|around|up to)?\s*(\d{2,3})\s*(?:miles?|mi)?\b/i) ??
      text.match(/\b(?:full charge|per charge|on a charge|on one charge)\s*(?:is|of|:|about|around|up to|gets me)?\s*(\d{2,3})\s*(?:miles?|mi)?\b/i) ??
      text.match(/\b(\d{2,3})[\s-]*(?:miles?|mi)\s*(?:of\s+)?(?:range|per charge|on (?:a |one |full |a full )?charge)\b/i)
    if (explicit) return Number(explicit[1])

    const previousAssistant = messages.slice(0, index).reverse().find((part) => part.role === 'assistant')
    if (previousAssistant?.parts.some((part) => part.type === 'text' &&
      (part.text.includes(EV_RANGE_QUESTION) || part.text.includes(UNKNOWN_RANGE_QUESTION)))) {
      const directAnswer =
        text.match(/^\s*(?:about|around|roughly|approximately)?\s*(\d{2,3})\s*(?:miles?|mi)?\s*[.!]?\s*$/i) ??
        text.match(/\b(\d{2,3})\s*(?:miles?|mi)\b/i)
      if (directAnswer) return Number(directAnswer[1])
    }

    if (/^\s*(?:yes|sure|ok(?:ay)?|sounds good|that works|use that|go ahead)\b/i.test(text) && previousAssistant) {
      const offeredRange = previousAssistant.parts
        .filter((part): part is Extract<ChatMessage['parts'][number], { type: 'text' }> => part.type === 'text')
        .map((part) => part.text)
        .join(' ')
        .match(/\b(?:use|assume|baseline)\b.{0,60}?\b(\d{2,3})[ -]*(?:miles?|mi)\b/i)
      if (offeredRange) return Number(offeredRange[1])
    }
  }
  return null
}

function isTripRequest(text: string): boolean {
  return /\b(?:trip|road[ -]?trip|route|plan(?:ning)?|drive|driving|travel)\b/i.test(text) ||
    /\b(?:go|going)\s+(?:from|to)\b/i.test(text) ||
    /\bfrom\b[\s\S]{0,120}\bto\b/i.test(text)
}

function modelHistory(messages: ChatMessage[]): ChatMessage[] {
  return messages.slice(-24).map((message) => ({
    ...message,
    parts: message.parts.flatMap((part) => {
      // Keep completed plans for follow-ups without resending raw place-search
      // results, rejected drafts, or duplicate copies of every card.
      if (part.type === 'tool-findPlaces') return []
      if (part.type === 'tool-publishPlan') {
        const output = part.state === 'output-available' ? part.output : undefined
        if (!output?.valid || !output.plan) return []
        const plan = output.plan
        return [{ type: 'text' as const, text: `Completed trip: ${plan.summary.origin} to ${plan.summary.destination}.\n${plan.itinerary}\nStops in driving order: ${plan.summary.stops.map((stop) => `${stop.name}, ${stop.location}`).join(' → ')}. Estimated total: ${plan.summary.totalDistance ?? 'unknown'}, ${plan.summary.totalDuration ?? 'unknown'}.` }]
      }
      if (part.type === 'tool-showRouteSummary' && part.state === 'input-available') {
        const route = part.input
        const stops = route.stops.map((stop) => `${stop.name} (${stop.location})`).join(' → ')
        const summary = `Completed trip plan: ${route.origin} → ${stops ? `${stops} → ` : ''}${route.destination}. ` +
          `Estimated distance: ${route.totalDistance ?? 'unknown'}. Estimated drive time: ${route.totalDuration ?? 'unknown'}.`
        return [{ type: 'text' as const, text: summary }]
      }
      if (part.type === 'tool-showRouteOptions' && part.state === 'input-available') {
        return [{ type: 'text' as const, text: `I asked: ${part.input.question} Options: ${part.input.options.map((option) => option.name).join(', ')}.` }]
      }
      if (part.type === 'tool-askMultipleChoice' && part.state === 'input-available') {
        return [{ type: 'text' as const, text: `I asked: ${part.input.question} Options: ${part.input.options.map((option) => option.label).join(', ')}.` }]
      }
      if (part.type === 'tool-showSuggestedStops' && part.state === 'input-available') {
        return [{ type: 'text' as const, text: `I offered optional stops: ${part.input.chips.map((chip) => chip.label).join(', ')}. The traveler can also choose no extra stops.` }]
      }
      return [part]
    }),
  }))
}

// ─── Tool Definitions ────────────────────────────────────────────────────────

const verifiedAddresses = new Map<string, number>()
const cityNames = locations.filter((location) => location.type === 'city')
  .sort((a, b) => b.name.length - a.name.length)

function cityInQuery(query: string) {
  const normalized = ` ${query.toLowerCase().replace(/[^a-z0-9]+/g, ' ')} `
  return cityNames.find((city) =>
    normalized.includes(` ${city.name.toLowerCase()} `) &&
    normalized.includes(` ${city.state.toLowerCase()} `))
    ?? cityNames.find((city) => normalized.includes(` ${city.name.toLowerCase()} `))
}

function placeKey(name: string, address: string) {
  return `${name} ${address}`.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function wasVerified(name: string, address: string) {
  const timestamp = verifiedAddresses.get(placeKey(name, address))
  return timestamp !== undefined && timestamp > Date.now() - 24 * 60 * 60 * 1000
}

const findPlacesTool = tool({
  description:
    'Look up real US restaurants, parks, scenic stops, and EV charging stations by name and city before including them in a final itinerary. Results come from OpenStreetMap via Photon. Use returned street addresses verbatim; a null address means no street address was found and must not be invented.',
  inputSchema: z.object({
    queries: z.array(z.string().min(3).max(120)).min(1).max(8)
      .describe('Specific place searches including city and state, e.g. "Tesla Supercharger Folsom CA"'),
  }),
  execute: async ({ queries }) => ({
    source: 'OpenStreetMap via Photon',
    results: await Promise.all(queries.map(async (query) => {
      try {
        const city = /charg|supercharger|evgo|electrify/i.test(query) ? cityInQuery(query) : undefined
        const fallbackQuery = city ? `Tesla Supercharger ${city.name} ${city.state}` : null
        const [matches, fallback] = await Promise.all([
          searchPlaces(query),
          fallbackQuery && placeKey(query, '') !== placeKey(fallbackQuery, '')
            ? searchPlaces(fallbackQuery).catch(() => []) : Promise.resolve([]),
        ])
        const nearbyChargers = city && !matches.some((match) =>
          match.address && match.area.toLowerCase().includes(city.name.toLowerCase()) && /charg/i.test(match.kind ?? ''))
          ? fallback.filter((match) =>
            match.address && match.area.toLowerCase().includes(city.name.toLowerCase()) && /charg/i.test(match.kind ?? ''))
          : []
        if (verifiedAddresses.size > 1000) verifiedAddresses.clear()
        for (const match of [...matches, ...nearbyChargers]) {
          if (match.address) verifiedAddresses.set(placeKey(match.name, match.address), Date.now())
        }
        return { query, matches, nearbyChargers }
      } catch {
        return { query, matches: [], error: 'Lookup unavailable; do not invent an address.' }
      }
    })),
  }),
})

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
    'Display the named restaurants, parks, scenic overlooks, and other places the traveler will visit as visual cards. Include only stops on the chosen itinerary, with a specific name, verified street address, and reason to visit.',
  inputSchema: z.object({
    stops: z.array(
      z.object({
        name: z.string().describe('Name of the stop (e.g. "Blue Bottle Coffee", "In-N-Out Burger")'),
        location: z.string().describe('Full street address returned by findPlaces (e.g. "220 Iron Point Road, Folsom, CA 95630"); never just a city'),
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
    'Display the completed itinerary as a visual timeline and generate its Google Maps directions link. Include every planned charging, dining, park, and scenic stop in driving order, with a specific place name and verified full street address. Call this after the detailed route text and other stop cards so the map link ends the answer.',
  inputSchema: z.object({
    origin: z.string().describe('Starting location (e.g. "San Francisco, CA")'),
    destination: z.string().describe('End destination (e.g. "Los Angeles, CA")'),
    stops: z.array(
      z.object({
        name: z.string().describe('Name of the stop'),
        location: z.string().describe('Full street address returned by findPlaces, not just a city'),
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
  ).describe('The chosen stop types and any named places entered by the traveler. Items with an id starting custom-stop- are specific places the traveler requested. An empty array means no optional stops.'),
})

const showChargingStationsTool = tool({
  description:
    'Display specific EV charging stops on the chosen route, in driving order. Include the station name and its verified full street address from findPlaces. When lookup fails, clearly label a candidate charging area and leave unknown details null. Do not claim live availability.',
  inputSchema: z.object({
    title: z.string().nullable().optional().describe('Optional section title'),
    stations: z.array(
      z.object({
        name: z.string().describe('Station name (e.g. "Tesla Supercharger - Santa Barbara")'),
        location: z.string().describe('Full street address returned by findPlaces; if unavailable, explicitly say the address is unverified'),
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

// A completed itinerary is one structured tool call. The client renders its
// text and existing cards in order, so the model cannot print fake tool calls.
const publishPlanTool = tool({
  description: 'Publish the completed EV trip in the existing answer layout: plain-text route legs, place cards, charging cards, then the route timeline and Google Maps link. Every planned stop must have the exact real name and full street address returned by findPlaces. The server rejects unverified addresses so you can look up an alternative.',
  inputSchema: z.object({
    itinerary: z.string().min(20).describe('Plain-text overview and short numbered route legs, including exact place names and full street addresses in driving order. No Markdown symbols or function-call text.'),
    places: z.array(z.object({
      name: z.string(),
      location: z.string().describe('Verified full street address from findPlaces; never just a city'),
      category: z.enum(['food', 'coffee', 'fuel', 'attraction', 'lodging', 'shopping', 'scenic', 'entertainment', 'default']),
      description: z.string().nullable().optional(),
    })).max(8).describe('Only optional non-charging stops actually included in the plan'),
    chargingStations: z.array(z.object({
      name: z.string(),
      location: z.string().describe('Verified full street address returned by findPlaces'),
      network: z.string().nullable().optional(),
      ports: z.number().int().nullable().optional(),
      maxKw: z.number().nullable().optional(),
      distanceFromRoute: z.string().nullable().optional(),
      estimatedChargingTime: z.string().nullable().optional(),
      amenitiesNearby: z.array(z.string()).nullable().optional(),
    })).max(6).describe('Only charging stops needed for the stated range'),
    summary: z.object({
      origin: z.string(),
      destination: z.string(),
      stops: z.array(z.object({
        name: z.string(),
        location: z.string().describe('Same full street address as the corresponding place or charging card'),
        category: z.enum(['food', 'coffee', 'fuel', 'attraction', 'lodging', 'shopping', 'scenic', 'entertainment', 'default']).nullable().optional(),
        durationFromPrev: z.string().nullable().optional(),
      })).max(9).describe('All planned intermediate stops, in exact driving order'),
      totalDistance: z.string().nullable().optional(),
      totalDuration: z.string().nullable().optional(),
      approximateEta: z.string().nullable().optional(),
      vehicleModel: z.string().nullable().optional(),
      routeTag: z.string().nullable().optional(),
    }),
  }),
  execute: async (plan) => {
    const errors: string[] = []
    const cards = [...plan.places, ...plan.chargingStations]
    for (const stop of cards) {
      if (!wasVerified(stop.name, stop.location)) {
        errors.push(`${stop.name} at ${stop.location} was not in the place lookup results. Search for a real named stop with a street address and use the returned name and address exactly.`)
      }
      const street = stop.location.split(',')[0].toLowerCase()
      if (!plan.itinerary.toLowerCase().includes(street)) {
        errors.push(`Include ${stop.name}'s street address (${street}) in the itinerary text.`)
      }
    }
    for (const stop of plan.summary.stops) {
      if (!cards.some((card) => placeKey(card.name, card.location) === placeKey(stop.name, stop.location))) {
        errors.push(`${stop.name} in the route summary must match a place or charging card exactly.`)
      }
    }
    for (const stop of cards) {
      if (!plan.summary.stops.some((summary) => placeKey(stop.name, stop.location) === placeKey(summary.name, summary.location))) {
        errors.push(`${stop.name} is missing from the route summary.`)
      }
    }
    if (errors.length) return { valid: false, errors, plan: null }
    return {
      valid: true,
      errors: [],
      plan: {
        ...plan,
        chargingStations: plan.chargingStations.map((station) => ({
          ...station,
          ports: null,
          maxKw: null,
          estimatedChargingTime: null,
          amenitiesNearby: null,
        })),
      },
    }
  },
})

// ─────────────────────────────────────────────────────────────────────────────

const tools = {
  findPlaces: findPlacesTool,
  publishPlan: publishPlanTool,
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
- Before planning any route, ask how many miles the traveler's EV can travel on a full charge if they have not already supplied it. Never assume a generic EV range. Use their stated range to decide whether an en-route charging stop is needed.
- Respond naturally to greetings and casual questions. For a greeting without a trip request, answer briefly and ask where they would like to go; do not mention EV range yet. If they do not know their range when planning, ask for their EV model. If they also do not know the model, offer an explicit conservative planning estimate and wait for their acceptance. Never silently invent an EV range.
- After a completed itinerary, treat the next user message as a follow-up. Answer questions about the existing route directly. If they request changes, revise the relevant part and update the route summary; if they request a new trip, plan it using the known EV range unless they changed vehicles. Do not restart the entire questionnaire or repeat the full itinerary for a small question.
- Plan charging legs conservatively: allow a reserve and account for weather, terrain, and highway speed. If the starting battery level is unknown, clearly state the starting-charge assumption. Never promise that a leg is safely reachable from the rated range alone.
- You do not have access to live maps, road closures, charger status, or reservation systems. State that routes, drive times, and charging suggestions are estimates. Never claim a charger is available, operational, or compatible without verified data.
- You CAN use findPlaces to search OpenStreetMap place data for names and street addresses. This is a place directory, not live routing or charger-status data. Before naming any restaurant, park entrance, overlook, or charging station as a PLANNED STOP, use findPlaces with the place name and city/state. Choose a returned match that has both the correct name and a non-null street address. Copy that address exactly into publishPlan.itinerary, the corresponding card, and publishPlan.summary. Keep the same place name and address in every view. For a park or viewpoint without a numbered street address, search for a named entrance, visitor center, or trailhead with an address. If no address can be found, say the street address could not be verified and do not invent one; prefer another stop with an address. Never treat a name-only search result as proof of a street address.
- If the traveler provides a street address or named business for the start or destination, preserve that full location in publishPlan.summary so the map opens at the intended place, rather than reducing it to a city name.
- Do not invent exact charger port counts, power ratings, or real-time availability. Use null for unknown fields and invite the traveler to verify the route and charger details before departure.
- Give the traveler a complete itinerary in plain text before the visual cards: the chosen highways/roads, each leg in driving order with approximate distance and driving time, where and why to charge (including an estimated charging break only if the vehicle and charge assumptions support it), and the specific names and full street addresses of restaurants, parks, scenic overlooks, charging stations, or other places they will visit. Explain what they will do at each stop. Distinguish drive time from time spent charging or visiting. If no en-route charge is needed, say so and explain the starting-charge assumption. Be concise: the cards will carry supporting details, so do not repeat their descriptions in long prose.
- Include only places you are reasonably confident exist. Never fabricate a restaurant, park, charger, address, or precise schedule. Mark uncertain charging locations as candidate areas and ask the traveler to confirm them before departure. If the vehicle, starting state of charge, departure time, or connector is unknown, state the assumption instead of making up a precise charging duration or ETA.
- The final route summary must include EVERY stop the itinerary actually plans to visit, in exactly the same order as the detailed text and charging/place cards. Use the verified specific place name plus its full street address, not just a city. Keep the complete itinerary to at most nine intermediate stops so one Google Maps directions link can include them all. Treat extra suggestions as optional alternatives, not part of the mapped route.
- Restaurants, parks, scenic overlooks, and other sightseeing stops are optional. If the traveler chooses "No extra stops" or skips stop suggestions, do not add optional stops anyway. Include only charging stops actually needed for their EV range; a trip can have zero intermediate stops. Pass an empty places array when there are no optional places.
- Even when there are zero intermediate stops, include a short plain-text route explanation with the chosen road, estimated distance and drive time, and whether charging is needed inside publishPlan.itinerary. Never send a route-summary card by itself as the whole final answer.
- After collecting the user's preferences, produce the itinerary, supporting cards, and final Route Summary in one answer. Do NOT ask the user to confirm the plan first. The user will follow up with changes if they want adjustments.
- For the final itinerary, use ONE real publishPlan tool call. Put the short plain-text overview and numbered legs in itinerary, non-charging places in places, needed chargers in chargingStations, and all stops in summary.stops in driving order. The client renders these in the existing layout: text, places, charging cards, route timeline, then Google Maps link. Do not write the itinerary separately, call showRouteStops/showChargingStations/showRouteSummary separately, print pseudo-code, or paste a raw Google Maps URL. Continue normal conversational text for questions and follow-ups that do not need a new itinerary.

## Conversation Flow
1. Greet briefly and identify the trip (origin and destination). A casual greeting alone is not a trip request.
2. Confirm the traveler's full-charge EV range in miles before planning. The server asks for it when a trip request is made without a range; never create a route, route options, or stops before they answer or explain they do not know it.
3. If multiple viable routes exist, use showRouteOptions to let the user choose one.
4. Ask only for important missing preferences using askMultipleChoice (one at a time): trip pace, dining style, scenic vs. fast, etc. If the traveler already supplied enough detail, go straight to the itinerary.
5. Optionally use showSuggestedStops with multiSelect: true to gather stop-type preferences. The traveler can also type specific named places and add more than one. Include those requested places in the plan if they can be located on the route. The traveler can choose no extra stops; accept that choice and continue directly to the itinerary.
6. Once you have the route and preferences, call findPlaces for each restaurant, park entrance, viewpoint, and needed EV charging station you intend to include. Search for all intended stops in one batch when possible. Use only matching returned names and street addresses.
7. Call publishPlan with the complete itinerary, supporting cards, and summary. Do not write more text or call more tools afterward. This also applies when there are zero intermediate stops: pass empty places, chargingStations, and summary.stops arrays.

## Tool Usage Guidelines

### findPlaces
Look up planned stops in batches with queries that include the name and city/state. Use the returned address only for the matching place. For charging searches, nearbyChargers may contain verified named stations in that city when the requested network has no result; use one of those rather than inventing a station for the preferred network. Search another candidate when a result lacks a street address or the name is ambiguous. Never turn a failed lookup into a fabricated address. Search stop locations before producing the final itinerary; do not call this tool for routine conversational questions or when the route has no intermediate stops.

### publishPlan
This is the ONLY tool for publishing a completed or revised itinerary. Put exact place names and full street addresses from findPlaces in itinerary and in each matching card/summary field. Keep the total itinerary concise and plain text. If a chosen place has no verified address, search for a different named place before publishing. The server will reject any invented address and return the specific errors so you can correct them. The summary must include all planned stops in driving order; the client creates the final Google Maps link.

### askMultipleChoice
Use to collect structured preferences. ALWAYS provide 4 options when possible (they render in a 2-column grid). Examples: trip pace (Relaxed / Moderate / Fast / Flexible), dining style (Local gems / Fine dining / Quick bites / Roadside classics), scenic preference, time of departure. Limit to one question at a time. For any optional stop question, include a "No extra stops" option.

### showSuggestedStops
Use to let the user pick categories or types of stops (e.g. coffee, scenic overlooks, local diners, national parks, viewpoints, photo spots). ALWAYS pass multiSelect: true unless there is a clear reason for single-select — users want to pick multiple stop types and enter specific place names. Provide 5-8 chips with diverse categories. An output id starting custom-stop- is a place the traveler explicitly requested. Search for its exact name and city; include it in the route if it can be verified and fits the trip. If it is ambiguous or lacks a verified address, ask for its city or street address instead of silently replacing it. An empty selection means no extra stops; do not ask again or insert any optional stops.

### showRouteOptions
Use when there are 2+ viable route alternatives (e.g. coastal vs. inland, PCH vs. I-5). Offer route options early in the planning so the user can choose direction. Include distance, EV-aware drive time, highlights, and tags (scenic, fast, eco, popular).

The older showRouteStops, showChargingStations, and showRouteSummary tools exist only so previous conversations can be read. Do not use them for new final plans.

## Style Tips
- Be conversational, warm, and enthusiastic.
- Be specific — use real place names, real charging networks, and real cities.
- Always include drive times between stops so the user can plan breaks.
- Keep preference questions to one short sentence, without a long introduction.
- Make the final answer easy to skim. Start with one short line covering the route, estimated drive time, and number of charging stops. Add a blank line, then give each driving leg its own short numbered paragraph in travel order. For each leg, include the road, approximate miles and drive time, and the named stop plus what the traveler will do there. Keep each leg to one or two short sentences. Put the starting-charge assumption and any charger verification note in one brief closing line only if they were not already covered in the overview or legs. Use blank lines between paragraphs.
- Scale detail to the trip: a short trip should take only a few short paragraphs; a long trip can use more legs, but avoid repetition, filler, long disclaimers, and lists of optional places. Include the important planning details once, then let the stop and charging cards show the supporting information.
- Write plain text only. Never output Markdown markers, including # headings, ** bold, * emphasis, or tables; the chat displays text literally.
- Never say "gas", "fuel up", "fill up the tank", etc. Use "charge", "top up", "Supercharger stop".
`

export async function POST(req: Request) {
  let body: unknown
  try {
    const raw = await req.text()
    if (raw.length > 128_000) return new Response('Request too large', { status: 413 })
    body = JSON.parse(raw)
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  let messages: ChatMessage[]
  try {
    const submitted = (body as { messages?: ChatMessage[] }).messages
    if (!Array.isArray(submitted) || submitted.length < 1 || submitted.length > 80) {
      return new Response('Bad Request', { status: 400 })
    }
    messages = await validateUIMessages<ChatMessage>({
      messages: submitted,
      tools,
    })
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  const evRangeMiles = getEvRangeMiles(messages)
  const latestUser = [...messages].reverse().find((message) => message.role === 'user')
  const latestUserText = latestUser ? getUserText(latestUser) : ''
  const lastAssistant = [...messages].reverse().find((message) => message.role === 'assistant')
  const answeringRangeQuestion = lastAssistant?.parts.some((part) => part.type === 'text' &&
    (part.text.includes(EV_RANGE_QUESTION) || part.text.includes(UNKNOWN_RANGE_QUESTION))) ?? false
  if (evRangeMiles === null && answeringRangeQuestion && /\b(?:do(?:n't| not) know|not sure|unsure|no idea)\b/i.test(latestUserText)) {
    return textResponse(UNKNOWN_RANGE_QUESTION)
  }
  if (evRangeMiles === null && !answeringRangeQuestion && isTripRequest(latestUserText)) {
    return textResponse(EV_RANGE_QUESTION)
  }

  let modelMessages: Awaited<ReturnType<typeof convertToModelMessages>>
  try {
    modelMessages = await convertToModelMessages(modelHistory(messages), { ignoreIncompleteToolCalls: true })
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
      system: evRangeMiles === null
        ? `${SYSTEM_PROMPT}\n\nThe traveler has not given an EV range yet. ${answeringRangeQuestion ? 'They are responding to your range question. If they supplied an EV model and year, give a clearly labeled approximate range and ask them to confirm it before planning. Otherwise ask for their EV model; do not repeat the same range question, invent a precise range, or plan the route yet.' : 'Their latest message is not a trip request. Respond conversationally and do not mention EV range yet. You may ask where they would like to go.'} Do not generate a route until a numeric range is known or the traveler explicitly accepts a stated planning estimate.`
        : `${SYSTEM_PROMPT}\n\nThe traveler stated an EV full-charge range of ${evRangeMiles} miles. Use this range when planning charging stops and explain your starting-charge and reserve assumptions.`,
      messages: modelMessages,
      tools,
      providerOptions: {
        google: { thinkingConfig: { thinkingLevel: 'minimal' } },
      },
      stopWhen: [stepCountIs(15), ({ steps }) => steps.some((step) =>
        step.toolResults.some((result) => result.toolName === 'publishPlan' &&
          (result.output as { valid?: boolean }).valid === true))],
      prepareStep: ({ steps }) => {
        const lookups = steps.flatMap((step) => step.toolCalls).filter((call) => call.toolName === 'findPlaces').length
        const lastPlan = steps.flatMap((step) => step.toolResults)
          .filter((result) => result.toolName === 'publishPlan').at(-1)
        if (lastPlan && (lastPlan.output as { valid?: boolean }).valid === false) {
          return { activeTools: ['findPlaces', 'publishPlan'], toolChoice: 'required' }
        }
        if (lookups >= 2) {
          return {
            activeTools: ['publishPlan'],
            toolChoice: { type: 'tool', toolName: 'publishPlan' },
          }
        }
        if (lookups === 1) {
          return {
            activeTools: ['findPlaces', 'publishPlan'],
            toolChoice: 'required',
          }
        }
        return { activeTools: ['findPlaces', 'publishPlan', 'askMultipleChoice', 'showSuggestedStops', 'showRouteOptions'] }
      },
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse({
      onError: () => PLANNING_ERROR,
    })
  } catch {
    return new Response(PLANNING_ERROR, { status: 500 })
  }
}
