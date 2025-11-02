# Search Page Documentation (search.php)

## Page URL

`http://10.10.10.44/ppdb/search.php`
![[search-page.png]]

## Page Title

"Search for RECORD"
![[search-results-cody.png]]

![[search-results-breed-corgi.png]]

## Layout Structure

This page serves as the top frame/header of the application containing navigation and search functionality.

### Navigation Buttons (Top Row)

Four main navigation buttons arranged horizontally:

1. **Add Customer** - Blue button for adding new customer records
2. **Add Breed** - Blue button for adding new breed types
3. **Daily Totals** - Blue button for viewing daily totals/reports
4. **Old Customers** - Blue button for accessing historical customer records

### Additional Elements (Top Right)

- **Backup Data** - Text link (appears to link to backup-data.php)
- **Date Display** - Shows current date: "July 31, 2025"

### Search Form Section

Second row contains the search interface:

#### Search Fields

Three input text boxes for filtering records:

- **ANIMAL NAME** - Left field for searching by pet name
- **BREED** - Center field for searching by breed type
- **SURNAME** - Right field for searching by customer surname

#### Search Actions

Two buttons for search operations:

- **Find Animal** - Executes the search with entered criteria
- **CLEAR** - Clears all search fields

### Footer

- Copyright notice: "DSLIP © 2001" (appears to be different from main page copyright)

## Technical Notes

- This page functions as the top frame in a frameset layout
- Blue color scheme consistent with main application
- Simple table-based layout typical of early 2000s web design
- No scrolling allowed (scrolling="NO" in frameset)

## Screenshots

- Search page: `screenshots/search-page.png`

## Interactive Elements

All navigation buttons and search functionality are clickable and functional within this frame.
