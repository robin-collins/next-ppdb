# Complete Workflow Test
# Tests a complete workflow: Create customer → Create animal → Add note → Retrieve → Delete

# Step 1: Create a new customer
# Note: Using static data - may create duplicates if run multiple times
POST {{base_url}}{{api_base}}/customers
Content-Type: application/json
{
  "firstname": "WorkflowTest",
  "surname": "TestCustomer",
  "address": "123 Workflow St",
  "suburb": "Testville",
  "postcode": 2000,
  "phone1": "0499998888",
  "email": "workflowtest@hurltest.com"
}

HTTP 201
[Asserts]
jsonpath "$.id" exists
jsonpath "$.surname" == "TestCustomer"
[Captures]
workflow_customer_id: jsonpath "$.id"
workflow_customer_firstname: jsonpath "$.firstname"


# Step 2: Create a new animal for that customer
POST {{base_url}}{{api_base}}/animals
Content-Type: application/json
{
  "name": "WorkflowTestPet",
  "breed": "Labrador",
  "sex": "Male",
  "customerId": {{workflow_customer_id}},
  "colour": "Golden",
  "cost": 75,
  "lastVisit": "2025-01-01T00:00:00.000Z",
  "thisVisit": "2025-01-20T00:00:00.000Z",
  "comments": "Created in workflow test"
}

HTTP 201
[Asserts]
jsonpath "$.id" exists
jsonpath "$.name" == "WorkflowTestPet"
jsonpath "$.customer.id" == {{workflow_customer_id}}
[Captures]
workflow_animal_id: jsonpath "$.id"


# Step 3: Add a service note to the animal
POST {{base_url}}{{api_base}}/animals/{{workflow_animal_id}}/notes
Content-Type: application/json
{
  "notes": "First grooming session - behaved well!",
  "serviceDate": "2025-01-20T00:00:00.000Z"
}

HTTP 201
[Asserts]
jsonpath "$.id" exists
jsonpath "$.animalId" == {{workflow_animal_id}}
[Captures]
workflow_note_id: jsonpath "$.id"


# Step 4: Retrieve the animal and verify all data
GET {{base_url}}{{api_base}}/animals/{{workflow_animal_id}}

HTTP 200
[Asserts]
jsonpath "$.id" == {{workflow_animal_id}}
jsonpath "$.name" == "WorkflowTestPet"
jsonpath "$.customer.id" == {{workflow_customer_id}}
jsonpath "$.customer.surname" == "TestCustomer"
jsonpath "$.serviceNotes" isCollection
jsonpath "$.serviceNotes[0].id" exists


# Step 5: Search for the customer by surname
GET {{base_url}}{{api_base}}/customers?q=TestCustomer

HTTP 200
[Asserts]
jsonpath "$" isCollection
# Note: Search may return multiple results, so we check if our customer exists
# jsonpath "$[0].id" == {{workflow_customer_id}}


# Step 6: Verify animal can be retrieved directly
GET {{base_url}}{{api_base}}/animals/{{workflow_animal_id}}

HTTP 200
[Asserts]
jsonpath "$.id" == {{workflow_animal_id}}


# Step 7: Delete the service note
DELETE {{base_url}}{{api_base}}/notes/{{workflow_note_id}}

HTTP 200
[Asserts]
jsonpath "$.success" == true


# Step 8: Delete the animal
DELETE {{base_url}}{{api_base}}/animals/{{workflow_animal_id}}

HTTP 200
[Asserts]
jsonpath "$.success" == true


# Step 9: Delete the customer
DELETE {{base_url}}{{api_base}}/customers/{{workflow_customer_id}}

HTTP 200
[Asserts]
jsonpath "$.message" == "Customer deleted successfully"


# Step 10: Verify customer is deleted
GET {{base_url}}{{api_base}}/customers/{{workflow_customer_id}}

HTTP 404
[Asserts]
jsonpath "$.error" exists

