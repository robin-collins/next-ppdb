# Get Animal by ID API Test
# Tests the GET /api/animals/[id] endpoint

# Test 1: Get existing animal
GET {{base_url}}{{api_base}}/animals/{{test_animal_id}}

HTTP 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.id" exists
jsonpath "$.name" exists
jsonpath "$.breed" exists
jsonpath "$.sex" matches "^(Male|Female)$"
jsonpath "$.colour" exists
jsonpath "$.customer" exists
jsonpath "$.customer.id" exists
jsonpath "$.customer.surname" exists
jsonpath "$.customer.firstname" exists
jsonpath "$.serviceNotes" exists
jsonpath "$.serviceNotes" isCollection


# Test 2: Get non-existent animal (should return 404)
GET {{base_url}}{{api_base}}/animals/999999

HTTP 404
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.error" exists


# Test 3: Get animal with invalid ID format (returns 500 due to parseInt(NaN))
# TODO: API should handle this better and return 404
GET {{base_url}}{{api_base}}/animals/invalid

HTTP 500

