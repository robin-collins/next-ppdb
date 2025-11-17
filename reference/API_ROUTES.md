| --------------------------- | ------ | ---------------------- | ------------------- |
| `/api/customers` | GET | Search/list customers | `Customer[]` |
| `/api/customers` | POST | Create new customer | `Customer` |
| `/api/customers/[id]` | GET | Get customer by ID | `Customer` |
| `/api/customers/[id]` | PUT | Update customer | `Customer` |
| `/api/customers/[id]` | DELETE | Delete customer | `{ success: true }` |
| --------------------------- | ------ | ---------------------- | ------------------- |
| `/api/animals` | GET | Search/list animals | `Animal[]` |
| `/api/animals` | POST | Create new animal | `Animal` |
| `/api/animals/[id]` | GET | Get animal by ID | `Animal` |
| `/api/animals/[id]` | PUT | Update animal | `Animal` |
| `/api/animals/[id]` | DELETE | Delete animal | `{ success: true }` |
| --------------------------- | ------ | ---------------------- | ------------------- |
| `/api/breeds` | GET | List all breeds | `Breed[]` |
| `/api/breeds` | POST | Create new breed | `Breed` |
| `/api/breeds/[id]` | GET | Get breed by ID | `Breed` |
| `/api/breeds/[id]` | PUT | Update breed | `Breed` |
| `/api/breeds/[id]` | DELETE | Delete breed | `{ success: true }` |
| --------------------------- | ------ | ---------------------- | ------------------- |
| `/api/animals/[id]/notes` | GET | List animal's notes | `Note[]` |
| `/api/animals/[id]/notes` | POST | Create note for animal | `Note` |
| `/api/notes/[id]` | GET | Get note by ID | `Note` |
| `/api/notes/[id]` | PUT | Update note | `Note` |
| `/api/notes/[id]` | DELETE | Delete note | `{ success: true }` |
| --------------------------- | ------ | ---------------------- | ------------------- |
| `/api/customers/history` | GET | Customer history data | `History[]` |
| `/api/reports/daily-totals` | GET | Daily totals data | `Report` |
| --------------------------- | ------ | ---------------------- | ------------------- |
| `/api/admin/backup` | GET | Database backup | `Backup` |
| --------------------------- | ------ | ---------------------- | ------------------- |
