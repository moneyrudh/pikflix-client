# PikFlix

Natural language movie and TV show discovery. Describe what you want to watch, get personalized recommendations.

## Stack

- **Next.js 15** / React 19 / TypeScript
- **Tailwind CSS** with 3 themes (Light, Maroon, Dark)
- Streaming NDJSON from backend — content renders as it arrives
- Deployed on **Vercel**

## Features

- **Natural language search** — no filters, just describe what you want
- **Movies, Shows, or Both** — content type toggle in search bar
- **Streaming results** — recommendations appear one by one as Claude generates them
- **Details panel** — slide-in panel with full metadata, genres, providers
- **Watch providers** — where to stream, rent, or buy (powered by JustWatch/TMDB)
- **Session history** — multiple follow-up queries in one session

## Setup

```bash
npm install

# Create .env.local
BACKEND_API_URL=http://localhost:8000

npm run dev
```

Requires the [pikflix-api](https://github.com/yourusername/pikflix-api) backend running.

## Project Structure

```
pikflix/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Main page — search, streaming, session history
│   │   ├── layout.tsx                   # Root layout with theme provider
│   │   ├── globals.css                  # CSS variables, theme definitions
│   │   └── api/
│   │       ├── recommendations/route.ts # Proxy to backend (Edge Runtime)
│   │       └── providers/route.ts       # Proxy to backend
│   ├── components/
│   │   ├── ContentCard.tsx              # Poster card with rating, year, content type
│   │   ├── ContentDetailsPanel.tsx      # Slide-in details panel
│   │   ├── ContentCardSkeleton.tsx      # Loading placeholders
│   │   ├── ContentPlaceholder.tsx       # Fallback when no poster
│   │   ├── SearchResults.tsx            # Responsive content grid
│   │   ├── ProvidersSection.tsx         # Stream/rent/buy providers
│   │   ├── PageLayout.tsx               # Layout wrapper
│   │   ├── ThemeSelector.tsx            # Theme toggle
│   │   └── Spinner.tsx                  # Loading indicator
│   ├── lib/
│   │   └── ThemeContext.tsx              # Theme state + localStorage
│   └── types/
│       └── content.ts                   # Types (Movie, Show, Content) and enums
├── middleware.ts                         # Rate limiting (20 req/min per IP)
└── .env.local                           # Environment variables (not in git)
```

## License

MIT
