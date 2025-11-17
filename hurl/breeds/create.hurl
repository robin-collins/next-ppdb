# Create Breed API Test
# Tests the POST /api/breeds endpoint

# Test 1: Create breed with valid data
# Note: May create duplicate if run multiple times (this is okay for testing)
POST {{base_url}}{{api_base}}/breeds
Content-Type: application/json
{
  "name": "HurlTestBreed_1763344176",
  "avgtime": "45",
  "avgcost": 60
}

HTTP 201
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.id" exists
jsonpath "$.name" == "HurlTestBreed_1763344176"
[Captures]
created_breed_id: jsonpath "$.id"
created_breed_name: jsonpath "$.name"


# Test 2: Create breed with missing required field (should fail with validation error)
POST {{base_url}}{{api_base}}/breeds
Content-Type: application/json
{
  "avgtime": "30"
}

HTTP 400
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.error" == "Invalid request data"
jsonpath "$.details[0].message" == "name is required"


# Test 3: Verify created breed exists
GET {{base_url}}{{api_base}}/breeds/{{created_breed_id}}

HTTP 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.id" == {{created_breed_id}}
jsonpath "$.name" == {{created_breed_name}}

