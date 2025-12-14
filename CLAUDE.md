# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Intel Dashboard is a React/TypeScript news aggregation dashboard that displays live RSS feeds from various political news sources. It features a "Global Intelligence Grid" UI with real-time feed status monitoring, category filtering, search, bookmarks, reading history, and data visualization.

## Commands

```bash
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

### Perspective System
The app routes users through a perspective selection (`LandingPage.tsx` → `Dashboard.tsx`):
- **Views**: `'landing' | 'right' | 'left' | 'political-tracker'`
- Sources loaded from `rightWingSources.ts` or `leftWingSources.ts` based on selection
- Perspective persisted to localStorage (`selected_perspective`)
- Dashboard component receives perspective as prop and loads corresponding sources

### Dashboard Tabs
1. **Intel Grid** - Source directory with category filtering
2. **Live Wire** - Real-time feed with search, bookmarks, and reading history
3. **Synthesis** - Analytics charts (volume over time, topic distribution)
4. **Media** - Rumble and Twitter widget embeds with settings

### RSS Feed Integration (Multi-Proxy System)
`feedService.ts` is a singleton that fetches feeds using round-robin proxy distribution with automatic fallback:

**Proxies (in fallback order):**
1. `rss2json` - `api.rss2json.com/v1/api.json?rss_url=...` (JSON response)
2. `allorigins` - `api.allorigins.win/raw?url=...` (raw XML, parsed client-side)
3. `corsproxy` - `corsproxy.io/?...` (raw XML, parsed client-side)

**Key behaviors:**
- Round-robin distribution with failure awareness (skips proxies with 3+ recent failures)
- Per-feed caching with 15-minute TTL
- Request deduplication via in-flight promise cache
- AbortController timeout (10s)
- URL/date validation to prevent XSS and sort crashes

### Data Flow
1. `feedService.fetchFeeds(sources)` called on mount and refresh
2. Parallel fetch to all feeds with request deduplication
3. Automatic fallback to next proxy on failure
4. Response validation: HTTP status, RSS status, date parsing, URL validation
5. Items sorted by `rawDate` (newest first)
6. `useTrending` computes analytics from feed data
7. `useSearch` filters feed based on user criteria

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
Categories defined in `SOURCE_CATEGORIES` (in `categories.ts`) with icons, labels, and colors. Used for filtering in Intel Grid view.

## Known Considerations

### External API Dependencies
Free-tier CORS proxies may have rate limits. The multi-proxy fallback system (`feedService.ts`) mitigates this by distributing load across providers. The 15-minute cache TTL further reduces API calls.

### Caching Strategy
- **Feed cache**: In-memory via `feedCache.ts` with 15-minute TTL
- **User data**: localStorage (bookmarks, reading history, filter presets, perspective)

### Error Handling
Feed errors tracked per-source and displayed in collapsible alert. Health indicator: green (all ok), orange (partial), red (all failed).

### Mobile Optimization
- Mobile-first responsive design (sm:/md:/lg: breakpoints)
- 44px minimum tap targets
- Touch feedback states (active:scale-95)
- Responsive chart heights (h-48 sm:h-64)

### Lint Considerations
Some lint warnings exist for setState in effects (localStorage sync patterns). These are functionally correct but flagged by React 19 lint rules.
