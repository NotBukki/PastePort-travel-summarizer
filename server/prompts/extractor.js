const TRAVELER_PROFILES = {
  budget: {
    label: 'Budget Traveler',
    accommodation: 'hostels, cheap guesthouses, or budget hotels (shared/private dorms, $15–50/night)',
    food: 'street food, supermarkets, cheap local eateries ($15–25/day)',
    transport: 'public transport, buses, metro ($5–10/day)',
    activities: 'free attractions, parks, museums with free entry ($5–15/day)',
  },
  'mid-range': {
    label: 'Mid-range Traveler',
    accommodation: '3–4 star hotels or nice Airbnbs ($80–180/night)',
    food: 'casual restaurants, cafes, occasional nicer dinner ($40–70/day)',
    transport: 'mix of public transport and occasional taxis ($15–25/day)',
    activities: 'paid attractions, day trips, guided tours ($30–60/day)',
  },
  luxury: {
    label: 'Luxury Traveler',
    accommodation: '5-star hotels, boutique hotels, suites ($250–600+/night)',
    food: 'upscale restaurants, fine dining, rooftop bars ($120–200+/day)',
    transport: 'taxis, Uber, private transfers, car hire ($40–80/day)',
    activities: 'premium experiences, skip-the-line tours, private guides ($80–150+/day)',
  },
};

export const buildExtractorPrompt = (segments, travelerType = 'mid-range') => {
  const profile = TRAVELER_PROFILES[travelerType] || TRAVELER_PROFILES['mid-range'];

  const combinedText = segments
    .map((s, i) => `--- DOCUMENT ${i + 1} ---\n${s.trim()}`)
    .join('\n\n');

  return {
    system: `You are a precise travel document parser. Your job is to extract structured travel information from raw booking confirmation emails, hotel confirmations, and train/flight tickets.

Extract ALL travel events and ALL passengers and return ONLY valid JSON matching the exact schema below. Be thorough — extract every booking detail you can find.

TRAVELER PROFILE: ${profile.label}
Use this profile when estimating daily budgets. Calibrate ALL cost estimates to this traveler style:
- Accommodation: ${profile.accommodation}
- Food & drink: ${profile.food}
- Local transport: ${profile.transport}
- Activities & sightseeing: ${profile.activities}

RULES:
- Dates must be ISO 8601 format (YYYY-MM-DDTHH:MM:SS). If no time is given, use T00:00:00.
- If a price is not mentioned, set amount to 0.
- For hotels, "departure" is check-in datetime and "arrival" is check-out datetime.
- Nights for a hotel = check-out date - check-in date. For flights with no hotel, estimate nights from total itinerary.
- Extract ALL passengers listed in the documents, including all names and their individual add-ons/extras.
- For destinations, provide estimated_daily_budget_usd based on the traveler profile above. This must be a DAILY figure, not total.
- total_estimated_stay_usd = estimated_daily_budget_usd × nights (compute this yourself).
- If origin city cannot be determined, set "from" to "Unknown".
- All amounts should be in USD equivalent. If the original currency is different, note it in notes.
- trip_summary.total_cost_extracted_usd should sum only EXPLICITLY mentioned prices in the documents.

RESPONSE SCHEMA (return ONLY this JSON, no markdown, no explanation):
{
  "events": [
    {
      "type": "flight|hotel|train|car|ferry|bus|other",
      "title": "Short descriptive title",
      "from": "Origin city or airport",
      "to": "Destination city or airport",
      "departure": "ISO datetime",
      "arrival": "ISO datetime",
      "confirmation": "Booking/confirmation code if found",
      "carrier": "Airline, hotel name, train operator, etc",
      "seat": "Seat/room number if found",
      "price": { "amount": 0, "currency": "USD" },
      "notes": "Any extra details (meal class, baggage, loyalty number, add-ons per passenger, etc)"
    }
  ],
  "passengers": [
    {
      "name": "Full passenger name",
      "addons": ["e.g. Priority & 2 Cabin Bags", "20kg hold bag", etc.]
    }
  ],
  "destinations": [
    {
      "city": "City name",
      "country": "Country name",
      "nights": 0,
      "arrival_date": "YYYY-MM-DD",
      "departure_date": "YYYY-MM-DD",
      "estimated_daily_budget_usd": 0,
      "total_estimated_stay_usd": 0,
      "budget_breakdown": {
        "accommodation": 0,
        "food": 0,
        "transport": 0,
        "activities": 0
      },
      "budget_notes": "One sentence explaining the daily estimate based on the traveler profile"
    }
  ],
  "trip_summary": {
    "total_days": 0,
    "total_cost_extracted_usd": 0,
    "total_estimated_budget_usd": 0,
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "traveler_name": "Primary passenger name if found, else null",
    "trip_title": "Creative short trip title based on destinations"
  }
}`,
    user: `Parse the following travel documents and extract all booking information:\n\n${combinedText}`,
  };
};
