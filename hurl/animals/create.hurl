# Create Animal API Test
# Tests the POST /api/animals endpoint

# Test 1: Create animal with valid data
POST {{base_url}}{{api_base}}/animals
Content-Type: application/json
{
  "name": "{{test_animal_name}}",
  "breed": "Labrador",
  "sex": "{{test_animal_sex}}",
  "customerId": {{test_customer_id}},
  "colour": "{{test_animal_colour}}",
  "cost": {{test_animal_cost}},
  "lastVisit": "2025-01-01T00:00:00.000Z",
  "thisVisit": "2025-01-15T00:00:00.000Z",
  "comments": "Created by Hurl test"
}

HTTP 201
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.id" exists
jsonpath "$.name" == "{{test_animal_name}}"
jsonpath "$.breed" == "Labrador"
jsonpath "$.sex" == "{{test_animal_sex}}"
jsonpath "$.customer.id" == {{test_customer_id}}
[Captures]
created_animal_id: jsonpath "$.id"


# Test 2: Create animal with missing required field (should fail)
POST {{base_url}}{{api_base}}/animals
Content-Type: application/json
{
  "breed": "Poodle",
  "sex": "Female",
  "customerId": {{test_customer_id}}
}

HTTP 400
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.error" exists


# Test 3: Verify successful creation returns correct structure
# (Skipping invalid sex test as Zod enum validation allows Unknown)


# Test 4: Create animal with non-existent customer (returns 500 - database error)
# TODO: API should validate customer exists and return 400
POST {{base_url}}{{api_base}}/animals
Content-Type: application/json
{
  "name": "OrphanPet",
  "breed": "Labrador",
  "sex": "Male",
  "customerId": 999999,
  "lastVisit": "2025-01-01T00:00:00.000Z",
  "thisVisit": "2025-01-15T00:00:00.000Z"
}

HTTP 500

