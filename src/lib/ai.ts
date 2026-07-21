import { createServerFn } from "@tanstack/react-start";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { buildRouteEventsPrompt, normalizeRouteEvents, parseRouteEventsFallback } from "./route-events.server";

const RouteEventsInput = z.object({
  origin: z.string(),
  destination: z.string(),
  serviceType: z.string(),
});

const RouteEventsOutput = z.object({
  error: z.string().nullable(),
  events: z.array(
    z.object({
      status: z.string(),
      location: z.string(),
      description: z.string(),
      event_time: z.string(),
    }),
  ),
});

export const generateRouteEvents = createServerFn({ method: "POST" })
  .inputValidator((input) => RouteEventsInput.parse(input))
  .handler(async ({ data }) => {
    const { origin, destination, serviceType } = data;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("AI is not configured yet. Please try again after the app finishes updating.");
    }

    const gateway = createLovableAiGatewayProvider(apiKey);
    const prompt = buildRouteEventsPrompt(origin, destination, serviceType);

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3.5-flash"),
        output: Output.object({ schema: RouteEventsOutput }),
        prompt: `${prompt}\n\nReturn an object with an error field set to null for success and an events array.`,
      });

      if (output.error) {
        throw new Error(output.error);
      }

      return normalizeRouteEvents(output.events);
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        const fallback = parseRouteEventsFallback(error.text);
        if (fallback?.length) return fallback;
      }

      console.error("AI route generation failed:", error);
      throw new Error("AI failed to generate a route. Please try again in a moment.");
    }
  });
