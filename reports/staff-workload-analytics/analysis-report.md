# Staff Workload Analytics Endpoint - Analysis Report

**Date:** 2025-12-11  
**Document Analyzed:** [STAFF_WORKLOAD_ANALYTICS_ENDPOINT.md](file:///home/tech/projects/next-ppdb/STAFF_WORKLOAD_ANALYTICS_ENDPOINT.md)  
**Related:** [STAFF_WORKLOAD_UPDATE.md](file:///home/tech/projects/next-ppdb/STAFF_WORKLOAD_UPDATE.md)

---

## Executive Summary

The proposed `GET /api/analytics/staff-workload` endpoint extends the recently implemented daily staff workload functionality into a multi-period analytics system. This is a **well-structured specification** that leverages existing business logic while adding temporal aggregation capabilities suitable for dashboard visualization.

| Aspect                    | Assessment                                                 |
| ------------------------- | ---------------------------------------------------------- |
| **Technical Feasibility** | ✅ High - Reuses proven extraction logic                   |
| **Schema Design**         | ✅ Excellent - Unified structure across all periods        |
| **Complexity**            | ⚡ Medium - Date bucketing requires careful implementation |
| **Effort Estimate**       | ~2-3 days development + testing                            |

---

## 1. Alignment with Existing Implementation

### 1.1 Existing Components

The current codebase already implements:

| Component                 | Location                                                                                                   | Status            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------- |
| Staff initials extraction | [notes.service.ts](file:///home/tech/projects/next-ppdb/src/services/notes.service.ts#L49-90)              | ✅ Complete       |
| Daily staff summary API   | [route.ts](file:///home/tech/projects/next-ppdb/src/app/api/reports/staff-summary/route.ts)                | ✅ Complete       |
| Staff workload UI card    | [StaffWorkloadCard.tsx](file:///home/tech/projects/next-ppdb/src/components/reports/StaffWorkloadCard.tsx) | ✅ Complete       |
| Unit tests                | [notes.service.test.ts](file:///home/tech/projects/next-ppdb/src/__tests__/services/notes.service.test.ts) | ✅ 30+ test cases |

### 1.2 Compatibility Assessment

The proposed analytics endpoint is **fully backward-compatible**:

- ✅ Reuses `extractStaffInitials()` function unchanged
- ✅ Same data selection rules (`animal.thisvisit` + `notes.date` matching)
- ✅ Same visit unit definition: `(animalId, date, staffInitials, breedName)`
- ✅ Same counting rule: each animal counted once per staff per date

> [!TIP]
> The existing `GET /api/reports/staff-summary` endpoint essentially provides the same output as a single "daily" bucket from the proposed analytics endpoint. Consider refactoring to use shared aggregation logic.

---

## 2. Specification Quality Assessment

### 2.1 Strengths

1. **Clear temporal granularity**: Fixed bucket counts (7/8/6/3) provide predictable response structure
2. **Inclusive date handling**: `endDate` is always included in the range
3. **Deterministic bucketing**: Each visit unit maps to exactly one bucket
4. **Dashboard-ready schema**: `bucketKey` and `label` enable direct chart binding
5. **Unified response structure**: Same schema across all periods simplifies frontend code

### 2.2 Clarifications Resolved ✅

The following items have been clarified and documented in the updated specification:

| Item                         | Resolution                                                                                           | Spec Section |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- | ------------ |
| **Week boundaries**          | Not needed—buckets are calculated backward from `endDate` in 7-day increments, no calendar alignment | §3.2         |
| **Timezone handling**        | All operations in `Australia/Adelaide` timezone                                                      | §2.2         |
| **Empty bucket handling**    | Empty buckets are **omitted** from the response                                                      | §5.2         |
| **Error response schemas**   | 400/429/500 responses defined with error codes                                                       | §6           |
| **Staff sorting**            | By `totalAnimals` descending within each bucket                                                      | §5.2         |
| **Rate limiting**            | Tiered limits by period (60/30/10/5 req/min)                                                         | §8.3         |
| **Caching strategy**         | Redis caching for monthly/yearly with TTL guidance                                                   | §8.2         |
| **Performance optimization** | Phased implementation with indexing recommendations                                                  | §8           |

---

## 3. Implementation Impact Analysis

### 3.1 New Components Required

```
src/
├── app/api/analytics/
│   └── staff-workload/
│       └── route.ts              [NEW] - Main endpoint handler
├── services/
│   └── staffWorkloadAnalytics.service.ts  [NEW] - Aggregation logic
├── lib/
│   └── dateUtils.ts              [MODIFY] - Add bucket calculation helpers
└── __tests__/
    └── services/
        └── staffWorkloadAnalytics.service.test.ts  [NEW]
```

### 3.2 Database Query Considerations

The current daily endpoint executes:

```sql
SELECT animals.*, breeds.breedname, notes.*
FROM animals
JOIN breeds ON ...
JOIN notes ON ...
WHERE animals.thisvisit BETWEEN start AND end
  AND notes.date BETWEEN start AND end
```

For the analytics endpoint with larger date ranges:

| Period  | Max Days | Query Impact                                               |
| ------- | -------- | ---------------------------------------------------------- |
| Daily   | 7        | Low - similar to current                                   |
| Weekly  | 56       | Medium - 8x current load                                   |
| Monthly | ~180     | High - may need query optimization                         |
| Yearly  | ~1095    | **Critical** - requires indexed queries or pre-aggregation |

> [!CAUTION]
> **Performance Risk**: The yearly view (3 years of data) could return thousands of records. Consider:
>
> 1. Adding database index on `(thisvisit, date)` composite
> 2. Implementing server-side pagination or streaming
> 3. Pre-computing monthly/yearly summaries via scheduled jobs

### 3.3 Reusability Opportunity

The existing daily endpoint logic can be refactored into a shared service:

```typescript
// Proposed shared function
async function aggregateStaffWorkload(
  startDate: Date,
  endDate: Date
): Promise<Map<string, VisitUnit[]>>
```

This would allow both endpoints to share the same data selection and extraction logic.

---

## 4. Response Schema Validation

### 4.1 Schema Correctness

The proposed response structure is well-designed:

```typescript
interface AnalyticsResponse {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  endDate: string // ISO date
  globalRange: {
    startDate: string
    endDate: string
  }
  buckets: Bucket[]
}

interface Bucket {
  bucketKey: string // e.g., "2025-W50", "2025-12", "2025"
  label: string // Human-readable display text
  startDate: string
  endDate: string
  staff: StaffSummary[] // Reuses existing interface
  bucketTotals: {
    totalAnimals: number
    totalStaff: number
  }
}
```

### 4.2 Schema Issues

| Field          | Issue                                         | Recommendation                                                                               |
| -------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `bucketKey`    | Format varies by period (W50 vs 12 vs 2025)   | Consider standardized format with prefix: `D:2025-12-11`, `W:2025-50`, `M:2025-12`, `Y:2025` |
| `bucketTotals` | Marked as "optional" but useful for all cases | Make required for consistency                                                                |

---

## 5. Implementation Recommendations

### 5.1 Phased Approach

| Phase       | Scope                 | Priority                   |
| ----------- | --------------------- | -------------------------- |
| **Phase 1** | Daily + Weekly views  | P1 - Low complexity        |
| **Phase 2** | Monthly view          | P2 - Medium complexity     |
| **Phase 3** | Yearly view + caching | P3 - Requires optimization |

### 5.2 Date Utility Functions Needed

```typescript
// New date utilities to implement
function getWeekBoundaries(date: Date): { start: Date; end: Date }
function getMonthBoundaries(date: Date): { start: Date; end: Date }
function getYearBoundaries(date: Date): { start: Date; end: Date }
function generateBuckets(period: Period, endDate: Date): BucketRange[]
function assignToBucket(visitDate: Date, buckets: BucketRange[]): number
```

### 5.3 Testing Strategy

1. **Unit tests**: Date bucketing logic, edge cases (leap years, DST transitions)
2. **Integration tests**: Full pipeline with mock database
3. **Performance tests**: Yearly query with 1000+ records
4. **Regression tests**: Ensure daily output matches existing endpoint

---

## 6. Risk Assessment

| Risk                             | Likelihood | Impact | Mitigation                  |
| -------------------------------- | ---------- | ------ | --------------------------- |
| Query performance on yearly view | High       | High   | Phase 3 with caching        |
| Timezone inconsistencies         | Medium     | Medium | Explicit UTC+10:30 handling |
| Week boundary edge cases         | Medium     | Low    | Comprehensive unit tests    |
| Breaking existing daily endpoint | Low        | High   | Shared service refactor     |

---

## 7. Verdict

The specification is **complete and implementation-ready**. All clarifications have been addressed:

> [!NOTE]
> **What was updated in the specification:**
>
> - §2.2: Timezone handling (`Australia/Adelaide`)
> - §3.2: Week bucket calculation (relative to `endDate`, no calendar alignment)
> - §5.2: Empty buckets omitted, staff sorted by `totalAnimals` descending
> - §6: Full error response schemas (400/429/500)
> - §8: Performance considerations with phased implementation and caching strategy

**Overall Assessment:** ✅ **Approved for implementation**

---

## Appendix: Bucket Calculation Examples

### Daily (7 buckets, endDate = 2025-12-11)

| Bucket | Start      | End        |
| ------ | ---------- | ---------- |
| 1      | 2025-12-05 | 2025-12-05 |
| 2      | 2025-12-06 | 2025-12-06 |
| ...    | ...        | ...        |
| 7      | 2025-12-11 | 2025-12-11 |

### Weekly (8 buckets, endDate = 2025-12-11, Monday start)

| Bucket | Key      | Start      | End          |
| ------ | -------- | ---------- | ------------ |
| 1      | 2025-W43 | 2025-10-20 | 2025-10-26   |
| 2      | 2025-W44 | 2025-10-27 | 2025-11-02   |
| ...    | ...      | ...        | ...          |
| 8      | 2025-W50 | 2025-12-08 | 2025-12-11\* |

\*Truncated to endDate

### Monthly (6 buckets, endDate = 2025-12-11)

| Bucket | Key     | Start      | End          |
| ------ | ------- | ---------- | ------------ |
| 1      | 2025-07 | 2025-07-01 | 2025-07-31   |
| ...    | ...     | ...        | ...          |
| 6      | 2025-12 | 2025-12-01 | 2025-12-11\* |

\*Truncated to endDate
