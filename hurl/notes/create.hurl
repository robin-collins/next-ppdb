# Create Service Note API Test
# Tests the POST /api/animals/[id]/notes endpoint

# Test 1: Create note for existing animal
POST {{base_url}}{{api_base}}/animals/{{test_animal_id}}/notes
Content-Type: application/json
{
  "notes": "Test service note created by Hurl",
  "serviceDate": "2025-01-20T00:00:00.000Z"
}

HTTP 201
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.id" exists
jsonpath "$.notes" == "Test service note created by Hurl"
jsonpath "$.animalId" == {{test_animal_id}}
[Captures]
created_note_id: jsonpath "$.id"


# Test 2: Create note with missing required field (should fail)
POST {{base_url}}{{api_base}}/animals/{{test_animal_id}}/notes
Content-Type: application/json
{
  "serviceDate": "2025-01-20T00:00:00.000Z"
}

HTTP 400
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.error" exists


# Test 3: Create note for non-existent animal (returns 500 - database error)
# TODO: API should handle this better and return 404
POST {{base_url}}{{api_base}}/animals/999999/notes
Content-Type: application/json
{
  "notes": "This should fail",
  "serviceDate": "2025-01-20T00:00:00.000Z"
}

HTTP 500

