---

Complete API Endpoint Documentation

Summary

Total Routes: 21 files, 36 endpoints across 7 resource categories

---

Animals API

| Endpoint                      | Method | Description                                   |
| ----------------------------- | ------ | --------------------------------------------- |
| /api/animals                  | GET    | Search animals with relevance-ranked results  |
| /api/animals                  | POST   | Create a new animal record                    |
| /api/animals/[id]             | GET    | Get single animal with customer, breed, notes |
| /api/animals/[id]             | PUT    | Update animal fields                          |
| /api/animals/[id]             | DELETE | Delete animal and cascade delete notes        |
| /api/animals/[id]/notes       | GET    | List animal's service notes (desc by date)    |
| /api/animals/[id]/notes       | POST   | Create service note (auto-appends cost)       |
| /api/animals/[id]/notes/count | GET    | Get count of notes for animal                 |

GET /api/animals Query Parameters

| Param | Type   | Default   | Description                                        |
| ----- | ------ | --------- | -------------------------------------------------- |
| q     | string | ""        | Search query (name, breed, customer, phone, email) |
| page  | int    | 1         | Page number                                        |
| limit | int    | 20        | Items per page                                     |
| sort  | string | relevance | Sort by: relevance, customer, animal, lastVisit    |
| order | string | desc      | Order: asc, desc                                   |

---

Customers API

| Endpoint                          | Method | Description                                    |
| --------------------------------- | ------ | ---------------------------------------------- |
| /api/customers                    | GET    | Search/list customers with pagination          |
| /api/customers                    | POST   | Create new customer                            |
| /api/customers/[id]               | GET    | Get customer with animals and note stats       |
| /api/customers/[id]               | PUT    | Update customer fields                         |
| /api/customers/[id]               | DELETE | Delete customer with optional animal migration |
| /api/customers/[id]/animals/count | GET    | Get count of customer's animals                |
| /api/customers/history            | GET    | Get inactive customers with visit history      |

GET /api/customers Query Parameters

| Param | Type   | Default | Description              |
| ----- | ------ | ------- | ------------------------ |
| q     | string | ""      | Search query             |
| page  | int    | 1       | Page number              |
| limit | int    | 20      | Items per page (max 100) |

GET /api/customers/history Query Parameters

| Param  | Type   | Default | Description                      |
| ------ | ------ | ------- | -------------------------------- |
| months | int    | 12      | Inactivity period: 12, 24, or 36 |
| q      | string | ""      | Search filter                    |
| page   | int    | 1       | Page number                      |
| limit  | int    | 25      | Items per page (max 100)         |

DELETE /api/customers/[id] Request Body (optional)

{
"migrateToCustomerId": 123,
"animalIds": [1, 2, 3],
"deleteAnimals": true
}

---

Breeds API

| Endpoint                       | Method | Description                                 |
| ------------------------------ | ------ | ------------------------------------------- |
| /api/breeds                    | GET    | List all breeds (sorted alphabetically)     |
| /api/breeds                    | POST   | Create new breed (duplicate check)          |
| /api/breeds/[id]               | GET    | Get breed by ID                             |
| /api/breeds/[id]               | PUT    | Update breed name/avgtime/avgcost           |
| /api/breeds/[id]               | DELETE | Delete breed (with animal migration option) |
| /api/breeds/[id]/animals/count | GET    | Get count of animals using breed            |
| /api/breeds/pricing            | POST   | Bulk pricing update for breeds & animals    |

POST /api/breeds/pricing Request Body

{
"breedId": 1, // Optional: specific breed, or all if omitted
"adjustmentType": "fixed", // "fixed" or "percentage"
"adjustmentValue": 5 // Dollar amount or percentage
}

---

Notes API

| Endpoint            | Method | Description              |
| ------------------- | ------ | ------------------------ |
| /api/notes/[noteId] | GET    | Get note by ID           |
| /api/notes/[noteId] | PUT    | Update note content/date |
| /api/notes/[noteId] | DELETE | Delete note              |

PUT /api/notes/[noteId] Request Body

{
"serviceDetails": "Updated note text",
"serviceDate": "2024-01-15T10:00:00Z"
}

---

Reports API

| Endpoint                  | Method | Description                  |
| ------------------------- | ------ | ---------------------------- |
| /api/reports/daily-totals | GET    | Daily revenue & visit report |
| /api/reports/analytics    | GET    | Time-series analytics data   |

GET /api/reports/daily-totals Query Parameters

| Param | Type   | Default | Description               |
| ----- | ------ | ------- | ------------------------- |
| date  | string | today   | Date in YYYY-MM-DD format |

GET /api/reports/analytics Query Parameters

| Param   | Type   | Required | Description                                        |
| ------- | ------ | -------- | -------------------------------------------------- |
| period  | enum   | Yes      | daily (7d), weekly (8w), monthly (6m), yearly (3y) |
| endDate | string | Yes      | End date YYYY-MM-DD                                |

---

Admin API

| Endpoint                              | Method | Description                      |
| ------------------------------------- | ------ | -------------------------------- |
| /api/admin/backup                     | GET    | List available backups           |
| /api/admin/backup                     | POST   | Create new database backup (ZIP) |
| /api/admin/backup/download/[filename] | GET    | Download backup file             |

Backup Response

{
"backups": [{
"filename": "20241201-120000-backup.zip",
"timestamp": "20241201-120000",
"size": 1234567,
"downloadUrl": "/api/admin/backup/download/..."
}],
"maxBackups": 5
}

---

Health API

| Endpoint    | Method | Description                        |
| ----------- | ------ | ---------------------------------- |
| /api/health | GET    | Application health diagnostics     |
| /api/health | POST   | Clear cache and re-run diagnostics |

Health Status Codes

- 200: Healthy
- 503: Needs setup
- 500: Unhealthy

---

Setup API

| Endpoint          | Method | Description                    |
| ----------------- | ------ | ------------------------------ |
| /api/setup/upload | POST   | Upload backup file for import  |
| /api/setup/import | GET    | SSE stream for import progress |

POST /api/setup/upload

- Content-Type: multipart/form-data
- Field: file (.sql, .zip, .tar.gz, .tgz)
- Max Size: 100MB

GET /api/setup/import Query Parameters

| Param    | Type   | Required | Description               |
| -------- | ------ | -------- | ------------------------- |
| uploadId | string | Yes      | UUID from upload response |

Returns: Server-Sent Events stream with progress updates

---

Documentation API

| Endpoint               | Method | Description                 |
| ---------------------- | ------ | --------------------------- |
| /api/docs/openapi.json | GET    | OpenAPI 3.0.3 specification |

---

File Locations Summary

src/app/api/
├── admin/backup/
│ ├── route.ts # GET, POST
│ └── download/[filename]/route.ts # GET
├── animals/
│ ├── route.ts # GET, POST
│ └── [id]/
│ ├── route.ts # GET, PUT, DELETE
│ └── notes/
│ ├── route.ts # GET, POST
│ └── count/route.ts # GET
├── breeds/
│ ├── route.ts # GET, POST
│ ├── pricing/route.ts # POST
│ └── [id]/
│ ├── route.ts # GET, PUT, DELETE
│ └── animals/count/route.ts # GET
├── customers/
│ ├── route.ts # GET, POST
│ ├── history/route.ts # GET
│ └── [id]/
│ ├── route.ts # GET, PUT, DELETE
│ └── animals/count/route.ts # GET
├── docs/openapi.json/route.ts # GET
├── health/route.ts # GET, POST
├── notes/[noteId]/route.ts # GET, PUT, DELETE
├── reports/
│ ├── analytics/route.ts # GET
│ └── daily-totals/route.ts # GET
└── setup/
├── import/route.ts # GET (SSE)
└── upload/route.ts # POST
