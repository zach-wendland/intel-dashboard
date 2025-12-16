# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

America First Intelligence Grid - A React/TypeScript news aggregation and live streaming dashboard. Features real-time RSS feeds from patriot news sources, embedded video streams from 30+ content creators across Kick, Rumble, YouTube, and Twitch, bookmarks, reading history, and analytics.

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
- **Streaming**: Platform embed APIs (Kick, Rumble, YouTube, Twitch)

### App Structure
The app loads directly into `Dashboard.tsx` via lazy loading in `App.tsx`. No landing page or perspective selection - single "America First" configuration.

### Dashboard Tabs
1. **Live Streams** (`grid` tab) - Video streams from content creators with platform/category filtering
2. **Patriot Wire** (`feed` tab) - Real-time RSS feed with search, bookmarks, reading history
3. **Synthesis** (`synthesis` tab) - Analytics charts (volume over time, topic distribution)
4. **Media** (`media` tab) - Rumble and Twitter widget embeds
5. **Bookmarks** (`bookmarks` tab) - Saved articles
6. **History** (`history` tab) - Reading history

### Live Streaming System
Streamer configuration in `src/config/streamers.ts`:
- **Platforms**: Kick, Rumble, YouTube, Twitch, Cozy.tv
- **Categories**: GROYPER, MAGA_MEDIA, PODCASTERS, MANOSPHERE, COMMENTARY, GAMING
- `PLATFORM_CONFIG` provides embed URL generators per platform
- `LiveStreamsView.tsx` handles filtering and video embedding

### RSS Feed Integration (Multi-Proxy System)
`feedService.ts` fetches feeds via round-robin proxy distribution with automatic fallback:

**Proxies (in fallback order):**
1. `rss2json` - `api.rss2json.com/v1/api.json?rss_url=...` (JSON response)
2. `allorigins` - `api.allorigins.win/raw?url=...` (raw XML, parsed client-side)
3. `corsproxy` - `corsproxy.io/?...` (raw XML, parsed client-side)

**Key behaviors:**
- Round-robin with failure awareness (skips proxies with 3+ recent failures)
- Per-feed caching with 15-minute TTL
- Request deduplication via in-flight promise cache
- AbortController timeout (10s)
- URL/date validation

### Data Flow
1. `feedService.fetchFeeds(sources)` called on mount and refresh
2. Parallel fetch with request deduplication
3. Automatic proxy fallback on failure
4. `useTrending` computes analytics
5. `useSearch` filters feed based on user criteria

## Configuration

### Adding Streamers
Add entries to `src/config/streamers.ts` in the appropriate platform array:
```typescript
{
  id: 'platform-username',
  name: 'Display Name',
  platform: 'kick' | 'rumble' | 'youtube' | 'twitch' | 'cozy',
  username: 'channel_username',
  channelUrl: 'https://platform.com/username',
  description: 'Brief description',
  category: 'GROYPER' | 'MAGA_MEDIA' | 'PODCASTERS' | 'MANOSPHERE' | 'COMMENTARY' | 'GAMING',
  followers?: '1.5K',
  schedule?: 'M-F 8pm CST',
  featured?: true
}
```

### Adding RSS Feeds
Add entries to `src/config/americaFirstSources.ts`:
```typescript
{
  id: 'unique-id',
  name: 'Display Name',
  url: 'https://example.com/feed/',
  category: 'INTELLECTUALS' | 'BROADCAST' | 'RADICALS' | 'LIBERTARIANS' | 'THEOLOGIANS' | 'INFRASTRUCTURE',
  topic_map: 'Topic Label'
}
```

## Key Files

- `src/config/streamers.ts` - All streamer data (30+ creators across 4 platforms)
- `src/config/americaFirstSources.ts` - RSS feed sources
- `src/components/views/LiveStreamsView.tsx` - Video streaming UI
- `src/services/feedService.ts` - RSS proxy system with fallback
- `src/hooks/useBookmarks.ts`, `useReadingHistory.ts` - User data persistence

## Known Considerations

### External APIs
- Free-tier CORS proxies may have rate limits; multi-proxy fallback mitigates this
- Platform embeds rely on external iframe APIs

### Caching
- **Feed cache**: In-memory with 15-minute TTL
- **User data**: localStorage (bookmarks, reading history, media settings)

### Mobile Optimization
- Mobile-first responsive design (sm:/md:/lg: breakpoints)
- 44px minimum tap targets
- Touch feedback states (active:scale-95)
