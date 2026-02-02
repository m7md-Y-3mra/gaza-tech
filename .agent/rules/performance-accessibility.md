# Performance & Accessibility Standards (MANDATORY)

## 1. Performance Thresholds

❌ **Strict Rule**: No feature should degrade performance below **95%** on Core Web Vitals (Lighthouse/PageSpeed).

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Required Actions:

1. **Run Checks**: You must verify performance impact before marking a task as complete.
2. **Dynamic Imports**: Use `next/dynamic` for heavy client components or below-the-fold content.
3. **Image Optimization**: Strictly use `next/image` with defined `sizes`, `priority` (for LCP), and modern formats.
4. **Rendering Strategy**: Prefer Static/ISR/PPR. Minimize purely client-side rendering for critical content.

## 2. Accessibility (a11y) Standards

❌ **Strict Rule**: All new UI must pass accessibility checks with **zero** critical errors.

- **Semantic HTML**: Use correct tags (`<button>`, `<main>`, `<nav>`, `<h1>` hierarchy). All non-semantic interactive elements are forbidden.
- **ARIA Attributes**: Use standard ARIA roles/labels only where semantic HTML is insufficient.
- **Keyboard Navigation**: Ensure all interactive elements are reachable, usable, and show visible focus states via keyboard.
- **Color Contrast**: Maintain WCAG AA standard (4.5:1 for normal text).
- **Alt Text**: Mandatory descriptive alt text for all meaningful images.

### Verification Steps

- Run accessibility linter (if available) on new components.
- Manually test tab order and keyboard interaction.
- Verify screen reader compatibility for complex widgets.
