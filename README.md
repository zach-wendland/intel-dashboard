# America First Intelligence Grid

Real-time news aggregation dashboard for patriot sources. Built with React, TypeScript, and Vite.

## Features

- **Patriot Grid** - Directory of 50+ America First news sources organized by category
- **Patriot Wire** - Live RSS feed aggregation with real-time updates
- **Bookmarks** - Save articles for later reading
- **Reading History** - Track what you've read
- **Synthesis** - Analytics charts showing article volume and topic distribution
- **Media** - Rumble and Twitter widget embeds

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS
- Recharts for data visualization
- Lucide React icons

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Source Categories

- **America First Thinkers** - Paleoconservative intellectuals
- **Patriot Broadcast Network** - MAGA media outlets
- **America First Vanguard** - Dissident right / Groypers
- **Non-Interventionist Patriots** - Libertarian / Anti-war voices
- **Christian Nationalists** - Theological conservatives
- **Patriot Platforms** - Alternative tech infrastructure

## Architecture

The app auto-loads directly into the dashboard with no landing page. RSS feeds are fetched through a multi-proxy system with automatic fallback:

1. `rss2json` - Primary API
2. `allorigins` - First fallback
3. `corsproxy` - Second fallback

15-minute cache TTL reduces API load. Request deduplication prevents duplicate fetches.

## Priority Watch List

- Big Tech Censorship
- Border Invasion
- Deep State Exposure
- Globalist Agenda
- Foreign Aid / Israel
