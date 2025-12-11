# API Routes Reference

## Customers

| Endpoint                            | Method | Description                 | Response            |
| ----------------------------------- | ------ | --------------------------- | ------------------- |
| `/api/customers`                    | GET    | Search/list customers       | `Customer[]`        |
| `/api/customers`                    | POST   | Create new customer         | `Customer`          |
| `/api/customers/[id]`               | GET    | Get customer by ID          | `Customer`          |
| `/api/customers/[id]`               | PUT    | Update customer             | `Customer`          |
| `/api/customers/[id]`               | DELETE | Delete customer             | `{ success: true }` |
| `/api/customers/[id]/animals/count` | GET    | Get customer's animal count | `{ count: number }` |
| `/api/customers/history`            | GET    | Customer history data       | `History[]`         |

## Animals

| Endpoint                        | Method | Description             | Response            |
| ------------------------------- | ------ | ----------------------- | ------------------- |
| `/api/animals`                  | GET    | Search/list animals     | `Animal[]`          |
| `/api/animals`                  | POST   | Create new animal       | `Animal`            |
| `/api/animals/[id]`             | GET    | Get animal by ID        | `Animal`            |
| `/api/animals/[id]`             | PUT    | Update animal           | `Animal`            |
| `/api/animals/[id]`             | DELETE | Delete animal           | `{ success: true }` |
| `/api/animals/[id]/notes`       | GET    | List animal's notes     | `Note[]`            |
| `/api/animals/[id]/notes`       | POST   | Create note for animal  | `Note`              |
| `/api/animals/[id]/notes/count` | GET    | Get animal's note count | `{ count: number }` |

## Breeds

| Endpoint                         | Method | Description              | Response            |
| -------------------------------- | ------ | ------------------------ | ------------------- |
| `/api/breeds`                    | GET    | List all breeds          | `Breed[]`           |
| `/api/breeds`                    | POST   | Create new breed         | `Breed`             |
| `/api/breeds/[id]`               | GET    | Get breed by ID          | `Breed`             |
| `/api/breeds/[id]`               | PUT    | Update breed             | `Breed`             |
| `/api/breeds/[id]`               | DELETE | Delete breed             | `{ success: true }` |
| `/api/breeds/[id]/animals/count` | GET    | Get breed's animal count | `{ count: number }` |
| `/api/breeds/pricing`            | POST   | Bulk update pricing      | `UpdateSummary`     |

## Notes

| Endpoint              | Method | Description    | Response            |
| --------------------- | ------ | -------------- | ------------------- |
| `/api/notes/[noteId]` | GET    | Get note by ID | `Note`              |
| `/api/notes/[noteId]` | PUT    | Update note    | `Note`              |
| `/api/notes/[noteId]` | DELETE | Delete note    | `{ success: true }` |

## Reports

| Endpoint                     | Method | Description         | Response             |
| ---------------------------- | ------ | ------------------- | -------------------- |
| `/api/reports/daily-totals`  | GET    | Daily totals report | `DailyTotalsReport`  |
| `/api/reports/analytics`     | GET    | Analytics report    | `AnalyticsReport`    |
| `/api/reports/staff-summary` | GET    | Staff work summary  | `StaffSummaryReport` |

## Admin

| Endpoint                                | Method | Description            | Response          |
| --------------------------------------- | ------ | ---------------------- | ----------------- |
| `/api/admin/backup`                     | GET    | List available backups | `BackupList`      |
| `/api/admin/backup`                     | POST   | Create new backup      | `BackupResult`    |
| `/api/admin/backup/download/[filename]` | GET    | Download backup file   | `application/zip` |

## Health

| Endpoint      | Method | Description          | Response       |
| ------------- | ------ | -------------------- | -------------- |
| `/api/health` | GET    | Get health status    | `HealthStatus` |
| `/api/health` | POST   | Refresh health cache | `HealthStatus` |

## Setup

| Endpoint            | Method | Description              | Response            |
| ------------------- | ------ | ------------------------ | ------------------- |
| `/api/setup/upload` | POST   | Upload backup for import | `UploadResponse`    |
| `/api/setup/import` | GET    | SSE stream for import    | `text/event-stream` |

---

**Total: 35 operations across 21 endpoints**

See `/api/docs` for interactive Swagger UI documentation.
See `/api/docs/openapi.json` for the OpenAPI 3.0.3 specification.
