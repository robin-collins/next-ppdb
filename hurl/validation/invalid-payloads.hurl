# Validation Tests - Invalid Payloads
# Tests API validation and error responses for invalid data

# Test 1: Create customer with missing required field (surname)
POST {{base_url}}{{api_base}}/customers
Content-Type: application/json
{
  "firstname": "NoSurname",
  "address": "123 Test St"
}

HTTP 400
[Asserts]
jsonpath "$.error" == "Invalid request data"


# Test 2: Create customer with invalid postcode (negative)
POST {{base_url}}{{api_base}}/customers
Content-Type: application/json
{
  "firstname": "Test",
  "surname": "Customer",
  "postcode": -1000
}

HTTP 201
# Note: Currently accepts negative postcode - validation could be improved
# TODO: Add postcode range validation


# Test 3: Create animal with invalid sex value
POST {{base_url}}{{api_base}}/animals
Content-Type: application/json
{
  "name": "TestPet",
  "breed": "Labrador",
  "sex": "Unknown",
  "customerId": 1,
  "lastVisit": "2025-01-01T00:00:00.000Z",
  "thisVisit": "2025-01-10T00:00:00.000Z"
}

HTTP 201
# Note: "Unknown" is accepted as valid sex value


# Test 4: Create animal with non-existent customer
POST {{base_url}}{{api_base}}/animals
Content-Type: application/json
{
  "name": "OrphanPet",
  "breed": "Labrador",
  "sex": "Male",
  "customerId": 999999,
  "colour": "Brown",
  "lastVisit": "2025-01-01T00:00:00.000Z",
  "thisVisit": "2025-01-10T00:00:00.000Z"
}

HTTP 500
# Note: Currently returns 500 (database error)
# TODO: Should return 400 with clear error message


# Test 5: Create animal with non-existent breed
POST {{base_url}}{{api_base}}/animals
Content-Type: application/json
{
  "name": "TestPet",
  "breed": "NonExistentBreed_XYZ123",
  "sex": "Male",
  "customerId": 1,
  "colour": "Brown",
  "lastVisit": "2025-01-01T00:00:00.000Z",
  "thisVisit": "2025-01-10T00:00:00.000Z"
}

HTTP 400
[Asserts]
jsonpath "$.error" == "Breed not found"


# Test 6: Create animal with invalid date format
POST {{base_url}}{{api_base}}/animals
Content-Type: application/json
{
  "name": "TestPet",
  "breed": "Labrador",
  "sex": "Male",
  "customerId": 1,
  "colour": "Brown",
  "lastVisit": "invalid-date",
  "thisVisit": "2025-01-10T00:00:00.000Z"
}

HTTP 400
[Asserts]
jsonpath "$.error" == "Invalid request data"


# Test 7: Create note with missing required field (notes content)
POST {{base_url}}{{api_base}}/animals/1/notes
Content-Type: application/json
{
  "serviceDate": "2025-01-10T00:00:00.000Z"
}

HTTP 400
[Asserts]
jsonpath "$.error" == "Invalid request data"


# Test 8: Create note for non-existent animal
POST {{base_url}}{{api_base}}/animals/999999/notes
Content-Type: application/json
{
  "notes": "This should fail",
  "serviceDate": "2025-01-10T00:00:00.000Z"
}

HTTP 500
# Note: Currently returns 500 (database error)
# TODO: Should return 404 with clear error message


# Test 9: Invalid ID format (non-numeric)
GET {{base_url}}{{api_base}}/animals/not-a-number

HTTP 404
# Note: parseInt returns NaN, treated as invalid


# Test 10: Create breed with duplicate name
POST {{base_url}}{{api_base}}/breeds
Content-Type: application/json
{
  "name": "ValidationTestBreed",
  "avgtime": "45",
  "avgcost": 50
}
HTTP 201
[Captures]
validation_breed_id: jsonpath "$.id"

POST {{base_url}}{{api_base}}/breeds
Content-Type: application/json
{
  "name": "ValidationTestBreed",
  "avgtime": "60",
  "avgcost": 75
}

HTTP 500
# Note: MySQL unique constraint violation
# TODO: Should return 400 with friendly error message


# Cleanup
DELETE {{base_url}}{{api_base}}/breeds/{{validation_breed_id}}
HTTP 200

