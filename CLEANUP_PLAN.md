# Component & Hook Cleanup Plan

## Executive Summary

This plan identifies and categorizes unused UI components and hooks in the intel-dashboard codebase, with recommendations for retention or removal. The analysis found **7 orphaned components** (44%) and **5 orphaned hooks** (83%) representing approximately 1,000+ lines of unused code.

---

## 1. Component Inventory & Classification

### ACTIVE Components (Keep)

| Component | Path | Used By | Status |
|-----------|------|---------|--------|
| Dashboard | `src/components/Dashboard.tsx` | App.tsx (lazy) | **RETAIN** |
| LandingPage | `src/components/LandingPage.tsx` | App.tsx | **RETAIN** |
| PoliticalDonorTracker | `src/components/PoliticalDonorTracker.tsx` | App.tsx (lazy) | **RETAIN** |
| ErrorBoundary | `src/components/ErrorBoundary.tsx` | main.tsx | **RETAIN** |
| Login | `src/components/Auth/Login.tsx` | AuthModal.tsx | **RETAIN** (if Auth kept) |
| Register | `src/components/Auth/Register.tsx` | AuthModal.tsx | **RETAIN** (if Auth kept) |
| RumbleWidget | `src/components/ui/RumbleWidget.tsx` | MediaView.tsx | **RETAIN** (if Media kept) |
| TwitterWidget | `src/components/ui/TwitterWidget.tsx` | MediaView.tsx | **RETAIN** (if Media kept) |
| MediaSettingsPanel | `src/components/ui/MediaSettingsPanel.tsx` | MediaView.tsx | **RETAIN** (if Media kept) |

### ORPHANED Components (Review for Removal)

| Component | Path | Lines | Recommendation |
|-----------|------|-------|----------------|
| LoadingState | `src/components/LoadingState.tsx` | ~50 | **REMOVE** - Skeleton loaders never integrated |
| AuthModal | `src/components/Auth/AuthModal.tsx` | ~60 | **DEFER** - Part of Auth feature, may be needed |
| SearchBar | `src/components/ui/SearchBar.tsx` | ~70 | **REMOVE** - Search feature abandoned |
| FilterPanel | `src/components/ui/FilterPanel.tsx` | ~280 | **REMOVE** - Filter feature abandoned |
| TrendingWidget | `src/components/ui/TrendingWidget.tsx` | ~85 | **REMOVE** - Analytics feature abandoned |
| TopicHeatmap | `src/components/ui/TopicHeatmap.tsx` | ~106 | **REMOVE** - Analytics feature abandoned |
| MediaView | `src/components/views/MediaView.tsx` | ~65 | **DEFER** - Contains working widgets, potential future tab |

---

## 2. Hook Inventory & Classification

### ACTIVE Hooks (Keep)

| Hook | Path | Used By | Status |
|------|------|---------|--------|
| useLocalStorage | `src/hooks/useLocalStorage.ts` | useSearch.ts | **RETAIN** - Utility hook |

### ORPHANED Hooks (Review for Removal)

| Hook | Path | Lines | Dependencies | Recommendation |
|------|------|-------|--------------|----------------|
| useFeed | `src/hooks/useFeed.ts` | ~166 | FeedItem type, validators, cache | **REMOVE** - feedService used instead |
| useTrending | `src/hooks/useTrending.ts` | ~62 | analytics utils | **REMOVE** - Analytics feature abandoned |
| useSearch | `src/hooks/useSearch.ts` | ~138 | useLocalStorage, types | **REMOVE** - Search feature abandoned |
| useBookmarks | `src/hooks/useBookmarks.ts` | ~99 | useAuth context | **REMOVE** - Bookmark feature never implemented |
| useReadingHistory | `src/hooks/useReadingHistory.ts` | ~96 | useAuth context | **REMOVE** - History feature never implemented |

---

## 3. Dependency Analysis

### Component Dependency Tree

```
App.tsx (entry)
├── LandingPage.tsx ─────────────────────── [ACTIVE - no deps]
├── Dashboard.tsx ───────────────────────── [ACTIVE]
│   └── Uses: feedService, config/sources, AuthContext
├── PoliticalDonorTracker.tsx ───────────── [ACTIVE]
│   └── Uses: feedService, config/politicalFinanceSources
└── ErrorBoundary.tsx ───────────────────── [ACTIVE - no deps]

AuthModal.tsx ───────────────────────────── [ORPHANED - potential feature]
├── Login.tsx ─────────────────────────────── [Dependent on AuthModal]
└── Register.tsx ──────────────────────────── [Dependent on AuthModal]

MediaView.tsx ───────────────────────────── [ORPHANED - potential feature]
├── RumbleWidget.tsx ──────────────────────── [Dependent on MediaView]
├── TwitterWidget.tsx ─────────────────────── [Dependent on MediaView]
└── MediaSettingsPanel.tsx ────────────────── [Dependent on MediaView]

Standalone Orphans (no dependencies):
├── LoadingState.tsx
├── SearchBar.tsx
├── FilterPanel.tsx
├── TrendingWidget.tsx
└── TopicHeatmap.tsx
```

### Hook Dependency Tree

```
useLocalStorage.ts ──────────────────────── [ACTIVE - utility]
└── Used by: useSearch.ts

useFeed.ts ──────────────────────────────── [ORPHANED]
└── Uses: types, validators, cache utils

useTrending.ts ──────────────────────────── [ORPHANED]
└── Uses: analytics utils

useSearch.ts ────────────────────────────── [ORPHANED]
└── Uses: useLocalStorage, types

useBookmarks.ts ─────────────────────────── [ORPHANED]
└── Uses: useAuth context

useReadingHistory.ts ────────────────────── [ORPHANED]
└── Uses: useAuth context
```

---

## 4. Cleanup Recommendations

### Phase 1: Safe Removal (No Risk)
**These files have no dependents and can be safely deleted:**

1. `src/components/LoadingState.tsx` - Standalone, unused skeleton components
2. `src/components/ui/SearchBar.tsx` - Standalone, unused search input
3. `src/components/ui/FilterPanel.tsx` - Standalone, unused filter UI
4. `src/components/ui/TrendingWidget.tsx` - Standalone, unused trending display
5. `src/components/ui/TopicHeatmap.tsx` - Standalone, unused heatmap
6. `src/hooks/useFeed.ts` - Replaced by feedService
7. `src/hooks/useTrending.ts` - Analytics feature abandoned
8. `src/hooks/useSearch.ts` - Search feature abandoned
9. `src/hooks/useBookmarks.ts` - Bookmark feature never built
10. `src/hooks/useReadingHistory.ts` - History feature never built

### Phase 2: Feature Clusters (Requires Decision)

#### Auth Feature Cluster
**Files:** AuthModal.tsx, Login.tsx, Register.tsx
**Decision needed:** Is authentication being implemented?
- If YES: Keep all 3 files
- If NO: Remove all 3 files (AuthModal + its children)

#### Media Feature Cluster
**Files:** MediaView.tsx, RumbleWidget.tsx, TwitterWidget.tsx, MediaSettingsPanel.tsx
**Decision needed:** Is the Media tab being implemented?
- If YES: Keep all 4 files, integrate MediaView into App.tsx
- If NO: Remove all 4 files

### Phase 3: Utility Cleanup

#### useLocalStorage Hook
**Status:** Currently only used by useSearch.ts (which is orphaned)
**Decision:**
- If useSearch is removed, useLocalStorage has no consumers
- However, useLocalStorage is a useful utility hook
- **Recommendation:** RETAIN for potential future use

---

## 5. Implementation Steps

### Step 1: Verify Build Passes
```bash
npm run build
npm run lint
```

### Step 2: Remove Phase 1 Files
```bash
# Components
rm src/components/LoadingState.tsx
rm src/components/ui/SearchBar.tsx
rm src/components/ui/FilterPanel.tsx
rm src/components/ui/TrendingWidget.tsx
rm src/components/ui/TopicHeatmap.tsx

# Hooks
rm src/hooks/useFeed.ts
rm src/hooks/useTrending.ts
rm src/hooks/useSearch.ts
rm src/hooks/useBookmarks.ts
rm src/hooks/useReadingHistory.ts
```

### Step 3: Verify Build Still Passes
```bash
npm run build
npm run lint
```

### Step 4: Decide on Feature Clusters
Make decisions on Auth and Media feature clusters based on product roadmap.

### Step 5: Update Documentation
Update CLAUDE.md to reflect the simplified file structure after cleanup.

---

## 6. Risk Assessment

### Low Risk (Phase 1 Removals)
- LoadingState.tsx - No imports, no references
- SearchBar.tsx - No imports, no references
- FilterPanel.tsx - No imports, no references
- TrendingWidget.tsx - No imports, no references
- TopicHeatmap.tsx - No imports, no references
- All 5 orphaned hooks - No imports in any component

### Medium Risk (Feature Clusters)
- Auth components - May be needed for future auth feature
- Media components - Contains working social widgets

### Mitigation
- All files are in git, easily recoverable
- Run build + lint after each deletion batch
- Test application manually in browser

---

## 7. Files Summary

### Safe to Remove (10 files, ~1,000 lines)
```
src/components/LoadingState.tsx
src/components/ui/SearchBar.tsx
src/components/ui/FilterPanel.tsx
src/components/ui/TrendingWidget.tsx
src/components/ui/TopicHeatmap.tsx
src/hooks/useFeed.ts
src/hooks/useTrending.ts
src/hooks/useSearch.ts
src/hooks/useBookmarks.ts
src/hooks/useReadingHistory.ts
```

### Requires Decision (7 files)
```
# Auth Cluster (3 files)
src/components/Auth/AuthModal.tsx
src/components/Auth/Login.tsx
src/components/Auth/Register.tsx

# Media Cluster (4 files)
src/components/views/MediaView.tsx
src/components/ui/RumbleWidget.tsx
src/components/ui/TwitterWidget.tsx
src/components/ui/MediaSettingsPanel.tsx
```

### Retain (6 files)
```
src/components/Dashboard.tsx
src/components/LandingPage.tsx
src/components/PoliticalDonorTracker.tsx
src/components/ErrorBoundary.tsx
src/hooks/useLocalStorage.ts
src/App.tsx
```

---

## 8. Post-Cleanup File Structure

After Phase 1 cleanup, the structure will be:

```
src/
├── components/
│   ├── Auth/              # (pending decision)
│   │   ├── AuthModal.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── ui/                # (pending decision)
│   │   ├── RumbleWidget.tsx
│   │   ├── TwitterWidget.tsx
│   │   └── MediaSettingsPanel.tsx
│   ├── views/             # (pending decision)
│   │   └── MediaView.tsx
│   ├── Dashboard.tsx
│   ├── ErrorBoundary.tsx
│   ├── LandingPage.tsx
│   └── PoliticalDonorTracker.tsx
├── hooks/
│   └── useLocalStorage.ts
├── App.tsx
└── main.tsx
```

---

## 9. Next Steps

1. **Review this plan** and confirm the recommendations
2. **Decide on feature clusters** (Auth and Media)
3. **Execute Phase 1 removal** of clearly orphaned files
4. **Verify build and functionality**
5. **Update CLAUDE.md** documentation
6. **Commit changes** with clear message

---

## 10. Lint Analysis (Build Validation)

**Build status:** PASSING
**Lint status:** 14 errors, 1 warning

### Lint Issues in Orphaned Files (Support for Removal)

| File | Error | Impact |
|------|-------|--------|
| `useBookmarks.ts` | setState in effect | Cascading render issue |
| `useReadingHistory.ts` | setState in effect | Cascading render issue |
| `useSearch.ts` | Impure function (Date.now) | Render instability |
| `useTrending.ts` | setState in effect | Cascading render issue |

**Finding:** 4 of 5 orphaned hooks have lint errors. Removing these files will eliminate 4 lint errors immediately.

### Lint Issues in Active Files (Separate Fix)

| File | Error | Fix Required |
|------|-------|--------------|
| `App.tsx:30` | setState in effect | Refactor localStorage init |
| `AuthContext.tsx:47` | setState in effect | Refactor user restoration |
| `AuthContext.tsx:131` | Unused `_` variable | Remove or rename |
| `AuthContext.tsx:25` | Fast refresh warning | Split exports |
| `Dashboard.tsx:289` | Missing useEffect dep | Add fetchLiveFeed dep |
| `feedCache.ts:10` | Explicit any | Add proper type |
| `performance.ts` | Multiple explicit any | Add proper types (4 issues) |

**Recommendation:** Fix active file lint issues as a separate task after cleanup.

---

*Plan generated: 2025-12-13*
*Codebase analyzed: intel-dashboard*
