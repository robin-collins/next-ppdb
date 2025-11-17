# Hurl API Testing

**Hurl** is a command-line tool that runs HTTP requests defined in a simple plain text format. It's perfect for:

- Testing REST APIs
- Integration testing
- Smoke testing
- API documentation

## Installation

### macOS

```bash
brew install hurl
```

### Ubuntu/Debian

```bash
curl -LO https://github.com/Orange-OpenSource/hurl/releases/latest/download/hurl_amd64.deb
sudo dpkg -i hurl_amd64.deb
```

### Windows (WSL2)

```bash
curl -LO https://github.com/Orange-OpenSource/hurl/releases/latest/download/hurl_amd64.deb
sudo dpkg -i hurl_amd64.deb
```

### Verify Installation

```bash
hurl --version
```

## Project Structure

```
hurl/
├── README.md                    # This file
├── animals/
│   ├── search.hurl             # Search/list animals
│   ├── get-by-id.hurl          # Get animal by ID
│   ├── create.hurl             # Create animal
│   ├── update.hurl             # Update animal
│   └── delete.hurl             # Delete animal
├── customers/
│   ├── search.hurl             # Search/list customers
│   ├── get-by-id.hurl          # Get customer by ID
│   ├── create.hurl             # Create customer
│   ├── update.hurl             # Update customer
│   └── delete.hurl             # Delete customer
├── breeds/
│   ├── list.hurl               # List all breeds
│   ├── get-by-id.hurl          # Get breed by ID
│   ├── create.hurl             # Create breed
│   ├── update.hurl             # Update breed
│   └── delete.hurl             # Delete breed
├── notes/
│   ├── create.hurl             # Create service note
│   ├── get-by-id.hurl          # Get note by ID
│   ├── update.hurl             # Update note
│   └── delete.hurl             # Delete note
└── variables.env               # Environment variables
```

## Running Tests

### All Tests

```bash
pnpm test:hurl
```

### Specific Test Suite

```bash
hurl hurl/animals/*.hurl --variables-file hurl/variables.env
hurl hurl/customers/*.hurl --variables-file hurl/variables.env
hurl hurl/breeds/*.hurl --variables-file hurl/variables.env
hurl hurl/notes/*.hurl --variables-file hurl/variables.env
```

### Single Test

```bash
hurl hurl/animals/search.hurl --variables-file hurl/variables.env
```

### Verbose Output

```bash
hurl hurl/animals/*.hurl --variables-file hurl/variables.env --verbose
```

### Generate HTML Report

```bash
hurl hurl/**/*.hurl --variables-file hurl/variables.env --report-html hurl-report
open hurl-report/index.html
```

## Environment Variables

Edit `hurl/variables.env` to configure:

```env
base_url=http://localhost:3000
api_base=/api

# Test data IDs (update these based on your database)
test_customer_id=7742
test_animal_id=8543
test_breed_id=1
test_note_id=1
```

## Test Data Setup

Before running tests, ensure:

1. **Development server is running**:

   ```bash
   pnpm dev
   ```

2. **Test data exists** (or tests will create it):
   - At least one customer
   - At least one breed
   - At least one animal

3. **Update `variables.env`** with actual IDs from your database.

## Hurl File Format

Example `animals/search.hurl`:

```hurl
# Search for animals with query
GET {{base_url}}{{api_base}}/animals?q=buddy

HTTP 200
[Asserts]
jsonpath "$" count > 0
jsonpath "$[0].name" exists
jsonpath "$[0].breed" exists
jsonpath "$[0].customer.surname" exists
```

### Key Features

- **Variables**: `{{base_url}}`, `{{api_base}}`
- **Assertions**: Verify response status, headers, body
- **JSONPath**: Query JSON responses
- **Captures**: Save values for later use
- **Chaining**: Use output from one request in another

## Example Test Workflow

```hurl
# 1. Create a customer
POST {{base_url}}{{api_base}}/customers
Content-Type: application/json
{
  "firstname": "Test",
  "surname": "Customer",
  "address": "123 Test St",
  "suburb": "Testville",
  "postcode": 2000,
  "phone1": "0412345678",
  "email": "test@example.com"
}

HTTP 201
[Captures]
customer_id: jsonpath "$.id"

# 2. Create an animal for that customer
POST {{base_url}}{{api_base}}/animals
Content-Type: application/json
{
  "name": "TestPet",
  "breed": "Labrador",
  "sex": "Male",
  "customerId": {{customer_id}},
  "lastVisit": "2025-01-01T00:00:00.000Z",
  "thisVisit": "2025-01-15T00:00:00.000Z"
}

HTTP 201
[Captures]
animal_id: jsonpath "$.id"

# 3. Retrieve the animal
GET {{base_url}}{{api_base}}/animals/{{animal_id}}

HTTP 200
[Asserts]
jsonpath "$.name" == "TestPet"
jsonpath "$.customer.id" == {{customer_id}}
```

## CI/CD Integration

Add to `.github/workflows/test.yml`:

```yaml
- name: Install Hurl
  run: |
    curl -LO https://github.com/Orange-OpenSource/hurl/releases/latest/download/hurl_amd64.deb
    sudo dpkg -i hurl_amd64.deb

- name: Run API Tests
  run: pnpm test:hurl
```

## Advantages Over Jest API Tests

✅ **Simple Format** - Plain text, easy to read and write  
✅ **No Code** - No TypeScript/JavaScript required  
✅ **Fast** - Runs directly against HTTP endpoints  
✅ **Real Requests** - Tests actual API behavior  
✅ **Documentation** - Tests serve as API documentation  
✅ **CI/CD Ready** - Easy to integrate into pipelines  
✅ **Language Agnostic** - Works with any HTTP API

## Complementary to Jest Tests

- **Jest**: Unit tests with mocked dependencies
- **Hurl**: Integration tests with real API calls
- **Playwright**: End-to-end tests with browser

Use all three for comprehensive testing!

## Troubleshooting

### Connection Refused

```bash
# Make sure dev server is running
pnpm dev
```

### 404 Errors

```bash
# Check route paths match your API
# Verify base_url and api_base in variables.env
```

### Test Data Issues

```bash
# Update IDs in variables.env to match your database
# Or modify tests to create their own test data
```

## Resources

- [Hurl Documentation](https://hurl.dev/)
- [Hurl Tutorial](https://hurl.dev/docs/tutorial/your-first-hurl-file.html)
- [JSONPath Syntax](https://goessner.net/articles/JsonPath/)
