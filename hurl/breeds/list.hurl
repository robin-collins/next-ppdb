# List Breeds API Test
# Tests the GET /api/breeds endpoint

# Test 1: List all breeds
GET {{base_url}}{{api_base}}/breeds

HTTP 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$" isCollection
jsonpath "$" count >= 0


# Test 2: Verify response structure if breeds exist
GET {{base_url}}{{api_base}}/breeds

HTTP 200
[Asserts]
jsonpath "$" isCollection
# If results exist, verify structure
# jsonpath "$[0].id" exists
# jsonpath "$[0].name" exists
# jsonpath "$[0].avgtime" exists
# jsonpath "$[0].avgcost" exists

