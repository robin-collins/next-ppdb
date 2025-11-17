# Customer Update and Delete API Tests
# Tests PUT /api/customers/[id] and DELETE /api/customers/[id]

# Setup: Create a customer for testing updates/deletes
POST {{base_url}}{{api_base}}/customers
Content-Type: application/json
{
  "firstname": "UpdateTest",
  "surname": "Customer",
  "address": "123 Original St",
  "suburb": "Originalville",
  "postcode": 2000,
  "phone1": "0411111111",
  "phone2": "0422222222",
  "email": "original@test.com"
}

HTTP 201
[Captures]
test_customer_id: jsonpath "$.id"


# Test 1: Update customer name
PUT {{base_url}}{{api_base}}/customers/{{test_customer_id}}
Content-Type: application/json
{
  "firstname": "UpdatedFirst",
  "surname": "UpdatedLast"
}

HTTP 200
[Asserts]
jsonpath "$.id" == {{test_customer_id}}
jsonpath "$.firstname" == "UpdatedFirst"
jsonpath "$.surname" == "UpdatedLast"


# Test 2: Update customer address details
PUT {{base_url}}{{api_base}}/customers/{{test_customer_id}}
Content-Type: application/json
{
  "address": "456 New Street",
  "suburb": "Newtown",
  "postcode": 3000
}

HTTP 200
[Asserts]
jsonpath "$.id" == {{test_customer_id}}
jsonpath "$.address" == "456 New Street"
jsonpath "$.suburb" == "Newtown"
jsonpath "$.postcode" == "3000"


# Test 3: Update customer contact details
PUT {{base_url}}{{api_base}}/customers/{{test_customer_id}}
Content-Type: application/json
{
  "phone1": "0433333333",
  "phone2": "0444444444",
  "phone3": "0455555555",
  "email": "updated@test.com"
}

HTTP 200
[Asserts]
jsonpath "$.id" == {{test_customer_id}}
jsonpath "$.phone1" == "0433333333"
jsonpath "$.email" == "updated@test.com"


# Test 4: Get the customer to verify all updates
GET {{base_url}}{{api_base}}/customers/{{test_customer_id}}

HTTP 200
[Asserts]
jsonpath "$.id" == {{test_customer_id}}
jsonpath "$.firstname" == "UpdatedFirst"
jsonpath "$.surname" == "UpdatedLast"
jsonpath "$.address" == "456 New Street"


# Test 5: Try to get non-existent customer
GET {{base_url}}{{api_base}}/customers/999999

HTTP 404
[Asserts]
jsonpath "$.error" == "Customer not found"


# Test 6: Try to update non-existent customer
PUT {{base_url}}{{api_base}}/customers/999999
Content-Type: application/json
{
  "firstname": "ShouldFail"
}

HTTP 404
[Asserts]
jsonpath "$.error" == "Customer not found"


# Test 7: Create an animal for the customer to test delete constraint
POST {{base_url}}{{api_base}}/animals
Content-Type: application/json
{
  "name": "BlockDeleteDog",
  "breed": "Labrador",
  "sex": "Male",
  "customerId": {{test_customer_id}},
  "colour": "Black",
  "cost": 50,
  "lastVisit": "2025-01-01T00:00:00.000Z",
  "thisVisit": "2025-01-15T00:00:00.000Z"
}

HTTP 201
[Captures]
blocking_animal_id: jsonpath "$.id"


# Test 8: Try to delete customer with animals (should fail)
DELETE {{base_url}}{{api_base}}/customers/{{test_customer_id}}

HTTP 400
[Asserts]
jsonpath "$.error" == "Cannot delete customer with associated animals"


# Test 9: Delete the blocking animal first
DELETE {{base_url}}{{api_base}}/animals/{{blocking_animal_id}}

HTTP 200


# Test 10: Now delete the customer (should succeed)
DELETE {{base_url}}{{api_base}}/customers/{{test_customer_id}}

HTTP 200
[Asserts]
jsonpath "$.message" == "Customer deleted successfully"


# Test 11: Verify customer is deleted
GET {{base_url}}{{api_base}}/customers/{{test_customer_id}}

HTTP 404
[Asserts]
jsonpath "$.error" == "Customer not found"


# Test 12: Try to delete already deleted customer
DELETE {{base_url}}{{api_base}}/customers/{{test_customer_id}}

HTTP 404
[Asserts]
jsonpath "$.error" == "Customer not found"

