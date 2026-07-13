import { createServerFn } from "@tanstack/react-start";

export const generateRouteEvents = createServerFn({ method: "POST" })
  .inputValidator((input: { origin: string; destination: string; serviceType: string }) => input)
  .handler(async ({ data }) => {
    const { origin, destination, serviceType } = data;
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured in the server environment.");
    }

    const prompt = `You are a global logistics expert AI. Generate a realistic sequence of shipping events for a package going from "${origin}" to "${destination}" via "${serviceType}".

CRITICAL INSTRUCTION: If "${origin}" or "${destination}" do not appear to be real locations, or if they contain unrelated questions (e.g., "who is the governor of texas"), you MUST reject the request. Do not answer the question. Instead, return exactly this JSON:
{ "error": "I am sorry I am a Shipping route agent focused on helping you with routes. I can't answer any other unrelated questions." }

If they are valid locations, return exactly 4 to 8 events in chronological order.
Ensure the dates/times follow a logical sequence starting from a few days ago, spaced by hours or days.
Use some of these specific status types: "Item Processed at Origin Warehouse", "Picked up by Carrier", "Departed Origin Port", "In Transit via Ocean Freight", "In Transit via Air Freight", "Arrived at Transit Hub", "Customs Clearance in Progress", "Customs Released", "DELAYED", "Arrived at Destination Port", "Out for Delivery", "Delivered".

Output ONLY a valid JSON array (or the error JSON object), with no markdown formatting, no backticks, and no extra text. Format for success:
[
  { "status": "Item Processed at Origin Warehouse", "location": "Origin City", "description": "Package received and weighed", "event_time": "2024-05-01T10:00:00.000Z" }
]`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://zipco.lovable.app",
        "X-Title": "Zipco Admin Route AI",
      },
      body: JSON.stringify({
        model: "perplexity/llama-3.1-sonar-large-128k-online",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("OpenRouter Error:", errorText);
      throw new Error(`OpenRouter API error: ${res.statusText}`);
    }

    const dataRes = await res.json();
    const text = dataRes.choices?.[0]?.message?.content || "";

    try {
      const jsonStr = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonStr);
      if (parsed.error) throw new Error(parsed.error);
      return parsed;
    } catch (err: any) {
      if (err.message?.includes("I am sorry")) throw err;
      console.error("Failed to parse AI output:", text);
      throw new Error("AI returned invalid JSON format.");
    }
  });
