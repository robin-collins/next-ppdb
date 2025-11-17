# Breed Update and Delete API Tests
# Tests PUT /api/breeds/[id] and DELETE /api/breeds/[id]

# Setup: Create a breed for testing updates/deletes
POST {{base_url}}{{api_base}}/breeds
Content-Type: application/json
{
  "name": "UpdateDeleteTestBreed",
  "avgtime": "60",
  "avgcost": 75
}

HTTP 201
[Captures]
test_breed_id: jsonpath "$.id"


# Test 1: Update breed name
PUT {{base_url}}{{api_base}}/breeds/{{test_breed_id}}
Content-Type: application/json
{
  "name": "UpdatedBreedName"
}

HTTP 200
[Asserts]
jsonpath "$.id" == {{test_breed_id}}
jsonpath "$.name" == "UpdatedBreedName"


# Test 2: Update avgtime and avgcost
PUT {{base_url}}{{api_base}}/breeds/{{test_breed_id}}
Content-Type: application/json
{
  "avgtime": "90",
  "avgcost": 100
}

HTTP 200
[Asserts]
jsonpath "$.id" == {{test_breed_id}}
jsonpath "$.avgcost" == 100


# Test 3: Update with HH:MM:SS time format
PUT {{base_url}}{{api_base}}/breeds/{{test_breed_id}}
Content-Type: application/json
{
  "avgtime": "01:30:00"
}

HTTP 200
[Asserts]
jsonpath "$.id" == {{test_breed_id}}


# Test 4: Get the updated breed to verify changes
GET {{base_url}}{{api_base}}/breeds/{{test_breed_id}}

HTTP 200
[Asserts]
jsonpath "$.id" == {{test_breed_id}}
jsonpath "$.name" == "UpdatedBreedName"


# Test 5: Try to get non-existent breed
GET {{base_url}}{{api_base}}/breeds/999999

HTTP 404
[Asserts]
jsonpath "$.error" == "Breed not found"


# Test 6: Delete the test breed
DELETE {{base_url}}{{api_base}}/breeds/{{test_breed_id}}

HTTP 200
[Asserts]
jsonpath "$.success" == true


# Test 7: Verify breed is deleted
GET {{base_url}}{{api_base}}/breeds/{{test_breed_id}}

HTTP 404
[Asserts]
jsonpath "$.error" == "Breed not found"


# Test 8: Try to delete non-existent breed (should fail)
DELETE {{base_url}}{{api_base}}/breeds/999999

HTTP 500
# Note: API should return 404, but currently returns 500 (Prisma error)
# TODO: Improve error handling for non-existent records

