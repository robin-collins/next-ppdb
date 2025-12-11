# Staff Workload Analytics Endpoint Specification

## 1. Endpoint Overview

**Endpoint**: `GET /api/analytics/staff-workload`

Provides unified workload analytics across four timeframes:

- **daily** → last **7 days**, per-day breakdown
- **weekly** → last **8 weeks**, per-week breakdown
- **monthly** → last **6 months**, per-month breakdown
- **yearly** → last **3 years**, per-year breakdown

The endpoint extends the existing staff workload logic (daily staff initials extraction and workload counting) into aggregated multi-period analytics.

---

## 2. Request Specification

### 2.1 Required Query Parameters

| Parameter | Type                                                  | Description                                                          |
| --------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| `period`  | string (`daily` \| `weekly` \| `monthly` \| `yearly`) | Determines the aggregation granularity.                              |
| `endDate` | string (ISO: `YYYY-MM-DD`)                            | Date picker value defining the inclusive end of the analytic window. |

### 2.2 Timezone Handling

All date calculations are performed in the **`Australia/Adelaide`** timezone (`TZ=Australia/Adelaide`).

- Input `endDate` is interpreted as a local date in Adelaide timezone
- All bucket boundaries are computed in Adelaide local time
- Response dates are formatted as ISO date strings (`YYYY-MM-DD`) representing Adelaide local dates

---

## 3. Date Range & Bucket Calculations

All ranges are inclusive of `endDate`.

### 3.1 Daily

- Range: `E - 6 days` → `E`
- Buckets: 7 buckets, each representing a single date.

### 3.2 Weekly

Weekly buckets are calculated backward from `endDate` in 7-day increments.

- Each bucket spans exactly 7 days
- 8 weekly buckets: `[E-55..E-49], [E-48..E-42], ..., [E-6..E]`
- No calendar week alignment required—buckets are relative to `endDate`
- Global range: `E - 55 days` → `E`

### 3.3 Monthly

- Identify the month containing `E`.
- Produce 6 monthly buckets: current month and previous 5.
- Current month is truncated at `E`.

### 3.4 Yearly

- Identify the year containing `E`.
- Produce 3 yearly buckets: current year and previous 2.
- Current year is truncated at `E`.

---

## 4. Data Selection & Filtering Logic

### 4.1 Base Daily Extraction Rules

For each date `d` within the global range:

1. Select animals where `animal.thisvisit = d`.
2. Select notes where `notes.date = d`.
3. Extract staff initials:
   - Must be alphabetic, length 2–3.
   - Use the last token unless it is a price token; if so, use the prior token.
   - Convert to uppercase.
   - Only count each `(animalId, initials)` once per date.

### 4.2 Visit Unit Definition

A visit unit is: `(animalId, date, staffInitials, breedName)`.

- Unique per animal per date per staff.
- Aggregations sum these visit units into buckets.

### 4.3 Bucket Assignment

Each unit is assigned to exactly one bucket based on its date.

- Daily → date matches bucket date
- Weekly → date falls within week range
- Monthly → date falls within month range
- Yearly → date falls within year range

### 4.4 Bucket Aggregation

Within each bucket:

- Group by `staffInitials`
- Group by `breedName`
- Metrics:
  - `breeds[breed]` = number of visit units
  - `totalAnimals` = sum of breed counts

---

## 5. Response Schema

Each response returns global metadata and an array of buckets.

### 5.1 High-Level Response Structure

```json
{
  "period": "weekly",
  "endDate": "2025-12-11",
  "globalRange": {
    "startDate": "2025-10-20",
    "endDate": "2025-12-11"
  },
  "buckets": [
    {
      "bucketKey": "2025-W50",
      "label": "Week of 2025-12-08",
      "startDate": "2025-12-08",
      "endDate": "2025-12-11",
      "staff": [
        {
          "initials": "HM",
          "breeds": {
            "Maltese": 6,
            "Poodle": 3
          },
          "totalAnimals": 9
        },
        {
          "initials": "CC",
          "breeds": {
            "Border Collie": 2
          },
          "totalAnimals": 2
        }
      ],
      "bucketTotals": {
        "totalAnimals": 11,
        "totalStaff": 2
      }
    }
  ]
}
```

### 5.2 Structural Requirements

- **`globalRange`**: Overall min/max dates.
- **`buckets`**: Variable count—empty buckets are **omitted** from the response.
  - Maximum buckets per period:
    - Daily: up to 7
    - Weekly: up to 8
    - Monthly: up to 6
    - Yearly: up to 3
  - A bucket with zero visit units is not included in the response array
- **Each bucket includes**:
  - `bucketKey` (stable identifier)
  - `label` (display-friendly string)
  - `startDate`, `endDate`
  - `staff[]` array (sorted by `totalAnimals` descending)
  - `bucketTotals` (required)

### 5.3 Staff Object

Each staff entry contains:

```json
{
  "initials": "HM",
  "breeds": {
    "Poodle": 3,
    "Maltese": 6
  },
  "totalAnimals": 9
}
```

---

## 6. Error Responses

### 6.1 Validation Errors (HTTP 400)

Returned when request parameters are invalid.

```json
{
  "error": "Invalid date format. Use YYYY-MM-DD",
  "code": "INVALID_DATE_FORMAT"
}
```

```json
{
  "error": "Invalid period. Use: daily, weekly, monthly, yearly",
  "code": "INVALID_PERIOD"
}
```

```json
{
  "error": "Missing required parameter: endDate",
  "code": "MISSING_PARAMETER"
}
```

### 6.2 Server Errors (HTTP 500)

Returned when an unexpected error occurs during processing.

```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

### 6.3 Rate Limiting (HTTP 429)

Returned when request rate exceeds limits.

```json
{
  "error": "Too many requests. Please try again later.",
  "code": "RATE_LIMITED",
  "retryAfter": 60
}
```

---

## 7. Dashboard Compatibility

- `bucketKey` & `label` allow direct chart axis binding.
- Same schema across all periods → one unified front-end renderer.
- Daily results remain 100% backward-compatible with the existing workload logic.
- Empty buckets are omitted, so frontend should handle sparse bucket arrays.

---

## 8. Performance Considerations

### 8.1 Query Load by Period

| Period  | Max Days Queried | Estimated Records  | Risk Level   |
| ------- | ---------------- | ------------------ | ------------ |
| Daily   | 7                | Low (~50-100)      | Low          |
| Weekly  | 56               | Medium (~400-800)  | Medium       |
| Monthly | ~180             | High (~1000-2000)  | High         |
| Yearly  | ~1095            | Very High (~5000+) | **Critical** |

### 8.2 Recommended Optimizations

1. **Database Indexing**
   - Add composite index on `(thisvisit, date)` for efficient date range queries
   - Ensure `animal.thisvisit` and `notes.date` columns are indexed

2. **Phased Implementation**
   - **Phase 1**: Implement Daily + Weekly views (low complexity, acceptable query load)
   - **Phase 2**: Add Monthly view with query optimization
   - **Phase 3**: Add Yearly view with caching layer

3. **Caching Strategy**
   - Consider Redis caching for monthly/yearly aggregations
   - Cache key format: `staff-workload:{period}:{endDate}`
   - TTL: 1 hour for monthly, 24 hours for yearly
   - Invalidate on new note creation for affected date ranges

4. **Query Optimization**
   - Use database-level aggregation where possible
   - Consider materialized views for yearly summaries
   - Implement request timeout (30s) for long-running queries

### 8.3 Rate Limiting

Apply stricter rate limits for heavier periods:

| Period  | Rate Limit |
| ------- | ---------- |
| Daily   | 60 req/min |
| Weekly  | 30 req/min |
| Monthly | 10 req/min |
| Yearly  | 5 req/min  |

---

## 9. Summary

This endpoint delivers a consistent, multi‑period analytics structure built on top of the existing daily workload extraction rules, with defined bucket ranges, deterministic aggregation, and clean JSON schemas suitable for front-end visualization.

Key design decisions:

- **Timezone**: All operations in `Australia/Adelaide`
- **Empty buckets**: Omitted from response
- **Staff sorting**: By `totalAnimals` descending within each bucket
- **Bucket calculation**: Relative to `endDate`, no calendar alignment required
- **Performance**: Phased implementation with caching for monthly/yearly views
