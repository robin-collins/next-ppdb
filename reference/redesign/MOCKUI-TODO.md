# MOCK UI pages still needing to be created.

## Customer Management

- [x] Add Customer Page (✅ Implemented at `/customers/add`) - Form with fields: Firstname, Surname, Address, Suburb, Postcode, Phone1, Phone2, Phone3, Email - "Insert Record" action button - Reference: 04-add-customer-form.md - Implementation: `src/app/customers/add/page.tsx`
- [ ] Customer Detail Page (mockui-customer-detail.html) - Two-column layout (customer info + animals) - Editable customer information form - List of associated animals with mini-cards - "Add Animal" button - "Update Record" and "DELETE CUSTOMER" actions - Reference: 12-individual-customer-records.md
- [ ] Customer History Page (mockui-customer-history.html) - Table displaying old/historical customers - Columns: Name, Address, Phone, Animal, Last Visit - Searchable/filterable historical records - Reference: 07-old-customers.md

  Animal Management

- [ ] Animal Detail Page (mockui-animal-detail.html) - Two-column layout (main column + sidebar column) - Main column: Animal details form (Name, Breed dropdown, Sex, Colour, Cost, Last Visit, This Visit, Comments) - Sidebar: Service history with add/delete notes functionality - Link to customer record - "Update Record" and "Change Dates" actions - Reference: 10-individual-animal-records.md
- [ ] Add Animal Page (mockui-add-animal.html) - Context-aware form (shows customer info at top) - Form fields: Animal Name, Breed dropdown, Sex, Colour, Cost, Last Visit, This Visit, Comments - Pre-populated with smart defaults (breed-based cost) - Calendar popups for date fields - Reference: 13-add-animal-form.md
- [ ] Complete Service History Page (mockui-service-history.html) - Full chronological list of all service notes for one animal - Header with animal identification - "Back to Animal Info Page" link - Displays date + service details for each entry - Reference: 11-complete-service-history.md

## Breed Management

- [ ] Breed Management Page (mockui-breed-management.html) - Dual functionality: Add new breed + Edit existing breeds - Top section: Add new breed form (Breed, Avg. Time, Avg. Cost, Insert Record button) - Bottom section: Table of all breeds (200+ entries) with inline edit - Each row: Breed (editable), Time (editable), Cost (editable), Update button, Delete button - Reference: 05-add-breed-management.md

## Analytics & Reports

- [ ] Daily Totals/Analytics Page (mockui-daily-totals.html) - Dashboard displaying current date/time - Total animals processed today - Total revenue for today - Potential expansion: charts, weekly/monthly views - Reference: 06-daily-totals.md

## System Features

- [ ] Backup Data Page (mockui-backup-data.html) - One-click backup functionality - Status display showing backup progress - File information (filename, size) - "Finished" acknowledgment button - Reference: 08-backup-data.md
