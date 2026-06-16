const TRAVELER_PROFILES = {
  budget: {
    label: 'Budget Traveler',
    accommodation: 'hostels, cheap guesthouses, or budget hotels (shared/private dorms, $15–50/night)',
    food: 'street food, supermarkets, cheap local eateries ($15–25/day)',
    transport: 'public transport, buses, metro ($5–10/day)',
    activities: 'free attractions, parks, museums with free entry ($5–15/day)',
    accommodation_suggestion_type: 'hostels, guesthouses, budget hotels, capsule hotels',
    dining_suggestion_type: 'street food stalls, local markets, cheap eats, bakeries, food courts',
    transport_suggestion_type: 'city bus, metro/subway, bike hire, walking, budget ride-share',
  },
  'mid-range': {
    label: 'Mid-range Traveler',
    accommodation: '3–4 star hotels or nice Airbnbs ($80–180/night)',
    food: 'casual restaurants, cafes, occasional nicer dinner ($40–70/day)',
    transport: 'mix of public transport and occasional taxis ($15–25/day)',
    activities: 'paid attractions, day trips, guided tours ($30–60/day)',
    accommodation_suggestion_type: '3–4 star hotels, boutique hotels, quality Airbnbs in central areas',
    dining_suggestion_type: 'local restaurants, wine bars, tapas/bistros, popular cafes, brunch spots',
    transport_suggestion_type: 'metro + occasional taxi, day passes, airport shuttle, Uber/Bolt',
  },
  luxury: {
    label: 'Luxury Traveler',
    accommodation: '5-star hotels, boutique hotels, suites ($250–600+/night)',
    food: 'upscale restaurants, fine dining, rooftop bars ($120–200+/day)',
    transport: 'taxis, Uber, private transfers, car hire ($40–80/day)',
    activities: 'premium experiences, skip-the-line tours, private guides ($80–150+/day)',
    accommodation_suggestion_type: '5-star hotels, design hotels, luxury resorts, private villas',
    dining_suggestion_type: 'Michelin-starred restaurants, rooftop bars, fine dining, chef\'s table experiences',
    transport_suggestion_type: 'private airport transfer, chauffeur service, luxury car hire, first-class train',
  },
};

export const buildExtractorPrompt = (segments, travelerType = 'mid-range') => {
  const profile = TRAVELER_PROFILES[travelerType] || TRAVELER_PROFILES['mid-range'];

  // Build a Claude content-block array from mixed text/image/pdf segments
  const contentBlocks = [];
  segments.forEach((seg, i) => {
    // Legacy: plain string segments
    if (typeof seg === 'string') {
      contentBlocks.push({ type: 'text', text: `--- DOCUMENT ${i + 1} ---\n${seg.trim()}` });
      return;
    }
    const label = `--- DOCUMENT ${i + 1}${seg.name ? ` (${seg.name})` : ''} ---`;
    if (seg.type === 'text') {
      contentBlocks.push({ type: 'text', text: `${label}\n${seg.content.trim()}` });
    } else if (seg.type === 'image') {
      contentBlocks.push({ type: 'text', text: label });
      contentBlocks.push({ type: 'image', source: { type: 'base64', media_type: seg.mediaType, data: seg.data } });
    } else if (seg.type === 'pdf') {
      contentBlocks.push({ type: 'text', text: label });
      contentBlocks.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: seg.data } });
    }
  });

  const userContent = [
    { type: 'text', text: 'Parse the following travel documents and extract all booking information:' },
    ...contentBlocks,
  ];

  return {
    system: `You are a precise travel document parser. Your job is to extract structured travel information from raw booking confirmation emails, hotel confirmations, and train/flight tickets. You also provide curated local recommendations for each destination.

Extract ALL travel events and ALL passengers and return ONLY valid JSON matching the exact schema below. Be thorough — extract every booking detail you can find.

TRAVELER PROFILE: ${profile.label}
Use this profile when estimating daily budgets AND when generating suggestions. Calibrate ALL cost estimates and recommendations to this traveler style:
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
- PASSENGER NAMES: strip all honorifics and titles. Remove "Mr", "Mrs", "Ms", "Miss", "Dr", "Prof" and any similar prefix. Return only the full given name + surname (e.g. "Alex Morgan" not "Mr Alex Morgan").
- If origin city cannot be determined, set "from" to "Unknown".
- All amounts should be in USD equivalent. If the original currency is different, note it in notes.
- trip_summary.total_cost_extracted_usd should sum only EXPLICITLY mentioned prices in the documents.
- PRICE ACCURACY: When a document shows both a line-item breakdown and a grand total, verify the total equals the sum of line items. If they disagree, use the sum of the line items as the correct price — not the printed total. Set price.amount to this verified number. The price you write in the notes field and the price you set in price.amount MUST be identical — if you mention a corrected price in notes, that same corrected price must appear in price.amount. Contradictions between price.amount and notes are a critical error.

BUDGET ESTIMATION RULES (read carefully — these are strict):
- Budget estimates are PER PERSON PER DAY. estimated_daily_budget_usd is the daily cost for ONE traveler.
- total_estimated_stay_usd = estimated_daily_budget_usd × nights (per person; the frontend multiplies by traveler count).
- ACCOMMODATION FLOOR: If the documents contain a confirmed hotel booking, derive the per-person-per-night cost: (hotel_total_price / number_of_passengers / nights). The accommodation component in budget_breakdown MUST be at least this value. Never estimate lower than what the traveler already paid.
- TOTAL FLOOR: estimated_daily_budget_usd = accommodation + food + transport + activities. It must always be GREATER than the accommodation component alone, because the traveler still needs to eat, get around, and do things each day.
- total_estimated_stay_usd per person must NEVER be less than (confirmed hotel total / number of passengers). The estimated total must account for the confirmed accommodation plus estimated food, transport, and activities on top.
- If meals are included in the hotel price (e.g. breakfast), reduce the food estimate slightly but still include lunch/dinner costs.

SUGGESTIONS RULES:
- For each destination, generate exactly 3 accommodation options, 4 dining options, and 3 transport options.
- Suggestions MUST match the traveler profile: ${profile.label}
- Accommodation should be ${profile.accommodation_suggestion_type}
- Dining should be ${profile.dining_suggestion_type}
- Transport should be ${profile.transport_suggestion_type}
- Use real, well-known places/areas where possible. Be specific — name real neighborhoods, real restaurant names, real transport lines.
- price_per_night_usd and price_per_person_usd must be numeric USD values (no strings).
- Keep "tip" fields to one practical sentence each.
- The "area" field should be a specific neighborhood or district name.

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
      "name": "Full passenger name WITHOUT honorifics (no Mr/Mrs/Ms/Dr etc)",
      "addons": ["e.g. Priority & 2 Cabin Bags", "20kg hold bag"]
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
  "suggestions": [
    {
      "city": "Must match a city in destinations[]",
      "accommodation": [
        {
          "name": "Hotel/hostel name or area description",
          "type": "Hostel|Guesthouse|Budget Hotel|Boutique Hotel|4-star Hotel|5-star Hotel|Luxury Resort|Villa",
          "area": "Specific neighborhood or district",
          "price_per_night_usd": 0,
          "tip": "One practical booking or location tip",
          "search_platforms": ["Booking.com", "Airbnb"]
        }
      ],
      "dining": [
        {
          "name": "Restaurant or venue name",
          "type": "Street food|Cafe|Casual dining|Restaurant|Fine dining|Rooftop bar",
          "cuisine": "Type of cuisine or food",
          "area": "Neighborhood where it is located",
          "price_per_person_usd": 0,
          "must_try": "Specific dish, drink, or experience to try",
          "tip": "One practical tip (best time to go, reservation needed, etc)"
        }
      ],
      "transport": [
        {
          "mode": "Metro|Bus|Tram|Taxi|Uber|Bolt|Bike hire|Walk|Ferry|Train|Private transfer",
          "description": "How this transport option works in this city",
          "cost_usd": 0,
          "cost_unit": "per ride|day pass|per journey|per person|per trip",
          "tip": "One practical tip for using this option"
        }
      ]
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
    userContent,
  };
};
