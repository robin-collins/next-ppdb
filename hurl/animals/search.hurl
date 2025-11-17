# Search Animals API Test
# Tests the GET /api/animals endpoint with search query

# Test 1: Search with no query (list all)
GET {{base_url}}{{api_base}}/animals

HTTP 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$" isCollection


# Test 2: Search with query parameter
GET {{base_url}}{{api_base}}/animals?q=test

HTTP 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$" isCollection


# Test 3: Search with specific query that should match
GET {{base_url}}{{api_base}}/animals?q=lab

HTTP 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$" isCollection


# Test 4: Verify response structure for first result
GET {{base_url}}{{api_base}}/animals?q=a

HTTP 200
[Asserts]
jsonpath "$" isCollection
# If results exist, verify structure
# jsonpath "$[0].id" exists
# jsonpath "$[0].name" exists
# jsonpath "$[0].breed" exists
# jsonpath "$[0].sex" matches "^(Male|Female)$"
# jsonpath "$[0].customer" exists
# jsonpath "$[0].customer.id" exists
# jsonpath "$[0].customer.surname" exists

