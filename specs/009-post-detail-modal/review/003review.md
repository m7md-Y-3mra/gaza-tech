# Spec Review: 009-post-detail-modal

- Branch: 009-post-detail-modal
- Review file: 003review.md
- Scope: Targeted follow-up — fix bidirectional (bidi) text rendering for Arabic / English / mixed user-generated content across community feed, post detail, and comments.

## Summary

- Overall status: PARTIAL (feature implementation is PASS, but bidi handling of user-generated text is broken)
- High-risk issues: 1 (Issue 1 — bidi direction is forced by the page `dir` instead of being determined per user-generated text block)
- Root cause: `unicode-bidi: plaintext` is applied to `html[dir='rtl']` in `app/globals.css`, which has no observable effect. The elements that actually render user content (post title, post content, comment text, author display name) do not opt into per-element auto direction via `dir="auto"` or `unicode-bidi: plaintext`.
- Lint / type-check: not re-run for this review (no production code change proposed here; doc-only). The previously PASSing check state from 002review.md still holds.

---

## Background: Why the Current CSS Does Nothing

The relevant rules in `app/globals.css`:

```css
/* line 331-333 */
html[dir='rtl'] {
  unicode-bidi: plaintext;
}

/* line 412-416 */
[style*='unicode-bidi: plaintext'],
.bidi-plaintext {
  unicode-bidi: plaintext;
}
```

Why they produce no visible effect:

1. `unicode-bidi: plaintext` instructs the browser to determine paragraph direction from the **first strong character** of that element's text, overriding the inherited `direction`. It must be applied to the **actual element that contains the paragraph of user text** (`<p>`, `<h1>`, `<span>` containing the title, etc.), not to `<html>`.
2. Applying it on `<html>` with `dir='rtl'` is a no-op for nested blocks, because Tailwind utilities like `text-base`, `leading-relaxed`, and block defaults don't propagate `plaintext` down — the browser already established paragraph direction from the ancestor `dir` attribute.
3. The `.bidi-plaintext` utility class exists but is **never applied** to any component in the feature (`grep -r "bidi-plaintext" modules/community app` → zero matches).
4. `html[dir='rtl'] .flex-row { flex-direction: row-reverse; }` (line 341-343) is actively harmful: Tailwind's flex utilities already respect `dir` via logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`). Reversing `flex-row` a second time breaks the visual order of every component using `flex-row` in RTL pages. It should be removed.

### The Correct Approach

Use the **native HTML attribute `dir="auto"`** on every element that displays user-generated text. This is:

- Equivalent to `unicode-bidi: plaintext` but doesn't require a CSS class.
- Applied per element, so each title / paragraph / comment decides its own direction from its first strong character.
- Supported in all modern browsers.
- The MDN-recommended and WHATWG-standard solution for user content of unknown language.

Result:

- An English title on an Arabic UI page renders LTR correctly.
- An Arabic comment on an English UI page renders RTL correctly.
- A mixed sentence ("Hello مرحبا world") uses the direction of its first strong character, and the Unicode Bidirectional Algorithm handles the inline segments naturally.

Do **NOT** set `dir="auto"` on layout containers (navbars, sidebars, action bars). Only on elements whose text content comes from users / CMS — i.e. titles, bodies, comment content, author display names.

---

## Task-by-task Verification (Bidi-only scope)

### Task B1: Post title in `PostCard`

- Spec requirement: Post title must render in the direction of its content, not the page locale.
- Implementation found:
  - File: `modules/community/components/post-card/PostCard.tsx`
  - Symbols: `<h3>` at line 141, `<Link>` at line 142–147 wrapping `{post.title}`
- Status: FAIL
- Evidence: No `dir` attribute on the `<Link>` or `<h3>`. Arabic title on EN page renders LTR, truncates from the wrong end.
- Proposed fix: add `dir="auto"` to the `<Link>` wrapping `{post.title}` at line 142.

### Task B2: Content preview in `PostCard`

- File: `modules/community/components/post-card/PostCard.tsx`
- Symbols: `<Link>` at line 151–156 wrapping `{contentPreview}`
- Status: FAIL
- Proposed fix: add `dir="auto"` to the `<Link>` at line 151.

### Task B3: Author display name in `PostCard`

- File: `modules/community/components/post-card/PostCard.tsx`
- Symbols: `<p>` containing `{displayName}` at lines 104-106 AND 118-120 (two branches — deleted/non-deleted)
- Status: FAIL
- Proposed fix: add `dir="auto"` to BOTH `<p class="text-foreground truncate text-sm font-semibold ...">` elements.

### Task B4: Post title in `PostDetailModal`

- File: `modules/community/components/post-detail-modal/PostDetailModal.tsx`
- Symbols: `<h2>` at line 39: `<h2 className="text-lg font-semibold">{post.title}</h2>`
- Status: FAIL
- Proposed fix: add `dir="auto"` to the `<h2>` at line 39.

### Task B5: Post body content in `PostDetailContent`

- File: `modules/community/components/post-detail-modal/components/post-detail-content/PostDetailContent.tsx`
- Symbols: `<p>` at line 18 wrapping `{content}`
- Status: FAIL
- Proposed fix: add `dir="auto"` to the `<p>` at line 18.

### Task B6: Author name in `PostDetailHeader`

- File: `modules/community/components/post-detail-modal/components/post-detail-header/PostDetailHeader.tsx`
- Symbols: `<span>` at line 84 (deleted branch), `<Link>` at line 88 (active branch) — both render `{authorName}`
- Status: FAIL
- Proposed fix: add `dir="auto"` to both the `<span>` at line 84 AND the `<Link>` at line 88.

### Task B7: Post title in full-page `PostDetailView`

- File: `modules/community/post-detail/PostDetailView.tsx`
- Symbols: `<h1>` at line 28 rendering `{post.title}`
- Status: FAIL
- Proposed fix: add `dir="auto"` to the `<h1>` at line 28.

### Task B8: Comment author name in `CommentItem`

- File: `modules/community/components/comments/components/comment-item/CommentItem.tsx`
- Symbols: `<span class="text-foreground truncate text-xs font-semibold">` at line 91 wrapping `{authorName}`
- Status: FAIL
- Proposed fix: add `dir="auto"` to the `<span>` at line 91.

### Task B9: Comment body content in `CommentItem`

- File: `modules/community/components/comments/components/comment-item/CommentItem.tsx`
- Symbols: `<p>` at line 129 wrapping `{comment.content}` AND the `<textarea>` at line 106 in edit mode
- Status: FAIL
- Proposed fix:
  - Add `dir="auto"` to the `<p>` at line 129.
  - Add `dir="auto"` to the `<textarea>` at line 106 so edits to Arabic comments align correctly while typing.

### Task B10: `CommentInput` textarea

- File: `modules/community/components/comments/components/comment-input/CommentInput.tsx`
- Symbols: primary `<textarea>` receiving the new comment text
- Status: FAIL (needs verification — ensure the main textarea has `dir="auto"` so Arabic typed on an English UI renders RTL as the user types)
- Proposed fix: add `dir="auto"` to the `<textarea>` element. (Do NOT add it to the outer sticky container, only the textarea itself.)

### Task B11: Cleanup of harmful / ineffective CSS in `app/globals.css`

- File: `app/globals.css`
- Symbols / lines:
  - Line 331-333: `html[dir='rtl'] { unicode-bidi: plaintext; }` — INEFFECTIVE
  - Line 341-343: `html[dir='rtl'] .flex-row { flex-direction: row-reverse; }` — HARMFUL
  - Line 360-370: `html[dir='rtl'] .space-x-{2,3,4} > :not([hidden]) ~ :not([hidden]) { --tw-space-x-reverse: 1; }` — Tailwind v4 handles this via logical properties automatically; these overrides conflict
  - Line 389-392: `html[dir='rtl'] .absolute.right-0 { right: auto; left: 0; }` — prefer logical `start-0` / `end-0` on the element; leaving this rule silently overrides intended `right-0` positioning
  - Line 395-401: `html[dir='rtl'] .text-left { text-align: right; }` / `.text-right { text-align: left; }` — harmful; breaks explicit `text-left` / `text-right` usage; prefer `text-start` / `text-end` in markup
- Status: FAIL (cleanup needed after the `dir="auto"` changes are verified)
- Proposed fix: remove lines 331-333, 341-343, 360-370, 389-392, and 395-401. Keep everything else (scrollbar rules, container rules, form-field `email/url/tel` LTR overrides, icon flipping, `html[dir='rtl'] body { text-align: right; }` — this last one is fine because it only sets default alignment, not `unicode-bidi`).

  **IMPORTANT**: After removing `.flex-row` row-reverse and `.text-left` / `.text-right` flips, run the app in Arabic (`/ar`) and visually confirm the navbar, post card action bar, comment action bar, and filters bar all still look correct. If something was **relying** on the reversal (i.e. uses bare `flex-row` without logical `ms-auto`/`me-auto`), fix that component to use logical properties instead of restoring the CSS hack.

---

## Issues List (Consolidated)

### Issue 1: Bidi direction is forced by the page `dir` attribute, so Arabic content on English pages (and vice-versa) renders in the wrong direction

- [x] FIXED
- Severity: HIGH
- Depends on: none
- Affected tasks: B1, B2, B3, B4, B5, B6, B7, B8, B9, B10
- Evidence: See task-by-task section above. No `dir="auto"` anywhere in `modules/community/**`. The CSS `unicode-bidi: plaintext` rule is on `<html>` only and `.bidi-plaintext` class is never used.
- Root cause analysis: The author assumed `unicode-bidi: plaintext` at the `<html>` level would propagate to all descendants. It does not — `unicode-bidi` is a formatting property that applies to the element it's set on, not its children. Combined with `<html dir='rtl'>`, every paragraph inherits `direction: rtl` and ignores the content's first strong character. The fix is to apply `dir="auto"` (the HTML-native equivalent) to each text-bearing element.
- Fix notes: Added `dir="auto"` to post titles, bodies, author names, comment content, and comment-input textareas across 7 files:
  - `modules/community/components/post-card/PostCard.tsx`
  - `modules/community/components/post-detail-modal/PostDetailModal.tsx`
  - `modules/community/components/post-detail-modal/components/post-detail-content/PostDetailContent.tsx`
  - `modules/community/components/post-detail-modal/components/post-detail-header/PostDetailHeader.tsx`
  - `modules/community/post-detail/PostDetailView.tsx`
  - `modules/community/components/comments/components/comment-item/CommentItem.tsx`
  - `modules/community/components/comments/components/comment-input/CommentInput.tsx`
- Proposed solution (detailed, mechanically applicable):

  **Step 1 — `modules/community/components/post-card/PostCard.tsx`**

  1a. Line 142 (title link): change

  ```tsx
  <Link
    href={`/community/${post.post_id}`}
    className="focus-visible:ring-ring line-clamp-1 w-full rounded-sm text-start hover:underline focus:outline-none focus-visible:ring-2"
  >
  ```

  to

  ```tsx
  <Link
    dir="auto"
    href={`/community/${post.post_id}`}
    className="focus-visible:ring-ring line-clamp-1 w-full rounded-sm text-start hover:underline focus:outline-none focus-visible:ring-2"
  >
  ```

  1b. Line 151 (content preview link): change

  ```tsx
  <Link
    href={`/${locale}/community/${post.post_id}`}
    className={`text-muted-foreground focus-visible:ring-ring w-full rounded-sm text-start text-sm focus:outline-none focus-visible:ring-2 ${post.content ? 'line-clamp-2' : 'min-h-[2lh]'}`}
  >
  ```

  to

  ```tsx
  <Link
    dir="auto"
    href={`/${locale}/community/${post.post_id}`}
    className={`text-muted-foreground focus-visible:ring-ring w-full rounded-sm text-start text-sm focus:outline-none focus-visible:ring-2 ${post.content ? 'line-clamp-2' : 'min-h-[2lh]'}`}
  >
  ```

  1c. Line 104-106 (deleted author name): change

  ```tsx
  <p className="text-foreground truncate text-sm font-semibold">
    {displayName}
  </p>
  ```

  to

  ```tsx
  <p dir="auto" className="text-foreground truncate text-sm font-semibold">
    {displayName}
  </p>
  ```

  1d. Line 118-120 (active author name): same change — add `dir="auto"` to that `<p>`. (This is the `<p>` inside the `<Link href={/profile/${author.id}}>` branch.)

  **Step 2 — `modules/community/components/post-detail-modal/PostDetailModal.tsx`**

  Line 39: change

  ```tsx
  <h2 className="text-lg font-semibold">{post.title}</h2>
  ```

  to

  ```tsx
  <h2 dir="auto" className="text-lg font-semibold">
    {post.title}
  </h2>
  ```

  **Step 3 — `modules/community/components/post-detail-modal/components/post-detail-content/PostDetailContent.tsx`**

  Line 18: change

  ```tsx
  <p className="text-foreground text-base leading-relaxed break-words whitespace-pre-wrap">
    {content}
  </p>
  ```

  to

  ```tsx
  <p
    dir="auto"
    className="text-foreground text-base leading-relaxed break-words whitespace-pre-wrap"
  >
    {content}
  </p>
  ```

  **Step 4 — `modules/community/components/post-detail-modal/components/post-detail-header/PostDetailHeader.tsx`**

  4a. Line 84 (deleted author span): add `dir="auto"`.

  4b. Line 88 (author Link): add `dir="auto"` to the `<Link>`.

  **Step 5 — `modules/community/post-detail/PostDetailView.tsx`**

  Line 28: change

  ```tsx
  <h1 className="text-2xl font-bold tracking-tight">{post.title}</h1>
  ```

  to

  ```tsx
  <h1 dir="auto" className="text-2xl font-bold tracking-tight">
    {post.title}
  </h1>
  ```

  **Step 6 — `modules/community/components/comments/components/comment-item/CommentItem.tsx`**

  6a. Line 91 (author name span): add `dir="auto"`.

  6b. Line 106 (edit textarea): add `dir="auto"` to the `<textarea>`.

  6c. Line 129 (content `<p>`): add `dir="auto"` to the `<p>`.

  **Step 7 — `modules/community/components/comments/components/comment-input/CommentInput.tsx`**

  Add `dir="auto"` to the primary comment `<textarea>`. Do NOT add it to the outer sticky wrapper.

- Test plan (manual, since there are no unit tests for this feature):
  1. `npm run check` — must stay at 0 errors.
  2. `npm run dev` and open `http://localhost:3000/en/community` — create a post with an Arabic title ("مرحبا بالعالم") and Arabic body. Verify:
     - Title in feed card aligns right, reads RTL.
     - Content preview aligns right.
     - Opening modal: title + body both align right.
  3. Open `http://localhost:3000/ar/community` — view a post with an English title ("Hello world"). Verify:
     - Title in feed card aligns left, reads LTR.
     - Content preview aligns left.
     - Modal title + body align left.
  4. Post a mixed-content comment ("Hello مرحبا world") on any post. Verify the comment renders with its direction determined by the first strong character ("H" → LTR).
  5. In the comment input on `/ar/...`, type an English word first: the textarea should switch to LTR as you type.
  6. Verify all layout elements (navbar, action bars, filters) still render correctly in both locales — they should, because they use Tailwind logical utilities (`ms-*`, `me-*`, `start-*`, `end-*`).

- Notes / tradeoffs:
  - `dir="auto"` only determines **paragraph direction** (the whole block is LTR or RTL). It does NOT re-arrange individual runs within a paragraph — the Unicode Bidi Algorithm handles inline runs automatically, which is already what the user wants.
  - For a truncated (`line-clamp-1`, `truncate`) title in a card, `dir="auto"` ensures the ellipsis appears on the correct end.
  - This change is additive and non-breaking. If a user wants to revert, they just drop the attribute.

### Issue 2: Dead / harmful CSS rules in `app/globals.css` hide the effect of correct bidi and corrupt RTL layouts

- [x] FIXED
- Severity: MED
- Depends on: Issue 1 (apply `dir="auto"` first, then prove the page still looks right, then remove the overrides)
- Affected tasks: B11
- Evidence: Lines 331-333, 341-343, 360-370, 389-392, 395-401 of `app/globals.css` — see Task B11.
- Root cause analysis: These rules were added as a blunt-force RTL workaround before Tailwind v4's logical properties were used consistently. They now fight with the logical-property utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`) and silently reverse things the component author expected to stay put.
- Fix notes: Removed 5 blocks of dead/harmful RTL overrides from `app/globals.css`:
  - `html[dir='rtl']` unicode-bidi (no effect on children)
  - `html[dir='rtl'] .flex-row` (conflicted with logical properties)
  - `html[dir='rtl'] .space-x-*` (Tailwind v4 handles this automatically)
  - `html[dir='rtl'] .absolute.right-0` (prefer `end-0`)
  - `html[dir='rtl'] .text-left/right` (conflicted with explicit text alignment)
- Proposed solution:
  1. Open `app/globals.css`.
  2. Delete line 331-333 (the `html[dir='rtl'] { unicode-bidi: plaintext; }` block).
  3. Delete line 341-343 (the `html[dir='rtl'] .flex-row { flex-direction: row-reverse; }` block).
  4. Delete lines 360-370 (the three `space-x-{2,3,4}` reverse overrides).
  5. Delete lines 389-392 (the `html[dir='rtl'] .absolute.right-0` override).
  6. Delete lines 395-401 (the `html[dir='rtl'] .text-left` / `.text-right` swaps).
  7. Keep everything else in the RTL block (body text-align right, ltr escape classes, icon flipping, email/url/tel forced LTR, sidebar positioning).

- Test plan:
  1. After deletion, run `npm run check` → must stay at 0 errors.
  2. Open `http://localhost:3000/ar/community` and visually audit: navbar layout, filters bar, post cards (author header, action bar order of like/comment/share/bookmark), comment action bar, post detail modal header. Everything should still look correct because these components already use Tailwind logical utilities.
  3. If any component looks wrong: that component is using a non-logical utility (e.g. bare `ml-*`, `mr-*`, `text-left`, `flex-row` without `rtl:` variants) that was silently being flipped by the deleted CSS. Fix the component to use logical utilities — do NOT restore the CSS hack.
  4. Repeat on `/en/community` to confirm LTR wasn't affected.

- Notes / tradeoffs:
  - This is the step most likely to expose pre-existing bugs in other components that relied on the hack. Do it after Issue 1 is landed, not in the same commit. A separate commit makes it trivial to bisect if something visually regresses.
  - If the user is on a tight timeline, Issue 2 can be deferred — Issue 1 alone fixes the reported complaint ("direction is wrong for mixed content"). Issue 2 is cleanup that prevents future confusion.

---

## Fix Plan (Ordered)

1. Issue 1: Bidi direction forced by page `dir` — add `dir="auto"` to 11 specific text-bearing elements across 7 files per Step 1-7 above. One commit.
2. Issue 2: Dead/harmful RTL CSS in `app/globals.css` — delete 5 blocks of CSS per Task B11. Separate commit. Visually audit Arabic and English pages afterward.

---

## Handoff to Coding Model (Copy/Paste for Gemini CLI)

You are editing a Next.js 16 + Tailwind v4 + next-intl app. Branch: `009-post-detail-modal`.

**Goal**: Fix bidirectional (bidi) text rendering so that user-generated text (post titles, post bodies, comment text, author display names, comment-input textareas) renders in the direction of its **content**, not the page's `dir` attribute. Use the HTML-native attribute `dir="auto"`. Do NOT introduce new CSS classes, do NOT import any libraries, do NOT modify component logic.

**Context you must know before editing**:

- The app uses `next-intl` with routes under `app/[locale]/...`. Valid locales are `en` (LTR) and `ar` (RTL). The `<html>` element already gets `dir="rtl"` on Arabic pages via the root layout.
- Problem: every user-generated text block currently inherits the page's `dir`, so an Arabic comment on `/en/...` renders LTR and vice versa. The fix is to let the browser decide direction per text block using its first strong character.
- `dir="auto"` is the standards-based attribute for this. It's equivalent to CSS `unicode-bidi: plaintext` but doesn't require a class.
- Apply `dir="auto"` ONLY to elements that display content authored by users (titles, bodies, comments, display names). Do NOT apply it to layout containers, navbars, action bars, buttons, icons, dates, category badges, or counts.
- The existing `app/globals.css` has `html[dir='rtl'] { unicode-bidi: plaintext; }` on the root — that rule does nothing and is NOT the solution. Do not rely on it.

**Files and exact edits** (follow in order, one commit for Phase 1, one commit for Phase 2):

### Phase 1 — Add `dir="auto"` (single commit)

File-by-file changes. For each, the only change is adding the `dir="auto"` attribute to the specified element. Do not touch any other line.

1. `modules/community/components/post-card/PostCard.tsx`
   - Line ~142: add `dir="auto"` to the `<Link>` that wraps `{post.title}` (the title link inside the `<h3>`).
   - Line ~151: add `dir="auto"` to the `<Link>` that wraps `{contentPreview || <span class="invisible">...}` (the content preview link).
   - Lines ~104 and ~118: add `dir="auto"` to BOTH `<p className="text-foreground truncate text-sm font-semibold ...">` elements (the two branches — deleted author and non-deleted author). There are two because the outer ternary has two branches.

2. `modules/community/components/post-detail-modal/PostDetailModal.tsx`
   - Line ~39: add `dir="auto"` to the `<h2>` that renders `{post.title}`.

3. `modules/community/components/post-detail-modal/components/post-detail-content/PostDetailContent.tsx`
   - Line ~18: add `dir="auto"` to the `<p>` that renders `{content}`.

4. `modules/community/components/post-detail-modal/components/post-detail-header/PostDetailHeader.tsx`
   - Line ~84: add `dir="auto"` to the `<span>` in the deleted-user branch that renders `{authorName}`.
   - Line ~88: add `dir="auto"` to the `<Link>` in the active-user branch that renders `{authorName}`.

5. `modules/community/post-detail/PostDetailView.tsx`
   - Line ~28: add `dir="auto"` to the `<h1>` that renders `{post.title}`.

6. `modules/community/components/comments/components/comment-item/CommentItem.tsx`
   - Line ~91: add `dir="auto"` to the `<span>` that renders `{authorName}`.
   - Line ~106: add `dir="auto"` to the `<textarea>` used for inline editing (inside the `isEditing` branch).
   - Line ~129: add `dir="auto"` to the `<p>` that renders `{comment.content}`.

7. `modules/community/components/comments/components/comment-input/CommentInput.tsx`
   - Add `dir="auto"` to the primary `<textarea>` element (the one users type into). Do NOT add it to the outer wrapper div.

After all 7 files are edited:

```bash
npm run check
```

Must pass with 0 errors. If it fails, STOP and report the error — do not attempt a workaround.

**Commit message for Phase 1**:

```
fix(community): render user-generated text with dir="auto" for correct bidi

Apply dir="auto" to post titles, bodies, author names, comment content,
and comment-input textareas so Arabic/English/mixed text renders in the
direction determined by its first strong character instead of inheriting
the page's dir attribute. Closes 003review Issue 1.
```

### Phase 2 — Remove dead/harmful RTL CSS (separate commit, only after Phase 1 is verified visually)

File: `app/globals.css`

Delete the following five blocks exactly:

1. Lines 331-333:

   ```css
   html[dir='rtl'] {
     unicode-bidi: plaintext;
   }
   ```

2. Lines 341-343:

   ```css
   html[dir='rtl'] .flex-row {
     flex-direction: row-reverse;
   }
   ```

3. Lines 360-370 (three space-x reverse rules):

   ```css
   html[dir='rtl'] .space-x-2 > :not([hidden]) ~ :not([hidden]) {
     --tw-space-x-reverse: 1;
   }

   html[dir='rtl'] .space-x-3 > :not([hidden]) ~ :not([hidden]) {
     --tw-space-x-reverse: 1;
   }

   html[dir='rtl'] .space-x-4 > :not([hidden]) ~ :not([hidden]) {
     --tw-space-x-reverse: 1;
   }
   ```

4. Lines 389-392:

   ```css
   html[dir='rtl'] .absolute.right-0 {
     right: auto;
     left: 0;
   }
   ```

5. Lines 395-401:

   ```css
   html[dir='rtl'] .text-left {
     text-align: right;
   }

   html[dir='rtl'] .text-right {
     text-align: left;
   }
   ```

Keep everything else in the RTL section (body text-align, LTR escape class, icon flipping, `email`/`url`/`tel` forced LTR, sidebar repositioning, container rules).

After deletion:

```bash
npm run check
```

Then `npm run dev` and manually verify on both locales:

- `/en/community` — everything still looks correct.
- `/ar/community` — navbar, filters, feed, post card action bar, comment section all still look correct.

If any component visually regresses in `/ar/community`, that component is using a NON-logical Tailwind utility (e.g. `ml-*`, `mr-*`, `text-left`, `text-right`, `left-*`, `right-*`, or bare `flex-row` that relied on row-reverse). Fix that component to use logical utilities (`ms-*`, `me-*`, `text-start`, `text-end`, `start-*`, `end-*`). Do NOT restore the deleted CSS.

**Commit message for Phase 2**:

```
refactor(styles): remove dead and harmful RTL CSS overrides

Remove html[dir='rtl'] rules that either had no effect (unicode-bidi on
root) or fought with Tailwind v4 logical utilities (flex-row reverse,
space-x reverse, text-left/right swap, absolute right-0 swap). Bidi
correctness now comes from dir="auto" on user-generated text elements.
```

**What NOT to do**:

- Do NOT add any new CSS class.
- Do NOT touch any translation file.
- Do NOT touch `middleware.ts`, `proxy.ts`, or routing.
- Do NOT refactor components beyond adding the attribute.
- Do NOT add `dir="auto"` to buttons, icons, badges, counts, dates, or action bars — only to user-generated text containers listed above.
- Do NOT combine Phase 1 and Phase 2 into one commit — they must be separable for bisection.

End of report.
