import { Itinerary } from '../types';

export const generateItinerary = async (
  destination: string,
  startDate: string,
  endDate: string,
  budget: number
): Promise<Itinerary> => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const prompt = `Generate a ${days}-day trip itinerary for ${destination} from ${startDate} to ${endDate} with a total budget of $${budget} USD. Return ONLY valid JSON in this exact shape, no markdown, no explanation:
{
  "destination": "string",
  "totalDays": ${days},
  "estimatedCost": number,
  "days": [
    {
      "day": number,
      "title": "string",
      "activities": [
        { "time": "string", "activity": "string", "cost": number }
      ]
    }
  ]
}`;

  const res = await fetch('/api/itinerary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 16384,
        thinkingConfig: { thinkingBudget: 1024 }
      }
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Failed to fetch from Gemini");
  }

  const text = data.candidates[0].content.parts[0].text;
  const cleanText = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleanText) as Itinerary;
};
