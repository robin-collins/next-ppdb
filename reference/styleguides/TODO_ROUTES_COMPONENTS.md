- [x] Landing + Search | Page | src/app/page.tsx - App shell with Header, Sidebar, unified search, and results grid/list.
- [x] Customer Detail | Page | src/app/customer/[id]/page.tsx - View/update/delete customer details with associated animals.
- [x] Add Customer | Page | src/app/customers/add/page.tsx - Create a new customer using validated form and redirect on success.
- [ ] Customers History | Page | src/app/customers/history/page.tsx - List inactive customers by 12+/24+/36+ months with search and stats.
- [ ] Animal Detail | Page | src/app/animals/[id]/page.tsx - Animal details with service notes timeline (list/create/delete).
- [ ] Add Animal (optional) | Page | src/app/animals/new/page.tsx - Create a new animal for an existing customer (via query param).
- [ ] Breeds Management | Page | src/app/breeds/page.tsx - List/create/update/delete breeds with inline editable table.
- [ ] Daily Totals | Page | src/app/reports/daily-totals/page.tsx - Show today's animal count and revenue totals.
- [ ] Backup (optional) | Page | src/app/admin/backup/page.tsx - Trigger or download a database backup archive.

- [x] Animals Search/List | API | src/app/api/animals/route.ts - GET /api/animals unified search with relevance scoring and pagination.
- [x] Create Animal | API | src/app/api/animals/route.ts - POST /api/animals to create new animal (maps API to DB fields).
- [x] Get Animal by ID | API | src/app/api/animals/[id]/route.ts - GET /api/animals/[id] returns animal with customer, breed, notes.
- [x] Update Animal | API | src/app/api/animals/[id]/route.ts - PUT /api/animals/[id] updates animal fields.
- [ ] Delete Animal | API | src/app/api/animals/[id]/route.ts - DELETE /api/animals/[id] removes animal (parity with legacy).
- [ ] Add Service Note | API | src/app/api/animals/[id]/notes/route.ts - POST to add service note for an animal.
- [ ] Delete Service Note | API | src/app/api/notes/[noteId]/route.ts - DELETE to remove a specific note.

- [x] Customers Search/List | API | src/app/api/customers/route.ts - GET /api/customers with relevance and included animals.
- [x] Create Customer | API | src/app/api/customers/route.ts - POST /api/customers with Zod validation and phone normalization.
- [x] Get Customer by ID | API | src/app/api/customers/[id]/route.ts - GET /api/customers/[id] with animal list and breed info.
- [x] Update Customer | API | src/app/api/customers/[id]/route.ts - PUT /api/customers/[id] updates details.
- [x] Delete Customer | API | src/app/api/customers/[id]/route.ts - DELETE /api/customers/[id] (blocked if animals exist).

- [ ] Customers History | API | src/app/api/customers/history/route.ts - GET /api/customers/history?months=&q= for inactive customers.
- [ ] List Breeds | API | src/app/api/breeds/route.ts - GET /api/breeds returns all breeds, sorted by name.
- [ ] Create Breed | API | src/app/api/breeds/route.ts - POST /api/breeds to add a new breed.
- [ ] Update Breed | API | src/app/api/breeds/[id]/route.ts - PUT /api/breeds/[id] updates name/avgtime/avgcost.
- [ ] Delete Breed | API | src/app/api/breeds/[id]/route.ts - DELETE /api/breeds/[id] removes a breed (respect FKs).

- [ ] Daily Totals | API | src/app/api/reports/daily-totals/route.ts - GET returns { dateTime, totalAnimalsToday, totalRevenueToday }.
- [ ] Backup (optional) | API | src/app/api/admin/backup/route.ts - GET returns/streams a backup archive (stub acceptable for MVP).

- [x] Header | Component | src/components/Header.tsx - App header with search input, date/time, and actions.
- [x] Sidebar | Component | src/components/Sidebar.tsx - Collapsible/resizable sidebar with pin/unpin and navigation.
- [x] EmptyState | Component | src/components/EmptyState.tsx - Landing empty state with suggestion chips.
- [x] ResultsView | Component | src/components/ResultsView.tsx - Results container with grid/list toggle and animations.
- [x] AnimalCard | Component | src/components/AnimalCard.tsx - Animal summary card/list row with relevance score.

- [x] CustomerHeader | Component | src/components/customer/CustomerHeader.tsx - Customer page header with actions.
- [x] CustomerInfoCard | Component | src/components/customer/CustomerInfoCard.tsx - Editable customer information card.
- [x] AssociatedAnimalsCard | Component | src/components/customer/AssociatedAnimalsCard.tsx - Customer’s animals list with actions.
- [x] ContactDetailsCard | Component | src/components/customer/ContactDetailsCard.tsx - Contact info card (sidebar).
- [x] CustomerStatsCard | Component | src/components/customer/CustomerStatsCard.tsx - Stats card (sidebar).
- [x] QuickActionsCard | Component | src/components/customer/QuickActionsCard.tsx - Quick actions for customer context.

- [ ] HistoryFilters | Component | src/components/customerHistory/HistoryFilters.tsx - Period select and search bar for history page.
- [ ] CustomerHistoryTable | Component | src/components/customerHistory/CustomerHistoryTable.tsx - Sticky header table of inactive customers with badges.
- [ ] StatsBar | Component | src/components/customerHistory/StatsBar.tsx - Totals and oldest-visit summary for history page.
- [ ] AnimalHeader | Component | src/components/animals/AnimalHeader.tsx - Owner summary and navigation to customer page.
- [ ] AnimalInfoCard | Component | src/components/animals/AnimalInfoCard.tsx - Editable animal details (name/breed/sex/colour/cost/dates/comments).
- [ ] ServiceNotesCard | Component | src/components/animals/ServiceNotesCard.tsx - Note editor and timeline with per-item delete.

- [ ] BreedForm | Component | src/components/breeds/BreedForm.tsx - Add new breed (name, avgtime, avgcost) form.
- [ ] BreedTable | Component | src/components/breeds/BreedTable.tsx - Editable table of breeds with per-row update/delete.

- [ ] DailyTotalsCard | Component | src/components/reports/DailyTotalsCard.tsx - Displays today’s totals (count and revenue).

## Potential / MVP Consideration

- [ ] Sort Menu | Component | src/components/SortMenu.tsx - Sorting (relevance/surname/last visit) on results.
- [ ] Filter Chips | Component | src/components/FilterChips.tsx - Quick filters for sex, breed, has-notes, etc.
- [ ] Pagination UI | Component | src/components/Pagination.tsx - Page numbers and next/prev controls.
- [ ] Relevance Badge Toggle | Component | src/components/Badge.tsx - Show/hide relevance score badge.
- [ ] Results Skeletons | Component | src/components/LoadingState.tsx - Loading placeholders for results grid/list.

- [ ] Breadcrumbs | Component | src/components/Breadcrumbs.tsx - Page breadcrumbs across app.
- [ ] Avatar | Component | src/components/Avatar.tsx - Initials or photo for customer.
- [ ] Status Badge | Component | src/components/Badge.tsx - Active/Inactive customer indicator.
- [ ] Toast/Notifications | Component | src/components/Toast.tsx - Save/update success feedback.
- [ ] Confirm Dialog | Component | src/components/ConfirmDialog.tsx - Confirm destructive actions like delete.

- [ ] Customer History | Page | src/app/customers/[id]/history/page.tsx - Historical view of customer interactions.

- [ ] All Notes View | Page | src/app/animals/[id]/history/page.tsx - Full service notes timeline page for an animal.
- [ ] Date Picker | Component | src/components/DatePicker.tsx - Used by visits and reports.
- [ ] Note Tags | Component | src/components/NoteTags.tsx - Technician codes and preset note snippets.

- [ ] Breeds Table Enhancements | Enhancement | src/components/breeds/BreedTable.tsx - Column sort/search and inline validation.
- [ ] Breeds Bulk Actions | Enhancement | src/components/breeds/BreedTable.tsx - Optional bulk update/delete flows.

- [ ] Reports Date Selector | Component | src/components/reports/DateSelector.tsx - Switch day for totals report.
- [ ] Reports Actions | Component | src/components/reports/ReportActions.tsx - Export/print report controls.

- [ ] Enhanced Empty States | Enhancement | src/components/EmptyState.tsx - Mascot variations and contextual tips.

- [ ] Customer Context Strip | Component | src/components/animals/CustomerContext.tsx - Avatar, customer name, phone on add/edit animal pages.
- [ ] Breed Pricing Autofill | Enhancement | src/components/animals/AnimalInfoCard.tsx - Auto-adjust cost when breed changes.
- [ ] Back to Search CTA | Enhancement | src/app/animals/[id]/page.tsx - Navigate back to search results.
- [ ] View Customer CTA | Enhancement | src/app/animals/[id]/page.tsx - Quick link to customer page.
- [ ] Change Dates Action | Enhancement | src/components/animals/AnimalInfoCard.tsx - Specialized date management flow.
- [ ] Breed Search Input | Component | src/components/breeds/BreedSearch.tsx - Search field for breeds table.
- [ ] Breed Category Filters | Component | src/components/breeds/BreedFilters.tsx - All/Dogs/Cats/Other filter buttons.
- [ ] Breed Table Pagination | Component | src/components/breeds/BreedTable.tsx - Footer pagination controls and info.
- [ ] Breeds Keyboard Shortcuts | Enhancement | src/app/breeds/page.tsx - Ctrl/Cmd+F search, Ctrl/Cmd+N new breed.
- [ ] Reports Stats Card | Component | src/components/reports/StatsCard.tsx - KPI cards (date/time, totals, revenue).
- [ ] Reports Period Toggle | Component | src/components/reports/PeriodToggle.tsx - Daily/Weekly/Monthly toggle.
- [ ] Reports Chart Card | Component | src/components/reports/ChartCard.tsx - Chart wrapper for revenue/animals trends.
- [ ] Reports Trends Table | Component | src/components/reports/TrendsTable.tsx - Last 7 days summary with trend indicators.
