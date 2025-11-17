# Mock UI Validation — Customers History

- Live URL: http://localhost:3000/customers/history
- Mock reference: reference/redesign/mockui-customer-history.html
- Method: Followed MOCKUI_ANALYSIS.md phases (visual, structure, computed styles, spacing, interactive)

## Matches (MVP)

- Filters: 12/24/36 period select + free-text search present and functional
- Stats Bar: shows total and oldest visit summary
- Table: columns (Surname, Firstname, Latest Visit, Months Since, Email, Phone); sorted by surname
- CSR data flow: fetches /api/customers/history with months and q; error and loading states surfaced
- Navigation: Breadcrumbs added (Home > Customers > History)

## Gaps

- P1: Sticky header for the table not implemented (mock shows sticky table header)
- P2: Inactivity visual badges (e.g., 12+/24+/36+) not rendered; plain numeric values shown
- P2: Minor spacing/typography polish (apply tokens for header/table spacing per STYLE_GUIDE.md)

## Next Steps

- Implement sticky table header (position: sticky; top aligned to header height)
- Add small badge component for “Months Since” with color coding by threshold
- Apply spacing tokens (--space-6, --space-8) to card/table sections for visual parity
