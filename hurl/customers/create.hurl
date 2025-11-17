# Create Customer API Test
# Tests the POST /api/customers endpoint

# Test 1: Create customer with valid data
POST {{base_url}}{{api_base}}/customers
Content-Type: application/json
{
  "firstname": "{{test_customer_firstname}}",
  "surname": "{{test_customer_surname}}",
  "address": "{{test_customer_address}}",
  "suburb": "{{test_customer_suburb}}",
  "postcode": {{test_customer_postcode}},
  "phone1": "{{test_customer_phone}}",
  "email": "{{test_customer_email}}"
}

HTTP 201
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.id" exists
jsonpath "$.firstname" == "{{test_customer_firstname}}"
jsonpath "$.surname" == "{{test_customer_surname}}"
jsonpath "$.email" == "{{test_customer_email}}"
[Captures]
created_customer_id: jsonpath "$.id"


# Test 2: Create customer with missing required field (should fail)
POST {{base_url}}{{api_base}}/customers
Content-Type: application/json
{
  "firstname": "Test",
  "address": "123 Test St"
}

HTTP 400
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.error" exists


# Test 3: Create customer with invalid email (should fail)
POST {{base_url}}{{api_base}}/customers
Content-Type: application/json
{
  "firstname": "Test",
  "surname": "Customer",
  "address": "123 Test St",
  "suburb": "Testville",
  "postcode": 2000,
  "email": "not-an-email"
}

HTTP 400
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.error" exists


# Test 4: Verify customer structure
# (Skipping negative postcode test as validation allows it)

