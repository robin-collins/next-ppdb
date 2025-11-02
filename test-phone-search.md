# Phone Search Debug

## Test Case 1: "8556234"
- Searched: `8556234`
- Found: Customer with `85562340`
- Result: ✅ WORKS (starts with match)

## Test Case 2: "047579573"  
- Searched: `047579573`
- Expected: Customer with `0475795732` in phone1 or phone2
- Result: ❌ NO RESULTS

### Possible Issues:

1. **Database formatting mismatch**
   - If DB has "0475 795 732" (with spaces)
   - Search for "047579573" won't match because we're comparing:
     - Query: "047579573"
     - DB value: "0475 795 732"
     - After normalization: "0475795732"
     - "0475795732".contains("047579573") = TRUE ✓
   
2. **The real problem**: Prisma query uses `contains` on DB field
   - Prisma query: `{ phone1: { contains: "047579573" } }`
   - This runs SQL: `phone1 LIKE '%047579573%'`
   - If DB has "0475 795 732", this won't match!
   - SQL would need to normalize: `REPLACE(REPLACE(phone1, ' ', ''), '-', '') LIKE '%047579573%'`

### Solution Needed:
We need to search for BOTH:
1. The original query (in case DB has no formatting)
2. Formatted variations (in case DB has common formatting patterns)

