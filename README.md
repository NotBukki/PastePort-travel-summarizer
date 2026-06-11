# ✈️ PastePort

> **Paste messy booking emails. Get an instant travel timeline + daily budget.**

PastePort is an AI-powered web app that turns raw, unstructured flight, hotel, and train confirmation emails into a clean chronological itinerary — complete with per-destination daily budget estimates tailored to your travel style.

![PastePort Screenshot](./docs/screenshot.png)

---

## Features

- **Multi-document paste** — paste multiple booking confirmations at once, each in its own labeled slot
- **AI extraction** — GPT-4o reads messy emails and pulls out flights, hotels, trains, car rentals, and more
- **Chronological timeline** — all events sorted by date with color-coded cards per booking type
- **Passenger detection** — extracts all passengers and their individual add-ons
- **Budget estimates** — per-destination daily budget + total stay cost, powered by GPT's world knowledge
- **Traveler style selector** — calibrate budgets to 🎒 Budget, ✈️ Mid-range, or 💎 Luxury travel
- **Dark glassmorphism UI** — violet/cyan gradient theme, micro-animations, responsive design

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| AI | OpenAI GPT-4o (JSON mode) |
| Styling | Vanilla CSS (glassmorphism) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/PastePort.git
cd PastePort

# Install all dependencies (root + server + client)
npm install
npm install --prefix server
npm install --prefix client
```

### Configuration

Copy the example env file and add your API key:

```bash
cp .env.example .env
```

Open `.env` and set your key:

```
OPENAI_API_KEY=sk-your-key-here
PORT=3001
```

> ⚠️ Never commit your `.env` file — it's already in `.gitignore`.

### Running Locally

```bash
npm run dev
```

This starts both servers concurrently:
- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:3001

---

## Project Structure

```
PastePort/
├── .env.example          # Environment variable template
├── package.json          # Root: runs both servers with concurrently
├── server/
│   ├── index.js          # Express server entry point
│   ├── routes/
│   │   └── parse.js      # POST /api/parse — calls OpenAI
│   └── prompts/
│       └── extractor.js  # GPT-4o system prompt + traveler profiles
└── client/
    ├── vite.config.js    # Vite config with API proxy
    └── src/
        ├── App.jsx
        ├── index.css
        ├── hooks/
        │   └── useTripParser.js
        └── components/
            ├── PasteInput.jsx     # Multi-segment paste area + traveler selector
            ├── Timeline.jsx       # Chronological event list
            ├── EventCard.jsx      # Individual booking card
            ├── BudgetPanel.jsx    # Budget estimates + donut chart
            └── LoadingOverlay.jsx
```

---

## API

### `POST /api/parse`

**Request body:**
```json
{
  "segments": ["raw booking text 1", "raw booking text 2"],
  "travelerType": "budget | mid-range | luxury"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [...],
    "passengers": [...],
    "destinations": [...],
    "trip_summary": { ... }
  }
}
```

---

## Privacy

- **No data is stored.** All text is sent directly to OpenAI and immediately discarded.
- Your API key lives only in your `.env` file and is never exposed to the browser.

---

## License

MIT — feel free to fork, extend, and deploy.
