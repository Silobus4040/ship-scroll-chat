'use server';

export async function generateRouteEvents(origin: string, destination: string, serviceType: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured in the server environment.");
  }

  const prompt = `You are a global logistics expert AI. Generate a realistic sequence of shipping events for a package going from "${origin}" to "${destination}" via "${serviceType}".
Return exactly 4 to 8 events in chronological order.
Ensure the dates/times follow a logical sequence starting from a few days ago, spaced by hours or days.
Use some of these specific status types: "Item Processed at Origin Warehouse", "Picked up by Carrier", "Departed Origin Port", "In Transit via Ocean Freight", "In Transit via Air Freight", "Arrived at Transit Hub", "Customs Clearance in Progress", "Customs Released", "DELAYED", "Arrived at Destination Port", "Out for Delivery", "Delivered".

Output ONLY a valid JSON array, with no markdown formatting, no backticks, and no extra text. Format:
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
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("OpenRouter Error:", errorText);
    throw new Error(`OpenRouter API error: ${res.statusText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  
  try {
    const jsonStr = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Failed to parse AI output:", text);
    throw new Error("AI returned invalid JSON format.");
  }
}
