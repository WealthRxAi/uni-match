Read CLAUDE.md. Add the FilterBar and finish the product.

1. FilterBar: country multi-select (searchable dropdown listing only countries present in data), region quick chips, "Max tuition / year" slider, "Max total cost / year" slider (tuition+living), and a "Show reach schools" toggle. Filters apply live via useMemo — no page reload.
2. Currency formatting ($12,300) and a compact "≈ total / yr" line on every card.
3. Sort control: Best match (default), Lowest total cost, Ranking.
4. Empty-results state with a "Relax filters" reset button.
5. Mobile: filters collapse into a bottom sheet toggled by a "Filters" button with an active-filter count badge.
6. Polish pass: hover states, focus rings, subtle card entrance animation, print-friendly light @media print styles.
7. `npm run build` and `npm run test` must pass.
