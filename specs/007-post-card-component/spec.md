# Feature Specification: Post Card Component

**Feature Branch**: `007-post-card-component`
**Created**: 2026-04-05
**Status**: Draft
**Input**: User description: "Read @CHAT.md and create specification for PHASE 3 - post-card-component"

## Clarifications

### Session 2026-04-05

- Q: How should the card treat like/bookmark/comment actions for unauthenticated viewers? → A: Show actions normally; on activation, redirect guests to the sign-in page (no optimistic change, no request)
- Q: What should the avatar fallback be when an author has no avatar image? → A: Author initials on a deterministic solid background (single consistent rule, also used for deleted authors)
- Q: Which card regions beyond the action bar should be interactive? → A: Title and content preview reuse the comment-open callback; author avatar/name navigates to the author's profile page
- Q: Should the attachment indicator be interactive in Phase 3? → A: No — it is a non-interactive visual badge only; any gallery/lightbox is deferred to a later phase
- Q: How often should the relative publish time update while the card is visible? → A: Compute once on mount and leave it static for the card's lifetime (no interval)
- Q: What form is the post content stored in, and how is the two-line preview truncated? → A: Plain text only; CSS `line-clamp-2` handles truncation (newlines collapsed to spaces in the preview)
- Q: When a guest activates like/bookmark/comment, how is the sign-in redirect constructed? → A: Sign-in URL includes a return-to query param pointing to the current page so the user lands back where they were after login
- Q: How should very long titles be clamped in the card? → A: Title clamps to 1 line with ellipsis (keeps header row a fixed height)
- Q: How are the avatar fallback initials and background color derived? → A: Up to 2 initials (first letter of the first two whitespace-separated tokens of the display name, uppercased); background color chosen deterministically from a small fixed palette by hashing the display name
- Q: How should the author header link behave given the profile page does not yet exist? → A: Render as a link to `/[locale]/profile/[userId]` now; the route is delivered in a later phase and the URL shape is stable
- Q: What is the canonical URL shape used by the share action? → A: `/community/[postId]` — locale-agnostic; the recipient's browser locale decides language on load
- Q: Which HTML element should back the title/content-preview comment hotspots? → A: Native `<button>` elements (unstyled, inheriting card typography) — matches callback semantics and gives Enter + Space activation for free
- Q: How are category badge colors mapped to the four categories? → A: questions → blue, tips → green, news → amber, troubleshooting → red, using existing Tailwind/shadcn semantic palette (no new tokens)
- Q: Should the like action show a success toast on successful like/unlike? → A: No — silent on success, error toast only on failure (avoids toast spam on a high-frequency action; bookmark keeps its success toast)
- Q: What shape does the card's external prop contract take? → A: A single flattened `post` prop that already contains author, counts, and the viewer's `isLiked`/`isBookmarked` state, plus callback props (e.g., `onOpenComments`); no separate viewer prop
- Q: How does the card detect authenticated vs guest viewers at click time, given the prop contract excludes a viewer prop? → A: A new shared client hook (`useCurrentUser`) backed by the Supabase browser client; the card calls it internally. Prop contract stays unchanged.
- Q: What is the server/client component boundary for the post card? → A: The entire `PostCard` is a single `'use client'` component; the skeleton placeholder is a separate server-renderable sibling.
- Q: How should large like/comment counts be formatted? → A: Locale-aware compact notation via `Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 })` (e.g., `1.2K` in English, `1.2 ألف` in Arabic).
- Q: For unauthenticated viewers, what should activating the comment hotspots (title, content preview, comment icon) do? → A: Fire `onOpenComments` for everyone on all three hotspots; only like and bookmark redirect guests to sign-in. The comments view is responsible for gating writes (supersedes the earlier clarification that grouped comment with like/bookmark).
- Q: Which concrete palette backs the deterministic initials avatar? → A: A fixed 6-color palette using existing Tailwind 500-weight shades — `slate-500`, `red-500`, `amber-500`, `emerald-500`, `sky-500`, `violet-500` — with white foreground initials; the palette index is chosen by hashing the display name. No new design tokens.
- Q: How should like/bookmark activations behave while `useCurrentUser` is still loading (pre-hydration/session resolution)? → A: Ignore the click — no redirect, no optimistic update, no request; the next click after the hook resolves behaves normally.
- Q: Can the post's author like and/or bookmark their own post from the card? → A: Yes to both — the author sees the same like and bookmark affordances as any other viewer with no special casing.
- Q: What is the exact shape of the sign-in return-to query parameter used when guests activate like/bookmark? → A: `?redirect=<encoded locale-prefixed pathname+search>` on the sign-in URL; value MUST be a same-origin pathname starting with `/` (login page rejects anything else to prevent open redirects); the locale segment is preserved so the user lands back on the same-language page.
- Q: Is `onOpenComments` a required callback prop on the post card? → A: Required. TypeScript marks it as required and every host must supply it; the three comment-open hotspots (comment icon, title, content preview) are always interactive, with no optional/degraded mode.
- Q: How does the card render the content preview when the post body is empty? → A: Reserve the two-line slot with a blank (empty) region so every card in the feed has the same height regardless of whether the body is present. The empty region is still a button (comment-open hotspot) with its accessible label so keyboard users can still activate the comments action from it.
- Q: Does the skeleton placeholder render a single card or accept a count prop? → A: Single-card skeleton. The component takes no count prop and always renders exactly one card-shaped placeholder; hosts that need multiple placeholders map over it themselves. This keeps the skeleton a pure, prop-less, server-renderable primitive.
- Q: Is the share action gated by authentication? → A: No. Share works for all viewers (authenticated and guests) with no sign-in redirect; it is a pure client-side clipboard write against a public URL and has no persistence side effect to gate.
- Q: How should the relative publish time be rendered for older posts? → A: Relative for posts under 7 days old (date-fns `formatDistanceToNow`, e.g., "2 hours ago" / "منذ ساعتين"); for posts ≥ 7 days old, render a short localized absolute date (e.g., "Mar 12, 2026" / "12 مارس 2026") instead. The 7-day threshold is evaluated once at mount alongside the existing static-for-lifetime rule.
- Q: What semantic element backs the title given FR-011a requires it to be a native `<button>`? → A: The title is an `<h3>` whose child is the unstyled `<button>` (heading wraps button). This preserves the feed's document outline (page `<h1>` → per-card `<h3>`) while keeping native button semantics (role, Enter/Space activation, focus) on the clickable hotspot.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Browse community posts at a glance (Priority: P1)

A visitor browsing the community feed sees each post rendered as a self-contained card that surfaces everything they need to decide whether to engage: who wrote it, what category it belongs to, the title, a short preview of the content, and aggregate engagement counts (likes, comments). The layout adapts to both Arabic (RTL) and English (LTR) and to mobile and desktop screen sizes.

**Why this priority**: Without a readable post card, no community feature is consumable. Every other community interaction (reading, liking, bookmarking, commenting, sharing) depends on the card being the entry point to a post.

**Independent Test**: Render a single post card with representative data in both locales and verify the author, category, title, preview, and counts all display correctly, truncation works, and the layout mirrors correctly in RTL.

**Acceptance Scenarios**:

1. **Given** a published post with an author, title, content, category, and engagement counts, **When** the card is rendered, **Then** the user sees the author avatar and full name, a human-readable relative publish time (e.g., "2 hours ago" / "منذ 2 ساعات"), a colored category badge, the title, a two-line content preview that truncates with an ellipsis, and the like and comment counts.
2. **Given** the user viewing the feed in Arabic, **When** the card renders, **Then** all text, avatar, icons, and action bar items are mirrored appropriately and reading flows right-to-left without visual clipping.
3. **Given** a post whose content is shorter than two lines, **When** the card renders, **Then** no truncation ellipsis is shown and the content displays in full within the allotted space.
4. **Given** a post with one or more attachments, **When** the card renders, **Then** an attachment indicator (icon + count) is visible near the content preview.
5. **Given** a post whose author's account has been deleted or has no avatar image, **When** the card renders, **Then** a default avatar and a fallback display name are used without breaking the layout.

---

### User Story 2 - Like a post optimistically (Priority: P1)

A logged-in user taps the like (heart) action on a post card. The like state and count update instantly in the UI, and the change is persisted in the background. If the background save fails, the UI reverts to the prior state and the user is notified.

**Why this priority**: Liking is the primary lightweight engagement signal. Users expect immediate feedback; any perceptible delay degrades the feed experience.

**Independent Test**: With a prepared post card, click the like action and observe the visual state and count change within the same frame, then verify the persisted state matches. Simulate a failure and verify the UI reverts and an error notification appears.

**Acceptance Scenarios**:

1. **Given** a user who has not liked a post, **When** they activate the like action, **Then** the heart fills, the count increases by one immediately, and the change is persisted.
2. **Given** a user who has already liked a post, **When** they activate the like action again, **Then** the heart unfills, the count decreases by one immediately, and the unlike is persisted.
3. **Given** the persistence call fails after an optimistic update, **When** the failure is detected, **Then** the like state and count revert to their prior values and an error toast is shown.
4. **Given** a user clicks the like action rapidly multiple times, **When** a previous request is still in flight, **Then** additional clicks do not cause inconsistent counts or duplicate requests.

---

### User Story 3 - Bookmark a post optimistically (Priority: P2)

A logged-in user taps the bookmark action on a post card. The bookmark state toggles instantly and is persisted in the background. A success toast confirms the action, and failures revert the UI.

**Why this priority**: Bookmarking drives retention by letting users save posts to revisit. It mirrors the existing listings bookmark pattern, so users expect parity.

**Independent Test**: Click the bookmark action on a card and verify the icon state changes immediately, a confirmation toast appears, and the persisted state matches. Simulate a failure and verify rollback plus error toast.

**Acceptance Scenarios**:

1. **Given** a post the user has not bookmarked, **When** they activate the bookmark action, **Then** the icon switches to the active state immediately, a success toast "Bookmark added" is shown, and the change is persisted.
2. **Given** a post the user has bookmarked, **When** they activate the bookmark action, **Then** the icon switches to the inactive state, a toast "Bookmark removed" is shown, and the change is persisted.
3. **Given** the persistence call fails, **When** the failure is detected, **Then** the bookmark state reverts and an error toast is shown.

---

### User Story 4 - Share a post via copied link (Priority: P2)

Any user (logged in or not) taps the share action on a post card. The post's public URL is copied to their clipboard and a confirmation toast is shown, letting them paste the link into any messaging or social channel.

**Why this priority**: Sharing drives organic growth of the community. Copy-to-clipboard is the simplest, most universal share mechanism and does not require a separate dialog.

**Independent Test**: Click the share action and verify the clipboard contains the canonical post URL and a confirmation toast appears.

**Acceptance Scenarios**:

1. **Given** a post card, **When** the user activates the share action, **Then** the post's canonical URL is written to the system clipboard and a "Link copied" toast is shown.
2. **Given** the clipboard write is not permitted by the browser, **When** the user activates share, **Then** an informational error toast is shown and no further action is taken.

---

### User Story 5 - Open comments for a post (Priority: P2)

A user taps the comment icon on a post card to view and participate in the discussion. The card notifies its parent that the user wants to open the post's detail/comments view for this specific post.

**Why this priority**: Comments are where deeper engagement happens. The card must expose a clear, accessible entry point, even though the comment UI itself is delivered in a later phase.

**Independent Test**: Click the comment action and verify a parent-provided callback receives the correct post identifier.

**Acceptance Scenarios**:

1. **Given** a post card wired to a comment-open handler, **When** the user activates the comment action, **Then** the handler is invoked exactly once with the current post's identifier.
2. **Given** a post with zero comments, **When** the card renders, **Then** the comment action is still visible and activatable, and its count displays as zero.

---

### User Story 6 - See a loading placeholder while posts fetch (Priority: P3)

While the community feed fetches posts, the user sees skeleton placeholders that match the shape of real post cards, preventing layout shift and communicating that content is loading.

**Why this priority**: Skeletons meaningfully improve perceived performance and prevent cumulative layout shift, but are secondary to the card itself being functional.

**Independent Test**: Render the skeleton component in isolation and verify it visually mirrors the real card's structure and occupies equivalent space.

**Acceptance Scenarios**:

1. **Given** a feed in a loading state, **When** the list of posts has not yet arrived, **Then** one or more skeleton cards are rendered in the same space the real cards will occupy, with no layout shift when real data replaces them.

---

### Edge Cases

- **Unauthenticated viewer**: Like and bookmark actions remain visible and enabled for guests to preserve layout parity; activating either of them redirects the user to the sign-in page with a return-to query parameter, applies no optimistic state, and sends no request. The three comment-open hotspots (comment icon, title, content preview) always invoke `onOpenComments` regardless of auth state — the downstream comments view is responsible for gating any writes.
- **Deleted author**: Posts whose author record is missing still render, using a fallback display name ("Deleted User" / "مستخدم محذوف") and a default avatar.
- **Missing or broken avatar URL**: Falls back to the author's initials rendered on a deterministic solid background color; the same rule applies when the author record is missing (using the localized fallback display name to derive initials).
- **Very long title**: Title clamps to a single line with an ellipsis so the header row keeps a fixed height across cards.
- **Very long content**: Content preview clamps to exactly two lines with an ellipsis regardless of word length.
- **Zero engagement**: Like count and comment count both display as zero rather than being hidden.
- **Rapid repeated taps** on like or bookmark: later taps during an in-flight request are ignored to keep optimistic state consistent.
- **Network failure** during like/bookmark: UI reverts to the pre-click state and the user is notified.
- **Clipboard unavailable** (e.g., insecure context, denied permission): share action degrades gracefully with an informative toast.
- **Post has many attachments**: the attachment indicator shows the total count, not a list of file names, to keep the card compact.
- **Long author name**: truncates within the header row without pushing the relative time out of view.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The post card MUST display the author's avatar, full name, relative publish time, category badge, title, a two-line content preview, like count, comment count, bookmark action, and share action for a single community post. The title MUST clamp to a single line with a trailing ellipsis when it overflows so that every card's header row occupies a fixed height. Like and comment counts MUST be rendered using locale-aware compact notation via `Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 })` (e.g., `1.2K` in English, `1.2 ألف` in Arabic) so the action bar remains visually compact for high-engagement posts.
- **FR-002**: The post card MUST render identically correct layouts in LTR (English) and RTL (Arabic), including mirrored icon/action order and locale-aware relative time formatting. The publish time MUST be computed once when the card mounts and remain static for the lifetime of that card instance (no per-card or feed-level interval). At mount, if the post is less than 7 days old the card MUST render a locale-aware relative string via `date-fns` `formatDistanceToNow` (e.g., "2 hours ago" / "منذ ساعتين"); if the post is 7 days old or older the card MUST instead render a short localized absolute date (e.g., "Mar 12, 2026" / "12 مارس 2026") so header-row width stays predictable and avoids awkward long-form relative strings. The 7-day threshold MUST be evaluated once at mount together with the static-for-lifetime rule.
- **FR-003**: The category badge MUST visually distinguish each of the four categories (questions, tips, news, troubleshooting) using a distinct color per category and a localized label. The color mapping MUST be: questions → blue, tips → green, news → amber, troubleshooting → red, implemented with the existing Tailwind/shadcn semantic palette (no new design tokens). All badge color/text pairs MUST meet WCAG AA contrast.
- **FR-004**: The content preview MUST treat the post content as plain text (no markdown or HTML rendering) and MUST clamp to two lines with a trailing ellipsis using CSS line-clamping when the content exceeds that length, and MUST not clamp otherwise. Newline characters in the source content MUST be collapsed to single spaces in the preview so the clamp measures visual lines correctly. When the post body is empty or whitespace-only, the card MUST still reserve the two-line slot as a blank (empty) region so every card in the feed occupies the same height regardless of whether the body is present (preserving SC-005's zero-CLS guarantee). The reserved empty region MUST remain a functional comment-open hotspot (keyboard-activatable button with its accessible label) so the comments action is still reachable.
- **FR-005**: The card MUST show an attachment indicator with the attachment count when the post has one or more attachments, and MUST omit the indicator entirely when there are none. The indicator MUST be rendered as a non-interactive visual badge (no click/keyboard affordance); an attachment gallery/lightbox is out of scope for this phase.
- **FR-006**: Activating the like action MUST immediately toggle the liked state and adjust the displayed like count by ±1 before the server result is known (optimistic update).
- **FR-007**: When a like or unlike request fails, the card MUST revert the like state and count to their prior values and surface an error notification to the user. On successful like/unlike the card MUST NOT show a success toast — the visual heart/count change is the sole success signal (this differs intentionally from bookmark, which is a lower-frequency save action and does show a success toast).
- **FR-008**: Activating the bookmark action MUST immediately toggle the bookmarked state, persist the change, show a success notification on completion, and revert with an error notification on failure.
- **FR-009**: While a like or bookmark request for the same card is in flight, the card MUST ignore additional activations of that same action to prevent duplicate requests and inconsistent state.
- **FR-010**: Activating the share action MUST copy the post's canonical URL to the system clipboard and display a "link copied" confirmation notification, or a fallback error notification if the clipboard write is not permitted. The canonical URL MUST be locale-agnostic and take the shape `/community/[postId]` (resolved against the app origin); the recipient's browser locale determines the language on load. The share action MUST be available to all viewers regardless of authentication state — it MUST NOT redirect guests to sign-in and MUST NOT be gated by `useCurrentUser`, because it is a pure client-side clipboard write against a public URL with no persistence side effect.
- **FR-011**: Activating the comment action MUST invoke a parent-supplied callback with the post's identifier; the post card itself MUST NOT open any modal or navigate away.
- **FR-011a**: Activating the title or the content preview region MUST invoke the same parent-supplied comment-open callback with the post's identifier (equivalent to activating the comment action); these regions MUST be implemented as native `<button>` elements (visually unstyled so they inherit the card's typography) so that Enter and Space both activate them, focus states are native, and screen readers announce them as buttons. Each MUST carry an accessible label identifying the action (e.g., "Open comments for post '<title>'").
- **FR-011b**: Activating the author avatar or author name MUST navigate the viewer to that author's profile page at `/[locale]/profile/[userId]`; the author header MUST be exposed as a keyboard-reachable link with an accessible label identifying the author. The profile route itself is delivered in a later phase — the card MUST still render the link now because the URL shape is stable. Deleted/missing authors render as non-interactive (no link).
- **FR-012**: Like and bookmark actions MUST render and be activatable for all viewers regardless of authentication state; when an unauthenticated viewer activates either of them, the card MUST redirect them to the sign-in page and MUST NOT apply any optimistic state change or issue any persistence request. The redirect target MUST include a `redirect` query parameter whose value is the current page's locale-prefixed pathname plus search string (e.g., `/login?redirect=%2Fen%2Fcommunity`), URL-encoded. The value MUST be a same-origin pathname starting with `/`; the sign-in page MUST reject any value that does not start with `/` to prevent open-redirect abuse. The locale segment MUST be preserved so the viewer lands back on the same-language page after completing sign-in. The three comment-open hotspots (comment icon, title, content preview) MUST invoke the parent-supplied `onOpenComments` callback for every viewer — authenticated or not — without redirecting; the downstream comments view is responsible for gating any writes that require authentication. The card MUST determine the viewer's authentication state by calling a shared client hook (`useCurrentUser`) backed by the Supabase browser client; it MUST NOT receive a separate viewer/auth prop and MUST NOT rely on server-action errors as the guest-detection signal. If the hook is not already present in the codebase, it is delivered as part of this phase as a shared utility reusable by later phases. While `useCurrentUser` is still resolving the session (loading state), the card MUST ignore like and bookmark activations entirely — no sign-in redirect, no optimistic update, and no persistence request. The click has no effect; once the hook resolves, subsequent activations behave according to the authenticated/guest rules above. Comment-open hotspots are unaffected and continue to fire `onOpenComments` immediately, since they do not depend on auth state.
- **FR-013**: The card MUST gracefully handle missing, deleted, or avatar-less authors by showing a localized fallback display name and an initials-based avatar on a deterministic solid background color — no generic silhouette image is used. The initials MUST be up to two characters taken as the first letter of the first two whitespace-separated tokens of the display name, uppercased; if only one token exists, one initial is used. The background color MUST be selected deterministically from a fixed 6-color palette — `slate-500`, `red-500`, `amber-500`, `emerald-500`, `sky-500`, `violet-500` (existing Tailwind shades, no new design tokens) — by hashing the display name so the same author always maps to the same color. Initials MUST be rendered in white for WCAG AA contrast against every palette entry.
- **FR-014**: The card MUST expose an accompanying skeleton placeholder that matches its visual footprint for use in loading states, preventing layout shift when real data replaces it. The skeleton MUST be a separate component that is safe to render from a server component (no `'use client'` directive, no client-only APIs), while the interactive `PostCard` itself is a single client component (`'use client'`) encapsulating all interactive state, the `useCurrentUser` hook, and the title/content-preview/action-bar hotspots — there is no server-component shell around the card. The skeleton component MUST render exactly one card-shaped placeholder and MUST NOT accept a `count` prop; hosts that need multiple placeholders (e.g., the community feed's initial loading state) map over the skeleton themselves.
- **FR-015**: All interactive elements on the card MUST be reachable via keyboard, have a visible focus state, and carry accessible labels that reflect the action and, where relevant, its current state (e.g., "Like" vs. "Unlike").
- **FR-016**: All user-visible text on the card (including action labels, relative time, category labels, fallback names, and toasts) MUST be available in both English and Arabic via the project's translation system, with no hard-coded strings.
- **FR-018**: The card MUST apply no special casing when the authenticated viewer is the post's own author — the author sees the like and bookmark actions with the same affordances, optimistic behavior, and persistence as any other authenticated viewer. Self-like and self-bookmark are permitted.
- **FR-017**: The post card component MUST be reusable in any feed-like context (community feed, profile posts tab, home page highlights) without structural modification. The component's external contract MUST consist of a single flattened `post` prop — containing author identity, publish time, category, title, content, attachment count, like count, comment count, and the current viewer's `isLiked` and `isBookmarked` state — alongside callback props. `onOpenComments` is a **required** callback prop (typed as required, not optional); every host must supply it, and the three comment-open hotspots (comment icon, title, content preview) are always fully interactive with no optional/degraded fallback. The card MUST NOT accept a separate viewer/auth prop; the host provides all viewer-specific state pre-merged into the `post` object, consistent with the Phase 2 flattened query shape.

### Key Entities _(include if feature involves data)_

- **Post Card Item**: A single community post prepared for display. Carries author identity (name and avatar), publish time, category, title, content body, attachment count, like count, comment count, and the current viewer's liked/bookmarked state relative to this post.
- **Post Category**: One of four enumerated values — questions, tips, news, troubleshooting — each with its own color treatment and localized label.
- **Viewer Context**: The identity and authentication status of the current user, used to decide whether interactive actions are available and to compute the correct initial liked/bookmarked state for the card.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user can identify a post's author, category, title, and preview within 2 seconds of the card appearing on screen.
- **SC-002**: Like and bookmark actions reflect their new state in the UI within one animation frame (under 16 ms) of activation, independent of network latency.
- **SC-003**: When a like or bookmark request fails, 100% of affected cards revert to their prior state and the user receives a visible error notification.
- **SC-004**: The share action copies the correct post URL to the clipboard in at least 95% of attempts across supported browsers, with a graceful fallback notification in the remaining cases.
- **SC-005**: The card and its skeleton cause zero layout shift (CLS contribution of 0) when swapping between loading and loaded states.
- **SC-006**: The card passes automated accessibility checks with zero critical violations and meets WCAG AA color contrast for all text, badges, and icons.
- **SC-007**: The card renders correctly in both English and Arabic with no clipped text, mis-mirrored icons, or untranslated strings across mobile (≤ 640 px) and desktop (≥ 1024 px) breakpoints.
- **SC-008**: The same post card component is consumed by at least two different surfaces in later phases (community feed and at least one of: profile posts tab, home page highlights) without any internal modification.

## Assumptions

- The community feed queries from Phase 2 are available and return a flattened post item shape that already includes author info, engagement counts, current viewer like/bookmark state, and attachment data — the card does not fetch its own data.
- The shared server actions for toggling like and toggling bookmark exist and return success/failure results that the card can use to confirm or revert its optimistic state.
- Relative time formatting uses the existing `date-fns` dependency with locale support for English and Arabic (no new date library introduced).
- The post detail modal and its comment UI are delivered in Phase 5; in Phase 3 the comment action only invokes a callback and does not render the modal.
- Opening the comments view is reachable from three hotspots on the card — the comment action button, the title, and the content preview — all of which invoke the same parent-supplied comment-open callback. The author avatar/name links to the author's profile page. All other regions of the card are non-interactive.
- Toast notifications use the existing `sonner` toast provider already wired into the app.
- The category color palette fits within the existing design system's badge variants (or uses Tailwind classes consistent with it) — no new design tokens are introduced.
- Clipboard writes use the standard browser clipboard API; environments without clipboard access receive a graceful fallback rather than silent failure.
- Authenticated vs. unauthenticated state is read by the card via a shared client hook (`useCurrentUser`) that wraps the Supabase browser client session; the host page does not pass viewer identity down as a prop.
- The component's external prop contract is stable enough that Phases 4, 6, and 7 can consume it unchanged.
- The card MUST NOT render `DELETED_USER_NAME_KEY` directly as display text. Instead, it uses a translation key (e.g., `PostCard.deletedUser`) for the fallback display name. The raw constant is used only for query-level fallback in `queries.ts`; the card layer always resolves through `next-intl`.
