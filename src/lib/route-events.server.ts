export type GeneratedRouteEvent = {
  status: string;
  location: string;
  description: string;
  event_time?: string;
  timestamp?: string;
};

export function buildRouteEventsPrompt(origin: string, destination: string, serviceType: string) {
  return `You are a global logistics expert for Zipco International Delivery Service.

Generate a realistic shipment tracking route from "${origin}" to "${destination}" using "${serviceType || "standard freight"}".

Reject unrelated questions or fake/non-location inputs. If the input is unrelated to shipping route planning, return an error message instead of answering it.

Return 4 to 8 chronological tracking events. Dates must start a few days ago and progress logically by hours or days.

Use realistic locations along the route and choose statuses such as:
Item Processed at Origin Warehouse, Picked up by Carrier, Departed Origin Port, In Transit via Ocean Freight, In Transit via Air Freight, Arrived at Transit Hub, Customs Clearance in Progress, Customs Released, DELAYED, Arrived at Destination Port, Out for Delivery, Delivered.

Keep descriptions short and professional.`;
}

export function normalizeRouteEvents(events: GeneratedRouteEvent[]) {
  return events
    .filter((event) => event.status?.trim())
    .slice(0, 8)
    .map((event) => ({
      status: event.status.trim(),
      location: event.location?.trim() || "",
      description: event.description?.trim() || "",
      event_time: Number.isNaN(Date.parse(event.event_time || event.timestamp || ""))
        ? new Date().toISOString()
        : new Date(event.event_time || event.timestamp || "").toISOString(),
    }));
}

export function parseRouteEventsFallback(text: string) {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return null;
    return normalizeRouteEvents(parsed as GeneratedRouteEvent[]);
  } catch {
    return null;
  }
}
