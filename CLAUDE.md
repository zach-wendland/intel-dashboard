# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Intel Dashboard is a React/TypeScript news aggregation dashboard that displays live RSS feeds from various political news sources. It features a "Global Intelligence Grid" UI with real-time feed status monitoring, category filtering, search, bookmarks, reading history, and data visualization.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server (default: http://localhost:5173)
npm run build        # TypeScript check + Vite production build
npm run lint         # Run ESLint on TypeScript/TSX files
npm run preview      # Preview production build locally
```

## Architecture

### Tech Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

### Key File Structure
```
src/
├── types/index.ts           # All TypeScript interfaces
├── config/
│   ├── feeds.ts             # LIVE_FEEDS array, RSS_API_BASE, FEED_CONFIG
│   ├── sources.ts           # SOURCES array (55 sources)
│   ├── rightWingSources.ts  # Right-wing perspective sources
│   ├── leftWingSources.ts   # Left-wing perspective sources
│   └── categories.ts        # SOURCE_CATEGORIES with lucide icons
├── hooks/
│   ├── useLocalStorage.ts   # Generic localStorage persistence
│   ├── useTrending.ts       # Topic analytics computation (memoized)
│   ├── useSearch.ts         # Search + filters + presets
│   ├── useBookmarks.ts      # Article bookmark management
│   └── useReadingHistory.ts # Track read articles
├── services/
│   ├── feedService.ts       # RSS feed fetching with caching (singleton)
│   └── feedCache.ts         # In-memory cache for feed data
├── utils/
│   ├── validators.ts        # URL/date validation, sanitization
│   ├── analytics.ts         # Topic extraction, trending computation
│   ├── security.ts          # Input sanitization
│   └── cache.ts             # localStorage cache helpers
├── contexts/
│   └── AuthContext.tsx      # Authentication context and provider
├── components/
│   ├── Dashboard.tsx        # Main unified dashboard component
│   ├── LandingPage.tsx      # Perspective selection page
│   ├── PoliticalDonorTracker.tsx  # Political finance tracking
│   ├── ErrorBoundary.tsx    # Error boundary wrapper
│   ├── LoadingState.tsx     # Skeleton loading components
│   ├── Auth/
│   │   ├── AuthModal.tsx    # Authentication modal
│   │   ├── Login.tsx        # Login form
│   │   └── Register.tsx     # Registration form
│   ├── ui/
│   │   ├── SearchBar.tsx    # Debounced search input
│   │   ├── FilterPanel.tsx  # Expandable filters + presets
│   │   ├── TrendingWidget.tsx   # Trending topics display
│   │   ├── TopicHeatmap.tsx     # Source-topic matrix heatmap
│   │   ├── RumbleWidget.tsx     # Rumble video embeds
│   │   ├── TwitterWidget.tsx    # Twitter/X embeds
│   │   └── MediaSettingsPanel.tsx  # Media configuration
│   └── views/
│       └── MediaView.tsx    # Media tab combining widgets
├── App.tsx                  # Main app with perspective routing
└── main.tsx                 # React entry point
```

### Dashboard Features (4 Tabs)
1. **Intel Grid** - Source directory with category filtering
2. **Live Wire** - Real-time feed with search, bookmarks, and reading history
3. **Synthesis** - Analytics charts (volume over time, topic distribution)
4. **Media** - Rumble and Twitter widget embeds with settings

### Modular Hooks
- **useSearch**: Filters feed by query, topic, category, date range, velocity threshold. Supports filter presets.
- **useTrending**: Computes trending topics, hourly aggregates, and source-topic matrix from feed data using memoization.
- **useBookmarks**: Save/remove bookmarks with localStorage persistence per user.
- **useReadingHistory**: Track read articles with visual indicators.
- **useLocalStorage**: Generic hook for localStorage state persistence.

### RSS Feed Integration
Feeds are fetched via `feedService` singleton from `https://api.rss2json.com/v1/api.json?rss_url=...` with:
- AbortController timeout (10s)
- Per-feed status tracking (`ok`, `error`, `loading`)
- URL validation to prevent XSS
- Date validation to prevent sort crashes
- Request deduplication and caching

### Data Flow
1. `feedService.fetchFeeds()` called on mount and refresh
2. Parallel fetch to all feeds with request deduplication
3. Response validation: HTTP status, RSS status, date parsing, URL validation
4. Items sorted by `rawDate` (newest first)
5. `useTrending` computes analytics from feed data
6. `useSearch` filters feed based on user criteria
7. Feed status and error messages stored in state for UI display

## Configuration

### Adding New RSS Feeds
Add entries to perspective config files (`rightWingSources.ts` or `leftWingSources.ts`):
```typescript
{
  id: 'unique-id',
  name: 'Display Name',
  url: 'https://example.com/feed/',
  category: 'INTELLECTUALS' | 'BROADCAST' | 'RADICALS' | 'LIBERTARIANS' | 'THEOLOGIANS' | 'INFRASTRUCTURE',
  topic_map: 'Topic Label'
}
```

### Source Categories
Categories defined in `SOURCE_CATEGORIES` with icons, labels, and colors. Used for filtering in Intel Grid view and displaying feed items in Live Wire view.

## Known Considerations

### External API Dependency
The app relies on rss2json.com as a CORS proxy. This free tier may have rate limits (~100 requests/day). Client-side caching via `feedService` helps reduce API calls.

### Analytics & Trending
- Topic extraction via keyword matching in `src/utils/analytics.ts`
- Trending computed from feed data using `useTrending` hook (memoized)
- Hourly aggregates for chart visualization
- Source-topic matrix for heatmap

### Caching Strategy
- Feed cache: In-memory via `feedService` with 15-minute TTL
- User preferences: localStorage
- Bookmarks/History: localStorage per user ID
- Filter presets: localStorage

### Error Handling Pattern
Feed errors are tracked per-source and displayed in a collapsible error alert. The feed health indicator shows green (all ok), orange (partial), or red (all failed) based on `feedStatus` state.

### Mobile Optimization
- Mobile-first responsive design with sm:/md:/lg: breakpoints
- 44px minimum tap targets on all interactive elements
- Touch feedback states (active:scale-95, active:bg-*)
- External link icons visible on mobile (opacity-60), hover-only on desktop
- Responsive chart heights (h-48 sm:h-64)
- Separate mobile navigation with icon-only buttons

### Lint Considerations
Some lint warnings exist for setState in effects (for localStorage sync patterns). These are functionally correct but flagged by strict React 19 lint rules. The patterns use refs for change detection to minimize unnecessary updates.
