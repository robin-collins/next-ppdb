# Animal Update and Delete API Tests
# Tests PUT /api/animals/[id] and DELETE /api/animals/[id]

# Setup: Create a customer and animal for testing
POST {{base_url}}{{api_base}}/customers
Content-Type: application/json
{
  "firstname": "AnimalTest",
  "surname": "UpdateDelete",
  "address": "123 Test St",
  "suburb": "Testville",
  "postcode": 2000,
  "phone1": "0400000000"
}

HTTP 201
[Captures]
test_customer_id: jsonpath "$.id"

POST {{base_url}}{{api_base}}/animals
Content-Type: application/json
{
  "name": "TestDog",
  "breed": "Labrador",
  "sex": "Male",
  "customerId": {{test_customer_id}},
  "colour": "Golden",
  "cost": 50,
  "lastVisit": "2025-01-01T00:00:00.000Z",
  "thisVisit": "2025-01-15T00:00:00.000Z",
  "comments": "Test animal"
}

HTTP 201
[Captures]
test_animal_id: jsonpath "$.id"


# Test 1: Update animal name and colour
PUT {{base_url}}{{api_base}}/animals/{{test_animal_id}}
Content-Type: application/json
{
  "name": "UpdatedDog",
  "colour": "Dark Golden"
}

HTTP 200
[Asserts]
jsonpath "$.id" == {{test_animal_id}}
jsonpath "$.name" == "UpdatedDog"
jsonpath "$.colour" == "Dark Golden"


# Test 2: Update animal cost and comments
PUT {{base_url}}{{api_base}}/animals/{{test_animal_id}}
Content-Type: application/json
{
  "cost": 75,
  "comments": "Updated comments - well behaved"
}

HTTP 200
[Asserts]
jsonpath "$.id" == {{test_animal_id}}
jsonpath "$.cost" == 75
jsonpath "$.comments" == "Updated comments - well behaved"


# Test 3: Update animal breed
PUT {{base_url}}{{api_base}}/animals/{{test_animal_id}}
Content-Type: application/json
{
  "breed": "Golden Retriever"
}

HTTP 200
[Asserts]
jsonpath "$.id" == {{test_animal_id}}
jsonpath "$.breed" == "Golden Retriever"


# Test 4: Get the animal to verify all updates
GET {{base_url}}{{api_base}}/animals/{{test_animal_id}}

HTTP 200
[Asserts]
jsonpath "$.id" == {{test_animal_id}}
jsonpath "$.name" == "UpdatedDog"
jsonpath "$.colour" == "Dark Golden"
jsonpath "$.cost" == 75


# Test 5: Try to get non-existent animal
GET {{base_url}}{{api_base}}/animals/999999

HTTP 404
[Asserts]
jsonpath "$.error" == "Animal not found"


# Test 6: Try to update non-existent animal
PUT {{base_url}}{{api_base}}/animals/999999
Content-Type: application/json
{
  "name": "ShouldFail"
}

HTTP 404
[Asserts]
jsonpath "$.error" == "Animal not found"


# Test 7: Delete the test animal
DELETE {{base_url}}{{api_base}}/animals/{{test_animal_id}}

HTTP 200
[Asserts]
jsonpath "$.success" == true


# Test 8: Verify animal is deleted
GET {{base_url}}{{api_base}}/animals/{{test_animal_id}}

HTTP 404
[Asserts]
jsonpath "$.error" == "Animal not found"


# Test 9: Try to delete already deleted animal
DELETE {{base_url}}{{api_base}}/animals/{{test_animal_id}}

HTTP 404
[Asserts]
jsonpath "$.error" == "Animal not found"


# Cleanup: Delete the test customer
DELETE {{base_url}}{{api_base}}/customers/{{test_customer_id}}

HTTP 200

