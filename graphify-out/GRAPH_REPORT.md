# Graph Report - svelteforge-admin  (2026-05-09)

## Corpus Check
- 271 files · ~221,350 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 358 nodes · 276 edges · 9 communities detected
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 23|Community 23]]

## God Nodes (most connected - your core abstractions)
1. `generateId()` - 8 edges
2. `login()` - 7 edges
3. `expectHeading()` - 6 edges
4. `GET()` - 6 edges
5. `seed()` - 5 edges
6. `handle()` - 4 edges
7. `parseUserAgent()` - 4 edges
8. `addBrowserFrame()` - 3 edges
9. `SidebarState` - 3 edges
10. `hashToken()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `generateSessionToken()`  [INFERRED]
  src\routes\(auth)\login\google\callback\+server.ts → src\lib\server\auth.ts
- `createTestUser()` --calls--> `generateId()`  [INFERRED]
  src\lib\server\db\test-utils.ts → src\lib\server\id.ts
- `seedPage()` --calls--> `generateId()`  [INFERRED]
  src\routes\(app)\content\content.test.ts → src\lib\server\id.ts
- `seedNotification()` --calls--> `generateId()`  [INFERRED]
  src\routes\(app)\notifications\notifications.test.ts → src\lib\server\id.ts
- `GET()` --calls--> `generateId()`  [INFERRED]
  src\routes\(auth)\login\google\callback\+server.ts → src\lib\server\id.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (2): SidebarState, useSidebar()

### Community 1 - "Community 1"
Cohesion: 0.14
Nodes (8): seedPage(), daysAgo(), randomInt(), randomItem(), seed(), createTestUser(), seedNotification(), generateId()

### Community 3 - "Community 3"
Cohesion: 0.23
Nodes (8): GET(), createSession(), deleteSessionCookie(), generateSessionToken(), hashToken(), setSessionCookie(), validateSession(), handle()

### Community 6 - "Community 6"
Cohesion: 0.38
Nodes (2): expectHeading(), login()

### Community 16 - "Community 16"
Cohesion: 0.4
Nodes (2): load(), getEnabledProviders()

### Community 17 - "Community 17"
Cohesion: 0.7
Nodes (4): parseBrowser(), parseDevice(), parseOS(), parseUserAgent()

### Community 18 - "Community 18"
Cohesion: 0.83
Nodes (3): addBrowserFrame(), createTitleBarSvg(), main()

### Community 21 - "Community 21"
Cohesion: 0.83
Nodes (3): downloadBlob(), exportToCSV(), exportToJSON()

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (1): IsMobile

## Knowledge Gaps
- **Thin community `Community 0`** (34 nodes): `setSidebar()`, `SidebarState`, `.constructor()`, `.isMobile()`, `useSidebar()`, `child()`, `child()`, `child()`, `constants.ts`, `context.svelte.ts`, `index.ts`, `sidebar-content.svelte`, `sidebar-footer.svelte`, `sidebar-group-action.svelte`, `sidebar-group-content.svelte`, `sidebar-group-label.svelte`, `sidebar-group.svelte`, `sidebar-header.svelte`, `sidebar-input.svelte`, `sidebar-inset.svelte`, `sidebar-menu-action.svelte`, `sidebar-menu-badge.svelte`, `sidebar-menu-button.svelte`, `sidebar-menu-item.svelte`, `sidebar-menu-skeleton.svelte`, `sidebar-menu-sub-button.svelte`, `sidebar-menu-sub-item.svelte`, `sidebar-menu-sub.svelte`, `sidebar-menu.svelte`, `sidebar-provider.svelte`, `sidebar-rail.svelte`, `sidebar-separator.svelte`, `sidebar.svelte`, `sidebar-trigger.svelte`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (11 nodes): `auth.spec.ts`, `content.spec.ts`, `dashboard.spec.ts`, `error-pages.spec.ts`, `expectHeading()`, `login()`, `register()`, `helpers.ts`, `navigation.spec.ts`, `settings.spec.ts`, `users.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (5 nodes): `load()`, `getBaseUrl()`, `getEnabledProviders()`, `oauth.ts`, `+page.server.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (3 nodes): `IsMobile`, `.constructor()`, `is-mobile.svelte.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `generateId()` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `GET()` connect `Community 3` to `Community 1`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `generateId()` (e.g. with `seed()` and `createTestUser()`) actually correct?**
  _`generateId()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `GET()` (e.g. with `generateSessionToken()` and `createSession()`) actually correct?**
  _`GET()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._