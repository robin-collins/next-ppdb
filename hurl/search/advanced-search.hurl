# Advanced Search Tests
# Tests search functionality with various query patterns

# Setup: Create test data with specific search terms
POST {{base_url}}{{api_base}}/customers
Content-Type: application/json
{
  "firstname": "SearchTest",
  "surname": "CustomerABC",
  "address": "789 Search Lane",
  "suburb": "Searchville",
  "postcode": 4000,
  "phone1": "0477777777",
  "email": "searchtest@example.com"
}
HTTP 201
[Captures]
search_customer_id: jsonpath "$.id"

POST {{base_url}}{{api_base}}/animals
Content-Type: application/json
{
  "name": "SearchDog",
  "breed": "Beagle",
  "sex": "Male",
  "customerId": {{search_customer_id}},
  "colour": "Tricolor",
  "cost": 55,
  "lastVisit": "2025-01-01T00:00:00.000Z",
  "thisVisit": "2025-01-15T00:00:00.000Z"
}
HTTP 201
[Captures]
search_animal_id: jsonpath "$.id"


# Test 1: Search animals by exact name
GET {{base_url}}{{api_base}}/animals?q=SearchDog

HTTP 200
[Asserts]
jsonpath "$" isCollection
jsonpath "$[*].name" includes "SearchDog"


# Test 2: Search animals by partial name
GET {{base_url}}{{api_base}}/animals?q=Search

HTTP 200
[Asserts]
jsonpath "$" isCollection


# Test 3: Search animals by breed
GET {{base_url}}{{api_base}}/animals?q=Beagle

HTTP 200
[Asserts]
jsonpath "$" isCollection


# Test 4: Search animals by customer surname
GET {{base_url}}{{api_base}}/animals?q=CustomerABC

HTTP 200
[Asserts]
jsonpath "$" isCollection


# Test 5: Search animals by customer email
GET {{base_url}}{{api_base}}/animals?q=searchtest@example.com

HTTP 200
[Asserts]
jsonpath "$" isCollection


# Test 6: Search animals by phone number
GET {{base_url}}{{api_base}}/animals?q=0477777777

HTTP 200
[Asserts]
jsonpath "$" isCollection


# Test 7: Search animals by phone number with formatting
GET {{base_url}}{{api_base}}/animals?q=0477-777-777

HTTP 200
[Asserts]
jsonpath "$" isCollection


# Test 8: Search animals with empty query (should return empty array)
GET {{base_url}}{{api_base}}/animals?q=

HTTP 200
[Asserts]
jsonpath "$" isCollection


# Test 9: Search animals with non-matching query
GET {{base_url}}{{api_base}}/animals?q=ThisShouldNotMatchAnything12345

HTTP 200
[Asserts]
jsonpath "$" isCollection
jsonpath "$" count == 0


# Test 10: Search customers by surname
GET {{base_url}}{{api_base}}/customers?q=CustomerABC

HTTP 200
[Asserts]
jsonpath "$" isCollection


# Test 11: Search customers by firstname
GET {{base_url}}{{api_base}}/customers?q=SearchTest

HTTP 200
[Asserts]
jsonpath "$" isCollection


# Test 12: Search customers by email
GET {{base_url}}{{api_base}}/customers?q=searchtest@example.com

HTTP 200
[Asserts]
jsonpath "$" isCollection


# Test 13: Search customers by phone
GET {{base_url}}{{api_base}}/customers?q=0477777777

HTTP 200
[Asserts]
jsonpath "$" isCollection


# Test 14: Search customers by postcode
GET {{base_url}}{{api_base}}/customers?q=4000

HTTP 200
[Asserts]
jsonpath "$" isCollection


# Test 15: Search animals - test relevance scoring (exact match should rank higher)
GET {{base_url}}{{api_base}}/animals?q=SearchDog

HTTP 200
[Asserts]
jsonpath "$[0].name" == "SearchDog"


# Cleanup
DELETE {{base_url}}{{api_base}}/animals/{{search_animal_id}}
HTTP 200

DELETE {{base_url}}{{api_base}}/customers/{{search_customer_id}}
HTTP 200

