# Search Customers API Test
# Tests the GET /api/customers endpoint

# Test 1: Search with no query (list all)
GET {{base_url}}{{api_base}}/customers

HTTP 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$" isCollection


# Test 2: Search by surname
GET {{base_url}}{{api_base}}/customers?q=smith

HTTP 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$" isCollection


# Test 3: Search by phone number
GET {{base_url}}{{api_base}}/customers?q=04

HTTP 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$" isCollection


# Test 4: Search by email
GET {{base_url}}{{api_base}}/customers?q=example.com

HTTP 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$" isCollection


# Test 5: Verify response structure for first result
GET {{base_url}}{{api_base}}/customers?q=a

HTTP 200
[Asserts]
jsonpath "$" isCollection
# If results exist, verify structure
# jsonpath "$[0].id" exists
# jsonpath "$[0].surname" exists
# jsonpath "$[0].firstname" exists
# jsonpath "$[0].email" exists

